<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class PublicContactMessage extends Mailable
{
    public function __construct(public array $contact) {}

    public function build(): self
    {
        return $this->subject('GECA — Message depuis le site')
            ->replyTo($this->contact['email'], $this->contact['name'])
            ->text('mail.public-contact');
    }
}
