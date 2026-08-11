<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class Teacher extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'user_id', 'nip', 'email', 'name', 'position', 'subject', 'education', 'phone', 'photo'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /** Jadwal mengajar guru ini */
    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }

    /** Kelas yang diwalikan guru ini */
    public function homeroomClassrooms()
    {
        return $this->hasMany(Classroom::class, 'homeroom_teacher_id');
    }

    /** ID kelas yang diampu (mengajar) atau diwalikan */
    public function accessibleClassroomIds(): array
    {
        return $this->schedules()->pluck('classroom_id')
            ->merge($this->homeroomClassrooms()->pluck('id'))
            ->unique()
            ->values()
            ->all();
    }

    /** Apakah guru ini mengajar mapel tertentu di kelas tertentu */
    public function teaches($classroomId, $subjectId): bool
    {
        return $this->schedules()
            ->where('classroom_id', $classroomId)
            ->where('subject_id', $subjectId)
            ->exists();
    }
}
