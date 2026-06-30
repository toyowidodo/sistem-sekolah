<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model {
    use HasFactory;
    protected $fillable = ['code','name','description','hours_per_week'];
    
    public function schedules() {
        return $this->hasMany(Schedule::class);
    }
}
