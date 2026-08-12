<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tahun ajaran sebelumnya hanya berupa teks bebas yang diketik ulang di
     * berbagai modul (settings, nilai, SPP), tanpa daftar resmi. Tabel ini jadi
     * sumber kebenarannya sekaligus penanda tahun ajaran yang sedang berjalan.
     */
    public function up(): void
    {
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();          // contoh: "2025/2026"
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('semester', ['Ganjil', 'Genap'])->default('Ganjil');
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_years');
    }
};
