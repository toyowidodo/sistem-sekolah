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
        Schema::create('point_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['pelanggaran', 'prestasi']);
            $table->integer('point_value');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('point_categories');
    }
};
