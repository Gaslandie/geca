<?php

namespace App\Console\Commands;

use App\Models\NewsletterCampaign;
use App\Models\NewsletterDelivery;
use App\Models\NewsletterSubscriber;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

class ProcessNewsletter extends Command
{
    protected $signature = 'geca:newsletter-process {--limit=10}';

    protected $description = 'Traiter progressivement les e-mails privés, sans réessai automatique ambigu.';

    public function handle(): int
    {
        $mode = config('newsletter.mode');
        if (! in_array($mode, ['preview', 'smtp'], true)) {
            $this->error('Mode newsletter invalide.');

            return self::FAILURE;
        }
        if ($mode === 'smtp' && (! filter_var(config('newsletter.from'), FILTER_VALIDATE_EMAIL) || ! config('mail.mailers.smtp.host') || ! config('mail.mailers.smtp.username') || ! config('mail.mailers.smtp.password'))) {
            $this->error('Messagerie newsletter non configurée.');

            return self::FAILURE;
        }
        $lock = Cache::lock('newsletter-process', 600);
        if (! $lock->get()) {
            return self::SUCCESS;
        }
        $count = 0;
        try {
            foreach (NewsletterDelivery::where('status', 'pending')->oldest()->limit(max(1, min(20, (int) $this->option('limit'))))->get() as $d) {
                $s = NewsletterSubscriber::find($d->subscriber_id);
                $c = $d->campaign_id ? NewsletterCampaign::find($d->campaign_id) : null;
                $owner = $c ? User::find($c->created_by) : null;
                $valid = $d->kind === 'confirmation' ? $s && $s->status === 'pending' && $s->requested_at->greaterThan(now()->subDay()) && $s->confirmation_version === $d->payload['version'] : $s && $s->status === 'subscribed' && $c && $c->status === 'approved' && $owner && $owner->is_admin && $owner->is_active;
                if (! $valid) {
                    $d->update(['status' => 'cancelled']);

                    continue;
                }
                if ($mode === 'smtp' && RateLimiter::tooManyAttempts('newsletter-smtp-hour', max(1, (int) config('newsletter.hourly_limit')))) {
                    break;
                }
                if (NewsletterDelivery::whereKey($d->id)->where('status', 'pending')->update(['status' => 'sending']) !== 1) {
                    continue;
                }
                if ($mode === 'preview') {
                    $state = 'simulated';
                } else {
                    RateLimiter::hit('newsletter-smtp-hour', 3600);
                    try {
                        $p = $d->payload;
                        $body = $p['body']."\n\n".($d->kind === 'campaign' ? ($s->locale === 'en' ? 'Unsubscribe: ' : 'Se désinscrire : ') : '').$p['link'];
                        Mail::mailer('smtp')->raw($body, function ($message) use ($s, $p, $d) {
                            $message->to($s->email)->from(config('newsletter.from'), 'Global EcoAction')->subject($p['subject']);
                            if ($d->kind === 'campaign') {
                                $message->getSymfonyMessage()->getHeaders()->addTextHeader('List-Unsubscribe', '<'.$p['link'].'>');
                            }
                        });
                        $state = 'handed_off';
                    } catch (\Throwable) {
                        $state = 'needs_review';
                    }
                }
                $d->update(['status' => $state, 'processed_at' => now()]);
                $count++;
            }
        } finally {
            $lock->release();
        }
        $this->info($count.' message(s) traité(s). Mode : '.$mode.'.');

        return self::SUCCESS;
    }
}
