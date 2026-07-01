<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Grade extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'student_id',
        'subject_id',
        'classroom_id',
        'semester',
        'academic_year',
        'score_tugas',
        'score_uts',
        'score_uas',
        'final_score',
        'grade_letter',
        'notes',
    ];

    protected $casts = [
        'score_tugas' => 'float',
        'score_uts' => 'float',
        'score_uas' => 'float',
        'final_score' => 'float',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }

    /**
     * Compute final score from task, midterm, and final exam
     * Weighting: Task 40%, Midterm 30%, Final Exam 30%
     */
    public static function computeFinal($tugas, $uts, $uas)
    {
        $score = 0;
        $weight = 0;

        if ($tugas !== null && $tugas !== '') {
            $score += floatval($tugas) * 0.4;
            $weight += 0.4;
        }
        if ($uts !== null && $uts !== '') {
            $score += floatval($uts) * 0.3;
            $weight += 0.3;
        }
        if ($uas !== null && $uas !== '') {
            $score += floatval($uas) * 0.3;
            $weight += 0.3;
        }

        if ($weight === 0) {
            return null;
        }

        return round(($score / $weight) * 10) / 10;
    }

    /**
     * Get letter grade from score
     */
    public static function letterGrade($score)
    {
        if ($score === null || $score === '') {
            return '-';
        }

        $score = floatval($score);
        if ($score >= 90) {
            return 'A';
        } elseif ($score >= 80) {
            return 'B';
        } elseif ($score >= 70) {
            return 'C';
        } elseif ($score >= 60) {
            return 'D';
        }
        return 'E';
    }
}
