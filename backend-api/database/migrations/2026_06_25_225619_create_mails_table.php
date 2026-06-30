<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mails', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['incoming', 'outgoing']);
            $table->string('reference_number')->unique();
            $table->string('entity')->comment('Pengirim (incoming) atau Tujuan (outgoing)');
            $table->string('subject');
            $table->date('date');
            $table->date('received_date')->nullable()->comment('Hanya untuk surat masuk');
            $table->string('file_path')->nullable();
            $table->text('disposition')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mails');
    }
};
