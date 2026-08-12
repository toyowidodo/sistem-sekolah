<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Role "Orang Tua" sudah ada di seeder sejak awal, tapi tidak punya akun,
     * permission, maupun relasi ke siswa mana pun.
     *
     * Tabel penghubung ini sengaja many-to-many: satu akun orang tua bisa punya
     * beberapa anak di sekolah yang sama, dan satu siswa bisa diikuti lebih dari
     * satu akun (ayah dan ibu terpisah).
     */
    public function up(): void
    {
        Schema::create('student_guardians', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->enum('relation', ['ayah', 'ibu', 'wali'])->default('wali');
            $table->string('phone')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'student_id'], 'student_guardians_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_guardians');
    }
};
