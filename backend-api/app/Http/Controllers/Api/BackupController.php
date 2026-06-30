<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BackupController extends Controller
{
    public function download()
    {
        try {
            $dbHost = env('DB_HOST', '127.0.0.1');
            $dbPort = env('DB_PORT', '3306');
            $dbUser = env('DB_USERNAME', 'root');
            $dbPass = env('DB_PASSWORD', '');
            $dbName = env('DB_DATABASE', 'db_sekolah');

            $filename = 'backup-' . $dbName . '-' . date('Y-m-d_H-i-s') . '.sql';
            $storagePath = storage_path('app/' . $filename);

            // Path to mysqldump on XAMPP
            $mysqldumpPath = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
            
            if (!file_exists($mysqldumpPath)) {
                return response()->json(['message' => 'Utility mysqldump tidak ditemukan di C:\\xampp\\mysql\\bin\\mysqldump.exe'], 500);
            }

            $passwordFlag = $dbPass ? "-p\"$dbPass\"" : '';

            // Run command
            $command = "\"$mysqldumpPath\" -h $dbHost -P $dbPort -u $dbUser $passwordFlag $dbName > \"$storagePath\"";
            
            exec($command, $output, $returnVar);

            if ($returnVar !== 0) {
                Log::error("Backup failed: " . implode("\n", $output));
                return response()->json(['message' => 'Gagal membuat backup database.'], 500);
            }

            return response()->download($storagePath)->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            Log::error("Backup error: " . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()], 500);
        }
    }

    public function restore(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|file|mimetypes:text/plain,application/sql,application/octet-stream'
        ]);

        try {
            $file = $request->file('backup_file');
            $filename = time() . '_restore.sql';
            $file->storeAs('temp', $filename);
            $storagePath = storage_path('app/temp/' . $filename);

            $dbHost = env('DB_HOST', '127.0.0.1');
            $dbPort = env('DB_PORT', '3306');
            $dbUser = env('DB_USERNAME', 'root');
            $dbPass = env('DB_PASSWORD', '');
            $dbName = env('DB_DATABASE', 'db_sekolah');

            // Path to mysql on XAMPP
            $mysqlPath = 'C:\\xampp\\mysql\\bin\\mysql.exe';
            
            if (!file_exists($mysqlPath)) {
                @unlink($storagePath);
                return response()->json(['message' => 'Utility mysql tidak ditemukan di C:\\xampp\\mysql\\bin\\mysql.exe'], 500);
            }

            $passwordFlag = $dbPass ? "-p\"$dbPass\"" : '';

            // Run command
            $command = "\"$mysqlPath\" -h $dbHost -P $dbPort -u $dbUser $passwordFlag $dbName < \"$storagePath\"";
            
            exec($command, $output, $returnVar);

            @unlink($storagePath);

            if ($returnVar !== 0) {
                Log::error("Restore failed: " . implode("\n", $output));
                return response()->json(['message' => 'Gagal me-restore database.'], 500);
            }

            return response()->json(['message' => 'Database berhasil di-restore.']);

        } catch (\Exception $e) {
            Log::error("Restore error: " . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()], 500);
        }
    }
}
