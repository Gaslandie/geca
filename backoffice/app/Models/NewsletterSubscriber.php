<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class NewsletterSubscriber extends Model
{
    use HasUuids;

    protected $guarded = ['id'];

    protected $hidden = ['email', 'email_hash'];

    protected function casts(): array
    {
        return ['email' => 'encrypted', 'requested_at' => 'datetime', 'confirmed_at' => 'datetime', 'unsubscribed_at' => 'datetime'];
    }
}
