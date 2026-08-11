<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class NotifyAttendanceAlpha extends Command
{
    protected $signature = 'notify:attendance-alpha
                            {--date= : Tanggal absensi (Y-m-d), default hari ini}
                            {--dry-run : Tampilkan calon penerima tanpa mengirim}';

    protected $description = 'Mengirim notifikasi ke orang tua untuk siswa yang alpha pada tanggal tertentu';

    public function handle(NotificationService $notifier): int
    {
        $date = $this->option('date') ?: today()->toDateString();

        $records = Attendance::with(['student.guardians'])
            ->whereDate('date', $date)
            ->where('status', 'alpha')
            ->get();

        if ($records->isEmpty()) {
            $this->info("Tidak ada siswa alpha pada {$date}.");
            return self::SUCCESS;
        }

        $this->info("Ditemukan {$records->count()} siswa alpha pada {$date}.");

        $sent = 0;
        $skipped = 0;

        foreach ($records as $record) {
            $student = $record->student;
            if (!$student) continue;

            $guardians = $student->guardians;

            if ($guardians->isEmpty()) {
                $this->warn("  - {$student->name}: belum ada akun orang tua, dilewati.");
                $skipped++;
                continue;
            }

            foreach ($guardians as $guardian) {
                $phone = $guardian->pivot->phone;

                if ($this->option('dry-run')) {
                    $this->line("  [dry-run] {$student->name} -> {$guardian->name} ({$phone})");
                    continue;
                }

                $log = $notifier->sendTemplate('siswa_alpha', $phone, [
                    'nama_siswa'    => $student->name,
                    'nama_ortu'     => $guardian->name,
                    'kelas'         => $student->classroom?->name ?? '-',
                    'tanggal'       => \Carbon\Carbon::parse($date)->translatedFormat('l, d F Y'),
                    'nama_sekolah'  => \App\Models\Setting::where('key', 'school_name')->value('value') ?? 'Sekolah',
                ], [
                    'student_id'     => $student->id,
                    'recipient_name' => $guardian->name,
                ]);

                if (!$log) {
                    $this->error('  Template "siswa_alpha" tidak ada atau nonaktif. Dihentikan.');
                    return self::FAILURE;
                }

                $log->status === 'terkirim' ? $sent++ : $skipped++;
            }
        }

        if ($this->option('dry-run')) {
            $this->info('Dry-run selesai, tidak ada yang dikirim.');
            return self::SUCCESS;
        }

        $this->info("Selesai. Terkirim: {$sent}, tidak terkirim/dilewati: {$skipped}.");
        $this->comment('Driver aktif: ' . config('notification.driver'));

        return self::SUCCESS;
    }
}
