<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicEvent extends Model {
    use HasFactory;
    protected $fillable = [
        'title','description','start_date','end_date','category',
        'priority','color','is_holiday','created_by'
    ];
    protected $casts = [
        'start_date'  => 'date',
        'end_date'    => 'date',
        'is_holiday'  => 'boolean',
    ];
    public function creator() {
        return $this->belongsTo(User::class, 'created_by');
    }
}
