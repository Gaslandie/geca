<?php

namespace App\Http\Middleware;

use App\Models\User;
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
        if (! $user->two_factor_confirmed_at || ! $user->two_factor_secret
            || ! is_array($verified) || ($verified['id'] ?? null) !== $user->id
            || ($verified['version'] ?? null) !== $user->session_version) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('status', 'La double authentification est nécessaire. Recommencez la connexion.');
        }
        Auth::setUser($user);

        return $next($request);
    }
}
