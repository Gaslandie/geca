<?php

namespace Tests\Feature;

use App\Mail\LoginCode;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class EmailLoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['login.verification' => 'email', 'login.from' => 'sender@example.test', 'mail.mailers.login.transport' => 'array']);
        Mail::fake();
    }

    private function admin(): User
    {
        return User::factory()->create(['is_admin' => true, 'is_active' => true, 'session_version' => 1]);
    }

    private function begin(User $user): string
    {
        Auth::logout();
        $this->post('/connexion', ['email' => $user->email, 'password' => 'password'])->assertRedirect('/connexion/double-verification');
        $this->assertGuest();

        return Mail::sent(LoginCode::class)->last()->code;
    }

    public function test_email_only_after_password_and_only_to_server_account_address(): void
    {
        $user = $this->admin();
        $this->post('/connexion', ['email' => $user->email, 'password' => 'wrong'])->assertSessionHasErrors();
        Mail::assertNothingSent();
        $code = $this->begin($user);
        Mail::assertSent(LoginCode::class, fn ($mail) => $mail->hasTo($user->email) && $mail->from[0]['address'] === 'sender@example.test' && preg_match('/^[0-9]{6}$/', $mail->code));
        $pending = session('two_factor_pending');
        $stored = DB::table('login_email_challenges')->first();
        $this->assertNotSame($code, $stored->code_hash);
        $this->assertStringNotContainsString($code, json_encode($pending));
        $this->get('/connexion/double-verification')->assertOk()->assertSee('Saisissez le code reçu par e-mail')->assertDontSee($code)->assertDontSee('Authenticator');
        $this->get('/administration')->assertRedirect('/connexion');
        $this->post('/connexion/double-verification', ['code' => $code, 'email' => 'other@example.test'])->assertRedirect('/administration');
        $this->assertAuthenticatedAs($user);
        $this->get('/administration')->assertOk();
        $this->assertNotNull(DB::table('login_email_challenges')->value('used_at'));
        $this->assertNull($user->fresh()->two_factor_secret);
        $this->get('/administration/securite')->assertOk()->assertDontSee('codes de secours');
        $this->get('/connexion/double-verification/qr')->assertRedirect('/administration');
    }

    public function test_code_is_single_use_even_when_old_pending_session_is_restored(): void
    {
        $user = $this->admin();
        $code = $this->begin($user);
        $pending = session('two_factor_pending');
        $this->post('/connexion/double-verification', ['code' => $code])->assertRedirect('/administration');
        Auth::logout();
        $this->withSession(['two_factor_pending' => $pending]);
        $this->post('/connexion/double-verification', ['code' => $code])->assertRedirect('/connexion');
        $this->assertGuest();
    }

    public function test_expiry_and_other_session_refused(): void
    {
        $user = $this->admin();
        $code = $this->begin($user);
        $original = session('two_factor_pending');
        $this->app['session']->invalidate();
        $this->withSession(['two_factor_pending' => $original]);
        $this->post('/connexion/double-verification', ['code' => $code])->assertRedirect('/connexion');
        $this->assertGuest();
        RateLimiter::clear('email-login-send:'.$user->id);
        $code = $this->begin($user);
        $this->travel(301)->seconds();
        $this->post('/connexion/double-verification', ['code' => $code])->assertRedirect('/connexion');
        $this->assertGuest();
    }

    public function test_five_wrong_attempts_exhaust_the_challenge_and_do_not_flash_codes(): void
    {
        $user = $this->admin();
        $code = $this->begin($user);
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->post('/connexion/double-verification', ['code' => 'invalid'])->assertSessionHasErrors('code');
            $this->assertGuest();
            $this->assertArrayNotHasKey('code', session('_old_input', []));
        }
        $this->assertSame(5, DB::table('login_email_challenges')->value('attempts'));
        $this->post('/connexion/double-verification', ['code' => $code])->assertStatus(429);
        $this->travel(61)->seconds();
        $this->post('/connexion/double-verification', ['code' => $code])->assertRedirect('/connexion');
        $this->assertGuest();
    }

    public function test_new_code_invalidates_old_code_and_does_not_reset_account_attempt_budget(): void
    {
        $user = $this->admin();
        $old = $this->begin($user);
        $this->post('/connexion/double-verification', ['code' => 'invalid'])->assertSessionHasErrors();
        $this->travel(61)->seconds();
        $new = $this->begin($user);
        $this->assertDatabaseCount('login_email_challenges', 1);
        // Comparer les empreintes plutôt que supposer que deux tirages ne coïncident jamais.
        $this->assertSame(1, RateLimiter::attempts('email-login-verify:'.$user->id));
        $this->post('/connexion/double-verification', ['code' => $new])->assertRedirect('/administration');
    }

    public function test_email_password_role_and_revocation_changes_invalidate_pending_code(): void
    {
        foreach (['email', 'password', 'is_admin', 'is_active', 'session_version'] as $field) {
            $user = $this->admin();
            $code = $this->begin($user);
            $user->$field = match ($field) {
                'email' => 'changed-'.$user->id.'@example.test', 'password' => 'new-password-value',
                'session_version' => 2, default => false,
            };
            $user->save();
            $this->post('/connexion/double-verification', ['code' => $code])->assertRedirect('/connexion');
            $this->assertGuest();
        }
    }

    public function test_changing_pending_account_does_not_accept_another_accounts_code(): void
    {
        $first = $this->admin();
        $other = $this->admin();
        $code = $this->begin($first);
        $this->withSession(['two_factor_pending.id' => $other->id]);
        $this->post('/connexion/double-verification', ['code' => $code])->assertRedirect('/connexion');
        $this->assertGuest();
    }

    public function test_transport_failure_leaves_no_private_access_or_valid_challenge(): void
    {
        $user = $this->admin();
        config(['mail.mailers.login.transport' => 'log']);
        $this->post('/connexion', ['email' => $user->email, 'password' => 'password'])->assertSessionHasErrors('credentials');
        $this->assertGuest();
        $this->assertNull(session('two_factor_pending'));
        $this->assertDatabaseCount('login_email_challenges', 0);
        Mail::assertNothingSent();
    }

    public function test_smtp_exception_and_send_cooldown_do_not_create_a_bypass(): void
    {
        $user = $this->admin();
        Mail::shouldReceive('mailer')->once()->andThrow(new \RuntimeException('fixture-sensitive-diagnostic'));
        $response = $this->post('/connexion', ['email' => $user->email, 'password' => 'password']);
        $response->assertSessionHasErrors('credentials');
        $this->assertStringNotContainsString('fixture-sensitive', json_encode(session()->all()));
        $this->assertDatabaseCount('login_email_challenges', 0);
        $this->assertGuest();
        $this->post('/connexion', ['email' => $user->email, 'password' => 'password'])->assertSessionHasErrors('credentials');
    }

    public function test_private_proof_must_match_email_method_and_current_email(): void
    {
        $user = $this->admin();
        $this->verifiedAdmin($user);
        $this->get('/administration')->assertRedirect('/connexion');
        $code = $this->begin($user);
        $this->post('/connexion/double-verification', ['code' => $code])->assertRedirect('/administration');
        $this->get('/administration')->assertOk();
        $user->email = 'changed@example.test';
        $user->save();
        $this->get('/administration')->assertRedirect('/connexion');
        $this->assertGuest();
    }

    public function test_removed_authenticator_endpoints_and_csrf_still_refuse_access(): void
    {
        $user = $this->admin();
        $this->begin($user);
        $this->get('/connexion/double-verification/qr')->assertNotFound();
        $this->get('/connexion/double-verification/codes-de-secours')->assertNotFound();
        $this->post('/connexion/double-verification/terminer', ['saved' => '1'])->assertNotFound();
        $this->app->instance(PreventRequestForgery::class, new class($this->app, $this->app['encrypter']) extends PreventRequestForgery
        {
            protected function runningUnitTests()
            {
                return false;
            }
        });
        $this->post('/connexion/double-verification', ['code' => '123456'])->assertStatus(419);
        $this->assertGuest();
    }
}
