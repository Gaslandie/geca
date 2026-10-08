<?php

use App\Models\NewsletterSubscriber;
use Illuminate\Support\Facades\Schedule;

// Commandes GECA dans app/Console/Commands.

Schedule::command('geca:newsletter-process --limit=10')->everyMinute()->withoutOverlapping();

Schedule::call(function () {
    NewsletterSubscriber::where('status', 'pending')->where('requested_at', '<', now()->subDays(7))->delete();
})->daily()->name('newsletter-prune-pending')->withoutOverlapping();
