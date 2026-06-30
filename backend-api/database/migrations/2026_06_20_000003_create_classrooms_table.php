<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('classrooms', function (Blueprint $table) {
            $table->id();
            $table->string('name');             // e.g. "X IPA 1"
            $table->string('grade_level');      // e.g. "X", "XI", "XII"
            $table->string('major')->nullable(); // e.g. "IPA", "IPS"
            $table->foreignId('homeroom_teacher_id')->nullable()->constrained('teachers')->onDelete('set null');
            $table->integer('capacity')->default(30);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('classrooms'); }
};
