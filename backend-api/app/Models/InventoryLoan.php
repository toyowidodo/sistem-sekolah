<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryLoan extends Model {
    use HasFactory;
    protected $fillable = [
        'inventory_id', 'borrower_name', 'loan_date', 'return_date', 
        'status', 'notes'
    ];
    
    protected $casts = [
        'loan_date' => 'date',
        'return_date' => 'date',
    ];

    public function inventory() {
        return $this->belongsTo(Inventory::class);
    }
}
