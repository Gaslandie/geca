<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('newsletter_subscribers', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->text('email');
            $t->string('email_hash', 64)->unique();
            $t->string('locale', 2);
            $t->string('consent_version')->default('newsletter-2026-10-08');
            $t->string('status')->default('pending');
            $t->unsignedInteger('confirmation_version')->default(1);
            $t->timestamp('requested_at');
            $t->timestamp('confirmed_at')->nullable();
            $t->timestamp('unsubscribed_at')->nullable();
            $t->timestamps();
        });
        Schema::create('newsletter_campaigns', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignId('created_by')->constrained('users');
            $t->string('subject', 180);
            $t->text('body');
            $t->string('locale', 2);
            $t->string('status')->default('draft');
            $t->unsignedInteger('revision')->default(1);
            $t->timestamp('approved_at')->nullable();
            $t->timestamps();
        });
        Schema::create('newsletter_deliveries', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('subscriber_id')->constrained('newsletter_subscribers')->cascadeOnDelete();
            $t->foreignUuid('campaign_id')->nullable()->constrained('newsletter_campaigns')->cascadeOnDelete();
            $t->string('kind');
            $t->text('payload');
            $t->string('status')->default('pending');
            $t->timestamp('processed_at')->nullable();
            $t->timestamps();
            $t->unique(['subscriber_id', 'campaign_id']);
            $t->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_deliveries');
        Schema::dropIfExists('newsletter_campaigns');
        Schema::dropIfExists('newsletter_subscribers');
    }
};
