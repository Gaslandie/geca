<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\LocalAccess;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RequireAdministrator
{
    public function handle(Request $request, Closure $next): Response
    {
        // Relire les droits : une ancienne session ne constitue pas une autorisation.
        $user = User::find(Auth::id());
        if (! $user || ! $user->is_admin || ! $user->is_active
            || $request->session()->get('admin_version') !== $user->session_version) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            abort(403, 'Accès administrateur refusé.');
        }
        $verified = $request->session()->get('two_factor_verified');
        $method = config('login.verification');
        $valid = is_array($verified) && ($verified['id'] ?? null) === $user->id
            && ($verified['version'] ?? null) === $user->session_version
            && ($verified['method'] ?? 'authenticator') === $method;
        if ($method === 'email') {
            $valid = $valid && hash_equals($verified['email'] ?? '', hash('sha256', $user->email));
        } elseif ($method === 'authenticator') {
            $valid = $valid && $user->two_factor_confirmed_at && $user->two_factor_secret;
        } else {
            $valid = false;
        }
        // Exception locale explicite : jamais présentée comme une preuve MFA.
        $valid = $valid || app(LocalAccess::class)->verified($request, $user);
        if (! $valid) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('status', 'La vérification de connexion est nécessaire. Recommencez la connexion.');
        }
        Auth::setUser($user);

        return $next($request);
    }
}
