<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Setting;
use App\Models\Student;
use App\Models\StudentEnrollment;
use Illuminate\Database\Seeder;

class AcademicYearSeeder extends Seeder
{
    /**
     * Membuat tahun ajaran awal dari nilai yang sudah ada di settings, lalu
     * mencatatkan siswa yang sudah punya kelas ke tahun ajaran tersebut.
     *
     * Tanpa langkah ini, siswa lama tidak punya riwayat sama sekali sehingga
     * proses kenaikan kelas pertama tidak tahu kelas asalnya.
     */
    public function run(): void
    {
        $name = Setting::where('key', 'active_academic_year')->value('value')
            ?: date('Y') . '/' . ((int) date('Y') + 1);

        $semester = Setting::where('key', 'active_semester')->value('value') ?: 'Ganjil';

        $year = AcademicYear::firstOrCreate(
            ['name' => $name],
            ['semester' => in_array($semester, ['Ganjil', 'Genap']) ? $semester : 'Ganjil']
        );

        if (!AcademicYear::where('is_active', true)->exists()) {
            $year->update(['is_active' => true]);
        }

        if (Classroom::count() === 0) {
            $this->command?->warn('Belum ada data kelas, pencatatan riwayat siswa dilewati.');
            return;
        }

        $backfilled = 0;

        Student::whereNotNull('classroom_id')->chunkById(200, function ($students) use ($year, &$backfilled) {
            foreach ($students as $student) {
                $enrollment = StudentEnrollment::firstOrCreate(
                    ['student_id' => $student->id, 'academic_year' => $year->name],
                    ['classroom_id' => $student->classroom_id, 'status' => 'aktif']
                );

                if ($enrollment->wasRecentlyCreated) {
                    $backfilled++;
                }
            }
        });

        $this->command?->info("Tahun ajaran aktif: {$year->name} ({$year->semester}). Riwayat siswa dibuat: {$backfilled}.");
    }
}
