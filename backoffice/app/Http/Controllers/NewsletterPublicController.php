<?php

namespace App\Http\Controllers;

use App\Models\NewsletterDelivery;
use App\Models\NewsletterSubscriber;
use App\Services\Newsletter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class NewsletterPublicController extends Controller
{
    public function form(Request $r, string $locale)
    {
        $email = '';
        if ($r->isMethod('post')) {
            abort_unless(in_array($r->header('Origin'), config('newsletter.origins'), true), 403);
            $validator = $this->signupValidator($r, $locale, false);
            if ($validator->fails()) {
                return $this->signupError($r, $locale, $validator);
            }
            $email = $validator->validated()['email'];
        }

        return view('newsletter.public', [
            'locale' => $locale,
            'stage' => 'signup',
            'email' => $r->old('email', $email),
        ]);
    }

    public function subscribe(Request $r, string $locale, Newsletter $newsletter)
    {
        $validator = $this->signupValidator($r, $locale, true);
        if ($validator->fails()) {
            return $this->signupError($r, $locale, $validator);
        }
        $data = $validator->validated();
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

    private function signupValidator(Request $r, string $locale, bool $subscription): \Illuminate\Contracts\Validation\Validator
    {
        $en = $locale === 'en';
        $emailError = $en ? 'Enter a valid email address, up to 254 characters.' : 'Indiquez une adresse e-mail valide, de 254 caractères maximum.';

        return Validator::make($r->all(), [
            'email' => 'bail|required|string|max:254|email:rfc',
            ...($subscription ? ['consent' => 'accepted', 'website' => 'nullable|string|max:0'] : []),
        ], [
            'email.*' => $emailError,
            'consent.accepted' => $en ? 'Tick the box if you agree to receive the newsletter.' : 'Cochez la case si vous acceptez de recevoir la newsletter.',
            'website.*' => $en ? 'This request cannot be accepted. Please try again using the form.' : 'Cette demande ne peut pas être acceptée. Réessayez depuis le formulaire.',
        ]);
    }

    private function signupError(Request $r, string $locale, \Illuminate\Contracts\Validation\Validator $validator): RedirectResponse
    {
        // Destination GET fixe : ne pas revenir sur le pont POST ni dépendre du Referer.
        // Ne conserver que les deux réponses utiles et une adresse de taille bornée.
        $email = $r->input('email');

        return redirect()->route('newsletter.form', $locale)->withErrors($validator)->withInput([
            'email' => is_string($email) && mb_strlen($email) <= 254 ? $email : '',
            'consent' => $r->boolean('consent') ? '1' : '',
        ]);
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
