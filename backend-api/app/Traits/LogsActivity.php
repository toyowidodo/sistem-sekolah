<?php

namespace App\Traits;

use Spatie\Activitylog\Traits\LogsActivity as BaseLogsActivity;
use Spatie\Activitylog\LogOptions;

trait LogsActivity
{
    use BaseLogsActivity;

    /**
     * Field yang tidak boleh pernah masuk ke activity log, apa pun modelnya.
     * Tanpa ini, memasang trait di model User akan menuliskan hash password
     * ke tabel log yang bisa dibaca Superadmin.
     */
    private const NEVER_LOG = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /** Nama modul yang enak dibaca di halaman Activity Log */
    private const MODEL_LABELS = [
        'grade'              => 'nilai',
        'sppbill'            => 'tagihan SPP',
        'sppsetting'         => 'pengaturan SPP',
        'student'            => 'data siswa',
        'teacher'            => 'data guru',
        'user'               => 'akun user',
        'classroom'          => 'kelas',
        'subject'            => 'mata pelajaran',
        'schedule'           => 'jadwal',
        'payment'            => 'pembayaran',
        'studentpoint'       => 'poin kedisiplinan',
        'pointcategory'      => 'kategori poin',
        'studentenrollment'  => 'riwayat kelas siswa',
        'studentguardian'    => 'akses orang tua',
        'academicyear'       => 'tahun ajaran',
        'setting'            => 'pengaturan sistem',
        'notificationtemplate' => 'template notifikasi',
        'attendance'         => 'absensi',
        'announcement'       => 'pengumuman',
        'inventory'          => 'inventaris',
    ];

    private const EVENT_LABELS = [
        'created' => 'menambah',
        'updated' => 'mengubah',
        'deleted' => 'menghapus',
        'restored' => 'memulihkan',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        // Model boleh menambah pengecualian sendiri lewat properti $activitylogExcept
        $except = array_unique(array_merge(
            self::NEVER_LOG,
            property_exists($this, 'activitylogExcept') ? $this->activitylogExcept : []
        ));

        return LogOptions::defaults()
            ->logAll()
            ->logExcept($except)
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('system');
    }

    public function getDescriptionForEvent(string $eventName): string
    {
        $model = self::MODEL_LABELS[strtolower(class_basename($this))]
            ?? strtolower(class_basename($this));

        $event = self::EVENT_LABELS[$eventName] ?? $eventName;
        $user  = auth()->user()?->name ?? 'Sistem';

        return "{$user} {$event} {$model} #{$this->id}";
    }
}
