<?php

namespace App\Mail;

use App\Support\OrganizationEmail;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class LoginCode extends Mailable
{
    public function __construct(public readonly string $code) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            replyTo: [new Address(OrganizationEmail::ADDRESS, 'Global EcoAction')],
            subject: 'Votre code de connexion Global EcoAction',
        );
    }

    public function content(): Content
    {
        return new Content(text: 'mail.login-code');
    }
}
