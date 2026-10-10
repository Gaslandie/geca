<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\LocalAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LocalAccessController extends Controller
{
    public function show(Request $request, LocalAccess $access)
    {
        abort_unless($access->available($request), 404);

        return view('auth.local');
    }

    public function store(Request $request, LocalAccess $access)
    {
        abort_unless($access->available($request), 404);
        // Le navigateur ne choisit ni compte ni droits.
        $user = User::find((int) config('login.local_user'));
        abort_unless($user && $user->is_admin && $user->is_active, 403);
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        Auth::login($user);
        $request->session()->regenerate();
        $request->session()->put('admin_version', $user->session_version);
        $request->session()->put('local_access', [
            'id' => $user->id,
            'version' => $user->session_version,
            'expires' => min(time() + 3600, (int) config('login.local_until')),
        ]);

        return redirect()->route('dashboard');
    }
}
