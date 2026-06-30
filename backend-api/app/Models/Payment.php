<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class Payment extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'invoice_number', 'student_id', 'amount', 'status', 'payment_date', 'notes'
    ];

    // Relasi ke Siswa
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}