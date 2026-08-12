<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class NotificationTemplate extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = ['key', 'name', 'body', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    /** Mengganti {placeholder} dengan nilai dari $data */
    public function render(array $data): string
    {
        $body = $this->body;

        foreach ($data as $key => $value) {
            $body = str_replace('{' . $key . '}', (string) $value, $body);
        }

        return $body;
    }
}
