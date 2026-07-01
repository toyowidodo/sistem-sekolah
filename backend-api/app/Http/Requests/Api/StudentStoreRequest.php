<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StudentStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Only authenticated users with manage-students permission can create/edit students
        return auth()->check() && auth()->user()->hasPermissionTo('manage-students');
    }

    public function rules(): array
    {
        return [
            'classroom_id' => 'required|exists:classrooms,id',
            'nisn' => 'required|string|unique:students,nisn,' . $this->route('student'),
            'name' => 'required|string|max:255',
            'gender' => 'required|in:L,P',
            'birth_place' => 'required|string|max:255',
            'birth_date' => 'required|date|before:today',
            'address' => 'required|string|max:500',
            'religion' => 'nullable|string|max:50',
            'previous_school' => 'nullable|string|max:255',
            'phone' => 'required|string|max:15|regex:/^[0-9+\-\s()]*$/',
            'is_active' => 'boolean',
            
            // Parent & Guardian (Optional)
            'father_name' => 'nullable|string|max:255',
            'mother_name' => 'nullable|string|max:255',
            'father_job' => 'nullable|string|max:255',
            'mother_job' => 'nullable|string|max:255',
            'parent_address_street' => 'nullable|string|max:255',
            'parent_address_village' => 'nullable|string|max:255',
            'parent_address_district' => 'nullable|string|max:255',
            'parent_address_city' => 'nullable|string|max:255',
            'parent_address_province' => 'nullable|string|max:255',
            
            'guardian_name' => 'nullable|string|max:255',
            'guardian_job' => 'nullable|string|max:255',
            'guardian_address' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'nisn.required' => 'NISN wajib diisi',
            'nisn.unique' => 'NISN sudah terdaftar',
            'name.required' => 'Nama siswa wajib diisi',
            'classroom_id.required' => 'Kelas wajib dipilih',
            'birth_date.before' => 'Tanggal lahir tidak boleh di masa depan',
            'phone.regex' => 'Format nomor telepon tidak valid',
        ];
    }
}
