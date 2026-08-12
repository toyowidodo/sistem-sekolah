<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * announcements.user_id memakai ON DELETE CASCADE, jadi menghapus akun staf
     * ikut menghapus SELURUH pengumuman yang pernah dia terbitkan — termasuk
     * yang masih berlaku dan dibaca orang tua.
     *
     * Polanya sama dengan students.user_id dan student_points.recorded_by yang
     * sudah diperbaiki di 2026_08_10_000003. Yang ini luput saat itu dan baru
     * ketahuan ketika memverifikasi foreign key di server produksi.
     *
     * Kolomnya dijadikan nullable supaya penulis bisa dikosongkan tanpa
     * menghapus pengumumannya. Frontend sudah menangani penulis kosong.
     */
    public function up(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('announcements', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        Schema::table('announcements', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
