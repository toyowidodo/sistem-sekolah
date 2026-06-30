<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model {
    use HasFactory;
    protected $fillable = [
        'student_id','subject_id','classroom_id','teacher_id',
        'academic_year','semester','score_tugas','score_uts','score_uas',
        'final_score','grade_letter','notes'
    ];

    protected $casts = [
        'score_tugas'  => 'float',
        'score_uts'    => 'float',
        'score_uas'    => 'float',
        'final_score'  => 'float',
        'semester'     => 'integer',
    ];

    public static function computeFinal($tugas, $uts, $uas): ?float {
        $filled = array_filter([$tugas, $uts, $uas], fn($v) => !is_null($v));
        if (count($filled) === 0) return null;
        // Bobot: Tugas 40%, UTS 30%, UAS 30%
        $score = 0;
        $weight = 0;
        if (!is_null($tugas)) { $score += $tugas * 0.4; $weight += 0.4; }
        if (!is_null($uts))   { $score += $uts   * 0.3; $weight += 0.3; }
        if (!is_null($uas))   { $score += $uas   * 0.3; $weight += 0.3; }
        $final = $weight > 0 ? round($score / $weight, 1) : null;
        return $final;
    }

    public static function letterGrade(?float $score): string {
        if (is_null($score)) return '-';
        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 70) return 'C';
        if ($score >= 60) return 'D';
        return 'E';
    }

    public function student()   { return $this->belongsTo(Student::class); }
    public function subject()   { return $this->belongsTo(Subject::class); }
    public function classroom() { return $this->belongsTo(Classroom::class); }
    public function teacher()   { return $this->belongsTo(Teacher::class); }
}
