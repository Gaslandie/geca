<?php

namespace Tests\Feature;

use App\Models\ContentEntry;
use App\Models\MediaAsset;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ContentCreationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['geca.media_uploads_enabled' => true]);
        Storage::fake('media');
        Mail::fake();
    }

    private function admin(array $attributes = []): User
    {
        $user = User::factory()->create(array_merge(['is_admin' => true, 'is_active' => true, 'session_version' => 1], $attributes));
        $this->verifiedAdmin($user);

        return $user;
    }

    private function data(string $kind, array $extra = []): array
    {
        $page = $this->get("/administration/$kind/ajouter")->assertOk();
        $fields = $kind === 'team'
            ? ['name' => 'TEST technique, aucun membre GECA', 'role' => 'Rôle de test']
            : ['title' => 'TEST technique, sans publication', 'description' => 'Description de test uniquement, aucune activité GECA.'];

        return array_replace_recursive([
            'creation_token' => $page->viewData('creationToken'),
            'source_note' => 'Fixture technique sur base jetable, aucun fait GECA.',
            'payload' => ['fr' => $fields],
        ], $extra);
    }

    public function test_each_kind_can_be_added_edited_removed_and_restored_with_server_provenance(): void
    {
        $user = $this->admin();
        foreach (['projects', 'news', 'team'] as $kind) {
            $data = $this->data($kind, ['kind' => 'team', 'source_key' => 'forged', 'user_id' => 999, 'source_payload' => ['fr' => ['title' => 'forged']]]);
            $this->post("/administration/$kind", $data)->assertSessionHasNoErrors();
            $entry = ContentEntry::where('kind', $kind)->firstOrFail();
            $this->assertStringStartsWith('admin-', $entry->source_key);
            $this->assertSame(1, $entry->revision);
            $this->assertSame($data['payload']['fr'], array_filter($entry->source_payload['fr']));
            $this->assertSame($data['source_note'], $entry->source_payload['source_note']);
            $this->assertSame('admin', $entry->source_payload['origin']);
            $this->assertDatabaseHas('content_revisions', ['content_entry_id' => $entry->id, 'user_id' => $user->id, 'revision' => 1]);
            $this->get("/administration/$kind")->assertSee($entry->label())->assertSee('Brouillon enregistré');
            $this->get("/administration/$kind/$entry->id/modifier")->assertOk();
            $edit = ['revision' => 1, 'source_note' => 'Correction technique du brouillon de test.', 'payload' => ['fr' => $entry->draft_payload['fr']]];
            $field = $kind === 'team' ? 'name' : 'title';
            $edit['payload']['fr'][$field] = 'TEST corrigé, sans publication';
            $this->put("/administration/$kind/$entry->id", $edit)->assertSessionHasNoErrors();
            $confirmation = $this->get("/administration/$kind/$entry->id/supprimer")->assertOk();
            $this->delete("/administration/$kind/$entry->id", ['revision' => 2, 'confirm' => 1, 'deletion_state' => $confirmation->viewData('deletionState')])->assertSessionHasNoErrors();
            $this->get('/administration/corbeille')->assertSee('TEST corrigé, sans publication');
            $this->post("/administration/$kind/$entry->id/restaurer", ['revision' => 3])->assertSessionHasNoErrors();
            $this->assertSame(4, $entry->fresh()->revision);
            $this->assertSame($data['payload']['fr'][$field], $entry->fresh()->source_payload['fr'][$field]);
        }
        $this->assertDatabaseCount('content_entries', 3);
        Mail::assertNothingSent();
    }

    public function test_optional_project_facts_and_english_stay_blank_until_provided(): void
    {
        $this->admin();
        $this->post('/administration/projects', $this->data('projects'))->assertSessionHasNoErrors();
        $entry = ContentEntry::firstOrFail();
        foreach (['zone', 'period', 'partner'] as $field) {
            $this->assertSame('', $entry->draft_payload['fr'][$field]);
        }
        $this->assertSame(array_fill_keys(array_keys($entry->fields()), ''), $entry->draft_payload['en']);
        $source = $entry->source_payload;
        $this->put("/administration/projects/$entry->id", ['revision' => 1, 'source_note' => 'Ajout de la traduction technique de test.', 'payload' => ['fr' => $entry->draft_payload['fr'], 'en' => ['title' => 'TEST only']]])->assertSessionHasNoErrors();
        $this->assertSame('TEST only', $entry->fresh()->draft_payload['en']['title']);
        $this->assertSame($source, $entry->fresh()->source_payload);
    }

    public function test_creation_token_is_single_use_and_bound_to_kind_account_and_expiry(): void
    {
        $user = $this->admin();
        $data = $this->data('projects');
        $this->post('/administration/news', $data)->assertSessionHasErrors('creation_token');
        $other = $this->admin();
        $this->post('/administration/projects', $data)->assertSessionHasErrors('creation_token');
        $this->verifiedAdmin($user);
        $this->post('/administration/projects', $data)->assertSessionHasNoErrors();
        $this->post('/administration/projects', $data)->assertSessionHasErrors('creation_token');
        $this->assertDatabaseCount('content_entries', 1);
        $data = $this->data('team');
        session()->put('content_creation.'.$data['creation_token'].'.expires', time() - 1);
        $this->post('/administration/team', $data)->assertSessionHasErrors('creation_token');
        $this->assertDatabaseCount('content_entries', 1);
    }

    public function test_required_fields_note_lengths_and_nested_protected_keys_are_validated(): void
    {
        $this->admin();
        foreach ([
            ['payload' => ['fr' => ['title' => '']]],
            ['source_note' => ''],
            ['payload' => ['fr' => ['description' => str_repeat('x', 20001)]]],
            ['payload' => ['fr' => ['linked_project' => 'forged']]],
            ['payload' => ['photo_id' => 'forged']],
            ['revision' => 999],
        ] as $extra) {
            $this->post('/administration/projects', $this->data('projects', $extra))->assertSessionHasErrors();
        }
        $this->assertDatabaseCount('content_entries', 0);
        $this->assertDatabaseCount('content_revisions', 0);
        $this->get('/administration/evenements/ajouter')->assertNotFound();
        $this->post('/administration/evenements', [])->assertNotFound();
    }

    public function test_private_photo_is_processed_and_forged_files_or_disabled_upload_are_refused(): void
    {
        $user = $this->admin();
        $data = $this->data('team', ['photo' => UploadedFile::fake()->image('portrait-test.jpg', 80, 80), 'user_id' => 999]);
        $this->post('/administration/team', $data)->assertSessionHasNoErrors();
        $entry = ContentEntry::firstOrFail();
        $media = MediaAsset::firstOrFail();
        $this->assertSame($media->id, $entry->draft_payload['photo_id']);
        $this->assertSame($user->id, $media->user_id);
        Storage::disk('media')->assertExists([$media->id.'/original.bin', $media->id.'/preview.webp']);
        $this->assertSame(0600, fileperms(Storage::disk('media')->path($media->id.'/preview.webp')) & 0777);
        $this->get("/administration/medias/$media->id/apercu")->assertOk();
        $this->post('/administration/news', $this->data('news', ['photo' => UploadedFile::fake()->createWithContent('photo.jpg', '<?php echo 1;'), 'alt_fr' => 'Test']))->assertSessionHasErrors('photo');
        config(['geca.media_uploads_enabled' => false]);
        $this->post('/administration/news', $this->data('news', ['photo' => UploadedFile::fake()->image('photo.jpg'), 'alt_fr' => 'Test']))->assertSessionHasErrors('photo');
        $this->assertDatabaseCount('content_entries', 1);
        $this->assertDatabaseCount('media_assets', 1);
    }

    public function test_photo_quota_and_failed_history_leave_no_entry_or_orphan_media(): void
    {
        $this->admin();
        Storage::disk('media')->put('quota.bin', str_repeat('x', 256 * 1024 * 1024));
        $data = $this->data('projects', ['photo' => UploadedFile::fake()->image('photo.jpg'), 'alt_fr' => 'Test']);
        $this->post('/administration/projects', $data)->assertSessionHasErrors('photo');
        Storage::disk('media')->delete('quota.bin');
        DB::statement('DROP TABLE content_revisions');
        $this->withoutExceptionHandling();
        try {
            $this->post('/administration/projects', $data);
            $this->fail('Une erreur d’historique doit annuler la création.');
        } catch (QueryException $exception) {
            $this->assertDatabaseCount('content_entries', 0);
            $this->assertDatabaseCount('media_assets', 0);
            $this->assertSame([], Storage::disk('media')->allFiles());
        }
    }

    public function test_anonymous_non_admin_inactive_missing_verification_and_revoked_sessions_cannot_create(): void
    {
        foreach (['projects', 'news', 'team'] as $kind) {
            $this->get("/administration/$kind/ajouter")->assertRedirect('/connexion');
            $this->post("/administration/$kind")->assertRedirect('/connexion');
        }
        foreach ([['is_admin' => false], ['is_active' => false]] as $attributes) {
            $user = $this->admin($attributes);
            $this->get('/administration/projects/ajouter')->assertForbidden();
            $this->verifiedAdmin($user);
            $this->post('/administration/projects')->assertForbidden();
        }
        $user = $this->admin();
        $data = $this->data('projects');
        $this->withSession(['two_factor_verified' => null]);
        $this->post('/administration/projects', $data)->assertRedirect('/connexion');
        $this->verifiedAdmin($user);
        User::whereKey($user->id)->update(['session_version' => 2]);
        $this->post('/administration/projects', $data)->assertForbidden();
        $this->verifiedAdmin($user->fresh());
        User::whereKey($user->id)->update(['is_active' => false]);
        $this->post('/administration/projects', $data)->assertForbidden();
        $this->assertDatabaseCount('content_entries', 0);
    }

    public function test_csrf_is_required_and_plain_text_is_escaped_when_rendered(): void
    {
        $this->admin();
        $data = $this->data('news', ['payload' => ['fr' => ['title' => '<script>alert(1)</script>']]]);
        $this->app->bind(PreventRequestForgery::class, fn ($app) => new class($app, $app['encrypter']) extends PreventRequestForgery
        {
            protected function runningUnitTests()
            {
                return false;
            }
        });
        $this->post('/administration/news', $data)->assertStatus(419);
        $this->assertDatabaseCount('content_entries', 0);
        $this->withSession(['_token' => 'creation-csrf-token'])->post('/administration/news', $data + ['_token' => 'creation-csrf-token'])->assertSessionHasNoErrors();
        $this->get('/administration/news')->assertSee('&lt;script&gt;alert(1)&lt;/script&gt;', false)->assertDontSee('<script>alert(1)</script>', false);
    }

    public function test_creation_attempts_are_rate_limited(): void
    {
        $this->admin();
        for ($i = 0; $i < 6; $i++) {
            $this->post('/administration/news', $this->data('news', ['source_note' => '']))->assertSessionHasErrors();
        }
        $this->post('/administration/news', $this->data('news'))->assertStatus(429);
        $this->assertDatabaseCount('content_entries', 0);
    }
}
