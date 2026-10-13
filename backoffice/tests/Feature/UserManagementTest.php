<?php

namespace Tests\Feature;

use App\Enums\BackofficeRole;
use App\Mail\LoginCode;
use App\Models\ActivityReport;
use App\Models\ContentEntry;
use App\Models\User;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private const PASSWORD = 'TEST phrase de passe uniquement';

    private function account(string $role = 'admin'): User
    {
        return User::factory()->create(['role' => $role, 'is_admin' => $role === 'admin',
            'is_active' => true, 'session_version' => 1, 'password' => self::PASSWORD]);
    }

    private function enter(User $user): void
    {
        session()->forget('password_hash_web');
        $this->verifiedAdmin($user);
        $this->withSession(['password_hash_web' => $user->getAuthPassword()]);
    }

    private function data(array $extra = []): array
    {
        $page = $this->get('/administration/comptes/ajouter')->assertOk();

        return array_replace(['creation_token' => $page->viewData('creationToken'), 'name' => 'TEST compte jetable',
            'email' => 'new@example.test', 'role' => 'reader', 'password' => self::PASSWORD,
            'password_confirmation' => self::PASSWORD, 'current_password' => self::PASSWORD], $extra);
    }

    public function test_three_roles_and_existing_accounts_keep_their_access(): void
    {
        $this->assertCount(3, BackofficeRole::cases());
        $admin = $this->account();
        $admin->role = null;
        $admin->save();
        $this->enter($admin);
        $this->get('/administration/comptes/ajouter')->assertOk()->assertSee('Administrateur')->assertSee('Éditeur')->assertSee('Lecteur');
        $this->get('/administration')->assertOk()->assertSee('Comptes et rôles');
        $ordinary = User::factory()->create(['is_admin' => false, 'is_active' => true]);
        $this->assertFalse($ordinary->hasBackofficeAccess());
        $admin->role = 'unknown';
        $admin->save();
        $this->get('/administration')->assertForbidden();
    }

    public function test_admin_creates_each_role_with_server_identity_and_no_secret_in_history(): void
    {
        $admin = $this->account();
        $this->enter($admin);
        foreach (['reader', 'editor', 'admin'] as $role) {
            $this->post('/administration/comptes', $this->data(['email' => $role.'@example.test', 'role' => $role,
                'id' => 9999, 'is_admin' => false, 'is_active' => false, 'session_version' => 100, 'actor_id' => 9999]))->assertRedirect('/administration/comptes');
            $user = User::where('email', $role.'@example.test')->firstOrFail();
            $this->assertSame($role, $user->backofficeRole()->value);
            $this->assertSame($role === 'admin', $user->is_admin);
            $this->assertTrue($user->is_active);
            $this->assertSame(1, $user->session_version);
            $this->assertTrue(Hash::check(self::PASSWORD, $user->password));
            $event = DB::table('user_access_events')->where('user_id', $user->id)->first();
            $this->assertSame($admin->id, $event->actor_id);
            $this->assertStringNotContainsString(self::PASSWORD, $event->changes);
        }
        $this->assertSame(3, DB::table('user_access_events')->count());
    }

    public function test_reader_and_editor_cannot_manage_accounts_or_newsletter_even_by_direct_address(): void
    {
        foreach (['reader', 'editor'] as $role) {
            $user = $this->account($role);
            $this->enter($user);
            foreach (['/administration/comptes', '/administration/comptes/ajouter', '/administration/comptes/'.$user->id.'/modifier', '/administration/newsletter'] as $url) {
                $this->get($url)->assertForbidden();
            }
            $this->post('/administration/comptes', ['role' => 'admin'])->assertForbidden();
            $this->put('/administration/comptes/'.$user->id, ['role' => 'admin'])->assertForbidden();
            $this->get('/administration')->assertOk()->assertDontSee('Comptes et rôles')->assertDontSee('Newsletter');
        }
        $this->assertSame(0, DB::table('user_access_events')->count());
    }

    public function test_editor_can_add_report_and_reader_download_but_cannot_mutate_or_open_edit_forms(): void
    {
        Storage::fake('reports');
        $editor = $this->account('editor');
        $this->enter($editor);
        $token = $this->get('/administration/rapports/ajouter')->assertOk()->viewData('creationToken');
        $this->post('/administration/rapports', ['creation_token' => $token, 'title' => 'TEST rapport',
            'start_date' => '2025-01-01', 'end_date' => '2025-12-31',
            'document' => UploadedFile::fake()->createWithContent('test.pdf', "%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n")])->assertSessionHasNoErrors();
        $report = ActivityReport::firstOrFail();
        $this->assertSame($editor->id, $report->created_by);
        $reader = $this->account('reader');
        $this->enter($reader);
        $this->get('/administration/rapports')->assertOk()->assertSee('Télécharger le PDF')->assertDontSee('Ajouter un rapport')->assertDontSee('Modifier');
        $this->get('/administration/rapports/'.$report->id.'/telecharger')->assertOk();
        foreach (['/administration/rapports/ajouter', '/administration/rapports/archives', '/administration/rapports/'.$report->id.'/modifier', '/administration/news/ajouter', '/administration/corbeille'] as $url) {
            $this->get($url)->assertForbidden();
        }
        $this->post('/administration/rapports', ['title' => 'forged'])->assertForbidden();
        $this->put('/administration/rapports/'.$report->id, ['title' => 'forged'])->assertForbidden();
        $this->delete('/administration/rapports/'.$report->id)->assertForbidden();
        $this->post('/administration/rapports/'.$report->id.'/restaurer')->assertForbidden();
        $this->assertSame('TEST rapport', $report->fresh()->title);
    }

    public function test_reader_consults_content_with_escaped_text_and_cannot_edit_it(): void
    {
        $entry = new ContentEntry;
        $entry->kind = 'news';
        $entry->source_key = 'admin-test';
        $entry->source_payload = ['fr' => ['title' => 'TEST titre', 'description' => '<script>TEST</script>']];
        $entry->revision = 1;
        $entry->save();
        $this->enter($this->account('reader'));
        $this->get('/administration/news')->assertOk()->assertSee('Consulter')->assertDontSee('Ajouter une actualité');
        $this->get('/administration/news/'.$entry->id.'/consulter')->assertOk()->assertSee('&lt;script&gt;TEST&lt;/script&gt;', false)->assertDontSee('<script>TEST</script>', false);
        $this->get('/administration/news/'.$entry->id.'/modifier')->assertForbidden();
        $this->put('/administration/news/'.$entry->id)->assertForbidden();
    }

    public function test_role_change_deactivation_reactivation_revoke_sessions_and_email_challenges(): void
    {
        $admin = $this->account();
        $target = $this->account('editor');
        $this->enter($admin);
        DB::table('sessions')->insert(['id' => 'TEST target', 'user_id' => $target->id, 'payload' => 'TEST', 'last_activity' => time()]);
        foreach ([['reader', 1], ['reader', 0], ['editor', 1]] as [$role, $active]) {
            $version = $target->fresh()->session_version;
            $this->put('/administration/comptes/'.$target->id, ['role' => $role, 'is_active' => $active, 'version' => $version, 'current_password' => self::PASSWORD])->assertRedirect('/administration/comptes');
            $this->assertSame($version + 1, $target->fresh()->session_version);
            $this->assertSame((bool) $active, $target->fresh()->is_active);
            $this->assertSame($role, $target->fresh()->backofficeRole()->value);
        }
        $this->assertSame(0, DB::table('sessions')->where('user_id', $target->id)->count());
        $this->assertSame(3, DB::table('user_access_events')->where('user_id', $target->id)->count());
        $this->assertTrue(Hash::check(self::PASSWORD, $target->fresh()->password));
    }

    public function test_self_change_and_stale_version_refused_without_mutation(): void
    {
        $admin = $this->account();
        $other = $this->account('editor');
        $this->enter($admin);
        $data = ['role' => 'reader', 'is_active' => 0, 'version' => 1, 'current_password' => self::PASSWORD];
        $this->put('/administration/comptes/'.$admin->id, $data)->assertSessionHasErrors('role');
        $this->put('/administration/comptes/'.$other->id, array_replace($data, ['version' => 99]))->assertStatus(409);
        $this->assertTrue($admin->fresh()->is_active);
        $this->assertSame(1, $other->fresh()->session_version);
        $this->assertSame(0, DB::table('user_access_events')->count());
    }

    public function test_invalid_roles_arrays_passwords_email_and_duplicates_refused_and_secrets_not_flashed(): void
    {
        $admin = $this->account();
        $this->enter($admin);
        foreach ([['role' => 'owner'], ['role' => ['admin']], ['name' => ['x']], ['email' => ['x']], ['email' => $admin->email], ['password' => 'short'], ['password' => str_repeat('é', 40)], ['password' => "phrase nulle\0interdite"], ['password_confirmation' => 'different'], ['current_password' => 'wrong']] as $extra) {
            if (isset($extra['password'])) {
                $extra['password_confirmation'] = $extra['password'];
            }
            $this->post('/administration/comptes', $this->data($extra))->assertSessionHasErrors();
            foreach (['current_password', 'password', 'password_confirmation'] as $secret) {
                $this->assertArrayNotHasKey($secret, session('_old_input', []));
            }
            // Chaque cas teste la validation, pas l'épuisement de la limite.
            RateLimiter::clear('users-write:'.$admin->id);
            RateLimiter::clear(md5('users-writeusers-write:'.$admin->id));
        }
        $this->assertSame(1, User::count());
        $this->assertSame(0, DB::table('user_access_events')->count());
    }

    public function test_token_replay_and_other_account_refused(): void
    {
        $admin = $this->account();
        $other = $this->account();
        $this->enter($admin);
        $data = $this->data();
        $this->enter($other);
        $this->post('/administration/comptes', $data)->assertSessionHasErrors('creation_token');
        $this->enter($admin);
        $this->post('/administration/comptes', $data)->assertRedirect('/administration/comptes');
        $this->post('/administration/comptes', array_replace($data, ['email' => 'second@example.test']))->assertSessionHasErrors('creation_token');
        $this->assertSame(3, User::count());
    }

    public function test_expired_missing_proof_changed_account_version_and_revoked_roles_refused(): void
    {
        foreach (['proof', 'version', 'inactive', 'role', 'other'] as $case) {
            $admin = $this->account();
            $this->enter($admin);
            $data = $this->data();
            match ($case) {
                'proof' => session()->forget('two_factor_verified'),
                'version' => $admin->forceFill(['session_version' => 2])->save(),
                'inactive' => $admin->forceFill(['is_active' => false])->save(),
                'role' => $admin->forceFill(['role' => 'reader', 'is_admin' => false])->save(),
                'other' => $this->actingAs($this->account()),
            };
            $response = $this->post('/administration/comptes', $data);
            $this->assertContains($response->status(), [302, 403]);
            $this->assertSame(0, DB::table('user_access_events')->count(), $case);
        }
        $this->assertSame(0, DB::table('user_access_events')->count());
    }

    public function test_each_role_logs_in_with_password_then_email_code_and_inactive_cannot_start(): void
    {
        config(['login.verification' => 'email', 'login.from' => 'sender@example.test', 'mail.mailers.login.transport' => 'array']);
        Mail::fake();
        foreach (['reader', 'editor', 'admin'] as $role) {
            Auth::logout();
            $user = $this->account($role);
            $this->post('/connexion', ['email' => $user->email, 'password' => self::PASSWORD])->assertRedirect('/connexion/double-verification');
            $this->assertGuest();
            $code = Mail::sent(LoginCode::class)->last()->code;
            $this->post('/connexion/double-verification', ['code' => $code])->assertRedirect('/administration');
            $this->assertAuthenticatedAs($user);
            $this->get('/administration')->assertOk();
            $this->post('/deconnexion');
            $user->is_active = false;
            $user->save();
            $this->post('/connexion', ['email' => $user->email, 'password' => self::PASSWORD])->assertSessionHasErrors();
            $this->assertGuest();
        }
    }

    public function test_role_change_invalidates_pending_email_code_and_old_private_session(): void
    {
        config(['login.verification' => 'email', 'login.from' => 'sender@example.test', 'mail.mailers.login.transport' => 'array']);
        Mail::fake();
        $admin = $this->account();
        $target = $this->account('editor');
        $this->post('/connexion', ['email' => $target->email, 'password' => self::PASSWORD])->assertRedirect('/connexion/double-verification');
        $pending = session('two_factor_pending');
        $binding = session('email_login_binding');
        $code = Mail::sent(LoginCode::class)->last()->code;
        $this->actingAs($admin)->withSession(['password_hash_web' => $admin->getAuthPassword(), 'admin_version' => 1,
            'two_factor_verified' => ['id' => $admin->id, 'version' => 1, 'method' => 'email', 'email' => hash('sha256', $admin->email)]]);
        $this->put('/administration/comptes/'.$target->id, ['role' => 'reader', 'is_active' => 1, 'version' => 1, 'current_password' => self::PASSWORD])->assertRedirect('/administration/comptes');
        $this->assertSame(0, DB::table('login_email_challenges')->where('user_id', $target->id)->count());
        Auth::logout();
        $this->withSession(['two_factor_pending' => $pending, 'email_login_binding' => $binding]);
        $this->post('/connexion/double-verification', ['code' => $code])->assertRedirect('/connexion');
        $this->actingAs($target->fresh())->withSession(['password_hash_web' => $target->getAuthPassword(), 'admin_version' => 1,
            'two_factor_verified' => ['id' => $target->id, 'version' => 1, 'method' => 'email', 'email' => hash('sha256', $target->email)]]);
        $this->get('/administration')->assertForbidden();
    }

    public function test_reader_can_change_own_password_but_cannot_target_other_person(): void
    {
        $reader = $this->account('reader');
        $other = $this->account();
        $this->enter($reader);
        $this->get('/administration/securite')->assertOk();
        $this->put('/administration/securite/mot-de-passe', ['user_id' => $other->id, 'current_password' => self::PASSWORD,
            'password' => 'TEST nouvelle phrase privée', 'password_confirmation' => 'TEST nouvelle phrase privée'])->assertRedirect('/connexion');
        $this->assertTrue(Hash::check('TEST nouvelle phrase privée', $reader->fresh()->password));
        $this->assertTrue(Hash::check(self::PASSWORD, $other->fresh()->password));
    }

    public function test_expired_form_and_local_only_proof_refuse_account_creation(): void
    {
        $admin = $this->account();
        $this->enter($admin);
        $data = $this->data();
        $pending = session('users_creation');
        $pending['expires'] = time() - 1;
        $this->withSession(['users_creation' => $pending]);
        $this->post('/administration/comptes', $data)->assertSessionHasErrors('creation_token');
        $data = $this->data();
        $this->app['env'] = 'local';
        config(['login.local_user' => $admin->id, 'login.local_until' => time() + 3600, 'database.connections.sqlite.database' => database_path('local.sqlite')]);
        $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])->withHeader('Host', '127.0.0.1:8000');
        session()->forget('two_factor_verified');
        $this->withSession(['two_factor_verified' => null, 'local_access' => ['id' => $admin->id, 'version' => 1, 'expires' => time() + 600]]);
        $this->get('http://127.0.0.1:8000/administration')->assertOk();
        $data['_token'] = session()->token();
        $response = $this->post('http://127.0.0.1:8000/administration/comptes', $data);
        $response->assertSessionHasErrors('current_password');
        $this->assertSame(1, User::count());
    }

    public function test_creation_failure_rolls_back_account_and_audit_together(): void
    {
        $this->enter($this->account());
        $data = $this->data();
        DB::listen(function (QueryExecuted $query) {
            if (str_contains($query->sql, 'insert into "user_access_events"')) {
                throw new \RuntimeException('TEST erreur audit');
            }
        });
        $this->post('/administration/comptes', $data)->assertStatus(500);
        $this->assertSame(1, User::count());
        $this->assertSame(0, DB::table('user_access_events')->count());
    }

    public function test_csrf_and_rate_limit_protect_user_management(): void
    {
        $this->enter($this->account());
        $this->app->bind(PreventRequestForgery::class, fn ($app) => new class($app, $app['encrypter']) extends PreventRequestForgery
        {
            protected function runningUnitTests()
            {
                return false;
            }
        });
        $this->post('/administration/comptes')->assertStatus(419);
        $data = $this->data(['current_password' => 'wrong']);
        $data['_token'] = session()->token();
        for ($i = 0; $i < 5; $i++) {
            $this->post('/administration/comptes', $data)->assertSessionHasErrors();
        }
        $this->post('/administration/comptes', $data)->assertStatus(429);
    }
}
