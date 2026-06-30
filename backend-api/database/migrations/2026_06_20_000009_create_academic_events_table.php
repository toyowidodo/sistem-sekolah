<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('academic_events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->enum('category', ['akademik','ujian','libur','kegiatan','rapat','lainnya'])->default('akademik');
            $table->enum('priority', ['normal','penting','urgent'])->default('normal');
            $table->string('color', 7)->nullable();  // hex color
            $table->boolean('is_holiday')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('academic_events'); }
};
