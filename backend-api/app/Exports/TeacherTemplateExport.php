<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TeacherTemplateExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles
{
    public function array(): array
    {
        return [
            [
                '198501012010011001',
                'Budi Santoso, S.Pd',
                'Guru Matematika',
                'Matematika',
                'S1 Pendidikan Matematika',
                '081234567890',
            ],
            [
                '197803152005012002',
                'Siti Rahayu, M.Pd',
                'Wali Kelas',
                'Bahasa Indonesia',
                'S2 Pendidikan Bahasa',
                '089876543210',
            ],
        ];
    }

    public function headings(): array
    {
        return [
            'nip',
            'nama',
            'jabatan',
            'mata_pelajaran',
            'pendidikan_terakhir',
            'no_hp',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
