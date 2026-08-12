<?php

namespace App\Console\Commands;

use App\Models\Classroom;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Database\Seeders\DemoDataSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DemoClear extends Command
{
    protected $signature = 'demo:clear {--force : Lewati konfirmasi}';

    protected $description = 'Menghapus seluruh data contoh yang dibuat DemoDataSeeder';

    public function handle(): int
    {
        $classrooms = Classroom::where('name', 'like', DemoDataSeeder::DEMO_CLASS_PREFIX . '%')->get();
        $teachers   = Teacher::where('nip', 'like', DemoDataSeeder::DEMO_NIP_PREFIX . '%')->get();
        $users      = User::where('email', 'like', '%' . DemoDataSeeder::DEMO_EMAIL_DOMAIN)->get();

        $affectedStudents = Student::whereIn('classroom_id', $classrooms->pluck('id'))->count();

        if ($classrooms->isEmpty() && $teachers->isEmpty() && $users->isEmpty()) {
            $this->info('Tidak ada data contoh yang ditemukan.');
            return self::SUCCESS;
        }

        $this->warn('Yang akan dihapus:');
        $this->line('  Kelas contoh   : ' . $classrooms->count());
        $this->line('  Guru contoh    : ' . $teachers->count());
        $this->line('  Akun contoh    : ' . $users->count());
        $this->newLine();
        $this->warn("Ikut terhapus karena kelasnya dihapus: jadwal dan NILAI di {$classrooms->count()} kelas contoh.");
        $this->line("Data siswa TIDAK dihapus — {$affectedStudents} siswa hanya dikembalikan ke status tanpa kelas.");
        $this->line('Absensi yang dibuat seeder TIDAK ikut terhapus (tidak terikat ke kelas).');
        $this->newLine();

        if (!$this->option('force') && !$this->confirm('Lanjutkan?', false)) {
            $this->info('Dibatalkan.');
            return self::SUCCESS;
        }

        DB::transaction(function () use ($classrooms, $teachers, $users) {
            // students.classroom_id memakai nullOnDelete, jadi siswa otomatis
            // lepas dari kelas tanpa ikut terhapus. Jadwal & nilai memakai
            // cascade, jadi ikut bersih bersama kelasnya.
            Classroom::whereIn('id', $classrooms->pluck('id'))->delete();

            Teacher::whereIn('id', $teachers->pluck('id'))->delete();

            // Menghapus akun tidak menghapus data siswa/guru — foreign key-nya
            // sudah ON DELETE SET NULL sejak perbaikan bug cascade.
            User::whereIn('id', $users->pluck('id'))->delete();
        });

        $this->newLine();
        $this->info('Data contoh dihapus.');

        return self::SUCCESS;
    }
}
