<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->string('nip')->unique();
            $table->string('name');
            $table->string('position'); // Jabatan
            $table->string('subject'); // Mata pelajaran
            $table->string('education'); // Pendidikan terakhir
            $table->string('phone');
            $table->string('photo')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('teachers');
    }
};