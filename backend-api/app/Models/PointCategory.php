<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class PointCategory extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = ['name', 'type', 'point_value'];
}
