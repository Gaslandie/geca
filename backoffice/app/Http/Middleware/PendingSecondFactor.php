<?php

namespace App\Http\Middleware;

use App\Services\EmailLogin;
use App\Services\TwoFactor;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PendingSecondFactor
{
    public function handle(Request $request, Closure $next): Response
    {
        $factor = config('login.verification') === 'email' ? app(EmailLogin::class) : app(TwoFactor::class);
        if (! $factor->pending($request)) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('status', 'Veuillez recommencer la connexion. Cette étape a expiré ou votre accès a changé.');
        }

        return $next($request);
    }
}
