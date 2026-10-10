<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminHeaders
{
    public static function secure(Response $response): Response
    {
        $response->headers->set('Cache-Control', 'no-store, private');
        $response->headers->set('X-Robots-Tag', 'noindex, nofollow, noarchive');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'no-referrer');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $nonce = request()->attributes->get('photo_preview_nonce');
        $preview = request()->routeIs('content.edit', 'content.create') && is_string($nonce) && preg_match('/^[A-Za-z0-9+\/]{24}$/', $nonce);
        $images = $preview ? "'self' blob:" : "'self'";
        $navigationNonce = request()->attributes->get('navigation_nonce');
        $scriptSources = [];
        if ($preview) {
            $scriptSources[] = "'nonce-$nonce'";
        }
        if (is_string($navigationNonce) && preg_match('/^[A-Za-z0-9+\/]{24}$/', $navigationNonce)) {
            $scriptSources[] = "'nonce-$navigationNonce'";
        }
        $scripts = $scriptSources ? '; script-src '.implode(' ', $scriptSources)."; script-src-attr 'none'" : '';
        $response->headers->set('Content-Security-Policy', "default-src 'none'; style-src 'self'; img-src $images; font-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'$scripts");

        return $response;
    }

    public function handle(Request $request, Closure $next): Response
    {
        return self::secure($next($request));
    }
}
