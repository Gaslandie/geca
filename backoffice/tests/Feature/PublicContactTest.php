<?php

namespace Tests\Feature;

use App\Support\OrganizationEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Mail\Events\MessageSending;
use Illuminate\Mail\Transport\ArrayTransport;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PublicContactTest extends TestCase
{
    use RefreshDatabase;

    private ArrayTransport $transport;

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'mail.default' => 'array',
            'login.from' => 'sender@example.test',
            'login.mailer' => 'login',
            'mail.mailers.login' => [
                'transport' => 'smtp', 'scheme' => 'smtps', 'host' => 'smtp.example.test',
                'port' => 465, 'username' => 'sender@example.test', 'password' => 'test-only',
                'require_tls' => true,
            ],
        ]);
        // Capture locale après construction réelle du message, sans connexion réseau.
        $this->transport = new ArrayTransport;
        Mail::mailer('login')->setSymfonyTransport($this->transport);
    }

    private function payload(): array
    {
        $token = $this->withHeaders(['Origin' => 'https://globalecoaction.org'])->getJson('/contact-public/jeton')->assertOk()->json('token');
        $this->travel(3)->seconds();

        return ['token' => $token, 'name' => 'Test contact', 'email' => 'sender@example.com', 'organization' => '', 'reason' => 'other', 'message' => 'Message de test isolé sans envoi réel.', 'website' => ''];
    }

    public function test_valid_message_is_sent_to_fixed_recipient_and_token_cannot_be_replayed(): void
    {
        $data = $this->payload();
        $data['recipient'] = 'attacker@example.com';
        $this->postJson('/contact-public', $data)->assertOk()->assertJson(['sent' => true]);
        $message = $this->transport->messages()->sole()->getOriginalMessage();
        $this->assertSame(['ong.geca@gmail.com'], array_map(fn ($address) => $address->getAddress(), $message->getTo()));
        $this->assertSame('sender@example.test', $message->getFrom()[0]->getAddress());
        $this->assertSame('sender@example.com', $message->getReplyTo()[0]->getAddress());
        $this->assertSame([], $message->getCc());
        $this->assertSame([], $message->getBcc());
        $this->assertStringContainsString('Message de test isolé', $message->getTextBody());
        $this->assertCount(0, Mail::mailer('array')->getSymfonyTransport()->messages());
        $this->postJson('/contact-public', $data)->assertStatus(419);
        $this->assertCount(1, $this->transport->messages());
    }

    public function test_unknown_origin_and_missing_origin_are_refused(): void
    {
        $this->withHeaders(['Origin' => 'https://evil.example'])->getJson('/contact-public/jeton')->assertForbidden()->assertHeaderMissing('Access-Control-Allow-Origin');
        $this->flushHeaders()->getJson('/contact-public/jeton')->assertForbidden();
        $this->assertCount(0, $this->transport->messages());
    }

    public function test_honeypot_invalid_reason_and_header_injection_are_refused(): void
    {
        foreach ([['website' => 'spam'], ['reason' => 'unknown'], ['email' => "sender@example.com\r\nBcc: other@example.com"], ['name' => "Name\nInjected"], ['message' => 'short']] as $change) {
            $this->travel(61)->minutes();
            $data = $this->payload();
            $this->postJson('/contact-public', array_merge($data, $change))->assertUnprocessable()->assertHeader('Access-Control-Allow-Origin', 'https://globalecoaction.org');
        }
        $this->assertCount(0, $this->transport->messages());
    }

    public function test_token_expiration_origin_binding_and_too_fast_submission_are_refused(): void
    {
        $data = $this->payload();
        $this->withHeaders(['Origin' => 'https://www.globalecoaction.org'])->postJson('/contact-public', $data)->assertStatus(419);
        $data = $this->payload();
        $this->travel(31)->minutes();
        $this->postJson('/contact-public', $data)->assertStatus(419);
        $data = $this->payload();
        $this->travelBack();
        $this->postJson('/contact-public', $data)->assertStatus(419);
        $this->assertCount(0, $this->transport->messages());
    }

    public function test_transport_failure_is_not_reported_as_success(): void
    {
        $data = $this->payload();
        Mail::shouldReceive('mailer')->once()->with('login')->andThrow(new \RuntimeException('private SMTP detail'));
        $this->postJson('/contact-public', $data)->assertStatus(503)->assertJson(['error' => 'delivery'])->assertDontSee('private SMTP detail');
    }

    #[DataProvider('invalidMailSettings')]
    public function test_missing_or_simulated_transport_never_reports_success(array $settings): void
    {
        $data = $this->payload();
        config($settings);
        $this->postJson('/contact-public', $data)->assertStatus(503)->assertExactJson(['error' => 'delivery']);
        $this->assertCount(0, $this->transport->messages());
        $this->assertCount(0, Mail::mailer('array')->getSymfonyTransport()->messages());
    }

    public static function invalidMailSettings(): array
    {
        return [
            'array' => [['mail.mailers.login.transport' => 'array']],
            'log' => [['mail.mailers.login.transport' => 'log']],
            'failover' => [['mail.mailers.login.transport' => 'failover']],
            'unknown mailer' => [['login.mailer' => 'unknown']],
            'missing sender' => [['login.from' => null]],
            'invalid sender' => [['login.from' => "sender@example.test\r\nBcc: other@example.test"]],
            'missing host' => [['mail.mailers.login.host' => '']],
            'missing username' => [['mail.mailers.login.username' => '']],
            'missing password' => [['mail.mailers.login.password' => '']],
            'missing scheme' => [['mail.mailers.login.scheme' => null]],
            'unenforced TLS' => [['mail.mailers.login.require_tls' => false]],
        ];
    }

    public function test_cancelled_message_never_reports_success(): void
    {
        Event::listen(MessageSending::class, fn () => false);
        $this->postJson('/contact-public', $this->payload())->assertStatus(503)->assertExactJson(['error' => 'delivery']);
        $this->assertCount(0, $this->transport->messages());
    }

    public function test_geca_recipient_matches_public_site_address(): void
    {
        $source = file_get_contents(base_path('../src/content/site.ts'));
        $this->assertMatchesRegularExpression('/email:\s*"'.preg_quote(OrganizationEmail::ADDRESS, '/').'"/', $source);
    }

    public function test_limits_block_further_submissions_and_preflight_is_narrow(): void
    {
        $this->withHeaders(['Origin' => 'https://globalecoaction.org'])->options('/contact-public')->assertNoContent()->assertHeader('Access-Control-Allow-Origin', 'https://globalecoaction.org')->assertHeaderMissing('Access-Control-Allow-Credentials');
        for ($i = 0; $i < 3; $i++) {
            $this->postJson('/contact-public', $this->payload())->assertOk();
        }
        $limited = $this->postJson('/contact-public', $this->payload())->assertStatus(429)
            ->assertHeader('Access-Control-Allow-Origin', 'https://globalecoaction.org')
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertHeaderMissing('Access-Control-Allow-Credentials');
        $this->assertGreaterThan(0, (int) $limited->headers->get('Retry-After'));
        $this->withHeaders(['Origin' => 'https://evil.example'])->postJson('/contact-public', [])
            ->assertForbidden()->assertHeaderMissing('Access-Control-Allow-Origin');
        $this->assertCount(3, $this->transport->messages());
    }

    public function test_token_limit_remains_readable_only_from_allowed_origin(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->withHeaders(['Origin' => 'https://www.globalecoaction.org'])
                ->getJson('/contact-public/jeton')->assertOk();
        }
        $limited = $this->getJson('/contact-public/jeton')->assertStatus(429)
            ->assertHeader('Access-Control-Allow-Origin', 'https://www.globalecoaction.org')
            ->assertHeaderMissing('Access-Control-Allow-Credentials');
        $this->assertGreaterThan(0, (int) $limited->headers->get('Retry-After'));
        $this->flushHeaders()->getJson('/contact-public/jeton')
            ->assertForbidden()->assertHeaderMissing('Access-Control-Allow-Origin');
        $this->assertCount(0, $this->transport->messages());
    }
}
