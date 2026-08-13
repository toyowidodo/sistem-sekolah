<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class BackupDatabase extends Command
{
    protected $signature = 'backup:database
                            {--keep=14 : Jumlah cadangan terbaru yang disimpan}
                            {--path= : Folder tujuan, default storage/app/private/backups}';

    protected $description = 'Mencadangkan database ke berkas .sql, menyimpan sejumlah cadangan terbaru saja';

    /** Mencari mysqldump; hosting Windows dan Linux menaruhnya di tempat berbeda */
    private function findMysqldump(): ?string
    {
        if (PHP_OS_FAMILY !== 'Windows') {
            $path = trim((string) shell_exec('which mysqldump'));
            return ($path && file_exists($path)) ? $path : null;
        }

        foreach ([
            'C:\\xampp\\mysql\\bin\\mysqldump.exe',
            'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
        ] as $c) {
            if (file_exists($c)) return $c;
        }

        return null;
    }

    public function handle(): int
    {
        if (config('database.default') !== 'mysql') {
            $this->warn('Koneksi aktif bukan MySQL, pencadangan dilewati.');
            return self::SUCCESS;
        }

        $dump = $this->findMysqldump();
        if (!$dump) {
            $this->error('mysqldump tidak ditemukan. Pencadangan otomatis tidak bisa berjalan.');
            Log::error('backup:database gagal — mysqldump tidak ditemukan');
            return self::FAILURE;
        }

        $dir = $this->option('path') ?: storage_path('app/private/backups');
        if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
            $this->error("Gagal membuat folder {$dir}");
            return self::FAILURE;
        }

        $db   = config('database.connections.mysql.database');
        $user = config('database.connections.mysql.username');
        $pass = config('database.connections.mysql.password');
        $host = config('database.connections.mysql.host');
        $port = config('database.connections.mysql.port');

        $file = $dir . DIRECTORY_SEPARATOR . 'db-' . date('Y-m-d_H-i-s') . '.sql';

        $passFlag = $pass !== '' && $pass !== null ? '-p"' . addslashes($pass) . '"' : '';
        $cmd = sprintf(
            '"%s" -h %s -P %s -u "%s" %s "%s" > "%s" 2>&1',
            $dump, $host, $port, $user, $passFlag, $db, $file
        );

        exec($cmd, $out, $code);

        // File nol byte berarti dump gagal walau exit code-nya 0 — jangan
        // sampai cadangan kosong ikut terhitung dan menggeser yang masih baik
        if ($code !== 0 || !file_exists($file) || filesize($file) === 0) {
            @unlink($file);
            $this->error('Pencadangan gagal. Periksa laravel.log untuk detail.');
            Log::error('backup:database gagal', ['exit' => $code, 'output' => $out]);
            return self::FAILURE;
        }

        $size = round(filesize($file) / 1024, 1);
        $this->info("Cadangan dibuat: " . basename($file) . " ({$size} KB)");

        $dihapus = $this->rotate($dir, max(1, (int) $this->option('keep')));
        if ($dihapus) {
            $this->line("Cadangan lama dihapus: {$dihapus}");
        }

        Log::info('backup:database berhasil', ['file' => basename($file), 'kb' => $size]);

        return self::SUCCESS;
    }

    /** Menyisakan sejumlah cadangan terbaru, sisanya dihapus */
    private function rotate(string $dir, int $keep): int
    {
        $files = glob($dir . DIRECTORY_SEPARATOR . 'db-*.sql') ?: [];
        if (count($files) <= $keep) return 0;

        usort($files, fn ($a, $b) => filemtime($b) <=> filemtime($a));

        $lama = array_slice($files, $keep);
        foreach ($lama as $f) {
            @unlink($f);
        }

        return count($lama);
    }
}
