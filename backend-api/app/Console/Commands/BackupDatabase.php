<?php

namespace App\Console\Commands;

use App\Services\DatabaseBackupService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class BackupDatabase extends Command
{
    protected $signature = 'backup:database
                            {--keep=14 : Jumlah cadangan terbaru yang disimpan}
                            {--path= : Folder tujuan, default storage/app/private/backups}';

    protected $description = 'Mencadangkan database ke berkas .sql, menyimpan sejumlah cadangan terbaru saja';

    public function handle(DatabaseBackupService $backup): int
    {
        $dir  = $this->option('path') ?: storage_path('app/private/backups');
        $file = $dir . DIRECTORY_SEPARATOR . 'db-' . date('Y-m-d_H-i-s') . '.sql';

        try {
            $backup->dumpTo($file);
        } catch (\Throwable $e) {
            $this->error('Pencadangan gagal: ' . $e->getMessage());
            Log::error('backup:database gagal', ['pesan' => $e->getMessage()]);
            return self::FAILURE;
        }

        $kb = round(filesize($file) / 1024, 1);
        $this->info('Cadangan dibuat: ' . basename($file) . " ({$kb} KB)");

        $dihapus = $this->rotate($dir, max(1, (int) $this->option('keep')));
        if ($dihapus) {
            $this->line("Cadangan lama dihapus: {$dihapus}");
        }

        Log::info('backup:database berhasil', ['file' => basename($file), 'kb' => $kb]);

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
