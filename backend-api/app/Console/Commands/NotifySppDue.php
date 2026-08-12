<?php

namespace App\Console\Commands;

use App\Models\SppBill;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class NotifySppDue extends Command
{
    protected $signature = 'notify:spp-due
                            {--min-months=1 : Minimal jumlah tagihan belum lunas}
                            {--dry-run : Tampilkan calon penerima tanpa mengirim}';

    protected $description = 'Mengirim pengingat tagihan SPP yang belum lunas ke orang tua';

    public function handle(NotificationService $notifier): int
    {
        $minMonths = max(1, (int) $this->option('min-months'));

        $bills = SppBill::with(['student.guardians', 'student.classroom'])
            ->where('status', 'belum')
            ->get()
            ->groupBy('student_id');

        $targets = $bills->filter(fn ($group) => $group->count() >= $minMonths);

        if ($targets->isEmpty()) {
            $this->info("Tidak ada siswa dengan minimal {$minMonths} tagihan belum lunas.");
            return self::SUCCESS;
        }

        $this->info("Ditemukan {$targets->count()} siswa dengan tunggakan.");

        $sent = 0;
        $skipped = 0;

        foreach ($targets as $group) {
            $student = $group->first()->student;
            if (!$student) continue;

            $guardians = $student->guardians;

            if ($guardians->isEmpty()) {
                $this->warn("  - {$student->name}: belum ada akun orang tua, dilewati.");
                $skipped++;
                continue;
            }

            $total = $group->sum('amount');

            foreach ($guardians as $guardian) {
                $phone = $guardian->pivot->phone;

                if ($this->option('dry-run')) {
                    $this->line("  [dry-run] {$student->name} ({$group->count()} bulan, Rp " .
                        number_format($total, 0, ',', '.') . ") -> {$guardian->name} ({$phone})");
                    continue;
                }

                $log = $notifier->sendTemplate('spp_jatuh_tempo', $phone, [
                    'nama_siswa'   => $student->name,
                    'nama_ortu'    => $guardian->name,
                    'kelas'        => $student->classroom?->name ?? '-',
                    'jumlah_bulan' => $group->count(),
                    'total'        => 'Rp ' . number_format($total, 0, ',', '.'),
                    'nama_sekolah' => \App\Models\Setting::where('key', 'school_name')->value('value') ?? 'Sekolah',
                ], [
                    'student_id'     => $student->id,
                    'recipient_name' => $guardian->name,
                ]);

                if (!$log) {
                    $this->error('  Template "spp_jatuh_tempo" tidak ada atau nonaktif. Dihentikan.');
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
