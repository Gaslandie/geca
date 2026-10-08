<?php

namespace Tests\Feature;

use App\Models\NewsletterCampaign as Campaign;
use App\Models\NewsletterDelivery as Delivery;
use App\Models\NewsletterSubscriber as Subscriber;
use App\Models\User;
use App\Services\Newsletter;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mime\Email;
use Tests\TestCase;

class NewsletterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['newsletter.mode' => 'preview', 'newsletter.public_url' => 'http://127.0.0.1:8000', 'newsletter.origins' => ['http://127.0.0.1:3000']]);
    }

    private function admin(): User
    {
        $u = User::factory()->create(['is_admin' => true, 'is_active' => true, 'session_version' => 1]);
        $this->verifiedAdmin($u);

        return $u;
    }

    private function subscriber(string $email = 'person@example.test', string $locale = 'fr', bool $active = false): Subscriber
    {
        $this->post("/newsletter/$locale/inscription", ['email' => $email, 'consent' => 1])->assertOk();
        $s = Subscriber::where('email_hash', app(Newsletter::class)->emailHash($email))->firstOrFail();
        if ($active) {
            $this->post(app(Newsletter::class)->link('newsletter.confirm', $s, true))->assertOk();
        }

        return $s->fresh();
    }

    private function campaign(): Campaign
    {
        $this->post('/administration/newsletter', ['subject' => 'Essai technique', 'body' => 'Texte de test sans fait GECA ajouté.', 'locale' => 'fr'])->assertRedirect();

        return Campaign::latest()->firstOrFail();
    }

    private function approve(Campaign $c): void
    {
        $this->post("/administration/newsletter/$c->id/preparer", ['revision' => '1', 'approve' => '1'])->assertRedirect();
    }

    private function csrf(): void
    {
        $this->app->bind(PreventRequestForgery::class, fn ($app) => new class($app, $app['encrypter']) extends PreventRequestForgery
        {
            protected function runningUnitTests()
            {
                return false;
            }
        });
    }

    public function test_bridge_checks_origin_and_has_no_side_effect(): void
    {
        $this->withHeader('Origin', 'https://evil.example')->post('/newsletter/fr/commencer', ['email' => 'x@example.test'])->assertForbidden();
        $this->withHeader('Origin', 'http://127.0.0.1:3000')->post('/newsletter/fr/commencer', ['email' => 'x@example.test'])->assertOk();
        $this->assertDatabaseCount('newsletter_subscribers', 0);
        $this->assertDatabaseCount('newsletter_deliveries', 0);
        $this->get('/newsletter/es')->assertNotFound();
    }

    public function test_csrf_is_required_for_every_mutation(): void
    {
        $s = $this->subscriber(active: true);
        $this->admin();
        $c = $this->campaign();
        $this->csrf();
        $this->post('/newsletter/fr/inscription', ['email' => 'new@example.test', 'consent' => 1])->assertStatus(419);
        $this->post('/administration/newsletter/simulation')->assertStatus(419);
        $this->post(app(Newsletter::class)->link('newsletter.confirm', $s, true))->assertStatus(419);
        $this->post(app(Newsletter::class)->link('newsletter.unsubscribe', $s))->assertStatus(419);
        $this->post("/administration/newsletter/$c->id/preparer", ['revision' => 1, 'approve' => 1])->assertStatus(419);
        $this->assertDatabaseCount('newsletter_subscribers', 1);
        $this->assertSame('draft', $c->fresh()->status);
        $this->withHeader('Origin', 'http://127.0.0.1:3000')->post('/newsletter/fr/commencer', ['email' => 'x@example.test'])->assertOk();
    }

    public function test_validation_consent_and_honeypot(): void
    {
        foreach ([['email' => 'invalid', 'consent' => 1], ['email' => ['x'], 'consent' => 1], ['email' => 'x@example.test'], ['email' => 'x@example.test', 'consent' => 1, 'website' => 'bot']] as $d) {
            $this->post('/newsletter/fr/inscription', $d)->assertSessionHasErrors();
        }$this->assertDatabaseCount('newsletter_subscribers', 0);
    }

    public function test_encryption_duplicate_request_and_no_email_enumeration(): void
    {
        $s = $this->subscriber('PERSON@EXAMPLE.TEST');
        $this->post('/newsletter/fr/inscription', ['email' => 'person@example.test', 'consent' => 1])->assertOk()->assertSee('Demande de test reçue');
        $this->assertDatabaseCount('newsletter_subscribers', 1);
        $this->assertDatabaseCount('newsletter_deliveries', 1);
        $this->assertSame('person@example.test', $s->email);
        $this->assertStringNotContainsString('person', DB::table('newsletter_subscribers')->value('email'));
        $this->assertStringNotContainsString('confirmer', DB::table('newsletter_deliveries')->value('payload'));
        $this->assertArrayNotHasKey('email', $s->toArray());
    }

    public function test_confirmation_signature_expiry_and_get_has_no_mutation(): void
    {
        $s = $this->subscriber();
        $url = Delivery::first()->payload['link'];
        $this->get($url)->assertOk();
        $this->assertSame('pending', $s->fresh()->status);
        $this->get(str_replace('version=1', 'version=2', $url))->assertForbidden();
        $this->post($url)->assertOk();
        $this->assertSame('subscribed', $s->fresh()->status);
        $this->travel(25)->hours();
        $this->get($url)->assertForbidden();
    }

    public function test_unsubscribe_scanner_protection_and_waiting_delivery_cancellation(): void
    {
        $s = $this->subscriber(active: true);
        $old = app(Newsletter::class)->link('newsletter.confirm', $s, true);
        $this->admin();
        $c = $this->campaign();
        $this->approve($c);
        $url = app(Newsletter::class)->link('newsletter.unsubscribe', $s);
        $this->get($url)->assertOk();
        $this->assertSame('subscribed', $s->fresh()->status);
        $this->post($url)->assertOk();
        $this->assertSame('unsubscribed', $s->fresh()->status);
        $this->assertSame(0, Delivery::where('status', 'pending')->count());
        $this->post($old)->assertForbidden();
    }

    public function test_private_access_denies_anonymous_non_admin_and_revocation(): void
    {
        $this->get('/administration/newsletter')->assertRedirect('/connexion');
        $u = User::factory()->create(['is_admin' => false, 'is_active' => true, 'session_version' => 1]);
        $this->verifiedAdmin($u);
        $this->get('/administration/newsletter')->assertForbidden();
        $u = $this->admin();
        $this->get('/administration/newsletter')->assertOk();
        User::whereKey($u->id)->update(['is_active' => false]);
        $this->get('/administration/newsletter')->assertForbidden();
    }

    public function test_campaign_owner_cannot_be_spoofed_and_another_account_is_denied(): void
    {
        $u = $this->admin();
        $other = User::factory()->create(['is_admin' => true, 'is_active' => true, 'session_version' => 1]);
        $this->post('/administration/newsletter', ['subject' => 'Test', 'body' => 'Test', 'locale' => 'fr', 'created_by' => $other->id]);
        $c = Campaign::first();
        $this->assertSame($u->id, $c->created_by);
        $this->verifiedAdmin($other);
        $this->get("/administration/newsletter/$c->id")->assertForbidden();
        $this->put("/administration/newsletter/$c->id", ['subject' => 'Test', 'body' => 'Test', 'locale' => 'fr', 'revision' => 1])->assertForbidden();
        $this->post("/administration/newsletter/$c->id/preparer", ['revision' => 1, 'approve' => 1])->assertForbidden();
        $this->post("/administration/newsletter/$c->id/arreter")->assertForbidden();
    }

    public function test_approval_snapshot_only_confirmed_language_and_stale_revision_refused(): void
    {
        $this->subscriber(active: true);
        $this->subscriber('english@example.test', 'en', true);
        $this->subscriber('pending@example.test');
        $this->admin();
        $c = $this->campaign();
        $this->post("/administration/newsletter/$c->id/preparer", ['revision' => 99, 'approve' => 1])->assertStatus(409);
        $this->approve($c);
        $this->assertSame(1, Delivery::where('kind', 'campaign')->count());
        $this->post("/administration/newsletter/$c->id/preparer", ['revision' => 1, 'approve' => 1])->assertStatus(409);
        $this->put("/administration/newsletter/$c->id", ['subject' => 'Test', 'body' => 'Test', 'locale' => 'fr', 'revision' => 1])->assertStatus(409);
    }

    public function test_preview_never_sends_mail_and_processed_delivery_is_not_repeated(): void
    {
        Mail::shouldReceive('mailer')->never();
        $this->subscriber(active: true);
        $this->admin();
        $c = $this->campaign();
        $this->approve($c);
        $this->artisan('geca:newsletter-process')->assertSuccessful();
        $this->assertSame('simulated', Delivery::where('kind', 'campaign')->first()->status);
        $this->artisan('geca:newsletter-process')->expectsOutput('0 message(s) traité(s). Mode : preview.')->assertSuccessful();
    }

    public function test_worker_rechecks_revoked_owner_and_cancellation(): void
    {
        $this->subscriber(active: true);
        $u = $this->admin();
        $c = $this->campaign();
        $this->approve($c);
        User::whereKey($u->id)->update(['is_active' => false]);
        Mail::shouldReceive('mailer')->never();
        $this->artisan('geca:newsletter-process')->assertSuccessful();
        $this->assertSame('cancelled', Delivery::where('kind', 'campaign')->first()->status);
    }

    public function test_rate_limits_survive_email_case_and_fake_forwarded_headers(): void
    {
        for ($i = 0; $i < 2; $i++) {
            $this->post('/newsletter/fr/inscription', ['email' => 'limit@example.test', 'consent' => 1])->assertOk();
        }$this->withHeaders(['X-Forwarded-For' => '192.0.2.5', 'X-Real-IP' => '192.0.2.6'])->post('/newsletter/fr/inscription', ['email' => 'LIMIT@EXAMPLE.TEST', 'consent' => 1])->assertStatus(429);
    }

    public function test_old_confirmation_cannot_be_reused_after_renewal(): void
    {
        $s = $this->subscriber();
        $old = Delivery::first()->payload['link'];
        $this->travel(25)->hours();
        $this->post('/newsletter/fr/inscription', ['email' => $s->email, 'consent' => 1])->assertOk();
        $this->get($old)->assertForbidden();
        $this->assertSame(2, $s->fresh()->confirmation_version);
    }

    public function test_smtp_configuration_required_and_ambiguous_failure_never_retried(): void
    {
        $this->subscriber();
        config(['newsletter.mode' => 'smtp', 'newsletter.from' => '']);
        $this->artisan('geca:newsletter-process')->assertFailed();
        config(['newsletter.from' => 'sender@example.test', 'mail.mailers.smtp.host' => 'mail.example.test', 'mail.mailers.smtp.username' => 'test', 'mail.mailers.smtp.password' => 'test-password']);
        Mail::shouldReceive('mailer')->once()->with('smtp')->andThrow(new \RuntimeException('SMTP private detail'));
        $this->artisan('geca:newsletter-process')->assertSuccessful();
        $this->assertSame('needs_review', Delivery::first()->status);
        $this->artisan('geca:newsletter-process')->assertSuccessful();
    }

    public function test_html_is_escaped_headers_are_validated_and_production_has_no_mailbox_preview(): void
    {
        $this->admin();
        $this->post('/administration/newsletter', ['subject' => '<script>alert(1)</script>', 'body' => '<img src=x onerror=alert(1)>', 'locale' => 'fr']);
        $c = Campaign::first();
        $this->get("/administration/newsletter/$c->id")->assertOk()->assertSee('&lt;script&gt;', false)->assertDontSee('<script>', false);
        $this->post('/administration/newsletter', ['subject' => "bad\r\nheader", 'body' => 'Test', 'locale' => 'fr'])->assertSessionHasErrors('subject');
        $this->subscriber();
        $d = Delivery::first();
        config(['newsletter.mode' => 'smtp']);
        $this->get("/administration/newsletter/messages/$d->id")->assertNotFound();
    }

    public function test_smtp_success_is_individual_includes_unsubscribe_and_obeys_global_quota(): void
    {
        $this->subscriber(active: true);
        $this->subscriber('second@example.test', 'fr', true);
        $this->admin();
        $c = $this->campaign();
        $this->approve($c);
        config(['newsletter.mode' => 'smtp', 'newsletter.from' => 'sender@example.test', 'mail.mailers.smtp.host' => 'mail.example.test', 'mail.mailers.smtp.username' => 'test',
            'mail.mailers.smtp.password' => 'test-password', 'newsletter.hourly_limit' => 1]);
        $transport = new class
        {
            public array $messages = [];

            public function raw($body, $callback)
            {
                $message = new Message(new Email);
                $callback($message);
                $this->messages[] = [$body, $message->getSymfonyMessage()];
            }
        };
        Mail::shouldReceive('mailer')->once()->with('smtp')->andReturn($transport);
        $this->artisan('geca:newsletter-process')->assertSuccessful();
        $this->assertCount(1, $transport->messages);
        [$body,$message] = $transport->messages[0];
        $this->assertCount(1, $message->getTo());
        $this->assertEmpty($message->getCc());
        $this->assertEmpty($message->getBcc());
        $this->assertStringContainsString('/desinscription/', $body);
        $this->assertTrue($message->getHeaders()->has('List-Unsubscribe'));
        $this->assertSame(1, Delivery::where('status', 'handed_off')->count());
        $this->assertSame(1, Delivery::where('kind', 'campaign')->where('status', 'pending')->count());
        $this->artisan('geca:newsletter-process')->assertSuccessful();
    }

    public function test_campaign_cancel_stops_pending_mail_and_stale_draft_cannot_overwrite(): void
    {
        $this->subscriber(active: true);
        $this->admin();
        $c = $this->campaign();
        $data = ['subject' => 'Version 2', 'body' => 'Texte test', 'locale' => 'fr', 'revision' => 1];
        $this->put("/administration/newsletter/$c->id", $data)->assertRedirect();
        $this->put("/administration/newsletter/$c->id", $data)->assertStatus(409);
        $this->post("/administration/newsletter/$c->id/preparer", ['revision' => 2, 'approve' => 1])->assertRedirect();
        $this->post("/administration/newsletter/$c->id/arreter")->assertRedirect();
        $this->assertSame(0, Delivery::where('kind', 'campaign')->where('status', 'pending')->count());
    }

    public function test_admin_erasure_requires_csrf_and_removes_private_messages(): void
    {
        $s = $this->subscriber();
        $this->admin();
        $url = "/administration/newsletter/abonnes/$s->id";
        $this->csrf();
        $this->delete($url)->assertStatus(419);
        $this->withSession(['_token' => 'test-token'])->delete($url, ['_token' => 'test-token'])->assertRedirect();
        $this->assertDatabaseCount('newsletter_subscribers', 0);
        $this->assertDatabaseCount('newsletter_deliveries', 0);
    }

    public function test_private_sqlite_backup_can_be_restored_and_decrypted_with_existing_key(): void
    {
        $s = $this->subscriber();
        $dir = sys_get_temp_dir().'/geca-newsletter-restore-'.bin2hex(random_bytes(12));
        mkdir($dir, 0700);
        $file = $dir.'/restore.sqlite';
        try {
            $pdo = new \PDO('sqlite::memory:');
            $pdo->exec('CREATE TABLE newsletter_subscribers (email TEXT NOT NULL)');
            $insert = $pdo->prepare('INSERT INTO newsletter_subscribers (email) VALUES (?)');
            $insert->execute([DB::table('newsletter_subscribers')->value('email')]);
            $pdo->exec('VACUUM INTO '.$pdo->quote($file));
            chmod($file, 0600);
            $restored = new \PDO('sqlite:'.$file);
            $this->assertSame('ok', $restored->query('PRAGMA integrity_check')->fetchColumn());
            $email = $restored->query('SELECT email FROM newsletter_subscribers')->fetchColumn();
            $this->assertSame($s->email, Crypt::decryptString($email));
        } finally {
            if (is_file($file)) {
                unlink($file);
            }rmdir($dir);
        }
    }

    public function test_public_session_cookie_is_separate_and_simulation_cannot_send_in_smtp_mode(): void
    {
        $this->get('/newsletter/fr')->assertOk()->assertCookie('geca_newsletter_session');
        $this->admin();
        config(['newsletter.mode' => 'smtp']);
        $this->post('/administration/newsletter/simulation')->assertForbidden();
        config(['newsletter.mode' => 'preview']);
        $this->post('/administration/newsletter/simulation')->assertRedirect();
    }
}
