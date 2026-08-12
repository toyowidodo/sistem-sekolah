<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class StudentEnrollment extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = ['student_id', 'classroom_id', 'academic_year', 'status', 'notes'];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }
}
