<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_assets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->string('title', 200);
            $table->text('source');
            $table->text('credit')->nullable();
            $table->text('license');
            $table->text('alt_fr');
            $table->text('alt_en');
            $table->boolean('illustrative')->default(true);
            $table->string('mime', 30);
            $table->unsignedInteger('width');
            $table->unsignedInteger('height');
            $table->unsignedInteger('original_bytes');
            $table->unsignedInteger('preview_bytes');
            $table->char('sha256', 64);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_assets');
    }
};
