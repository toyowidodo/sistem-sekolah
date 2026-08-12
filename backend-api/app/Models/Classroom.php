<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class Classroom extends Model {
    use HasFactory, LogsActivity;
    protected $fillable = ['name','grade_level','major','homeroom_teacher_id','capacity'];
    
    public function homeroomTeacher() {
        return $this->belongsTo(Teacher::class, 'homeroom_teacher_id');
    }
    public function schedules() {
        return $this->hasMany(Schedule::class);
    }
}
