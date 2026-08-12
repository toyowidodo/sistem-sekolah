<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Modul pengumuman yang sudah ada tidak pernah keluar dari aplikasi, padahal
     * orang tua tidak akan login setiap hari. Dua tabel ini jadi dasar notifikasi
     * keluar: template yang bisa disunting admin, dan log setiap percobaan kirim
     * supaya kegagalan tidak hilang diam-diam.
     */
    public function up(): void
    {
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();   // siswa_alpha, spp_jatuh_tempo, dst
            $table->string('name');
            $table->text('body');              // mendukung placeholder {nama_siswa} dll
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->string('template_key')->nullable();
            $table->foreignId('student_id')->nullable()->constrained('students')->nullOnDelete();
            $table->string('recipient_name')->nullable();
            $table->string('recipient_phone');
            $table->text('message');
            $table->enum('status', ['terkirim', 'gagal', 'dilewati'])->default('terkirim');
            $table->string('driver')->nullable();
            $table->text('error')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['template_key', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
        Schema::dropIfExists('notification_templates');
    }
};
