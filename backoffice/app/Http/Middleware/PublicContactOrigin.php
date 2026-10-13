<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class PublicContactOrigin
{
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->header('Origin');
        $allowed = ['https://globalecoaction.org', 'https://www.globalecoaction.org'];
        if (app()->environment('local', 'testing')) {
            $allowed[] = 'http://127.0.0.1:3000';
        }
        if (! in_array($origin, $allowed, true)) {
            return response()->json(['error' => 'origin'], 403);
        }
        try {
            $response = $request->isMethod('options') ? response('', 204) : $next($request);
        } catch (ValidationException $exception) {
            $response = response()->json(['errors' => $exception->errors()], 422);
        } catch (HttpExceptionInterface $exception) {
            $response = response()->json(['error' => 'request'], $exception->getStatusCode(), $exception->getHeaders());
        }
        $response->headers->set('Access-Control-Allow-Origin', $origin);
        $response->headers->set('Vary', 'Origin');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Accept');
        $response->headers->set('Cache-Control', 'no-store');

        return $response;
    }
}
