<?php

namespace App\Imports;

use App\Models\Teacher;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class TeachersImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Abaikan baris yang tidak ada NIP
        if (!isset($row['nip']) || empty($row['nip'])) {
            return null;
        }

        // Cari berdasarkan NIP, jika ada update, jika tidak buat baru
        $teacher = Teacher::where('nip', $row['nip'])->first();

        $data = [
            'name'      => $row['name'] ?? $row['nama'] ?? 'Tanpa Nama',
            'position'  => $row['position'] ?? $row['jabatan'] ?? '-',
            'subject'   => $row['subject'] ?? $row['mata_pelajaran'] ?? '-',
            'education' => $row['education'] ?? $row['pendidikan_terakhir'] ?? '-',
            'phone'     => $row['phone'] ?? $row['no_hp'] ?? '-',
        ];

        if ($teacher) {
            $teacher->update($data);
            return null;
        }

        $data['nip'] = $row['nip'];

        return new Teacher($data);
    }
}
