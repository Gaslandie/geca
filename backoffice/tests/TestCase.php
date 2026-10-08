<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use OTPHP\TOTP;

abstract class TestCase extends BaseTestCase
{
    protected function verifiedAdmin(User $user): void
    {
        // Fixture complète pour tester les fonctions privées après les deux preuves.
        $user->two_factor_secret = TOTP::generate()->getSecret();
        $user->two_factor_confirmed_at = now();
        $user->save();
        $this->actingAs($user)->withSession([
            'admin_version' => $user->session_version,
            'two_factor_verified' => ['id' => $user->id, 'version' => $user->session_version],
        ]);
    }
}
