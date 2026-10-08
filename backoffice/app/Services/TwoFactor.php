<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Validation\ValidationException;
use OTPHP\TOTP;

class TwoFactor
{
    public const PENDING_SECONDS = 300;

    public function start(Request $request, User $user): void
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        $request->session()->put('two_factor_pending', [
            'id' => $user->id,
            'version' => $user->session_version,
            'password' => hash('sha256', $user->password),
            'expires' => now()->timestamp + self::PENDING_SECONDS,
            'stage' => $user->two_factor_confirmed_at ? 'challenge' : 'setup',
        ]);
        if (! $user->two_factor_confirmed_at) {
            $request->session()->put('two_factor_setup_secret', Crypt::encryptString(TOTP::generate()->getSecret()));
        }
    }

    public function pending(Request $request, ?User $user = null): ?User
    {
        $pending = $request->session()->get('two_factor_pending');
        if (! is_array($pending) || ($pending['expires'] ?? 0) <= now()->timestamp) {
            return null;
        }
        $user ??= User::find($pending['id'] ?? null);
        if (! $user || $user->id !== ($pending['id'] ?? null) || ! $user->is_admin || ! $user->is_active
            || $user->session_version !== ($pending['version'] ?? null)
            || ! hash_equals($pending['password'] ?? '', hash('sha256', $user->password))) {
            return null;
        }
        $stage = $pending['stage'] ?? '';
        if (($stage === 'setup' && $user->two_factor_confirmed_at)
            || (in_array($stage, ['challenge', 'recovery'], true) && (! $user->two_factor_confirmed_at || ! $user->two_factor_secret))) {
            return null;
        }

        return $user;
    }

    public function otp(string $secret, User $user): TOTP
    {
        $otp = TOTP::createFromSecret($secret);
        $otp->setIssuer('Global EcoAction');
        $otp->setLabel($user->email);

        return $otp;
    }

    public function setupSecret(Request $request): string
    {
        return Crypt::decryptString($request->session()->get('two_factor_setup_secret'));
    }

    // À appeler sous verrou de la ligne utilisateur : même code jamais consommé deux fois.
    public function consume(User $user, string $code, ?string $setupSecret = null): bool
    {
        $secret = $setupSecret ?? $user->two_factor_secret;
        if (! is_string($secret) || ! preg_match('/\A[0-9]{6}\z/D', $code)) {
            return false;
        }
        $otp = $this->otp($secret, $user);
        $current = intdiv(now()->timestamp, 30);
        foreach ([$current, $current - 1, $current + 1] as $step) {
            if (($user->two_factor_last_step === null || $step > $user->two_factor_last_step)
                && $otp->verify($code, $step * 30)) {
                $user->two_factor_last_step = $step;

                return true;
            }
        }

        return false;
    }

    public function consumeRecovery(User $user, string $code): bool
    {
        if (! preg_match('/\A[0-9a-f]{8}(?:-[0-9a-f]{8}){3}\z/D', $code)) {
            return false;
        }
        $hashes = $user->two_factor_recovery_hashes ?? [];
        foreach ($hashes as $index => $hash) {
            if (hash_equals($hash, hash('sha256', $code))) {
                unset($hashes[$index]);
                $user->two_factor_recovery_hashes = array_values($hashes);

                return true;
            }
        }

        return false;
    }

    public function newRecoveryCodes(User $user): array
    {
        $codes = array_map(fn () => implode('-', str_split(bin2hex(random_bytes(16)), 8)), range(1, 10));
        $user->two_factor_recovery_hashes = array_map(fn ($code) => hash('sha256', $code), $codes);

        return $codes;
    }

    public function reject(string $field = 'code'): never
    {
        throw ValidationException::withMessages([$field => 'Code invalide, expiré ou déjà utilisé.']);
    }

    public function login(Request $request, User $user): void
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        Auth::login($user, false);
        $request->session()->regenerate();
        $request->session()->put([
            'admin_version' => $user->session_version,
            'two_factor_verified' => ['id' => $user->id, 'version' => $user->session_version],
        ]);
    }
}
