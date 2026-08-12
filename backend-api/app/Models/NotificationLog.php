<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_key', 'student_id', 'recipient_name', 'recipient_phone',
        'message', 'status', 'driver', 'error', 'sent_at',
    ];

    protected $casts = ['sent_at' => 'datetime'];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
