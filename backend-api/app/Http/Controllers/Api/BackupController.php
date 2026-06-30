<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BackupController extends Controller
{
    /**
     * Mendapatkan path mysqldump/mysql secara dinamis berdasarkan OS.
     */
    private function findBinary(string $name): ?string
    {
        // Linux/Mac: gunakan 'which'
        if (PHP_OS_FAMILY !== 'Windows') {
            $path = trim(shell_exec("which {$name}"));
            return (!empty($path) && file_exists($path)) ? $path : null;
        }

        // Windows: coba beberapa lokasi umum
        $candidates = [
            "C:\\xampp\\mysql\\bin\\{$name}.exe",
            "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\{$name}.exe",
            "C:\\Program Files\\MySQL\\MySQL Server 5.7\\bin\\{$name}.exe",
        ];

        foreach ($candidates as $candidate) {
            if (file_exists($candidate)) {
                return $candidate;
            }
        }

        return null;
    }

    public function download()
    {
        try {
            $dbHost = config('database.connections.mysql.host', '127.0.0.1');
            $dbPort = config('database.connections.mysql.port', '3306');
            $dbUser = config('database.connections.mysql.username', 'root');
            $dbPass = config('database.connections.mysql.password', '');
            $dbName = config('database.connections.mysql.database', 'db_sekolah');

            $mysqldump = $this->findBinary('mysqldump');

            if (!$mysqldump) {
                return response()->json([
                    'message' => 'Utility mysqldump tidak ditemukan. Pastikan MySQL sudah terinstall dan dapat diakses dari PATH.'
                ], 500);
            }

            $filename    = 'backup-' . $dbName . '-' . date('Y-m-d_H-i-s') . '.sql';
            $storagePath = storage_path('app/' . $filename);

            // Pastikan direktori ada
            if (!is_dir(storage_path('app'))) {
                mkdir(storage_path('app'), 0775, true);
            }

            $passwordFlag = !empty($dbPass) ? "-p\"" . addslashes($dbPass) . "\"" : '';
            $command      = "\"$mysqldump\" -h $dbHost -P $dbPort -u \"$dbUser\" $passwordFlag \"$dbName\" > \"$storagePath\" 2>&1";

            exec($command, $output, $returnVar);

            if ($returnVar !== 0 || !file_exists($storagePath) || filesize($storagePath) === 0) {
                Log::error('Backup failed', ['output' => $output, 'return_var' => $returnVar]);
                return response()->json(['message' => 'Gagal membuat backup database. Periksa log untuk detail.'], 500);
            }

            return response()->download($storagePath)->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            Log::error('Backup error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()], 500);
        }
    }

    public function restore(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|file|mimetypes:text/plain,application/sql,application/octet-stream'
        ]);

        try {
            $dbHost = config('database.connections.mysql.host', '127.0.0.1');
            $dbPort = config('database.connections.mysql.port', '3306');
            $dbUser = config('database.connections.mysql.username', 'root');
            $dbPass = config('database.connections.mysql.password', '');
            $dbName = config('database.connections.mysql.database', 'db_sekolah');

            $mysql = $this->findBinary('mysql');

            if (!$mysql) {
                return response()->json([
                    'message' => 'Utility mysql tidak ditemukan. Pastikan MySQL sudah terinstall dan dapat diakses dari PATH.'
                ], 500);
            }

            $file        = $request->file('backup_file');
            $filename    = time() . '_restore.sql';
            $file->storeAs('temp', $filename);
            $storagePath = storage_path('app/temp/' . $filename);

            $passwordFlag = !empty($dbPass) ? "-p\"" . addslashes($dbPass) . "\"" : '';
            $command      = "\"$mysql\" -h $dbHost -P $dbPort -u \"$dbUser\" $passwordFlag \"$dbName\" < \"$storagePath\" 2>&1";

            exec($command, $output, $returnVar);

            @unlink($storagePath);

            if ($returnVar !== 0) {
                Log::error('Restore failed', ['output' => $output, 'return_var' => $returnVar]);
                return response()->json(['message' => 'Gagal me-restore database. Periksa log untuk detail.'], 500);
            }

            return response()->json(['message' => 'Database berhasil di-restore.']);

        } catch (\Exception $e) {
            Log::error('Restore error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()], 500);
        }
    }
}
