<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NewsletterSession
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->is('newsletter/*')) {
            return $next($request);
        }
        $cookie = config('session.cookie');
        config(['session.cookie' => 'geca_newsletter_session']);
        try {
            return $next($request);
        } finally {
            config(['session.cookie' => $cookie]);
        }
    }
}
