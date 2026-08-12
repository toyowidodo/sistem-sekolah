<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class SppSetting extends Model {
    use HasFactory, LogsActivity;
    protected $fillable = ['grade_level', 'amount', 'academic_year', 'notes'];
    protected $casts = ['amount' => 'float'];
}
