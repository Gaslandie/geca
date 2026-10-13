<?php

namespace Tests\Feature;

use App\Mail\PublicContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PublicContactTest extends TestCase
{
    use RefreshDatabase;

    private function payload(): array
    {
        $token = $this->withHeaders(['Origin' => 'https://globalecoaction.org'])->getJson('/contact-public/jeton')->assertOk()->json('token');
        $this->travel(3)->seconds();

        return ['token' => $token, 'name' => 'Test contact', 'email' => 'sender@example.com', 'organization' => '', 'reason' => 'other', 'message' => 'Message de test isolé sans envoi réel.', 'website' => ''];
    }

    public function test_valid_message_is_sent_to_fixed_recipient_and_token_cannot_be_replayed(): void
    {
        Mail::fake();
        $data = $this->payload();
        $data['recipient'] = 'attacker@example.com';
        $this->postJson('/contact-public', $data)->assertOk()->assertJson(['sent' => true]);
        Mail::assertSent(PublicContactMessage::class, fn ($mail) => $mail->hasTo('ong.geca@gmail.com') && $mail->contact['email'] === 'sender@example.com');
        $this->postJson('/contact-public', $data)->assertStatus(419);
        Mail::assertSentCount(1);
    }

    public function test_unknown_origin_and_missing_origin_are_refused(): void
    {
        Mail::fake();
        $this->withHeaders(['Origin' => 'https://evil.example'])->getJson('/contact-public/jeton')->assertForbidden()->assertHeaderMissing('Access-Control-Allow-Origin');
        $this->flushHeaders()->getJson('/contact-public/jeton')->assertForbidden();
        Mail::assertNothingSent();
    }

    public function test_honeypot_invalid_reason_and_header_injection_are_refused(): void
    {
        Mail::fake();
        foreach ([['website' => 'spam'], ['reason' => 'unknown'], ['email' => "sender@example.com\r\nBcc: other@example.com"], ['name' => "Name\nInjected"], ['message' => 'short']] as $change) {
            $this->travel(61)->minutes();
            $data = $this->payload();
            $this->postJson('/contact-public', array_merge($data, $change))->assertUnprocessable()->assertHeader('Access-Control-Allow-Origin', 'https://globalecoaction.org');
        }
        Mail::assertNothingSent();
    }

    public function test_token_expiration_origin_binding_and_too_fast_submission_are_refused(): void
    {
        Mail::fake();
        $data = $this->payload();
        $this->withHeaders(['Origin' => 'https://www.globalecoaction.org'])->postJson('/contact-public', $data)->assertStatus(419);
        $data = $this->payload();
        $this->travel(31)->minutes();
        $this->postJson('/contact-public', $data)->assertStatus(419);
        $data = $this->payload();
        $this->travelBack();
        $this->postJson('/contact-public', $data)->assertStatus(419);
        Mail::assertNothingSent();
    }

    public function test_transport_failure_is_not_reported_as_success(): void
    {
        $data = $this->payload();
        Mail::shouldReceive('to')->once()->with('ong.geca@gmail.com')->andThrow(new \RuntimeException('private SMTP detail'));
        $this->postJson('/contact-public', $data)->assertStatus(503)->assertJson(['error' => 'delivery'])->assertDontSee('private SMTP detail');
    }

    public function test_limits_block_further_submissions_and_preflight_is_narrow(): void
    {
        Mail::fake();
        $this->withHeaders(['Origin' => 'https://globalecoaction.org'])->options('/contact-public')->assertNoContent()->assertHeader('Access-Control-Allow-Origin', 'https://globalecoaction.org')->assertHeaderMissing('Access-Control-Allow-Credentials');
        for ($i = 0; $i < 3; $i++) {
            $this->postJson('/contact-public', $this->payload())->assertOk();
        }
        $this->postJson('/contact-public', $this->payload())->assertStatus(429);
        Mail::assertSentCount(3);
    }
}
