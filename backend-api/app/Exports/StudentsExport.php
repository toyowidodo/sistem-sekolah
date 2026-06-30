<?php

namespace App\Exports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class StudentsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Student::all();
    }

    public function map($student): array
    {
        return [
            $student->nisn,
            $student->name,
            $student->gender == 'L' ? 'Laki-laki' : 'Perempuan',
            $student->birth_place . ', ' . $student->birth_date->format('d-m-Y'),
            $student->phone,
            $student->is_active ? 'Aktif' : 'Nonaktif',
        ];
    }

    public function headings(): array
    {
        return [
            'NISN',
            'Nama Lengkap',
            'Jenis Kelamin',
            'Tempat, Tanggal Lahir',
            'No HP',
            'Status',
        ];
    }
}