<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Guru sebelumnya tidak terhubung ke akun login mana pun. Akibatnya role Guru
     * terpaksa diberi permission manage-academic penuh, yang membuat setiap guru
     * bisa mengubah nilai semua kelas dan semua mapel — bukan hanya yang diampunya.
     *
     * Relasi ini jadi dasar pembatasan akses per guru sekaligus portal guru
     * dan peran wali kelas.
     */
    public function up(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->after('id')
                ->constrained('users')
                ->nullOnDelete();

            $table->string('email')->nullable()->unique()->after('nip');
        });
    }

    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'email']);
        });
    }
};
