<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title', 200);
            $table->string('period', 100);
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->unsignedBigInteger('bytes');
            $table->string('sha256', 64);
            $table->foreignId('created_by')->constrained('users');
            $table->unsignedInteger('revision')->default(1);
            $table->timestamps();
            $table->softDeletes();
        });
        Schema::create('activity_report_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('activity_report_id')->constrained('activity_reports');
            $table->foreignId('user_id')->constrained('users');
            $table->unsignedInteger('revision');
            $table->json('payload');
            $table->string('action', 20);
            $table->timestamp('created_at');
            $table->unique(['activity_report_id', 'revision']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_report_revisions');
        Schema::dropIfExists('activity_reports');
    }
};
