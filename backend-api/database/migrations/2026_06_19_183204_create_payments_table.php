<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2); // Jumlah pembayaran
            $table->enum('status', ['lunas', 'belum'])->default('belum');
            $table->date('payment_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};