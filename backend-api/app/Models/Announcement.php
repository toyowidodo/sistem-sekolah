<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model {
    use HasFactory;
    
    protected $fillable = [
        'user_id','title','content','category','priority','is_published','published_at','expires_at'
    ];
    
    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'expires_at'   => 'datetime',
    ];
    
    public function author() {
        return $this->belongsTo(User::class, 'user_id');
    }
}
