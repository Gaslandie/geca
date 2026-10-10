<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;

class LocalAccess
{
    public function available(Request $request): bool
    {
        // Une autorisation temporaire du terminal, jamais un mode public.
        $database = config('database.connections.sqlite.database');

        return app()->environment('local')
            && (int) config('login.local_until') > time()
            && (int) config('login.local_user') > 0
            && config('database.default') === 'sqlite'
            && is_string($database)
            && realpath($database) !== false
            && realpath($database) === realpath(database_path('local.sqlite'))
            && $request->server('REMOTE_ADDR') === '127.0.0.1'
            && preg_match('/^127\.0\.0\.1(?::[0-9]+)?$/D', $request->headers->get('host', '')) === 1
            && ! $request->headers->has('forwarded')
            && ! $request->headers->has('x-forwarded-for')
            && ! $request->headers->has('x-forwarded-host');
    }

    public function verified(Request $request, User $user): bool
    {
        $proof = $request->session()->get('local_access');

        return $this->available($request)
            && is_array($proof)
            && ($proof['id'] ?? null) === $user->id
            && $user->id === (int) config('login.local_user')
            && ($proof['version'] ?? null) === $user->session_version
            && is_int($proof['expires'] ?? null)
            && $proof['expires'] > time();
    }
}
