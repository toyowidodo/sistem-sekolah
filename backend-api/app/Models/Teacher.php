<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class Teacher extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'nip', 'name', 'position', 'subject', 'education', 'phone', 'photo'
    ];
}