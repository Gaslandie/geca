<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class LocalAccessTest extends TestCase
{
    use RefreshDatabase;

    private function enable(): User
    {
        $user = User::factory()->create(['is_admin' => true, 'is_active' => true, 'session_version' => 1]);
        $this->app['env'] = 'local';
        // La connexion de RefreshDatabase reste en mémoire ; aucune reconnexion.
        config([
            'database.connections.sqlite.database' => database_path('local.sqlite'),
            'login.local_user' => $user->id,
            'login.local_until' => time() + 7200,
        ]);
        $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])->withHeader('Host', '127.0.0.1:8000');

        return $user;
    }

    private function enter(array $data = [])
    {
        return $this->withSession(['_token' => 'local-test-token'])->post('http://'.$this->defaultHeaders['Host'].'/connexion-locale', array_merge($data, ['_token' => 'local-test-token']));
    }

    public function test_local_login_ignores_browser_identity_and_preserves_logout(): void
    {
        $user = $this->enable();
        $other = User::factory()->create(['is_admin' => true, 'is_active' => true]);
        $this->get('/connexion-locale')->assertOk()->assertSee('Entrer dans le back-office');
        $this->assertGuest();
        $this->get('/administration')->assertRedirect('/connexion');
        $oldSession = session()->getId();
        $this->enter(['user_id' => $other->id, 'email' => $other->email])->assertRedirect('/administration');
        $this->assertAuthenticatedAs($user);
        $this->assertNotSame($oldSession, session()->getId());
        $this->assertNull(session('two_factor_verified'));
        $this->get('/administration')->assertOk();
        $this->post('/deconnexion', ['_token' => session()->token()])->assertRedirect('/connexion');
        $this->get('/administration')->assertRedirect('/connexion');
    }

    public function test_disabled_expired_production_remote_host_forwarded_and_mysql_are_refused(): void
    {
        $this->enable();
        foreach (['disabled', 'expired', 'production', 'remote', 'host', 'forwarded', 'mysql', 'database'] as $case) {
            Cache::flush();
            $this->app['env'] = $case === 'production' ? 'production' : 'local';
            config([
                'login.local_until' => in_array($case, ['disabled', 'expired']) ? time() - 1 : time() + 7200,
                'database.default' => $case === 'mysql' ? 'mysql' : 'sqlite',
                'database.connections.sqlite.database' => $case === 'database' ? ':memory:' : database_path('local.sqlite'),
            ]);
            $this->withServerVariables(['REMOTE_ADDR' => $case === 'remote' ? '203.0.113.8' : '127.0.0.1']);
            $this->flushHeaders();
            $this->withHeader('Host', $case === 'host' ? 'example.org' : '127.0.0.1:8000');
            if ($case === 'forwarded') {
                $this->withHeader('X-Forwarded-For', '127.0.0.1');
            }
            $this->assertSame(404, $this->get($case === 'host' ? 'http://example.org/connexion-locale' : '/connexion-locale')->status(), $case);
            $this->enter()->assertNotFound();
            $this->assertGuest();
        }
    }

    public function test_inactive_non_admin_and_missing_accounts_cannot_enter(): void
    {
        $user = $this->enable();
        $user->is_active = false;
        $user->save();
        $this->enter()->assertForbidden();
        $user->is_active = true;
        $user->is_admin = false;
        $user->save();
        $this->enter()->assertForbidden();
        config(['login.local_user' => 999999]);
        $this->enter()->assertForbidden();
        $this->assertGuest();
    }

    public function test_revocation_and_version_change_close_existing_session(): void
    {
        $user = $this->enable();
        $this->enter()->assertRedirect('/administration');
        $user->is_active = false;
        $user->save();
        $this->get('/administration')->assertForbidden();
        $user->is_active = true;
        $user->save();
        $this->enter();
        $user->session_version++;
        $user->save();
        $this->get('/administration')->assertForbidden();
    }

    public function test_local_proof_is_rejected_when_context_account_or_expiry_changes(): void
    {
        $user = $this->enable();
        foreach (['production', 'disabled', 'account', 'expired', 'remote', 'host'] as $case) {
            $this->app['env'] = 'local';
            config(['login.local_user' => $user->id, 'login.local_until' => time() + 7200]);
            $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])->withHeader('Host', '127.0.0.1:8000');
            $this->enter()->assertRedirect('/administration');
            match ($case) {
                'production' => $this->app['env'] = 'production',
                'disabled' => config(['login.local_until' => 0]),
                'account' => config(['login.local_user' => $user->id + 1]),
                'expired' => session()->put('local_access.expires', time() - 1),
                'remote' => $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.8']),
                'host' => $this->withHeader('Host', 'example.org'),
            };
            $response = $this->get($case === 'host' ? 'http://example.org/administration' : '/administration');
            $response->assertRedirect('/connexion');
            $this->assertGuest();
            Auth::forgetGuards();
        }
    }

    public function test_repeated_local_login_is_rate_limited(): void
    {
        $this->enable();
        for ($attempt = 0; $attempt < 6; $attempt++) {
            $this->enter()->assertRedirect('/administration');
        }
        $this->enter()->assertStatus(429);
    }

    public function test_local_login_requires_csrf(): void
    {
        $this->enable();
        $this->app->bind(PreventRequestForgery::class, fn ($app) => new class($app, $app['encrypter']) extends PreventRequestForgery
        {
            protected function runningUnitTests()
            {
                return false;
            }
        });
        $this->post('/connexion-locale')->assertStatus(419);
        $this->assertGuest();
        $this->withSession(['_token' => 'test-local-token'])->post('/connexion-locale', ['_token' => 'test-local-token'])->assertRedirect('/administration');
    }
}
