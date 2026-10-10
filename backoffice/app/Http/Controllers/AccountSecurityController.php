<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AccountSecurityController extends Controller
{
    public function loginConfigured(): bool
    {
        if (config('login.verification') === 'authenticator') {
            return true;
        }
        $mailer = 'mail.mailers.'.config('login.mailer').'.';

        return config('login.verification') === 'email' && config($mailer.'transport') === 'smtp'
            && (bool) config($mailer.'host') && (bool) config($mailer.'username') && (bool) config($mailer.'password')
            && config($mailer.'require_tls') === true && filter_var(config('login.from'), FILTER_VALIDATE_EMAIL) !== false;
    }

    public function confirmed(Request $request, User $user): bool
    {
        $proof = $request->session()->get('two_factor_verified');
        $method = config('login.verification');
        if (! is_array($proof) || ($proof['id'] ?? null) !== $user->id
            || ($proof['version'] ?? null) !== $user->session_version
            || ($proof['method'] ?? 'authenticator') !== $method) {
            return false;
        }

        return match ($method) {
            'email' => is_string($proof['email'] ?? null) && hash_equals($proof['email'], hash('sha256', $user->email)),
            'authenticator' => (bool) $user->two_factor_confirmed_at && (bool) $user->two_factor_secret,
            default => false,
        };
    }

    public function password(Request $request)
    {
        try {
            $this->requireConfirmation($request, $request->user());
            $data = $request->validate([
                'current_password' => ['required', 'string', 'max:256'],
                'password' => ['bail', 'required', 'string', 'min:15', 'max:72', 'confirmed', function ($attribute, $value, $fail) {
                    if (str_contains($value, "\0")) {
                        $fail('Le nouveau mot de passe contient un caractère non accepté.');
                    }
                    if (strlen($value) > 72) {
                        $fail('Le nouveau mot de passe dépasse la limite acceptée. Choisissez une phrase plus courte (72 octets maximum).');
                    }
                }],
            ], [
                'password.min' => 'Le nouveau mot de passe doit contenir au moins 15 caractères.',
                'password.max' => 'Le nouveau mot de passe est trop long (72 caractères maximum).',
                'password.confirmed' => 'Les deux nouveaux mots de passe doivent être identiques.',
            ], ['current_password' => 'mot de passe actuel', 'password' => 'nouveau mot de passe']);
            $this->change($request, $data['current_password'], $data['password']);
        } catch (ValidationException $exception) {
            throw $exception->redirectTo(route('security'));
        }

        return $this->finish($request, 'Votre mot de passe a été changé. Toutes vos connexions sont fermées. Reconnectez-vous avec le nouveau mot de passe.');
    }

    public function logoutAll(Request $request)
    {
        try {
            $this->requireConfirmation($request, $request->user());
            $data = $request->validate(['current_password' => ['required', 'string', 'max:256']], [], ['current_password' => 'mot de passe actuel']);
            $this->change($request, $data['current_password']);
        } catch (ValidationException $exception) {
            throw $exception->redirectTo(route('security'));
        }

        return $this->finish($request, 'Toutes vos connexions sont fermées, y compris celle-ci. Reconnectez-vous pour continuer.');
    }

    private function requireConfirmation(Request $request, User $user): void
    {
        if (! $this->confirmed($request, $user)) {
            throw ValidationException::withMessages(['security' => 'Pour cette action, quittez l’accès local puis connectez-vous avec votre mot de passe et votre code de connexion.']);
        }
    }

    private function change(Request $request, string $currentPassword, ?string $password = null): void
    {
        DB::transaction(function () use ($request, $currentPassword, $password) {
            // Compte de la session uniquement ; droits et preuve relus sous verrou.
            $user = User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            abort_unless($user->is_admin && $user->is_active
                && $user->session_version === $request->session()->get('admin_version'), 403);
            $this->requireConfirmation($request, $user);
            if (! Hash::check($currentPassword, $user->password)) {
                throw ValidationException::withMessages(['current_password' => 'Le mot de passe actuel est incorrect.']);
            }
            if ($password !== null) {
                if (Hash::check($password, $user->password)) {
                    throw ValidationException::withMessages(['password' => 'Choisissez un mot de passe différent du mot de passe actuel.']);
                }
                $user->password = $password;
            }
            $user->session_version++;
            $user->remember_token = Str::random(60);
            $user->save();
            DB::table('sessions')->where('user_id', $user->id)->delete();
            DB::table('login_email_challenges')->where('user_id', $user->id)->delete();
        }, 3);
    }

    private function finish(Request $request, string $message)
    {
        Auth::logoutCurrentDevice();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('status', $message);
    }
}
