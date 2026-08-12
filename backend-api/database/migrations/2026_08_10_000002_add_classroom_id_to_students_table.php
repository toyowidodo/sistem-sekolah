<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Siswa sebelumnya tidak punya relasi ke kelas sama sekali. Akibatnya nominal SPP
     * tidak bisa ditentukan per tingkat, input nilai menampilkan seluruh siswa sekolah,
     * dan portal siswa mengembalikan jadwal semua kelas.
     */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('classroom_id')
                ->nullable()
                ->after('user_id')
                ->constrained('classrooms')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['classroom_id']);
            $table->dropColumn('classroom_id');
        });
    }
};
