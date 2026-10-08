<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\TwoFactor;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use OTPHP\TOTP;
use Tests\TestCase;

class TwoFactorBackupTest extends TestCase
{
    // Une sauvegarde SQLite exige des écritures confirmées, hors transaction de fixture.
    // Les migrations concernent seulement la base jetable :memory: de phpunit.xml.
    use DatabaseMigrations;

    public function test_private_sqlite_backup_restores_encrypted_authenticator_and_recovery_hashes_with_existing_key(): void
    {
        $user = User::factory()->create(['is_admin' => true, 'is_active' => true, 'session_version' => 1]);
        $user->two_factor_secret = TOTP::generate()->getSecret();
        $user->two_factor_confirmed_at = now();
        $user->save();
        $secret = $user->two_factor_secret;
        $codes = app(TwoFactor::class)->newRecoveryCodes($user);
        $user->save();
        $path = tempnam(sys_get_temp_dir(), 'geca-mfa-restore-');
        unlink($path);
        try {
            DB::statement("VACUUM INTO '".str_replace("'", "''", $path)."'");
            chmod($path, 0600);
            $restored = new \SQLite3($path, SQLITE3_OPEN_READONLY);
            $this->assertSame('ok', $restored->querySingle('PRAGMA integrity_check'));
            $row = $restored->querySingle('SELECT two_factor_secret, two_factor_recovery_hashes FROM users WHERE id = '.(int) $user->id, true);
            $this->assertSame($secret, Crypt::decryptString($row['two_factor_secret']));
            $hashes = json_decode($row['two_factor_recovery_hashes'], true);
            $this->assertContains(hash('sha256', $codes[0]), $hashes);
            $this->assertStringNotContainsString($secret, $row['two_factor_secret']);
            $restored->close();
        } finally {
            if (is_file($path)) {
                unlink($path);
            }
        }
    }
}
