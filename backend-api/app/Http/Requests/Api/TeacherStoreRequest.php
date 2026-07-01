<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class TeacherStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasPermissionTo('manage-teachers');
    }

    public function rules(): array
    {
        return [
            'nip' => 'required|string|unique:teachers,nip,' . $this->route('teacher'),
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'education' => 'required|string|max:255',
            'phone' => 'required|string|max:15|regex:/^[0-9+\-\s()]*$/',
        ];
    }

    public function messages(): array
    {
        return [
            'nip.required' => 'NIP wajib diisi',
            'nip.unique' => 'NIP sudah terdaftar',
            'name.required' => 'Nama guru wajib diisi',
            'position.required' => 'Jabatan wajib diisi',
            'subject.required' => 'Mata pelajaran wajib diisi',
            'education.required' => 'Pendidikan terakhir wajib diisi',
            'phone.required' => 'Nomor telepon wajib diisi',
            'phone.regex' => 'Format nomor telepon tidak valid',
        ];
    }
}
