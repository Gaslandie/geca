<?php

namespace App\Http\Controllers;

use App\Services\EmailLogin;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class EmailLoginController extends Controller
{
    public function show()
    {
        return view('auth.email-code');
    }

    public function verify(Request $request, EmailLogin $login)
    {
        $code = $request->input('code');
        // Tous les essais, y compris les formats invalides, comptent dans la limite.
        $user = $login->verify($request, is_string($code) && strlen($code) <= 6 ? $code : '');
        if (! $user) {
            throw ValidationException::withMessages(['code' => 'Code invalide, expiré ou déjà utilisé.']);
        }

        return redirect()->route('dashboard');
    }

    public function cancel(Request $request)
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    public function settings(Request $request)
    {
        $security = app(AccountSecurityController::class);

        return view('auth.email-security', [
            'accountActionsAvailable' => $security->confirmed($request, $request->user()),
            'normalLoginConfigured' => $security->loginConfigured(),
        ]);
    }
}
