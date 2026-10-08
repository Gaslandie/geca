<?php

namespace App\Services;

use App\Models\NewsletterDelivery;
use App\Models\NewsletterSubscriber;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;

class Newsletter
{
    public function emailHash(string $email): string
    {
        return hash_hmac('sha256', mb_strtolower(trim($email)), (string) config('app.key'));
    }

    public function link(string $route, NewsletterSubscriber $subscriber, bool $temporary = false): string
    {
        $args = ['locale' => $subscriber->locale, 'subscriber' => $subscriber->id];
        if ($temporary) {
            $args['version'] = $subscriber->confirmation_version;
        }
        $path = $temporary ? URL::temporarySignedRoute($route, now()->addDay(), $args, absolute: false) : URL::signedRoute($route, $args, absolute: false);
        $base = rtrim((string) config('newsletter.public_url'), '/');
        if (! filter_var($base, FILTER_VALIDATE_URL) || (! str_starts_with($base, 'https://') && ! preg_match('~^http://127\.0\.0\.1:[0-9]+$~', $base))) {
            throw new \RuntimeException('URL newsletter non configurée.');
        }

        return $base.$path;
    }

    public function request(string $email, string $locale): void
    {
        $email = mb_strtolower(trim($email));
        $hash = $this->emailHash($email);
        DB::transaction(function () use ($email, $hash, $locale) {
            // L’unicité en base complète le verrou partagé du contrôleur.
            $s = NewsletterSubscriber::where('email_hash', $hash)->lockForUpdate()->first();
            if ($s && ($s->status === 'subscribed' || $s->requested_at->greaterThan(now()->subDay()))) {
                return;
            }
            if (! $s) {
                $s = new NewsletterSubscriber(['email' => $email, 'email_hash' => $hash, 'confirmation_version' => 0]);
            }
            $s->fill(['locale' => $locale, 'status' => 'pending', 'requested_at' => now(), 'confirmation_version' => $s->confirmation_version + 1]);
            $s->save();
            $en = $locale === 'en';
            NewsletterDelivery::create(['subscriber_id' => $s->id, 'kind' => 'confirmation', 'payload' => [
                'subject' => $en ? 'Confirm your newsletter subscription' : 'Confirmez votre inscription à la newsletter',
                'body' => $en ? 'Confirm your email address to receive the Global EcoAction newsletter. If you did not request this, ignore this message.' : 'Confirmez votre adresse pour recevoir la newsletter Global EcoAction. Si vous n’avez pas fait cette demande, ignorez ce message.',
                'link' => $this->link('newsletter.confirm', $s, true), 'version' => $s->confirmation_version,
            ]]);
        });
    }
}
