<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * students.classroom_id hanya menyimpan kelas SAAT INI. Tanpa riwayat, begitu
     * siswa naik kelas, rapor dan rekap absensi tahun lalu ikut berubah kelasnya —
     * data historis rusak diam-diam.
     *
     * Tabel ini mencatat kelas siswa per tahun ajaran beserta hasil akhirnya,
     * sehingga laporan tahun lalu tetap menunjuk kelas yang benar.
     */
    public function up(): void
    {
        Schema::create('student_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('classroom_id')->nullable()->constrained('classrooms')->nullOnDelete();
            $table->string('academic_year');
            $table->enum('status', ['aktif', 'naik', 'tinggal', 'lulus', 'keluar'])->default('aktif');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'academic_year'], 'student_enrollments_unique');
            $table->index(['academic_year', 'classroom_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_enrollments');
    }
};
