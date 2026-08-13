<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StudentTemplateExport implements FromArray, WithHeadings, ShouldAutoSize, WithStyles
{
    public function array(): array
    {
        return [
            [
                '1001001001',
                'Ahmad Budi',
                'L',
                'Jakarta',
                '2010-05-15',
                '081234567890',
                'Jl. Merdeka No. 1',
                'Islam',
                'TK Tunas Bangsa',
                '1A',
            ],
            [
                '1001001002',
                'Siti Aminah',
                'P',
                'Bandung',
                '2011-08-20',
                '089876543210',
                'Jl. Pahlawan No. 2',
                'Islam',
                'TK Harapan',
                '1B',
            ]
        ];
    }

    public function headings(): array
    {
        return [
            'nisn',
            'nama',
            'jenis_kelamin',
            'tempat_lahir',
            'tanggal_lahir',
            'no_hp',
            'alamat',
            'agama',
            'asal_sekolah',
            // Diisi nama kelas persis seperti di menu Akademik -> Kelas.
            // Boleh dikosongkan; siswa bisa ditempatkan belakangan lewat
            // tombol "Tetapkan Kelas" di halaman Data Siswa.
            'kelas',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text.
            1 => ['font' => ['bold' => true]],
        ];
    }
}
