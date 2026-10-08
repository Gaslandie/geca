<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_entries', function (Blueprint $table) {
            $table->id();
            $table->string('kind', 20);
            $table->string('source_key');
            $table->json('source_payload');
            $table->json('draft_payload')->nullable();
            $table->unsignedInteger('revision')->default(0);
            $table->timestamps();
            $table->unique(['kind', 'source_key']);
        });
        Schema::create('content_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('content_entry_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('revision');
            $table->json('payload');
            $table->text('source_note');
            $table->timestamp('created_at');
            $table->unique(['content_entry_id', 'revision']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_revisions');
        Schema::dropIfExists('content_entries');
    }
};
