<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class TeacherStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nip' => 'required|string|unique:teachers,nip,' . $this->route('teacher'),
            'name' => 'required|string|max:255',
            'position' => 'required|string',
            'subject' => 'required|string',
            'education' => 'required|string',
            'phone' => 'required|string|max:15',
            'email' => 'nullable|email|unique:teachers,email,' . $this->route('teacher'),
        ];
    }
}