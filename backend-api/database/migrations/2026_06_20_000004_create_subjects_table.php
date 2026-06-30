<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();   // e.g. "MTK"
            $table->string('name');             // e.g. "Matematika"
            $table->text('description')->nullable();
            $table->integer('hours_per_week')->default(2);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('subjects'); }
};
