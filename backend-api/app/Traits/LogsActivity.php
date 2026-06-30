<?php

namespace App\Traits;

use Spatie\Activitylog\Traits\LogsActivity as BaseLogsActivity;
use Spatie\Activitylog\LogOptions;

trait LogsActivity
{
    use BaseLogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['*'])
            ->logOnlyDirty()
            ->useLogName('system');
    }

    public function getDescriptionForEvent(string $eventName): string
    {
        $model = strtolower(class_basename($this));
        $user = auth()->user() ? auth()->user()->name : 'System';
        
        return "{$user} has {$eventName} {$model} #{$this->id}";
    }
}