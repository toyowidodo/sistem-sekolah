<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Student;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $genders = ['L', 'P'];

        for ($i = 1; $i <= 10; $i++) {
            Student::create([
                'nisn' => '00' . $i . '12345',
                'name' => 'Siswa Contoh ' . $i,
                'gender' => $genders[array_rand($genders)],
                'birth_place' => 'Jakarta',
                'birth_date' => '2007-01-01',
                'address' => 'Jl. Contoh No. ' . $i,
                'parent_name' => 'Orang Tua ' . $i,
                'phone' => '0812345678' . $i,
                'is_active' => true,
            ]);
        }
    }
}