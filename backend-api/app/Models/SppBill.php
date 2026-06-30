<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SppBill extends Model {
    use HasFactory;
    protected $fillable = [
        'student_id', 'month', 'year', 'academic_year',
        'amount', 'status', 'paid_at', 'paid_by', 'notes'
    ];
    protected $casts = [
        'amount'  => 'float',
        'paid_at' => 'datetime',
        'month'   => 'integer',
        'year'    => 'integer',
    ];
    public function student() {
        return $this->belongsTo(Student::class);
    }
}
