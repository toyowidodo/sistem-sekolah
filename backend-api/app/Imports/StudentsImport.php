<?php

namespace App\Imports;

use App\Models\Student;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StudentsImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        // Pengecekan jika baris kosong atau nisn kosong, abaikan
        if (!isset($row['nisn']) || empty($row['nisn'])) {
            return null;
        }

        // Cari berdasarkan NISN, jika ada update, jika tidak create
        $student = Student::where('nisn', $row['nisn'])->first();

        $data = [
            'name' => $row['name'] ?? $row['nama'] ?? 'Tanpa Nama',
            'gender' => isset($row['gender']) ? strtoupper(substr($row['gender'], 0, 1)) : (isset($row['jenis_kelamin']) ? strtoupper(substr($row['jenis_kelamin'], 0, 1)) : 'L'),
            'birth_place' => $row['birth_place'] ?? $row['tempat_lahir'] ?? '-',
            'birth_date' => $row['birth_date'] ?? $row['tanggal_lahir'] ?? date('Y-m-d'),
            'phone' => $row['phone'] ?? $row['no_hp'] ?? '-',
            'address' => $row['address'] ?? $row['alamat'] ?? '-',
            'religion' => $row['religion'] ?? $row['agama'] ?? null,
            'previous_school' => $row['previous_school'] ?? $row['asal_sekolah'] ?? null,
        ];

        if ($student) {
            $student->update($data);
            return null; // Return null agar ToModel tidak membuat instance baru
        }

        $data['nisn'] = $row['nisn'];
        
        return new Student($data);
    }
}
