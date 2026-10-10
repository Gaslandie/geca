<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $path = config('geca.public_path');
        if ($path !== null) {
            if (! is_string($path) || ! str_starts_with($path, '/') || ! is_dir($path)) {
                throw new \RuntimeException('GECA_PUBLIC_PATH doit désigner un dossier absolu existant.');
            }
            $this->app->usePublicPath($path);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('local-access', fn (Request $request) => Limit::perMinute(6)->by('local-access:'.$request->server('REMOTE_ADDR')));
        RateLimiter::for('account-security', fn (Request $request) => Limit::perMinute(5)->by('account-security:'.$request->user()->id));
        RateLimiter::for('content-create', fn (Request $request) => Limit::perMinute(6)->by('content-create:'.$request->user()->id));
        RateLimiter::for('newsletter-display', fn (Request $request) => Limit::perMinute(30)->by('newsletter-display:'.$request->ip()));
        RateLimiter::for('newsletter-admin', fn (Request $request) => Limit::perMinute(60)->by('newsletter-admin:'.$request->user()?->id));
        RateLimiter::for('newsletter-signup', function (Request $request) {
            $email = $request->input('email');
            $key = hash_hmac('sha256', is_string($email) ? mb_strtolower(trim($email)) : 'invalid', (string) config('app.key'));

            return [Limit::perMinute(5)->by('newsletter-ip:'.$request->ip()), Limit::perDay(2)->by('newsletter-email:'.$key), Limit::perHour(100)->by('newsletter-global')];
        });
        RateLimiter::for('media-upload', fn (Request $request) => $request->hasFile('photo') ? Limit::perMinute(4)->by((string) $request->user()->id) : Limit::none());
        RateLimiter::for('content-removal', fn (Request $request) => Limit::perMinute(12)->by('content-removal:'.$request->user()->id));
        RateLimiter::for('mfa-qr', fn (Request $request) => Limit::perMinute(20)->by('mfa-qr:'.($request->session()->get('two_factor_pending.id') ?? 'unknown')));
        RateLimiter::for('mfa', function (Request $request) {
            $id = $request->user()?->id ?? $request->session()->get('two_factor_pending.id');

            return [
                Limit::perMinute(20)->by('mfa-ip:'.hash('sha256', $request->ip() ?? '')),
                Limit::perMinute(5)->by('mfa-account:'.($id ?? 'unknown')),
            ];
        });
        RateLimiter::for('login', function (Request $request) {
            $email = $request->input('email');
            $email = is_string($email) ? mb_strtolower(trim($email)) : '';

            return [
                Limit::perMinute(20)->by('ip:'.hash('sha256', $request->ip() ?? '')),
                Limit::perMinute(5)->by('account:'.hash('sha256', $email)),
            ];
        });
    }
}
