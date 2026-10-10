<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Tests\TestCase;

class AccountSecurityTest extends TestCase
{
    use RefreshDatabase;

    private const CURRENT = 'Phrase actuelle pour les tests';

    private const NEXT = 'Une nouvelle phrase pour les tests';

    private const PASSWORD_URL = '/administration/securite/mot-de-passe';

    private const LOGOUT_URL = '/administration/securite/deconnecter';

    private function admin(string $method = 'email'): User
    {
        config(['login.verification' => $method]);
        $user = User::factory()->create(['password' => self::CURRENT, 'is_active' => true, 'is_admin' => true, 'session_version' => 1]);
        if ($method === 'authenticator') {
            $this->verifiedAdmin($user);
        } else {
            $this->emailSession($user);
        }
        Mail::fake();

        return $user->refresh();
    }

    private function emailSession(User $user, int $version = 1): void
    {
        $this->actingAs($user)->withSession([
            'admin_version' => $version,
            'two_factor_verified' => ['id' => $user->id, 'version' => $version, 'method' => 'email', 'email' => hash('sha256', $user->email)],
        ]);
    }

    private function data(array $extra = []): array
    {
        return array_replace(['current_password' => self::CURRENT, 'password' => self::NEXT, 'password_confirmation' => self::NEXT], $extra);
    }

    private function sessions(User $user, User $other): void
    {
        foreach (['own-one' => $user->id, 'own-two' => $user->id, 'other' => $other->id] as $id => $owner) {
            DB::table('sessions')->insert(['id' => $id, 'user_id' => $owner, 'payload' => 'fixture', 'last_activity' => time()]);
        }
        foreach ([$user, $other] as $account) {
            DB::table('login_email_challenges')->insert([
                'id' => (string) Str::uuid(), 'user_id' => $account->id, 'code_hash' => str_repeat('a', 64),
                'session_hash' => str_repeat('b', 64), 'email_hash' => hash('sha256', $account->email),
                'password_hash' => hash('sha256', $account->password), 'session_version' => 1, 'expires_at' => now()->addMinutes(5),
            ]);
        }
    }

    public function test_password_changes_only_session_owner_and_closes_every_old_access(): void
    {
        $user = $this->admin();
        $other = User::factory()->create(['is_admin' => true, 'is_active' => true]);
        $otherBefore = $other->fresh()->getRawOriginal();
        $before = $user->getRawOriginal();
        $this->sessions($user, $other);
        $sessionId = session()->getId();
        $csrf = session()->token();
        $this->put(self::PASSWORD_URL, $this->data(['user_id' => $other->id, 'is_admin' => false, 'email' => 'forged@example.test']))
            ->assertRedirect('/connexion')->assertSessionHasNoErrors();
        $this->assertGuest();
        $this->assertTrue(Hash::check(self::NEXT, $user->fresh()->password));
        $this->assertFalse(Hash::check(self::CURRENT, $user->fresh()->password));
        $this->assertNotSame(self::NEXT, $user->fresh()->password);
        $this->assertSame(2, $user->fresh()->session_version);
        $this->assertSame($before['email'], $user->fresh()->email);
        $this->assertTrue($user->fresh()->is_admin);
        $this->assertNotSame($before['remember_token'], $user->fresh()->remember_token);
        $this->assertSame($otherBefore, $other->fresh()->getRawOriginal());
        $this->assertDatabaseMissing('sessions', ['user_id' => $user->id]);
        $this->assertDatabaseHas('sessions', ['id' => 'other', 'user_id' => $other->id]);
        $this->assertDatabaseMissing('login_email_challenges', ['user_id' => $user->id]);
        $this->assertDatabaseHas('login_email_challenges', ['user_id' => $other->id]);
        $this->assertNotSame($sessionId, session()->getId());
        $this->assertNotSame($csrf, session()->token());
        $this->assertNull(session('two_factor_verified'));
        $this->assertNull(session('local_access'));
        $this->emailSession($user->fresh(), 1);
        $this->get('/administration')->assertForbidden();
        Mail::assertNothingSent();
    }

    public function test_disconnect_all_closes_sessions_without_changing_password_or_second_factor(): void
    {
        $user = $this->admin('authenticator');
        $other = User::factory()->create();
        $this->sessions($user, $other);
        $before = $user->getRawOriginal();
        $this->post(self::LOGOUT_URL, ['current_password' => self::CURRENT, 'user_id' => $other->id])->assertRedirect('/connexion');
        $this->assertGuest();
        $after = $user->fresh();
        $this->assertSame($before['password'], $after->getRawOriginal('password'));
        $this->assertSame($before['two_factor_secret'], $after->getRawOriginal('two_factor_secret'));
        $this->assertSame(2, $after->session_version);
        $this->assertDatabaseMissing('sessions', ['user_id' => $user->id]);
        $this->assertDatabaseHas('sessions', ['id' => 'other']);
        $this->assertDatabaseMissing('login_email_challenges', ['user_id' => $user->id]);
    }

    public function test_authenticator_password_change_keeps_setup_and_recovery_codes(): void
    {
        $user = $this->admin('authenticator');
        $user->two_factor_recovery_hashes = [hash('sha256', 'fixture')];
        $user->save();
        $user->refresh();
        $before = $user->getRawOriginal();
        $this->put(self::PASSWORD_URL, $this->data())->assertRedirect('/connexion');
        foreach (['two_factor_secret', 'two_factor_recovery_hashes', 'two_factor_confirmed_at', 'two_factor_last_step'] as $field) {
            $this->assertSame($before[$field], $user->fresh()->getRawOriginal($field));
        }
        $this->assertTrue(Hash::check(self::NEXT, $user->fresh()->password));
    }

    public function test_bad_current_password_fails_both_actions_without_flashing_any_password(): void
    {
        $user = $this->admin();
        $before = $user->getRawOriginal();
        $this->put(self::PASSWORD_URL, $this->data(['current_password' => 'Incorrect secret']))->assertRedirect('/administration/securite')->assertSessionHasErrors('current_password');
        $this->post(self::LOGOUT_URL, ['current_password' => 'Incorrect secret'])->assertRedirect('/administration/securite')->assertSessionHasErrors('current_password');
        foreach (['current_password', 'password', 'password_confirmation'] as $key) {
            $this->assertNull(session('_old_input.'.$key));
        }
        $this->assertSame($before, $user->fresh()->getRawOriginal());
        $this->assertAuthenticatedAs($user);
    }

    public function test_short_mismatched_same_and_overlong_multibyte_passwords_are_refused(): void
    {
        $user = $this->admin();
        $before = $user->password;
        foreach (['short', self::CURRENT, str_repeat('x', 73), str_repeat('é', 37), "Phrase de test avec\0caractère nul", ['invalid']] as $index => $password) {
            if ($index === 5) {
                $this->travel(61)->seconds();
            }
            $this->put(self::PASSWORD_URL, $this->data(['password' => $password, 'password_confirmation' => $password]))->assertSessionHasErrors('password');
        }
        $this->travel(61)->seconds();
        $this->put(self::PASSWORD_URL, $this->data(['password_confirmation' => 'Different phrase']))->assertSessionHasErrors('password');
        $this->assertSame($before, $user->fresh()->password);
        $this->assertSame(1, $user->fresh()->session_version);
    }

    public function test_password_limit_does_not_silently_truncate(): void
    {
        $user = $this->admin();
        $phrase = str_repeat('é', 36);
        $this->put(self::PASSWORD_URL, $this->data(['password' => $phrase, 'password_confirmation' => $phrase]))->assertRedirect('/connexion');
        $this->assertTrue(Hash::check($phrase, $user->fresh()->password));
    }

    public function test_anonymous_missing_proof_non_admin_inactive_and_revoked_accesses_fail(): void
    {
        $this->put(self::PASSWORD_URL, $this->data())->assertRedirect('/connexion');
        $this->post(self::LOGOUT_URL, ['current_password' => self::CURRENT])->assertRedirect('/connexion');
        foreach (['proof', 'is_admin', 'is_active', 'session_version', 'email'] as $change) {
            $user = $this->admin();
            if ($change === 'proof') {
                session()->forget('two_factor_verified');
            } else {
                $user->$change = match ($change) {
                    'session_version' => 2, 'email' => 'changed@example.test', default => false
                };
                $user->save();
            }
            $response = $this->put(self::PASSWORD_URL, $this->data());
            $this->assertContains($response->status(), [302, 403]);
            $this->assertTrue(Hash::check(self::CURRENT, $user->fresh()->password));
            Auth::logout();
        }
    }

    public function test_reusing_another_accounts_proof_is_refused(): void
    {
        $previous = $this->admin();
        $proof = session('two_factor_verified');
        $user = $this->admin();
        $this->withSession(['two_factor_verified' => $proof]);
        $this->put(self::PASSWORD_URL, $this->data())->assertRedirect('/connexion');
        $this->assertTrue(Hash::check(self::CURRENT, $user->fresh()->password));
        $this->assertSame(1, $previous->fresh()->session_version);
    }

    public function test_local_access_can_view_but_cannot_change_password_or_disconnect_accounts(): void
    {
        $user = $this->admin();
        $this->app->detectEnvironment(fn () => 'local');
        config(['login.local_user' => $user->id, 'login.local_until' => time() + 3600, 'database.connections.sqlite.database' => database_path('local.sqlite')]);
        // La connexion de test reste mémoire ; seul le contexte attendu du service local est configuré.
        $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.1', 'HTTP_HOST' => '127.0.0.1:8000']);
        session()->forget('two_factor_verified');
        $this->withSession(['local_access' => ['id' => $user->id, 'version' => 1, 'expires' => time() + 600]]);
        $this->get('/administration/securite')->assertOk()->assertSee('Vous utilisez l’accès local temporaire')->assertSee('disabled', false)
            ->assertSee('L’envoi des codes e-mail n’est pas encore configuré')->assertDontSee('Quitter l’accès local pour me connecter');
        $this->put(self::PASSWORD_URL, $this->data(['_token' => session()->token()]))->assertSessionHasErrors('security');
        $this->post(self::LOGOUT_URL, ['current_password' => self::CURRENT, '_token' => session()->token()])->assertSessionHasErrors('security');
        $this->assertTrue(Hash::check(self::CURRENT, $user->fresh()->password));
        $this->assertSame(1, $user->fresh()->session_version);
        // Une ancienne preuve Authenticator ne remplace pas un secret supprimé.
        config(['login.verification' => 'authenticator']);
        $user->two_factor_secret = '';
        $user->two_factor_confirmed_at = now();
        $user->save();
        $this->withSession(['two_factor_verified' => ['id' => $user->id, 'version' => 1, 'method' => 'authenticator']]);
        $this->get('/administration/securite')->assertOk()->assertSee('Vous utilisez l’accès local temporaire');
        $this->put(self::PASSWORD_URL, $this->data(['_token' => session()->token()]))->assertSessionHasErrors('security');
        $this->assertTrue(Hash::check(self::CURRENT, $user->fresh()->password));
    }

    public function test_csrf_is_enforced_for_both_sensitive_actions(): void
    {
        $user = $this->admin();
        $this->app->detectEnvironment(fn () => 'local');
        $this->withMiddleware(PreventRequestForgery::class);
        $this->withSession(['_token' => 'fixture-csrf']);
        $this->put(self::PASSWORD_URL, $this->data())->assertStatus(419);
        $this->post(self::LOGOUT_URL, ['current_password' => self::CURRENT])->assertStatus(419);
        $this->assertSame(1, $user->fresh()->session_version);
        $this->put(self::PASSWORD_URL, $this->data(['_token' => 'fixture-csrf']))->assertRedirect('/connexion');
    }

    public function test_attempt_limit_is_shared_across_actions_sessions_and_ip_addresses(): void
    {
        $user = $this->admin();
        for ($n = 0; $n < 5; $n++) {
            $this->put(self::PASSWORD_URL, $this->data(['current_password' => 'wrong']))->assertSessionHasErrors('current_password');
        }
        session()->regenerate();
        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.9']);
        $this->post(self::LOGOUT_URL, ['current_password' => self::CURRENT])->assertStatus(429);
        $this->assertSame(1, $user->fresh()->session_version);
        RateLimiter::clear('account-security:'.$user->id);
    }

    public function test_database_failure_rolls_back_password_and_revocation(): void
    {
        $user = $this->admin();
        $before = $user->getRawOriginal();
        DB::table('sessions')->insert(['id' => 'own', 'user_id' => $user->id, 'payload' => 'fixture', 'last_activity' => time()]);
        $this->withoutExceptionHandling();
        DB::statement('DROP TABLE login_email_challenges');
        try {
            $this->put(self::PASSWORD_URL, $this->data());
            $this->fail('La mutation doit être annulée après un échec de base.');
        } catch (QueryException) {
            $this->assertSame($before, $user->fresh()->getRawOriginal());
            $this->assertDatabaseHas('sessions', ['id' => 'own']);
            $this->assertAuthenticatedAs($user);
        }
    }
}
