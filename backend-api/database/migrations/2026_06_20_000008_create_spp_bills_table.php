<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('spp_bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->tinyInteger('month');          // 1-12
            $table->year('year');                 // 2025
            $table->string('academic_year');      // 2024/2025
            $table->decimal('amount', 12, 2);
            $table->enum('status', ['belum', 'lunas'])->default('belum');
            $table->timestamp('paid_at')->nullable();
            $table->string('paid_by')->nullable(); // nama penerima pembayaran
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['student_id', 'month', 'year'], 'spp_bills_unique');
        });
    }
    public function down(): void { Schema::dropIfExists('spp_bills'); }
};
