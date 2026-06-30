<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nisn' => $this->nisn,
            'name' => $this->name,
            'gender' => $this->gender,
            'religion' => $this->religion,
            'previous_school' => $this->previous_school,
            'birth_place' => $this->birth_place,
            'birth_date' => $this->birth_date ? $this->birth_date->format('Y-m-d') : null,
            'address' => $this->address,
            'phone' => $this->phone,
            'photo' => $this->photo,
            'is_active' => $this->is_active,
            
            'father_name' => $this->father_name,
            'mother_name' => $this->mother_name,
            'father_job' => $this->father_job,
            'mother_job' => $this->mother_job,
            'parent_address_street' => $this->parent_address_street,
            'parent_address_village' => $this->parent_address_village,
            'parent_address_district' => $this->parent_address_district,
            'parent_address_city' => $this->parent_address_city,
            'parent_address_province' => $this->parent_address_province,
            
            'guardian_name' => $this->guardian_name,
            'guardian_job' => $this->guardian_job,
            'guardian_address' => $this->guardian_address,

            'created_at' => $this->created_at ? $this->created_at->format('d-m-Y H:i') : null,
        ];
    }
}