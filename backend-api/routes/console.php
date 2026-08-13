<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Jadwal Notifikasi
|--------------------------------------------------------------------------
|
| Baru berjalan kalau scheduler Laravel aktif:
|   * * * * * cd /path/ke/backend-api && php artisan schedule:run >> /dev/null 2>&1
|
| Selama config notification.driver masih 'log', keduanya hanya mencatat dan
| tidak mengirim ke mana pun.
|
*/

// Cadangan database setiap dini hari, saat lalu lintas paling sepi.
// Menyimpan 14 terakhir supaya kuota hosting tidak penuh.
Schedule::command('backup:database --keep=14')
    ->dailyAt('02:00')
    ->withoutOverlapping();

// Siswa alpha diberitahukan sore hari, setelah absensi harian selesai diinput
Schedule::command('notify:attendance-alpha')
    ->weekdays()
    ->dailyAt('15:00')
    ->withoutOverlapping();

// Pengingat tunggakan SPP sekali sebulan, untuk yang menunggak minimal 1 bulan
Schedule::command('notify:spp-due')
    ->monthlyOn(5, '09:00')
    ->withoutOverlapping();
