<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model {
    use HasFactory;
    protected $fillable = [
        'item_code', 'name', 'category', 'quantity', 'condition', 
        'location', 'purchase_date', 'price', 'notes', 'image'
    ];
    
    protected $casts = [
        'purchase_date' => 'date',
        'price' => 'decimal:2',
    ];

    public function loans() {
        return $this->hasMany(InventoryLoan::class);
    }
}
