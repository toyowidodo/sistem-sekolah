<?php

namespace App\Imports;

use App\Models\Classroom;
use App\Models\Student;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class StudentsImport implements ToModel, WithHeadingRow, SkipsEmptyRows
{
    /** Nama kelas (huruf kecil, tanpa spasi tepi) => id */
    private ?array $classroomMap = null;

    /** Nama kelas di berkas yang tidak dikenali, untuk dilaporkan ke pengguna */
    public array $unknownClassrooms = [];

    public int $placed = 0;

    /**
     * Memuat daftar kelas sekali saja. Tanpa ini, berkas berisi ratusan baris
     * akan memicu satu query per baris.
     */
    private function classroomId(?string $name): ?int
    {
        if ($this->classroomMap === null) {
            $this->classroomMap = Classroom::pluck('id', 'name')
                ->mapWithKeys(fn ($id, $n) => [mb_strtolower(trim($n)) => $id])
                ->all();
        }

        $key = mb_strtolower(trim((string) $name));
        if ($key === '') {
            return null;
        }

        if (!isset($this->classroomMap[$key])) {
            // Cukup catat sekali per nama, bukan per baris
            $this->unknownClassrooms[$key] = trim((string) $name);
            return null;
        }

        $this->placed++;

        return $this->classroomMap[$key];
    }

    public function model(array $row)
    {
        // Pengecekan jika baris kosong atau nisn kosong, abaikan
        if (!isset($row['nisn']) || empty($row['nisn'])) {
            return null;
        }

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

        // Kolom kelas opsional. Kalau kosong atau namanya tidak dikenali, siswa
        // tetap masuk tanpa kelas — jangan sampai satu sel salah ketik
        // menggagalkan seluruh impor.
        $classroomId = $this->classroomId($row['kelas'] ?? $row['classroom'] ?? null);
        if ($classroomId !== null) {
            $data['classroom_id'] = $classroomId;
        }

        // Cari berdasarkan NISN, jika ada update, jika tidak create
        $student = Student::where('nisn', $row['nisn'])->first();

        if ($student) {
            $student->update($data);
            return null; // Return null agar ToModel tidak membuat instance baru
        }

        $data['nisn'] = $row['nisn'];

        return new Student($data);
    }
}
