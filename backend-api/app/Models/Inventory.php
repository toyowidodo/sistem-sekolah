<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use App\Traits\LogsActivity;

class Inventory extends Model {
    use HasFactory, LogsActivity;
    protected $fillable = [
        'item_code', 'name', 'category', 'quantity', 'condition',
        'location', 'purchase_date', 'price', 'notes', 'image'
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'price' => 'decimal:2',
    ];

    /**
     * Kolom image menyimpan path relatif ("inventories/abc.png"), bukan URL
     * lengkap. URL-nya dibangun saat dibaca dari APP_URL, sehingga gambar lama
     * tidak ikut rusak kalau domain berubah.
     *
     * Untuk mengambil path mentahnya (misal saat menghapus berkas), pakai
     * $inventory->getRawOriginal('image').
     */
    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $value ? Storage::disk('public')->url($value) : null,
        );
    }

    public function loans() {
        return $this->hasMany(InventoryLoan::class);
    }
}
