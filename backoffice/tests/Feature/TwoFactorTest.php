<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\TwoFactor;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use OTPHP\TOTP;
use Tests\TestCase;

class TwoFactorTest extends TestCase
{
    use RefreshDatabase;

    private function admin(bool $enrolled = false): User
    {
        $user = User::factory()->create(['is_admin' => true, 'is_active' => true, 'session_version' => 1]);
        if ($enrolled) {
            $user->two_factor_secret = TOTP::generate()->getSecret();
            $user->two_factor_confirmed_at = now();
            $user->save();
        }

        return $user;
    }

    private function begin(User $user): void
    {
        Auth::logout();
        $this->post('/connexion', ['email' => $user->email, 'password' => 'password'])->assertRedirect('/connexion/double-verification');
        $this->assertGuest();
    }

    private function code(string $secret, int $offset = 0): string
    {
        return TOTP::createFromSecret($secret)->at(now()->timestamp + $offset);
    }

    public function test_password_alone_never_allows_any_private_route(): void
    {
        $user = $this->admin();
        $this->begin($user);
        foreach (['/administration', '/administration/newsletter', '/administration/securite', '/administration/projects'] as $url) {
            $this->get($url)->assertRedirect('/connexion');
        }
        $this->post('/administration/newsletter/simulation')->assertRedirect('/connexion');
        $this->get('/connexion/double-verification')->assertOk()->assertSee('Protéger votre compte');
        $this->get('/connexion/double-verification/qr')->assertOk()->assertHeader('Content-Type', 'image/svg+xml');
        $this->assertNull($user->fresh()->two_factor_confirmed_at);
    }

    public function test_setup_confirms_phone_shows_single_use_backups_once_and_requires_acknowledgement(): void
    {
        $user = $this->admin();
        $this->begin($user);
        $secret = Crypt::decryptString(session('two_factor_setup_secret'));
        $this->post('/connexion/double-verification', ['code' => $this->code($secret)])->assertRedirect('/connexion/double-verification/codes-de-secours');
        $this->assertGuest();
        $saved = $user->fresh();
        $this->assertNotNull($saved->two_factor_confirmed_at);
        $this->assertCount(10, $saved->two_factor_recovery_hashes);
        $this->assertNotSame($secret, DB::table('users')->where('id', $user->id)->value('two_factor_secret'));
        $this->assertArrayNotHasKey('two_factor_secret', $saved->toArray());
        $this->get('/administration')->assertRedirect('/connexion');
        $display = $this->get('/connexion/double-verification/codes-de-secours')->assertOk();
        $codes = $display->viewData('codes');
        $this->assertCount(10, $codes);
        $this->assertNotContains($codes[0], $saved->two_factor_recovery_hashes);
        $this->get('/connexion/double-verification/codes-de-secours')->assertViewHas('codes', []);
        $this->post('/connexion/double-verification/terminer')->assertSessionHasErrors('saved');
        $this->assertGuest();
        $this->post('/connexion/double-verification/terminer', ['saved' => 1])->assertRedirect('/administration');
        $this->assertAuthenticatedAs($saved);
        $this->get('/administration')->assertOk();
        $this->assertNull(session('two_factor_pending'));
        $this->assertNull(session('two_factor_setup_secret'));
    }

    public function test_wrong_malformed_expired_or_replayed_totp_is_refused_and_not_flashed(): void
    {
        $this->freezeTime();
        $user = $this->admin(true);
        $this->begin($user);
        $expired = $this->code($user->two_factor_secret, -120);
        foreach (['abcdef', $expired] as $code) {
            $this->post('/connexion/double-verification', ['code' => $code])->assertSessionHasErrors('code');
            $this->assertGuest();
            $this->assertNull(session('_old_input.code'));
        }
        $code = $this->code($user->two_factor_secret);
        $this->post('/connexion/double-verification', ['code' => $code])->assertRedirect('/administration');
        $this->get('/administration')->assertOk();
        $this->post('/deconnexion');
        $this->begin($user->fresh());
        $this->post('/connexion/double-verification', ['code' => $code])->assertSessionHasErrors('code');
        $this->assertGuest();
        $this->travel(30)->seconds();
        $this->post('/connexion/double-verification', ['code' => $this->code($user->two_factor_secret)])->assertRedirect('/administration');
    }

    public function test_recovery_code_requires_password_and_is_consumed_only_once(): void
    {
        $user = $this->admin(true);
        $codes = app(TwoFactor::class)->newRecoveryCodes($user);
        $user->save();
        $this->post('/connexion/double-verification', ['recovery_code' => $codes[0]])->assertRedirect('/connexion');
        $this->begin($user);
        $this->post('/connexion/double-verification', ['recovery_code' => $codes[0]])->assertRedirect('/administration');
        $this->assertCount(9, $user->fresh()->two_factor_recovery_hashes);
        $this->post('/deconnexion');
        $this->begin($user->fresh());
        $this->post('/connexion/double-verification', ['recovery_code' => $codes[0]])->assertSessionHasErrors('recovery_code');
        $this->assertGuest();
        $this->assertNull(session('_old_input.recovery_code'));
    }

    public function test_pending_connection_expires_and_cannot_survive_revocation_or_password_change(): void
    {
        foreach (['expired', 'revoked', 'role', 'version', 'password'] as $case) {
            $user = $this->admin(true);
            $this->begin($user);
            match ($case) {
                'expired' => $this->travel(301)->seconds(),
                'revoked' => $user->forceFill(['is_active' => false])->save(),
                'role' => $user->forceFill(['is_admin' => false])->save(),
                'version' => DB::table('users')->where('id', $user->id)->update(['session_version' => 2]),
                'password' => $user->update(['password' => 'changed-test-password']),
            };
            $this->post('/connexion/double-verification', ['code' => $this->code($user->two_factor_secret)])->assertRedirect('/connexion');
            $this->assertGuest();
            $this->travelBack();
        }
    }

    public function test_existing_password_only_session_and_mfa_from_another_account_are_refused(): void
    {
        $user = $this->admin(true);
        $other = $this->admin(true);
        foreach ([null, ['id' => $other->id, 'version' => 1], ['id' => $user->id, 'version' => 0]] as $verified) {
            $this->actingAs($user)->withSession(['admin_version' => 1, 'two_factor_verified' => $verified]);
            $this->get('/administration')->assertRedirect('/connexion');
            $this->assertGuest();
        }
    }

    public function test_mfa_account_limit_survives_new_password_session_and_different_ip(): void
    {
        $user = $this->admin(true);
        $this->begin($user);
        for ($i = 0; $i < 5; $i++) {
            $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.'.($i + 1)])
                ->post('/connexion/double-verification', ['code' => 'invalid'])->assertSessionHasErrors('code');
        }
        $this->begin($user);
        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.1'])
            ->post('/connexion/double-verification', ['code' => $this->code($user->two_factor_secret)])->assertStatus(429);
        $this->assertGuest();
    }

    public function test_regeneration_requires_password_and_second_factor_invalidates_old_codes_and_sessions(): void
    {
        $user = $this->admin(true);
        $old = app(TwoFactor::class)->newRecoveryCodes($user);
        $user->save();
        $this->actingAs($user)->withSession(['admin_version' => 1, 'two_factor_verified' => ['id' => $user->id, 'version' => 1]]);
        $this->post('/administration/securite/codes', ['password' => 'wrong', 'code' => $old[0]])->assertSessionHasErrors('code');
        $this->assertSame(1, $user->fresh()->session_version);
        $this->post('/administration/securite/codes', ['password' => 'password', 'code' => 'invalid'])->assertSessionHasErrors('code');
        $response = $this->post('/administration/securite/codes', ['password' => 'password', 'code' => $old[0]])->assertOk();
        $this->assertCount(10, $response->viewData('codes'));
        $this->assertSame(2, $user->fresh()->session_version);
        $this->get('/administration')->assertOk();
        $this->assertFalse(app(TwoFactor::class)->consumeRecovery($user->fresh(), $old[1]));
        $this->assertNull(session('_old_input.password'));
    }

    public function test_terminal_recovery_requires_identity_confirmation_rotates_password_and_keeps_revoked_account_revoked(): void
    {
        $user = $this->admin(true);
        $user->forceFill(['is_active' => false])->save();
        $originalSecret = $user->two_factor_secret;
        $question = 'Avez-vous vérifié hors ligne l’identité et l’autorisation de la personne ? Cette opération impose un nouveau mot de passe et annule le téléphone, les codes de secours et toutes les sessions.';
        $this->artisan('geca:admin recover-mfa')->expectsQuestion('Adresse e-mail du compte', $user->email)
            ->expectsConfirmation($question, 'no')->assertFailed();
        $this->assertSame($originalSecret, $user->fresh()->two_factor_secret);
        $newPassword = 'A-new-private-test-password';
        $this->artisan('geca:admin recover-mfa')->expectsQuestion('Adresse e-mail du compte', $user->email)
            ->expectsConfirmation($question, 'yes')
            ->expectsQuestion('Mot de passe : 15 caractères minimum, 72 caractères simples maximum', $newPassword)
            ->expectsQuestion('Confirmer le mot de passe', $newPassword)->assertSuccessful();
        $saved = $user->fresh();
        $this->assertFalse($saved->is_active);
        $this->assertNull($saved->two_factor_secret);
        $this->assertNull($saved->two_factor_confirmed_at);
        $this->assertNull($saved->two_factor_recovery_hashes);
        $this->assertSame(2, $saved->session_version);
        $this->assertTrue(Hash::check($newPassword, $saved->password));
    }

    public function test_authenticator_matches_standard_totp_vector_and_enrollment_cannot_use_backup_instead_of_phone(): void
    {
        // RFC 6238, SHA-1 at 59 seconds, last six digits of 94287082.
        $this->assertSame('287082', TOTP::createFromSecret('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ')->at(59));
        $user = $this->admin();
        $this->begin($user);
        $this->post('/connexion/double-verification', ['recovery_code' => str_repeat('a', 35)])->assertSessionHasErrors('code');
        $this->assertNull($user->fresh()->two_factor_confirmed_at);
        $this->assertGuest();
    }

    public function test_account_identifier_from_browser_never_changes_second_factor_owner(): void
    {
        $owner = $this->admin(true);
        $other = $this->admin(true);
        $this->begin($owner);
        $this->post('/connexion/double-verification', ['code' => $this->code($other->two_factor_secret), 'id' => $other->id])->assertSessionHasErrors('code');
        $this->assertGuest();
        $this->post('/connexion/double-verification', ['code' => $this->code($owner->two_factor_secret), 'id' => $other->id])->assertRedirect('/administration');
        $this->assertAuthenticatedAs($owner);
    }

    public function test_all_second_factor_posts_require_csrf_and_private_qr_cannot_be_opened_anonymously(): void
    {
        $user = $this->admin();
        $this->get('/connexion/double-verification/qr')->assertRedirect('/connexion');
        $this->begin($user);
        $this->app->bind(PreventRequestForgery::class, fn ($app) => new class($app, $app['encrypter']) extends PreventRequestForgery
        {
            protected function runningUnitTests()
            {
                return false;
            }
        });
        foreach (['/connexion/double-verification', '/connexion/double-verification/terminer', '/connexion/double-verification/annuler'] as $url) {
            $this->post($url, ['code' => '123456', 'saved' => 1])->assertStatus(419);
        }
    }
}
