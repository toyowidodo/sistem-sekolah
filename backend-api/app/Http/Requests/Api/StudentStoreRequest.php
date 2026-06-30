<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StudentStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'nisn' => 'required|string|unique:students,nisn,' . $this->route('student'),
            'name' => 'required|string|max:255',
            'gender' => 'required|in:L,P',
            'birth_place' => 'required|string',
            'birth_date' => 'required|date',
            'address' => 'required|string',
            'religion' => 'nullable|string',
            'previous_school' => 'nullable|string',
            'phone' => 'required|string|max:15',
            'is_active' => 'boolean',
            
            // Parent & Guardian (Optional)
            'father_name' => 'nullable|string',
            'mother_name' => 'nullable|string',
            'father_job' => 'nullable|string',
            'mother_job' => 'nullable|string',
            'parent_address_street' => 'nullable|string',
            'parent_address_village' => 'nullable|string',
            'parent_address_district' => 'nullable|string',
            'parent_address_city' => 'nullable|string',
            'parent_address_province' => 'nullable|string',
            
            'guardian_name' => 'nullable|string',
            'guardian_job' => 'nullable|string',
            'guardian_address' => 'nullable|string',
        ];
    }
}