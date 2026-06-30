<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mail extends Model
{
    protected $fillable = [
        'type', 'reference_number', 'entity', 'subject', 
        'date', 'received_date', 'file_path', 'disposition'
    ];
}
