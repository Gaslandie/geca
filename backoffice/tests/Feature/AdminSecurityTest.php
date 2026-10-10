<?php

namespace Tests\Feature;

use App\Models\ContentEntry;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminSecurityTest extends TestCase
{
    use RefreshDatabase;

    private function admin(array $attributes = []): User
    {
        return User::factory()->create(array_merge(['is_admin' => true, 'is_active' => true, 'session_version' => 1], $attributes));
    }

    private function signedIn(?User $user = null): User
    {
        $user ??= $this->admin();
        $this->verifiedAdmin($user);

        return $user;
    }

    private function entry(): ContentEntry
    {
        $this->artisan('geca:import-reference')->assertSuccessful();

        return ContentEntry::where('kind', 'projects')->firstOrFail();
    }

    private function draft(ContentEntry $entry): array
    {
        $source = $entry->source_payload;

        return ['revision' => $entry->revision, 'source_note' => 'Test technique, sans publication.', 'payload' => ['fr' => $source['fr'], 'en' => $source['en']]];
    }

    private function enforceCsrf(): void
    {
        $this->app->bind(PreventRequestForgery::class, fn ($app) => new class($app, $app['encrypter']) extends PreventRequestForgery
        {
            protected function runningUnitTests()
            {
                return false;
            }
        });
    }

    public function test_anonymous_cannot_read_or_write_private_content(): void
    {
        $entry = $this->entry();
        foreach (['/administration', '/administration/projects', "/administration/projects/$entry->id/modifier"] as $url) {
            $this->get($url)->assertRedirect('/connexion');
        }
        $this->put("/administration/projects/$entry->id", $this->draft($entry))->assertRedirect('/connexion');
        $this->assertDatabaseCount('content_revisions', 0);
    }

    public function test_login_and_logout_rotate_session_and_protect_return_access(): void
    {
        $user = $this->admin();
        $this->get('/connexion')->assertOk();
        $before = session()->getId();
        $tokenBefore = session()->token();
        $this->post('/connexion', ['email' => strtoupper($user->email), 'password' => 'password'])->assertRedirect('/connexion/double-verification');
        $this->assertGuest();
        $this->get('/connexion/double-verification')->assertOk();
        $this->verifiedAdmin($user);
        $this->assertNotSame($before, session()->getId());
        $this->assertNotSame($tokenBefore, session()->token());
        $this->get('/administration')->assertOk()->assertSee('<h1>Tableau de bord</h1>', false);
        $this->post('/deconnexion')->assertRedirect('/connexion');
        $this->assertGuest();
        $this->get('/administration')->assertRedirect('/connexion');
    }

    public function test_invalid_inactive_and_non_admin_logins_share_generic_error(): void
    {
        $users = [$this->admin(['is_active' => false]), $this->admin(['is_admin' => false])];
        foreach (array_merge(array_map(fn ($u) => $u->email, $users), ['absent@example.test']) as $email) {
            $this->post('/connexion', ['email' => $email, 'password' => 'password', 'is_admin' => true, 'is_active' => true])
                ->assertSessionHasErrors(['credentials' => 'Connexion impossible. Vérifiez votre adresse e-mail et votre mot de passe.']);
            $this->assertGuest();
        }
    }

    public function test_revoked_rights_are_reloaded_from_database_on_next_request(): void
    {
        $user = $this->signedIn();
        $this->get('/administration')->assertOk();
        DB::table('users')->where('id', $user->id)->update(['is_active' => false]);
        $this->get('/administration')->assertForbidden();
        $this->assertGuest();
    }

    public function test_removed_role_and_stale_session_version_are_refused(): void
    {
        foreach ([['is_admin' => false], ['session_version' => 2]] as $change) {
            $user = $this->signedIn();
            DB::table('users')->where('id', $user->id)->update($change);
            $this->get('/administration')->assertForbidden();
        }
    }

    public function test_password_change_invalidates_an_existing_session(): void
    {
        $user = $this->signedIn();
        $this->get('/administration')->assertOk();
        DB::table('users')->where('id', $user->id)->update(['password' => Hash::make('another-test-password')]);
        $this->get('/administration')->assertRedirect('/connexion');
        $this->assertGuest();
    }

    public function test_non_admin_cannot_bypass_login_by_direct_access(): void
    {
        $this->signedIn($this->admin(['is_admin' => false]));
        $this->get('/administration/team')->assertForbidden();
    }

    public function test_dashboard_counts_follow_private_database_contents(): void
    {
        $this->signedIn();
        $this->get('/administration')->assertOk()
            ->assertViewHas('counts', ['projects' => 0, 'news' => 0, 'team' => 0]);
        $this->artisan('geca:import-reference')->assertSuccessful();
        $this->get('/administration')->assertOk()
            ->assertViewHas('counts', ['projects' => 7, 'news' => 9, 'team' => 8]);
        ContentEntry::where('kind', 'team')->firstOrFail()->delete();
        $this->get('/administration')->assertOk()
            ->assertViewHas('counts', ['projects' => 7, 'news' => 9, 'team' => 7]);
    }

    public function test_account_name_is_escaped_in_shared_navigation(): void
    {
        $name = '<script>alert("fixture")</script>';
        $this->signedIn($this->admin(['name' => $name]));
        $this->get('/administration')->assertOk()->assertSee($name)->assertDontSee($name, false);
    }

    public function test_unknown_account_attempts_are_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->post('/connexion', ['email' => 'rate@example.test', 'password' => 'wrong'])->assertStatus(302);
        }
        $this->post('/connexion', ['email' => 'RATE@example.test', 'password' => 'wrong'])->assertStatus(429);
    }

    public function test_ip_limit_cannot_be_bypassed_by_changing_email(): void
    {
        for ($i = 0; $i < 20; $i++) {
            $this->post('/connexion', ['email' => "rate$i@example.test", 'password' => 'wrong'])->assertStatus(302);
        }
        $this->post('/connexion', ['email' => 'other@example.test', 'password' => 'wrong'])->assertStatus(429);
    }

    public function test_account_limit_survives_new_session_and_changed_ip(): void
    {
        $user = $this->admin();
        for ($i = 1; $i <= 5; $i++) {
            session()->invalidate();
            $this->withServerVariables(['REMOTE_ADDR' => "192.0.2.$i"])
                ->post('/connexion', ['email' => $user->email, 'password' => 'wrong'])
                ->assertSessionHasErrors('credentials');
        }
        session()->invalidate();
        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.1'])
            ->post('/connexion', ['email' => '  '.strtoupper($user->email).'  ', 'password' => 'password'])
            ->assertStatus(429)->assertHeader('Retry-After');
        $this->assertGuest();
        $this->get('/administration')->assertRedirect('/connexion');
    }

    public function test_temporary_limit_expires_without_disabling_the_account(): void
    {
        $this->freezeTime();
        $user = $this->admin();
        for ($i = 0; $i < 5; $i++) {
            $this->post('/connexion', ['email' => $user->email, 'password' => 'wrong'])
                ->assertSessionHasErrors('credentials');
        }
        $this->travel(30)->seconds();
        $this->post('/connexion', ['email' => $user->email, 'password' => 'password'])
            ->assertStatus(429)->assertHeader('Retry-After', '30');
        $this->assertGuest();
        $this->assertTrue($user->fresh()->is_active);
        $this->travel(31)->seconds();
        $this->post('/connexion', ['email' => $user->email, 'password' => 'password'])
            ->assertRedirect('/connexion/double-verification');
        $this->assertGuest();
        $this->get('/connexion/double-verification')->assertOk();
        $this->verifiedAdmin($user);
        $this->get('/administration')->assertOk();
        $this->travelBack();
    }

    public function test_forged_forwarded_addresses_cannot_bypass_ip_limit(): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.100']);
        for ($i = 0; $i < 20; $i++) {
            $this->withHeaders(['X-Forwarded-For' => "198.51.100.$i", 'X-Real-IP' => "198.51.100.$i"])
                ->post('/connexion', ['email' => "forwarded$i@example.test", 'password' => 'wrong'])
                ->assertSessionHasErrors('credentials');
        }
        $this->withHeaders(['X-Forwarded-For' => '203.0.113.1', 'X-Real-IP' => '203.0.113.1'])
            ->post('/connexion', ['email' => 'forwarded-last@example.test', 'password' => 'wrong'])
            ->assertStatus(429);
        $this->assertGuest();
    }

    public function test_csrf_is_checked_on_login_logout_and_edits(): void
    {
        $entry = $this->entry();
        $this->enforceCsrf();
        $this->post('/connexion', ['email' => 'test@example.test', 'password' => 'password'])->assertStatus(419);
        $this->signedIn();
        $this->post('/deconnexion')->assertStatus(419);
        $this->put("/administration/projects/$entry->id", $this->draft($entry))->assertStatus(419);
        $this->withSession(['_token' => 'csrf-test-token'])->post('/deconnexion', ['_token' => 'csrf-test-token'])->assertRedirect('/connexion');
        $this->assertDatabaseCount('content_revisions', 0);
    }

    public function test_sensitive_routes_are_absent_and_errors_are_not_cached(): void
    {
        foreach (['/register', '/forgot-password', '/reset-password/token', '/api/content', '/storage/private.txt', '/.env', '/composer.json', '/vendor/autoload.php'] as $url) {
            $response = $this->get($url)->assertNotFound()->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
            $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        }
    }

    public function test_sidebar_script_has_a_fresh_matching_nonce_without_broad_script_permissions(): void
    {
        $this->get('/connexion')->assertDontSee('admin-navigation.js');
        $this->signedIn();
        $previous = null;
        foreach (['/administration', '/administration/projects', '/administration/corbeille'] as $path) {
            $response = $this->get($path)->assertOk();
            preg_match('/<script src="[^"]*admin-navigation\.js[^"]*" nonce="([A-Za-z0-9+\/]{24})"/', $response->getContent(), $match);
            $this->assertCount(2, $match);
            $this->assertNotSame($previous, $match[1]);
            $previous = $match[1];
            $policy = $response->headers->get('Content-Security-Policy');
            $this->assertStringContainsString("script-src 'nonce-{$match[1]}'; script-src-attr 'none'", $policy);
            foreach (["script-src 'self'", 'unsafe-inline', 'unsafe-eval', 'blob:'] as $forbidden) {
                $this->assertStringNotContainsString($forbidden, $policy);
            }
            $response->assertSee('aria-controls="admin-sidebar"', false)->assertSee('aria-expanded="true"', false);
        }
    }

    public function test_authenticated_admin_can_save_a_private_draft_with_server_actor(): void
    {
        $entry = $this->entry();
        $user = $this->signedIn();
        $data = $this->draft($entry);
        $data['user_id'] = 999;
        $data['kind'] = 'team';
        $data['source_payload'] = ['forged' => true];
        $this->put("/administration/projects/$entry->id", $data)->assertSessionHasNoErrors()->assertRedirect();
        $this->assertSame($data['payload'], $entry->fresh()->draft_payload);
        $this->assertSame($entry->source_payload, $entry->fresh()->source_payload);
        $this->assertDatabaseHas('content_revisions', ['user_id' => $user->id, 'revision' => 1]);
    }

    public function test_wrong_kind_and_unknown_id_cannot_target_another_record(): void
    {
        $entry = $this->entry();
        $this->signedIn();
        $this->get("/administration/team/$entry->id/modifier")->assertNotFound();
        $this->put("/administration/team/$entry->id", $this->draft($entry))->assertNotFound();
        $this->get('/administration/projects/999999/modifier')->assertNotFound();
        $this->assertDatabaseCount('content_revisions', 0);
    }

    public function test_changed_fields_survive_reopening_in_all_content_sections(): void
    {
        $this->entry();
        $user = $this->signedIn();
        foreach (['projects', 'news', 'team'] as $kind) {
            $entry = ContentEntry::where('kind', $kind)->get()->first(fn ($entry) => ! isset($entry->source_payload['linked_project']));
            $original = $entry->source_payload;
            $data = $this->draft($entry);
            foreach (['fr', 'en'] as $locale) {
                foreach (array_keys($entry->fields()) as $field) {
                    $data['payload'][$locale][$field] = "Contrôle technique $kind $locale $field";
                }
            }
            $this->put("/administration/$kind/$entry->id", $data)->assertSessionHasNoErrors()->assertRedirect();
            $saved = $entry->fresh();
            $this->assertSame($data['payload'], $saved->draft_payload);
            $this->assertSame($original, $saved->source_payload);
            $this->get("/administration/$kind/$entry->id/modifier")->assertOk()->assertViewHas('payload', $data['payload']);
            $this->get("/administration/$kind")->assertOk()->assertSee($saved->label());
            $revision = DB::table('content_revisions')->where('content_entry_id', $entry->id)->first();
            $this->assertSame($user->id, $revision->user_id);
            $this->assertSame($data['payload'], json_decode($revision->payload, true));
        }
    }

    public function test_linked_news_heading_and_list_follow_the_saved_project(): void
    {
        $project = $this->entry();
        $news = ContentEntry::where('source_key', 'projet-'.$project->source_key)->firstOrFail();
        $this->signedIn();
        $data = $this->draft($project);
        $data['payload']['fr']['title'] = 'Projet renommé pour le contrôle technique';
        $this->put("/administration/projects/$project->id", $data)->assertSessionHasNoErrors()->assertRedirect();
        $this->get("/administration/news/$news->id/modifier")->assertOk()
            ->assertSee('<h1>'.$data['payload']['fr']['title'].'</h1>', false);
        $this->get('/administration/news')->assertOk()
            ->assertSee('<h2>'.$data['payload']['fr']['title'].'</h2>', false);
    }

    public function test_changing_account_does_not_reuse_previous_access(): void
    {
        $entry = $this->entry();
        $this->signedIn();
        $this->post('/deconnexion');
        $this->signedIn($this->admin(['is_admin' => false]));
        $this->put("/administration/projects/$entry->id", $this->draft($entry))->assertForbidden();
        $this->assertDatabaseCount('content_revisions', 0);
    }

    public function test_conflicting_edits_do_not_overwrite_the_newer_draft(): void
    {
        $entry = $this->entry();
        $this->signedIn();
        $data = $this->draft($entry);
        $this->put("/administration/projects/$entry->id", $data)->assertSessionHasNoErrors();
        $this->put("/administration/projects/$entry->id", $data)->assertSessionHasErrors('revision');
        $this->assertDatabaseCount('content_revisions', 1);
    }

    public function test_invalid_nested_fields_cannot_add_publication_or_permissions(): void
    {
        $entry = $this->entry();
        $this->signedIn();
        $data = $this->draft($entry);
        $data['payload']['fr']['published'] = true;
        $this->put("/administration/projects/$entry->id", $data)->assertSessionHasErrors('payload.fr');
        unset($data['payload']['fr']['published']);
        $data['payload']['en']['is_admin'] = true;
        $this->put("/administration/projects/$entry->id", $data)->assertSessionHasErrors('payload.en');
        $this->assertDatabaseCount('content_revisions', 0);
    }

    public function test_french_only_changes_preserve_existing_english_and_originals(): void
    {
        $entry = $this->entry();
        $this->signedIn();
        $data = $this->draft($entry);
        unset($data['payload']['en']);
        $data['payload']['fr']['title'] = 'Titre corrigé pour le test';
        $this->put("/administration/projects/$entry->id", $data)->assertSessionHasNoErrors()->assertRedirect();
        $saved = $entry->fresh();
        $this->assertSame($data['payload']['fr'], $saved->draft_payload['fr']);
        $this->assertSame($entry->source_payload['en'], $saved->draft_payload['en']);
        $this->assertSame($entry->source_payload, $saved->source_payload);
        $revision = DB::table('content_revisions')->where('content_entry_id', $entry->id)->first();
        $this->assertSame($saved->draft_payload, json_decode($revision->payload, true));
    }

    public function test_english_may_be_empty_but_french_and_field_limits_remain_required(): void
    {
        $entry = $this->entry();
        $this->signedIn();
        $data = $this->draft($entry);
        $data['payload']['en'] = array_fill_keys(array_keys($entry->fields()), '');
        $data['payload']['fr']['title'] = '';
        $this->put("/administration/projects/$entry->id", $data)->assertSessionHasErrors('payload.fr.title');
        $data['payload']['fr']['title'] = $entry->source_payload['fr']['title'];
        $data['payload']['en']['title'] = str_repeat('x', 1501);
        $this->put("/administration/projects/$entry->id", $data)->assertSessionHasErrors('payload.en.title');
        $this->assertDatabaseCount('content_revisions', 0);
        $data['payload']['en']['title'] = '';
        $this->put("/administration/projects/$entry->id", $data)->assertSessionHasNoErrors()->assertRedirect();
        $this->assertSame($data['payload']['en'], $entry->fresh()->draft_payload['en']);
    }

    public function test_saved_html_is_escaped_in_forms_and_lists(): void
    {
        $entry = $this->entry();
        $this->signedIn();
        $data = $this->draft($entry);
        $data['payload']['fr']['title'] = '<script>alert(1)</script>';
        $this->put("/administration/projects/$entry->id", $data)->assertSessionHasNoErrors();
        $this->get('/administration/projects')->assertDontSee('<script>', false)->assertSee('&lt;script&gt;', false);
        $this->get("/administration/projects/$entry->id/modifier")->assertDontSee('<script>', false);
        $news = ContentEntry::where('source_key', 'projet-'.$entry->source_key)->firstOrFail();
        $this->get('/administration/news')->assertDontSee('<script>', false)->assertSee('&lt;script&gt;', false);
        $this->get("/administration/news/$news->id/modifier")->assertDontSee('<script>', false)->assertSee('&lt;script&gt;', false);
    }

    public function test_linked_news_must_be_edited_in_the_project(): void
    {
        $project = $this->entry();
        $news = ContentEntry::where('source_key', 'projet-'.$project->source_key)->firstOrFail();
        $this->signedIn();
        $this->get("/administration/news/$news->id/modifier")->assertOk()->assertSee('Ouvrir le projet associé');
        $data = $this->draft($news);
        $data['payload']['fr']['title'] = 'Changement non autorisé du texte partagé';
        $this->put("/administration/news/$news->id", $data)->assertSessionHasErrors('payload');
        $this->assertDatabaseCount('content_revisions', 0);
    }

    public function test_reference_import_is_idempotent_and_never_replaces_drafts(): void
    {
        $entry = $this->entry();
        $this->signedIn();
        $this->put("/administration/projects/$entry->id", $this->draft($entry));
        $this->artisan('geca:import-reference')->assertSuccessful();
        $this->assertDatabaseCount('content_entries', 24);
        $this->assertSame(1, $entry->fresh()->revision);
        $this->assertSame(null, ContentEntry::where('source_key', 'reboisement-communautaire')->first()->source_payload['status']);
    }

    public function test_admin_command_refuses_non_interactive_password_input(): void
    {
        $this->artisan('geca:admin create --no-interaction')->assertFailed();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_terminal_creates_admin_with_hashed_password_only(): void
    {
        $password = 'phrase-de-test-unique-2026';
        $this->artisan('geca:admin create')
            ->expectsQuestion('Adresse e-mail du compte', 'ADMIN@example.test')
            ->expectsQuestion('Nom de la personne autorisée', 'Compte de test')
            ->expectsQuestion('Mot de passe : 15 caractères minimum, 72 caractères simples maximum', $password)
            ->expectsQuestion('Confirmer le mot de passe', $password)
            ->assertSuccessful();
        $user = User::firstOrFail();
        $this->assertTrue($user->is_active && $user->is_admin);
        $this->assertSame('admin@example.test', $user->email);
        $this->assertNotSame($password, $user->password);
        $this->assertTrue(Hash::check($password, $user->password));
    }

    public function test_terminal_rejects_mismatched_and_overlong_passwords(): void
    {
        foreach ([['test-password-123456', 'different-password'], [str_repeat('é', 40), str_repeat('é', 40)]] as [$password, $confirmation]) {
            $this->artisan('geca:admin create')
                ->expectsQuestion('Adresse e-mail du compte', 'admin@example.test')
                ->expectsQuestion('Nom de la personne autorisée', 'Compte de test')
                ->expectsQuestion('Mot de passe : 15 caractères minimum, 72 caractères simples maximum', $password)
                ->expectsQuestion('Confirmer le mot de passe', $confirmation)
                ->assertFailed();
        }
        $this->assertDatabaseCount('users', 0);
    }

    private function deletion(ContentEntry $entry): array
    {
        $confirmation = $this->get("/administration/$entry->kind/$entry->id/supprimer")->assertOk();

        return ['revision' => $entry->revision, 'confirm' => 1, 'deletion_state' => $confirmation->viewData('deletionState')];
    }

    public function test_content_deletion_and_restore_keep_original_draft_and_server_actor(): void
    {
        $this->entry();
        $actor = $this->signedIn();
        foreach (['projects', 'news', 'team'] as $kind) {
            $entry = ContentEntry::where('kind', $kind)->get()->first(fn ($item) => ! isset($item->source_payload['linked_project']));
            $this->put("/administration/$kind/$entry->id", $this->draft($entry))->assertSessionHasNoErrors();
            $entry->refresh();
            $source = $entry->source_payload;
            $draft = $entry->draft_payload;
            $data = $this->deletion($entry);
            $this->assertSame(1, $entry->fresh()->revision, 'La confirmation GET ne supprime rien');
            $this->delete("/administration/$kind/$entry->id", $data + ['deleted_by' => 999, 'deletion_batch' => 'forged'])->assertSessionHasNoErrors()->assertRedirect("/administration/$kind");
            $deleted = ContentEntry::withTrashed()->findOrFail($entry->id);
            $this->assertTrue($deleted->trashed());
            $this->assertEquals($actor->id, $deleted->deleted_by);
            $this->assertNotSame('forged', $deleted->deletion_batch);
            $this->assertSame($source, $deleted->source_payload);
            $this->assertSame($draft, $deleted->draft_payload);
            $this->assertSame(2, $deleted->revision);
            $this->assertDatabaseHas('content_revisions', ['content_entry_id' => $entry->id, 'revision' => 2, 'user_id' => $actor->id, 'source_note' => 'Suppression de la fiche vers la corbeille.']);
            $this->get("/administration/$kind/$entry->id/modifier")->assertNotFound();
            $this->get("/administration/$kind/$entry->id/photo")->assertNotFound();
            $this->put("/administration/$kind/$entry->id", $this->draft($entry))->assertNotFound();
            $this->delete("/administration/$kind/$entry->id", $data)->assertNotFound();
            $this->artisan('geca:import-reference')->assertSuccessful();
            $this->assertTrue(ContentEntry::withTrashed()->find($entry->id)->trashed(), 'Un nouvel import ne réintroduit pas une fiche supprimée');
            $this->get("/administration/$kind/corbeille")->assertOk()->assertSee($entry->label());
            $this->post("/administration/$kind/$entry->id/restaurer", ['revision' => $deleted->revision])->assertSessionHasNoErrors()->assertRedirect("/administration/$kind");
            $restored = ContentEntry::findOrFail($entry->id);
            $this->assertSame($source, $restored->source_payload);
            $this->assertSame($draft, $restored->draft_payload);
            $this->assertSame(3, $restored->revision);
            $this->assertNull($restored->deleted_by);
            $this->get("/administration/$kind/$entry->id/modifier")->assertOk();
        }
    }

    public function test_deletion_requires_current_confirmation_and_scoped_identity(): void
    {
        $entry = $this->entry();
        $this->signedIn();
        $data = $this->deletion($entry);
        $this->delete("/administration/projects/$entry->id", array_diff_key($data, ['confirm' => true]))->assertSessionHasErrors('confirm');
        $this->delete("/administration/projects/$entry->id", $data + ['kind' => 'team'])->assertSessionHasNoErrors();
        $this->get('/administration')->assertOk()->assertViewHas('counts', fn ($counts) => $counts['projects'] === 6 && $counts['news'] === 8);
        $this->post("/administration/team/$entry->id/restaurer", ['revision' => 1])->assertNotFound();
        $this->post('/administration/projects/999999/restaurer', ['revision' => 1])->assertNotFound();
        $this->get('/administration/evenements/corbeille')->assertNotFound();
        $this->get("/administration/projects/$entry->id/restaurer")->assertStatus(405);
        $this->delete("/administration/team/$entry->id", $data)->assertNotFound();
        $this->post("/administration/projects/$entry->id/restaurer", ['revision' => 0])->assertSessionHasErrors('revision');
        $this->assertTrue(ContentEntry::withTrashed()->find($entry->id)->trashed());
    }

    public function test_shared_trash_contains_only_removed_items_and_keeps_scoped_restore_links(): void
    {
        $this->entry();
        $this->signedIn();
        $removed = collect();
        foreach (['projects', 'news', 'team'] as $kind) {
            $entry = ContentEntry::where('kind', $kind)->get()->first(fn ($item) => ! isset($item->source_payload['linked_project']));
            $entry->delete();
            $removed->push($entry);
        }
        $response = $this->get('/administration/corbeille')->assertOk()
            ->assertViewHas('entries', fn ($entries) => $entries->getCollection()->pluck('id')->sort()->values()->all() === $removed->pluck('id')->sort()->values()->all());
        foreach ($removed as $entry) {
            $response->assertSee($entry->label())
                ->assertSee(route('content.restore', ['kind' => $entry->kind, 'entry' => $entry->id]), false);
        }
        $this->assertSame(3, ContentEntry::onlyTrashed()->count());
    }

    public function test_deletion_and_restore_require_mfa_active_admin_and_current_session(): void
    {
        $entry = $this->entry();
        $dummy = ['revision' => 0, 'confirm' => 1, 'deletion_state' => str_repeat('0', 64)];
        foreach (["/administration/projects/$entry->id/supprimer", '/administration/projects/corbeille', '/administration/corbeille'] as $url) {
            $this->get($url)->assertRedirect('/connexion');
        }
        $this->delete("/administration/projects/$entry->id", $dummy)->assertRedirect('/connexion');
        $this->post("/administration/projects/$entry->id/restaurer", ['revision' => 1])->assertRedirect('/connexion');
        foreach ([['is_admin' => false], ['is_active' => false]] as $attributes) {
            $user = $this->admin($attributes);
            foreach ([
                fn () => $this->get('/administration/projects/corbeille'),
                fn () => $this->get('/administration/corbeille'),
                fn () => $this->get("/administration/projects/$entry->id/supprimer"),
                fn () => $this->delete("/administration/projects/$entry->id", $dummy),
                fn () => $this->post("/administration/projects/$entry->id/restaurer", ['revision' => 1]),
            ] as $request) {
                $this->signedIn($user);
                $request()->assertForbidden();
            }
        }
        $user = $this->signedIn();
        $data = $this->deletion($entry);
        $this->withSession(['two_factor_verified' => null]);
        $this->delete("/administration/projects/$entry->id", $data)->assertRedirect('/connexion');
        $this->signedIn($user);
        User::whereKey($user->id)->update(['session_version' => 2]);
        $this->delete("/administration/projects/$entry->id", $data)->assertForbidden();
        $this->signedIn($user->fresh());
        User::whereKey($user->id)->update(['is_active' => false]);
        $this->delete("/administration/projects/$entry->id", $data)->assertForbidden();
        $this->assertFalse($entry->fresh()->trashed());
        $this->assertDatabaseCount('content_revisions', 0);
    }

    public function test_shared_trash_refuses_missing_verification_and_revoked_sessions(): void
    {
        $user = $this->signedIn();
        $this->withSession(['two_factor_verified' => null]);
        $this->get('/administration/corbeille')->assertRedirect('/connexion');
        $this->signedIn($user);
        User::whereKey($user->id)->update(['session_version' => 2]);
        $this->get('/administration/corbeille')->assertForbidden();
        $this->signedIn($user->fresh());
        User::whereKey($user->id)->update(['is_active' => false]);
        $this->get('/administration/corbeille')->assertForbidden();
    }

    public function test_content_removal_and_restore_require_csrf(): void
    {
        $entry = $this->entry();
        $this->signedIn();
        $data = $this->deletion($entry);
        $this->enforceCsrf();
        $this->delete("/administration/projects/$entry->id", $data)->assertStatus(419);
        $this->assertFalse($entry->fresh()->trashed());
        $this->withSession(['_token' => 'delete-test-token'])->delete("/administration/projects/$entry->id", $data + ['_token' => 'delete-test-token'])->assertRedirect();
        $this->post("/administration/projects/$entry->id/restaurer", ['revision' => 1])->assertStatus(419);
        $this->assertTrue(ContentEntry::withTrashed()->find($entry->id)->trashed());
        $this->post("/administration/projects/$entry->id/restaurer", ['revision' => 1, '_token' => 'delete-test-token'])->assertRedirect();
    }

    public function test_changed_project_or_related_news_blocks_stale_deletion(): void
    {
        $project = $this->entry();
        $this->signedIn();
        $data = $this->deletion($project);
        $this->put("/administration/projects/$project->id", $this->draft($project))->assertSessionHasNoErrors();
        $this->delete("/administration/projects/$project->id", $data)->assertSessionHasErrors('revision');
        $project->refresh();
        $data = $this->deletion($project);
        $news = ContentEntry::where('source_payload->linked_project', $project->source_key)->firstOrFail();
        $news->revision++;
        $news->save();
        $this->delete("/administration/projects/$project->id", $data)->assertSessionHasErrors('revision');
        $data = $this->deletion($project);
        $copy = $news->replicate();
        $copy->source_key = 'related-fixture';
        $copy->save();
        $this->delete("/administration/projects/$project->id", $data)->assertSessionHasErrors('revision');
        $this->assertSame(0, ContentEntry::onlyTrashed()->count());
    }

    public function test_project_restore_only_restores_news_removed_in_the_same_operation(): void
    {
        $project = $this->entry();
        $this->signedIn();
        $news = ContentEntry::where('source_payload->linked_project', $project->source_key)->firstOrFail();
        $this->delete("/administration/news/$news->id", $this->deletion($news))->assertSessionHasNoErrors();
        $copy = $news->replicate(['deleted_at', 'deleted_by', 'deletion_batch']);
        $copy->source_key = 'active-related-fixture';
        $copy->save();
        $this->delete("/administration/projects/$project->id", $this->deletion($project))->assertSessionHasNoErrors();
        $this->assertTrue(ContentEntry::withTrashed()->find($copy->id)->trashed());
        $this->post("/administration/news/$copy->id/restaurer", ['revision' => $copy->revision + 1])->assertSessionHasErrors('project');
        // Contenus GECA partagés : un autre administrateur actif peut restaurer,
        // mais l’acteur de l’historique est toujours pris dans sa session serveur.
        $other = $this->signedIn();
        $deleted = ContentEntry::withTrashed()->find($project->id);
        $this->post("/administration/projects/$project->id/restaurer", ['revision' => $deleted->revision, 'user_id' => 999])->assertSessionHasNoErrors();
        $this->assertTrue(ContentEntry::withTrashed()->find($news->id)->trashed());
        $this->assertFalse(ContentEntry::findOrFail($copy->id)->trashed());
        $this->assertDatabaseHas('content_revisions', ['content_entry_id' => $project->id, 'revision' => 2, 'user_id' => $other->id]);
        $this->assertSame(6, ContentEntry::where('kind', 'projects')->where('id', '!=', $project->id)->count());
        $this->assertSame(8, ContentEntry::where('kind', 'team')->count());
    }

    public function test_history_failure_rolls_back_entire_deletion_and_restore(): void
    {
        $project = $this->entry();
        $this->signedIn();
        foreach (['Suppression', 'Restauration'] as $operation) {
            DB::statement("CREATE TRIGGER fail_removal_history BEFORE INSERT ON content_revisions WHEN NEW.source_note LIKE '$operation%' BEGIN SELECT RAISE(ABORT, 'fixture history failure'); END");
            $this->withoutExceptionHandling();
            try {
                if ($operation === 'Suppression') {
                    $this->delete("/administration/projects/$project->id", $this->deletion($project));
                } else {
                    $this->post("/administration/projects/$project->id/restaurer", ['revision' => 1]);
                }
                $this->fail('La transaction doit être annulée si son historique échoue.');
            } catch (QueryException $exception) {
                $this->assertStringContainsString('fixture history failure', $exception->getMessage());
            }
            $this->assertSame($operation === 'Suppression' ? 0 : 2, ContentEntry::onlyTrashed()->count());
            $this->assertSame($operation === 'Suppression' ? 0 : 2, DB::table('content_revisions')->count());
            DB::statement('DROP TRIGGER fail_removal_history');
            $this->withExceptionHandling();
            if ($operation === 'Suppression') {
                $this->delete("/administration/projects/$project->id", $this->deletion($project))->assertSessionHasNoErrors();
            }
        }
    }

    public function test_repeated_content_removal_requests_are_limited(): void
    {
        $entry = $this->entry();
        $this->signedIn();
        for ($i = 0; $i < 12; $i++) {
            $this->delete("/administration/projects/$entry->id", [])->assertSessionHasErrors('confirm');
        }
        $this->delete("/administration/projects/$entry->id", [])->assertStatus(429)->assertHeader('Retry-After');
        $this->assertFalse($entry->fresh()->trashed());
        $this->assertDatabaseCount('content_revisions', 0);
    }

    public function test_terminal_revoke_removes_sessions_and_reset_does_not_reactivate(): void
    {
        $user = $this->admin();
        DB::table('sessions')->insert(['id' => 'test-session', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time()]);
        $this->artisan('geca:admin revoke')
            ->expectsQuestion('Adresse e-mail du compte', $user->email)
            ->expectsConfirmation('Révoquer cet accès et toutes ses sessions ?', 'yes')
            ->assertSuccessful();
        $this->assertFalse($user->fresh()->is_active);
        $this->assertDatabaseCount('sessions', 0);
        $this->artisan('geca:admin reset')
            ->expectsQuestion('Adresse e-mail du compte', $user->email)
            ->expectsQuestion('Mot de passe : 15 caractères minimum, 72 caractères simples maximum', 'new-password-for-test')
            ->expectsQuestion('Confirmer le mot de passe', 'new-password-for-test')
            ->expectsConfirmation('Réinitialiser le mot de passe et fermer les sessions ? Un compte révoqué restera révoqué.', 'yes')
            ->assertSuccessful();
        $this->assertFalse($user->fresh()->is_active);
        $this->assertSame(3, $user->fresh()->session_version);
        $this->assertTrue(Hash::check('new-password-for-test', $user->fresh()->password));
    }
}
