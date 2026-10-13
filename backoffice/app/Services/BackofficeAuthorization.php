<?php

namespace App\Services;

use App\Http\Controllers\AccountSecurityController;
use App\Models\User;
use Illuminate\Http\Request;

class BackofficeAuthorization
{
    public function writer(Request $request): User
    {
        // Verrou dans la transaction de mutation : une révocation attend sa fin.
        $user = User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
        abort_unless($user->editsContent() && $user->is_active
            && $user->session_version === $request->session()->get('admin_version')
            && (app(AccountSecurityController::class)->confirmed($request, $user)
                || app(LocalAccess::class)->verified($request, $user)), 403);

        return $user;
    }
}
