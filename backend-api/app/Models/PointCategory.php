<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PointCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'type', 'point_value'];
}
