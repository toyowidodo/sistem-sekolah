<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('classroom_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_id')->nullable()->constrained('teachers')->onDelete('set null');
            $table->enum('day', ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']);
            $table->time('start_time');
            $table->time('end_time');
            $table->string('room')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('schedules'); }
};
