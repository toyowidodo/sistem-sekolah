<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->string('item_code')->unique();
            $table->string('name');
            $table->enum('category', ['elektronik', 'furnitur', 'buku', 'alat_tulis', 'lainnya'])->default('lainnya');
            $table->integer('quantity')->default(1);
            $table->enum('condition', ['baik', 'rusak_ringan', 'rusak_berat'])->default('baik');
            $table->string('location')->nullable();
            $table->date('purchase_date')->nullable();
            $table->decimal('price', 15, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('inventories'); }
};
