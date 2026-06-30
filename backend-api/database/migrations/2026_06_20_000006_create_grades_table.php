<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('classroom_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->onDelete('set null');
            $table->string('academic_year');        // e.g. "2024/2025"
            $table->tinyInteger('semester');        // 1 atau 2
            $table->float('score_tugas')->nullable();  // rata-rata tugas
            $table->float('score_uts')->nullable();
            $table->float('score_uas')->nullable();
            $table->float('final_score')->nullable();  // nilai akhir computed
            $table->string('grade_letter', 2)->nullable(); // A/B/C/D/E
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['student_id','subject_id','classroom_id','academic_year','semester'], 'grades_unique');
        });
    }
    public function down(): void { Schema::dropIfExists('grades'); }
};
