<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Dua foreign key ke tabel users sebelumnya memakai ON DELETE CASCADE:
     *
     *  - students.user_id       : hapus akun siswa => baris siswa ikut terhapus, lalu
     *                             cascade berantai ke attendances, grades, spp_bills,
     *                             dan student_points.
     *  - student_points.recorded_by : hapus akun guru/TU => seluruh catatan poin yang
     *                             pernah dia input ikut hilang.
     *
     * Keduanya diubah menjadi ON DELETE SET NULL supaya menghapus akun tidak pernah
     * menghapus data akademik.
     */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('student_points', function (Blueprint $table) {
            $table->dropForeign(['recorded_by']);
        });

        Schema::table('student_points', function (Blueprint $table) {
            $table->unsignedBigInteger('recorded_by')->nullable()->change();
            $table->foreign('recorded_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('student_points', function (Blueprint $table) {
            $table->dropForeign(['recorded_by']);
        });

        Schema::table('student_points', function (Blueprint $table) {
            $table->unsignedBigInteger('recorded_by')->nullable(false)->change();
            $table->foreign('recorded_by')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
