<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('inventory_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_id')->constrained()->onDelete('cascade');
            $table->string('borrower_name');
            $table->date('loan_date');
            $table->date('return_date')->nullable();
            $table->enum('status', ['dipinjam', 'dikembalikan'])->default('dipinjam');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('inventory_loans'); }
};
