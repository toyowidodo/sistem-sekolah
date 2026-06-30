<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nip' => $this->nip,
            'name' => $this->name,
            'position' => $this->position,
            'subject' => $this->subject,
            'education' => $this->education,
            'phone' => $this->phone,
            'photo' => $this->photo,
            'created_at' => $this->created_at->format('d-m-Y H:i'),
        ];
    }
}