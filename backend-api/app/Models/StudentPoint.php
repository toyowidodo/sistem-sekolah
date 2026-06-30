<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentPoint extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'point_category_id',
        'date',
        'notes',
        'recorded_by'
    ];

    public function student()
    {
        return $this->belongsTo(\App\Models\Student::class);
    }

    public function category()
    {
        return $this->belongsTo(PointCategory::class, 'point_category_id');
    }

    public function recorder()
    {
        return $this->belongsTo(\App\Models\User::class, 'recorded_by');
    }
}
