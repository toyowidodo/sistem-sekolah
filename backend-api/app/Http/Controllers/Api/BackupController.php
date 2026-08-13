<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DatabaseBackupService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Pencadangan & pemulihan database.
 *
 * Versi sebelumnya memanggil mysqldump dan mysql lewat exec(). Hosting produksi
 * memblokir exec, shell_exec, system, passthru, dan popen — jadi kedua tombol
 * ini tidak pernah benar-benar berfungsi di sana, dan kegagalannya hanya muncul
 * sebagai pesan generik "Gagal membuat backup database".
 *
 * Sekarang keduanya memakai DatabaseBackupService yang bekerja murni lewat PDO.
 */
class BackupController extends Controller
{
    public function download(DatabaseBackupService $backup)
    {
        try {
            $nama = 'backup-' . config('database.connections.mysql.database') . '-' . date('Y-m-d_H-i-s') . '.sql';
            $path = storage_path('app/private/backups/' . $nama);

            $backup->dumpTo($path);

            return response()->download($path, $nama)->deleteFileAfterSend(true);
        } catch (\Throwable $e) {
            Log::error('Backup gagal: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal membuat cadangan: ' . $e->getMessage()], 500);
        }
    }

    public function restore(Request $request, DatabaseBackupService $backup)
    {
        $request->validate([
            'backup_file' => 'required|file|mimetypes:text/plain,application/sql,application/octet-stream'
        ]);

        try {
            $file     = $request->file('backup_file');
            $nama     = time() . '_restore.sql';
            $file->storeAs('temp', $nama);
            $path     = Storage::disk('local')->path('temp/' . $nama);

            $jumlah = $backup->restoreFrom($path);

            @unlink($path);

            return response()->json([
                'message' => "Database berhasil dipulihkan ({$jumlah} pernyataan dijalankan)."
            ]);
        } catch (\Throwable $e) {
            Log::error('Restore gagal: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal memulihkan database: ' . $e->getMessage()
                    . ' Untuk berkas dari sumber lain, gunakan phpMyAdmin.'
            ], 500);
        }
    }
}
