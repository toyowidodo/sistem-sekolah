<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Grade;
use App\Models\Schedule;
use App\Models\SppSetting;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\StudentGuardian;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

/**
 * Data contoh untuk mencoba fitur kelas, portal guru, dan portal orang tua.
 *
 * SEMUA data yang dibuat di sini diberi penanda supaya bisa dihapus bersih:
 *   - akun     : email berakhiran @demo.local
 *   - guru     : NIP diawali DEMO-
 *   - kelas    : nama diawali [D]
 *
 * Hapus semuanya dengan:  php artisan demo:clear
 *
 * Seeder ini idempoten — dijalankan berulang kali tidak menggandakan data.
 * Siswa yang sudah punya kelas TIDAK diubah, jadi penempatan manual Anda aman.
 */
class DemoDataSeeder extends Seeder
{
    public const DEMO_EMAIL_DOMAIN = '@demo.local';
    public const DEMO_NIP_PREFIX   = 'DEMO-';
    public const DEMO_CLASS_PREFIX = '[D] ';

    /** Password seragam supaya mudah dicoba. Hanya untuk data contoh. */
    public const DEMO_PASSWORD = 'demo1234';

    public function run(): void
    {
        DB::transaction(function () {
            $year = AcademicYear::where('is_active', true)->value('name')
                ?? AcademicYear::orderByDesc('id')->value('name')
                ?? '2025/2026';

            $subjects   = $this->seedSubjects();
            $classrooms = $this->seedClassrooms();
            $teachers   = $this->seedTeachers($classrooms);
            $this->seedSchedules($classrooms, $subjects, $teachers);
            $placed = $this->placeStudents($classrooms, $year);
            $this->seedSppSettings($year);
            $guardians = $this->seedGuardians();
            $this->seedGrades($subjects, $year);
            $this->seedAttendance();

            $this->report($classrooms, $teachers, $placed, $guardians);
        });
    }

    private function seedSubjects(): array
    {
        $data = [
            ['code' => 'MTK', 'name' => 'Matematika',        'hours_per_week' => 4],
            ['code' => 'BIN', 'name' => 'Bahasa Indonesia',  'hours_per_week' => 4],
            ['code' => 'BIG', 'name' => 'Bahasa Inggris',    'hours_per_week' => 3],
            ['code' => 'IPA', 'name' => 'Ilmu Pengetahuan Alam',   'hours_per_week' => 3],
            ['code' => 'IPS', 'name' => 'Ilmu Pengetahuan Sosial', 'hours_per_week' => 3],
            ['code' => 'PAI', 'name' => 'Pendidikan Agama Islam',  'hours_per_week' => 2],
            ['code' => 'PKN', 'name' => 'Pendidikan Kewarganegaraan', 'hours_per_week' => 2],
            ['code' => 'PJK', 'name' => 'Pendidikan Jasmani',      'hours_per_week' => 2],
        ];

        $out = [];
        foreach ($data as $d) {
            // Mapel yang sudah ada dipakai ulang, tidak ditimpa
            $out[] = Subject::firstOrCreate(['code' => $d['code']], $d);
        }

        return $out;
    }

    private function seedClassrooms(): array
    {
        $data = [
            ['name' => 'X IPA 1',   'grade_level' => 'X',   'major' => 'IPA'],
            ['name' => 'X IPS 1',   'grade_level' => 'X',   'major' => 'IPS'],
            ['name' => 'XI IPA 1',  'grade_level' => 'XI',  'major' => 'IPA'],
            ['name' => 'XI IPS 1',  'grade_level' => 'XI',  'major' => 'IPS'],
            ['name' => 'XII IPA 1', 'grade_level' => 'XII', 'major' => 'IPA'],
            ['name' => 'XII IPS 1', 'grade_level' => 'XII', 'major' => 'IPS'],
        ];

        $out = [];
        foreach ($data as $d) {
            $d['name'] = self::DEMO_CLASS_PREFIX . $d['name'];
            $out[] = Classroom::firstOrCreate(
                ['name' => $d['name']],
                $d + ['capacity' => 30]
            );
        }

        return $out;
    }

    /** Satu guru per kelas, sekaligus jadi wali kelasnya */
    private function seedTeachers(array $classrooms): array
    {
        $data = [
            ['name' => 'Budi Santoso',    'subject' => 'Matematika',       'education' => 'S1 Pendidikan Matematika'],
            ['name' => 'Siti Aminah',     'subject' => 'Bahasa Indonesia', 'education' => 'S1 Sastra Indonesia'],
            ['name' => 'Ahmad Fauzi',     'subject' => 'Bahasa Inggris',   'education' => 'S1 Sastra Inggris'],
            ['name' => 'Dewi Lestari',    'subject' => 'IPA',              'education' => 'S1 Pendidikan Biologi'],
            ['name' => 'Rahmat Hidayat',  'subject' => 'IPS',              'education' => 'S1 Pendidikan Sejarah'],
            ['name' => 'Nur Halimah',     'subject' => 'PAI',              'education' => 'S1 Pendidikan Agama Islam'],
        ];

        $guruRole = Role::firstOrCreate(['name' => 'Guru', 'guard_name' => 'web']);
        $out = [];

        foreach ($data as $i => $d) {
            $nip   = self::DEMO_NIP_PREFIX . str_pad($i + 1, 3, '0', STR_PAD_LEFT);
            $email = 'guru' . ($i + 1) . self::DEMO_EMAIL_DOMAIN;

            $user = User::firstOrCreate(
                ['email' => $email],
                ['name' => $d['name'], 'password' => self::DEMO_PASSWORD]
            );
            if (!$user->hasRole('Guru')) {
                $user->assignRole($guruRole);
            }

            $teacher = Teacher::firstOrCreate(
                ['nip' => $nip],
                [
                    'user_id'   => $user->id,
                    'email'     => $email,
                    'name'      => $d['name'],
                    'position'  => 'Guru ' . $d['subject'],
                    'subject'   => $d['subject'],
                    'education' => $d['education'],
                    'phone'     => '08' . str_pad((string) rand(1000000000, 9999999999), 10, '0'),
                ]
            );

            // Jadikan wali kelas — inilah yang mengaktifkan menu Kelas Perwalian
            if (isset($classrooms[$i]) && !$classrooms[$i]->homeroom_teacher_id) {
                $classrooms[$i]->update(['homeroom_teacher_id' => $teacher->id]);
            }

            $out[] = $teacher;
        }

        return $out;
    }

    /**
     * Jadwal inilah yang menentukan guru mengampu mapel apa di kelas mana —
     * dasar pembatasan akses di App\Services\TeachingScope.
     */
    private function seedSchedules(array $classrooms, array $subjects, array $teachers): void
    {
        $days  = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
        $slots = [['07:00', '08:30'], ['08:30', '10:00'], ['10:15', '11:45']];

        // Tiap guru memegang satu mapel (sesuai kolom subject-nya), dan tiap kelas
        // hanya mendapat sebagian mapel. Dengan begitu seorang guru mengampu
        // sebagian kelas saja — supaya pembatasan akses per kelas benar-benar
        // terlihat, bukan semua guru bisa ke semua kelas.
        $subjectsPerClass = 4;

        foreach ($classrooms as $ci => $classroom) {
            // Mapel kelas ini: jendela bergeser mengikuti indeks kelas
            $classSubjects = [];
            for ($k = 0; $k < $subjectsPerClass; $k++) {
                $classSubjects[] = ($ci + $k) % count($teachers);
            }

            foreach ($days as $di => $day) {
                foreach ($slots as $si => $slot) {
                    $pick    = $classSubjects[($di + $si) % $subjectsPerClass];
                    $subject = $subjects[$pick];
                    $teacher = $teachers[$pick];

                    Schedule::firstOrCreate(
                        [
                            'classroom_id' => $classroom->id,
                            'day'          => $day,
                            'start_time'   => $slot[0],
                        ],
                        [
                            'subject_id' => $subject->id,
                            'teacher_id' => $teacher->id,
                            'end_time'   => $slot[1],
                            'room'       => 'R-' . ($ci + 1) . str_pad((string) ($si + 1), 2, '0', STR_PAD_LEFT),
                        ]
                    );
                }
            }
        }
    }

    /** Menempatkan siswa yang BELUM punya kelas, bergiliran ke kelas contoh */
    private function placeStudents(array $classrooms, string $year): int
    {
        $students = Student::whereNull('classroom_id')->where('is_active', true)->orderBy('name')->get();
        $placed = 0;

        foreach ($students as $i => $student) {
            $classroom = $classrooms[$i % count($classrooms)];

            $student->update(['classroom_id' => $classroom->id]);

            // Riwayat kelas per tahun ajaran, jadi dasar fitur kenaikan kelas
            StudentEnrollment::updateOrCreate(
                ['student_id' => $student->id, 'academic_year' => $year],
                ['classroom_id' => $classroom->id, 'status' => 'aktif']
            );

            $placed++;
        }

        return $placed;
    }

    private function seedSppSettings(string $year): void
    {
        $amounts = ['X' => 350000, 'XI' => 375000, 'XII' => 400000];

        foreach ($amounts as $level => $amount) {
            SppSetting::updateOrCreate(
                ['grade_level' => $level, 'academic_year' => $year],
                ['amount' => $amount, 'notes' => 'Data contoh']
            );
        }
    }

    /** Akun orang tua untuk 6 siswa pertama, supaya portal ortu bisa dicoba */
    private function seedGuardians(): int
    {
        $students = Student::whereNotNull('classroom_id')->orderBy('name')->take(6)->get();
        $role = Role::firstOrCreate(['name' => 'Orang Tua', 'guard_name' => 'web']);
        $count = 0;

        foreach ($students as $i => $student) {
            $email = 'ortu' . ($i + 1) . self::DEMO_EMAIL_DOMAIN;

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name'     => $student->father_name ?: 'Orang Tua ' . $student->name,
                    'password' => self::DEMO_PASSWORD,
                ]
            );
            if (!$user->hasRole('Orang Tua')) {
                $user->assignRole($role);
            }

            StudentGuardian::firstOrCreate(
                ['user_id' => $user->id, 'student_id' => $student->id],
                ['relation' => 'ayah', 'phone' => '08' . str_pad((string) rand(1000000000, 9999999999), 10, '0')]
            );

            $count++;
        }

        return $count;
    }

    /** Nilai untuk semua siswa berkelas, supaya rapor & dashboard ada isinya */
    private function seedGrades(array $subjects, string $year): void
    {
        $students = Student::whereNotNull('classroom_id')->get();

        foreach ($students as $student) {
            // Ambil 4 mapel saja supaya tidak terlalu banyak baris
            foreach (array_slice($subjects, 0, 4) as $subject) {
                $tugas = rand(70, 95);
                $uts   = rand(65, 95);
                $uas   = rand(65, 95);
                $final = Grade::computeFinal($tugas, $uts, $uas);

                Grade::updateOrCreate(
                    [
                        'student_id'    => $student->id,
                        'subject_id'    => $subject->id,
                        'classroom_id'  => $student->classroom_id,
                        'academic_year' => $year,
                        'semester'      => 1,
                    ],
                    [
                        'score_tugas'  => $tugas,
                        'score_uts'    => $uts,
                        'score_uas'    => $uas,
                        'final_score'  => $final,
                        'grade_letter' => Grade::letterGrade($final),
                    ]
                );
            }
        }
    }

    /** Absensi 5 hari kerja terakhir, dengan sedikit alpha agar notifikasi ada isinya */
    private function seedAttendance(): void
    {
        $students = Student::whereNotNull('classroom_id')->get();
        $dates = [];
        $cursor = now();

        while (count($dates) < 5) {
            if (!$cursor->isWeekend()) {
                $dates[] = $cursor->copy()->toDateString();
            }
            $cursor->subDay();
        }

        foreach ($dates as $date) {
            foreach ($students as $i => $student) {
                // Sebagian kecil dibuat tidak hadir supaya datanya tidak seragam
                $roll = ($i + crc32($date)) % 20;
                $status = match (true) {
                    $roll === 0 => 'alpha',
                    $roll === 1 => 'sakit',
                    $roll === 2 => 'izin',
                    default     => 'hadir',
                };

                Attendance::updateOrCreate(
                    ['student_id' => $student->id, 'date' => $date],
                    ['status' => $status]
                );
            }
        }
    }

    private function report(array $classrooms, array $teachers, int $placed, int $guardians): void
    {
        $c = $this->command;
        if (!$c) return;

        $c->newLine();
        $c->info('Data contoh berhasil dibuat.');
        $c->line('  Kelas          : ' . count($classrooms));
        $c->line('  Guru + akun    : ' . count($teachers));
        $c->line('  Siswa ditempatkan: ' . $placed);
        $c->line('  Akun orang tua : ' . $guardians);
        $c->newLine();

        $c->warn('Kredensial data contoh (password sama untuk semua):');
        $c->line('  Guru      : guru1' . self::DEMO_EMAIL_DOMAIN . ' ... guru6' . self::DEMO_EMAIL_DOMAIN);
        $c->line('  Orang tua : ortu1' . self::DEMO_EMAIL_DOMAIN . ' ... ortu6' . self::DEMO_EMAIL_DOMAIN);
        $c->line('  Password  : ' . self::DEMO_PASSWORD);
        $c->newLine();
        $c->warn('Password ini lemah dan sengaja seragam. Jangan dipakai di lingkungan produksi.');
        $c->line('Hapus seluruh data contoh dengan: php artisan demo:clear');
    }
}
