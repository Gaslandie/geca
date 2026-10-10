<?php

namespace App\Services;

use App\Mail\LoginCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class EmailLogin
{
    public const PENDING_SECONDS = 300;

    public function start(Request $request, User $user): void
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        $request->session()->put('email_login_binding', bin2hex(random_bytes(32)));
        $key = 'email-login-send:'.$user->id;
        if (RateLimiter::tooManyAttempts($key, 1)) {
            throw ValidationException::withMessages(['credentials' => 'Attendez une minute avant de demander un nouveau code.']);
        }
        RateLimiter::hit($key, 60);
        $id = (string) Str::uuid();
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expires = now()->addSeconds(self::PENDING_SECONDS);
        try {
            $mailer = config('login.mailer');
            $transport = config('mail.mailers.'.$mailer.'.transport');
            if (! is_string(config('login.from')) || ! filter_var(config('login.from'), FILTER_VALIDATE_EMAIL)
                || ($transport !== 'smtp' && ! ($this->testing() && $transport === 'array'))
                || ($transport === 'smtp' && (! config('mail.mailers.'.$mailer.'.host') || config('mail.mailers.'.$mailer.'.require_tls') !== true))) {
                throw new \RuntimeException('Transport de connexion indisponible.');
            }
            DB::transaction(function () use ($request, $user, $id, $code, $expires) {
                $current = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
                if (! $current->is_admin || ! $current->is_active || $current->session_version !== $user->session_version
                    || ! hash_equals($current->password, $user->password) || $current->email !== $user->email) {
                    throw new \RuntimeException('Accès changé.');
                }
                DB::table('login_email_challenges')->where('user_id', $user->id)->delete();
                DB::table('login_email_challenges')->insert([
                    'id' => $id, 'user_id' => $user->id, 'code_hash' => $this->digest($id, $code),
                    'session_hash' => hash('sha256', (string) $request->session()->get('email_login_binding', '')),
                    'email_hash' => hash('sha256', $user->email), 'password_hash' => hash('sha256', $user->password),
                    'session_version' => $user->session_version, 'expires_at' => $expires,
                ]);
            }, 3);
            Mail::mailer($mailer)->to($user->email)->send((new LoginCode($code))->from(config('login.from'), 'Global EcoAction'));
        } catch (Throwable $error) {
            try {
                DB::table('login_email_challenges')->where('id', $id)->delete();
            } catch (Throwable) {
                // Une panne de base bloque aussi la connexion, sans diagnostic sensible.
            }
            // Aucune exception SMTP brute, aucun code ni adresse dans les journaux.
            throw ValidationException::withMessages(['credentials' => 'Impossible d’envoyer le code. Réessayez plus tard ou contactez le responsable du site.']);
        }
        $request->session()->put('two_factor_pending', [
            'id' => $user->id, 'version' => $user->session_version,
            'password' => hash('sha256', $user->password), 'email' => hash('sha256', $user->email),
            'expires' => $expires->timestamp, 'stage' => 'email', 'challenge' => $id,
        ]);
    }

    private function testing(): bool
    {
        return app()->environment('testing') && app()->runningUnitTests();
    }

    private function digest(string $id, string $code): string
    {
        return hash_hmac('sha256', $id.':'.$code, (string) config('app.key'));
    }

    public function pending(Request $request, ?User $user = null): ?User
    {
        $pending = $request->session()->get('two_factor_pending');
        if (! is_array($pending) || ($pending['stage'] ?? '') !== 'email' || ($pending['expires'] ?? 0) <= now()->timestamp) {
            return null;
        }
        $user ??= User::find($pending['id'] ?? null);
        if (! $user || $user->id !== ($pending['id'] ?? null) || ! $user->is_admin || ! $user->is_active
            || $user->session_version !== ($pending['version'] ?? null)
            || ! hash_equals($pending['password'] ?? '', hash('sha256', $user->password))
            || ! hash_equals($pending['email'] ?? '', hash('sha256', $user->email))) {
            return null;
        }
        $challenge = DB::table('login_email_challenges')->where('id', $pending['challenge'] ?? '')->first();
        if (! $challenge || $challenge->user_id !== $user->id || $challenge->used_at !== null || $challenge->attempts >= 5
            || $challenge->session_version !== $user->session_version
            || ! hash_equals($challenge->email_hash, hash('sha256', $user->email))
            || ! hash_equals($challenge->password_hash, hash('sha256', $user->password))
            || strtotime($challenge->expires_at) <= now()->timestamp
            || ! is_string($request->session()->get('email_login_binding'))
            || strlen($request->session()->get('email_login_binding')) !== 64
            || ! hash_equals($challenge->session_hash, hash('sha256', (string) $request->session()->get('email_login_binding', '')))) {
            return null;
        }

        return $user;
    }

    public function verify(Request $request, string $code): ?User
    {
        $user = DB::transaction(function () use ($request, $code) {
            $user = User::whereKey($request->session()->get('two_factor_pending.id'))->lockForUpdate()->first();
            if (! $user || ! $this->pending($request, $user)) {
                return null;
            }
            $challenge = DB::table('login_email_challenges')->where('id', $request->session()->get('two_factor_pending.challenge'))->lockForUpdate()->first();
            $key = 'email-login-verify:'.$user->id;
            if (RateLimiter::tooManyAttempts($key, 5)) {
                return null;
            }
            RateLimiter::hit($key, self::PENDING_SECONDS);
            $valid = preg_match('/\A[0-9]{6}\z/D', $code) && hash_equals($challenge->code_hash, $this->digest($challenge->id, $code));
            DB::table('login_email_challenges')->where('id', $challenge->id)->update([
                'attempts' => $challenge->attempts + 1,
                'used_at' => $valid || $challenge->attempts >= 4 ? now() : null,
            ]);
            if (! $valid) {
                return null;
            }

            return $user;
        }, 3);
        if ($user) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            Auth::login($user, false);
            $request->session()->regenerate();
            $request->session()->put([
                'admin_version' => $user->session_version,
                'two_factor_verified' => ['id' => $user->id, 'version' => $user->session_version,
                    'method' => 'email', 'email' => hash('sha256', $user->email)],
            ]);
        }

        return $user;
    }
}
