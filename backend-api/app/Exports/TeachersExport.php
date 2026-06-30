<?php

namespace App\Exports;

use App\Models\Teacher;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class TeachersExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    public function collection()
    {
        return Teacher::all();
    }

    public function map($teacher): array
    {
        return [
            $teacher->nip,
            $teacher->name,
            $teacher->position,
            $teacher->subject,
            $teacher->education,
            $teacher->phone,
        ];
    }

    public function headings(): array
    {
        return [
            'NIP',
            'Nama Lengkap',
            'Jabatan',
            'Mata Pelajaran',
            'Pendidikan Terakhir',
            'No HP',
        ];
    }
}
