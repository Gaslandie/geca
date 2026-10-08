<?php

namespace App\Http\Controllers;

use App\Services\TwoFactor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class SessionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->session()->forget(['two_factor_pending', 'two_factor_setup_secret', 'two_factor_recovery_display']);
        $data = $request->validate([
            'email' => ['required', 'string', 'email', 'max:254'],
            'password' => ['required', 'string', 'max:256'],
        ]);

        $credentials = [
            'email' => mb_strtolower(trim($data['email'])),
            'password' => $data['password'],
            'is_admin' => true,
            'is_active' => true,
        ];
        // Validation Laravel avec sa protection de durée, sans ouvrir de session privée.
        if (! Auth::validate($credentials)) {
            throw ValidationException::withMessages(['credentials' => 'Connexion impossible. Vérifiez votre adresse e-mail et votre mot de passe.']);
        }

        $user = Auth::getLastAttempted();
        Auth::getProvider()->rehashPasswordIfRequired($user, $credentials);
        app(TwoFactor::class)->start($request, $user);

        return redirect()->route('two-factor.show');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
