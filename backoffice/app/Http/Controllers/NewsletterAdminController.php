<?php

namespace App\Http\Controllers;

use App\Models\NewsletterCampaign;
use App\Models\NewsletterDelivery;
use App\Models\NewsletterSubscriber;
use App\Services\Newsletter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class NewsletterAdminController extends Controller
{
    public function index(Request $r)
    {
        return view('newsletter.index', ['subscribers' => NewsletterSubscriber::latest()->paginate(20, ['*'], 'subscribers'), 'campaigns' => NewsletterCampaign::where('created_by', $r->user()->id)->latest()->paginate(10), 'deliveries' => NewsletterDelivery::where(fn ($q) => $q->whereNull('campaign_id')->orWhereIn('campaign_id', NewsletterCampaign::where('created_by', $r->user()->id)->select('id')))->latest()->limit(20)->get()]);
    }

    public function create(Request $r)
    {
        return view('newsletter.edit', ['campaign' => new NewsletterCampaign]);
    }

    public function store(Request $r)
    {
        $data = $r->validate(['subject' => 'required|string|max:180|not_regex:/[\r\n]/', 'body' => 'required|string|max:20000', 'locale' => 'required|in:fr,en']);
        $c = NewsletterCampaign::create($data + ['created_by' => $r->user()->id]);

        return redirect()->route('newsletter.edit', $c)->with('status', 'Brouillon enregistré. Aucun envoi.');
    }

    private function owned(Request $r, NewsletterCampaign $c): void
    {
        abort_unless($c->created_by === $r->user()->id, 403);
    }

    public function edit(Request $r, NewsletterCampaign $campaign)
    {
        $this->owned($r, $campaign);

        return view('newsletter.edit', compact('campaign'));
    }

    public function update(Request $r, NewsletterCampaign $campaign)
    {
        $this->owned($r, $campaign);
        $data = $r->validate(['subject' => 'required|string|max:180|not_regex:/[\r\n]/', 'body' => 'required|string|max:20000', 'locale' => 'required|in:fr,en', 'revision' => 'required|integer|min:1']);
        DB::transaction(function () use ($campaign, $data) {
            $c = NewsletterCampaign::whereKey($campaign->id)->lockForUpdate()->firstOrFail();
            abort_unless($c->status === 'draft' && $c->revision === (int) $data['revision'], 409);
            $c->update(['subject' => $data['subject'], 'body' => $data['body'], 'locale' => $data['locale'], 'revision' => $c->revision + 1]);
        });

        return back()->with('status', 'Brouillon enregistré.');
    }

    public function approve(Request $r, NewsletterCampaign $campaign, Newsletter $newsletter)
    {
        $this->owned($r, $campaign);
        $data = $r->validate(['revision' => 'required|integer|min:1', 'approve' => 'accepted']);
        DB::transaction(function () use ($campaign, $data, $newsletter) {
            $c = NewsletterCampaign::whereKey($campaign->id)->lockForUpdate()->firstOrFail();
            abort_unless($c->status === 'draft' && $c->revision === (int) $data['revision'], 409);
            $c->update(['status' => 'approved', 'approved_at' => now()]);
            NewsletterSubscriber::where('status', 'subscribed')->where('locale', $c->locale)->orderBy('id')->chunk(100, function ($subscribers) use ($c, $newsletter) {
                foreach ($subscribers as $s) {
                    NewsletterDelivery::create(['subscriber_id' => $s->id, 'campaign_id' => $c->id, 'kind' => 'campaign', 'payload' => ['subject' => $c->subject, 'body' => $c->body, 'link' => $newsletter->link('newsletter.unsubscribe', $s)]]);
                }
            });
        });

        return back()->with('status', config('newsletter.mode') === 'preview' ? 'Simulation préparée. Aucun e-mail réel ne sera envoyé.' : 'Envoi préparé pour les abonnés confirmés.');
    }

    public function cancel(Request $r, NewsletterCampaign $campaign)
    {
        $this->owned($r, $campaign);
        DB::transaction(function () use ($campaign) {
            NewsletterCampaign::whereKey($campaign->id)->lockForUpdate()->firstOrFail()->update(['status' => 'cancelled']);
            NewsletterDelivery::where('campaign_id', $campaign->id)->where('status', 'pending')->update(['status' => 'cancelled']);
        });

        return back()->with('status', 'Envoi arrêté. Les e-mails déjà remis au serveur de messagerie ne peuvent pas être rappelés.');
    }

    public function delivery(Request $r, NewsletterDelivery $delivery)
    {
        if ($delivery->campaign_id) {
            $this->owned($r, NewsletterCampaign::findOrFail($delivery->campaign_id));
        }
        abort_unless(config('newsletter.mode') === 'preview', 404);

        return view('newsletter.delivery', ['delivery' => $delivery, 'subscriber' => NewsletterSubscriber::findOrFail($delivery->subscriber_id)]);
    }

    public function destroySubscriber(Request $r, NewsletterSubscriber $subscriber)
    {
        // Liste GECA commune aux administrateurs actifs ; aucune organisation issue du navigateur.
        DB::transaction(function () use ($subscriber) {
            NewsletterSubscriber::whereKey($subscriber->id)->lockForUpdate()->firstOrFail()->delete();
        });

        return back()->with('status', 'Adresse et messages associés supprimés de la liste privée.');
    }

    public function simulate(Request $r)
    {
        abort_unless(config('newsletter.mode') === 'preview', 403);
        Artisan::call('geca:newsletter-process', ['--limit' => 10]);

        return redirect()->route('newsletter.index')->with('status', 'Messages de test traités, sans envoi réel.');
    }
}
