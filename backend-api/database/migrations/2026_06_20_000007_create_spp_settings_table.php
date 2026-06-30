<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('spp_settings', function (Blueprint $table) {
            $table->id();
            $table->string('grade_level');        // X, XI, XII
            $table->decimal('amount', 12, 2);     // nominal SPP
            $table->string('academic_year');      // 2024/2025
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['grade_level', 'academic_year']);
        });
    }
    public function down(): void { Schema::dropIfExists('spp_settings'); }
};
