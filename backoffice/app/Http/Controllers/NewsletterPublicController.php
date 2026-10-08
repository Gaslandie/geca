<?php

namespace App\Http\Controllers;

use App\Models\NewsletterDelivery;
use App\Models\NewsletterSubscriber;
use App\Services\Newsletter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class NewsletterPublicController extends Controller
{
    public function form(Request $r, string $locale)
    {
        $email = '';
        if ($r->isMethod('post')) {
            abort_unless(in_array($r->header('Origin'), config('newsletter.origins'), true), 403);
            $email = $r->validate(['email' => 'required|string|email:rfc|max:254'])['email'];
        }

        return view('newsletter.public', ['locale' => $locale, 'stage' => 'signup', 'email' => $email]);
    }

    public function subscribe(Request $r, string $locale, Newsletter $newsletter)
    {
        $data = $r->validate(['email' => 'required|string|email:rfc|max:254', 'consent' => 'accepted', 'website' => 'nullable|string|max:0']);
        $lock = Cache::lock('newsletter-request:'.$newsletter->emailHash($data['email']), 10);
        if ($lock->get()) {
            try {
                $newsletter->request($data['email'], $locale);
            } finally {
                $lock->release();
            }
        }

        return view('newsletter.public', ['locale' => $locale, 'stage' => config('newsletter.mode') === 'preview' ? 'test-requested' : 'requested']);
    }

    public function confirm(Request $r, string $locale, NewsletterSubscriber $subscriber)
    {
        abort_unless($subscriber->locale === $locale && (string) $subscriber->confirmation_version === $r->query('version'), 403);
        if ($r->isMethod('post')) {
            DB::transaction(function () use ($subscriber) {
                $s = NewsletterSubscriber::whereKey($subscriber->id)->lockForUpdate()->firstOrFail();
                // Revérifier sous verrou, y compris après désinscription.
                if ($s->status === 'pending' && $s->confirmation_version === $subscriber->confirmation_version) {
                    $s->update(['status' => 'subscribed', 'confirmed_at' => now(), 'unsubscribed_at' => null]);
                }
            });

            return view('newsletter.public', ['locale' => $locale, 'stage' => 'confirmed']);
        }

        return view('newsletter.public', ['locale' => $locale, 'stage' => 'confirm']);
    }

    public function unsubscribe(Request $r, string $locale, NewsletterSubscriber $subscriber)
    {
        abort_unless($subscriber->locale === $locale, 403);
        if ($r->isMethod('post')) {
            DB::transaction(function () use ($subscriber) {
                $s = NewsletterSubscriber::whereKey($subscriber->id)->lockForUpdate()->firstOrFail();
                $s->update(['status' => 'unsubscribed', 'unsubscribed_at' => now(), 'confirmation_version' => $s->confirmation_version + 1]);
                NewsletterDelivery::where('subscriber_id', $subscriber->id)->where('status', 'pending')->update(['status' => 'cancelled']);
            });

            return view('newsletter.public', ['locale' => $locale, 'stage' => 'unsubscribed']);
        }

        return view('newsletter.public', ['locale' => $locale, 'stage' => 'unsubscribe']);
    }
}
