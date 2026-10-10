<?php

use App\Http\Middleware\AdminHeaders;
use App\Http\Middleware\NewsletterSession;
use App\Http\Middleware\PendingSecondFactor;
use App\Http\Middleware\RequireAdministrator;
use Illuminate\Contracts\Session\Middleware\AuthenticatesSessions;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->preventRequestForgery(except: ['newsletter/fr/commencer', 'newsletter/en/commencer']);
        $middleware->prepend(NewsletterSession::class);
        $middleware->append(AdminHeaders::class);
        $middleware->alias(['admin' => RequireAdministrator::class, 'pending-mfa' => PendingSecondFactor::class]);
        $middleware->prependToPriorityList(
            AuthenticatesSessions::class,
            RequireAdministrator::class,
        );
        $middleware->redirectGuestsTo('/connexion');
        $middleware->redirectUsersTo('/administration');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->dontFlash(['current_password', 'password', 'password_confirmation', 'code', 'recovery_code']);
        $exceptions->render(function (HttpExceptionInterface $exception, Request $request) {
            $status = $exception->getStatusCode();
            if (! $request->is('newsletter/*') || $request->expectsJson() || ! in_array($status, [403, 404, 419, 429], true)) {
                return null;
            }
            $locale = in_array($request->segment(2), ['fr', 'en'], true) ? $request->segment(2) : 'fr';

            return response()->view('errors.newsletter', ['status' => $status, 'locale' => $locale], $status, $exception->getHeaders());
        });
        $exceptions->respond(fn ($response) => AdminHeaders::secure($response));
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
