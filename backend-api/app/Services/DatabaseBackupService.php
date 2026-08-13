<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Pencadangan database tanpa mysqldump.
 *
 * Hosting produksi memblokir exec, shell_exec, system, passthru, dan popen:
 *
 *   disable_functions: system, exec, shell_exec, passthru, popen, ...
 *
 * Akibatnya seluruh jalur yang memanggil mysqldump gagal — termasuk tombol
 * Backup manual di Panel Admin, yang berarti tidak pernah berfungsi di server
 * ini. Dumper di bawah bekerja murni lewat PDO sehingga tidak bergantung pada
 * biner eksternal maupun izin menjalankan proses.
 */
class DatabaseBackupService
{
    /** Jumlah baris yang diambil per putaran, supaya tabel besar tidak memenuhi memori */
    private const CHUNK = 500;

    /**
     * Menulis dump ke berkas dan mengembalikan path absolutnya.
     */
    public function dumpTo(string $path): string
    {
        $folder = dirname($path);
        if (!is_dir($folder) && !mkdir($folder, 0775, true) && !is_dir($folder)) {
            throw new RuntimeException("Gagal membuat folder {$folder}");
        }

        $handle = fopen($path, 'w');
        if (!$handle) {
            throw new RuntimeException("Gagal menulis ke {$path}");
        }

        try {
            $nama = DB::getDatabaseName();

            fwrite($handle, "-- Cadangan {$nama}\n");
            fwrite($handle, '-- Dibuat ' . now()->toDateTimeString() . "\n");
            fwrite($handle, "-- Dihasilkan tanpa mysqldump (fungsi exec diblokir hosting)\n\n");
            fwrite($handle, "SET FOREIGN_KEY_CHECKS=0;\n");
            fwrite($handle, "SET NAMES utf8mb4;\n\n");

            foreach ($this->tables() as $tabel) {
                $this->dumpTable($handle, $tabel);
            }

            fwrite($handle, "\nSET FOREIGN_KEY_CHECKS=1;\n");
        } finally {
            fclose($handle);
        }

        if (!filesize($path)) {
            @unlink($path);
            throw new RuntimeException('Dump dihasilkan kosong.');
        }

        return $path;
    }

    /** @return string[] */
    private function tables(): array
    {
        return array_map(
            fn ($row) => array_values((array) $row)[0],
            DB::select('SHOW TABLES')
        );
    }

    private function dumpTable($handle, string $tabel): void
    {
        $create = (array) DB::selectOne("SHOW CREATE TABLE `{$tabel}`");
        $ddl    = $create['Create Table'] ?? $create['Create View'] ?? null;

        if (!$ddl) return;

        fwrite($handle, "\n-- Struktur `{$tabel}`\n");
        fwrite($handle, "DROP TABLE IF EXISTS `{$tabel}`;\n{$ddl};\n\n");

        $pdo    = DB::getPdo();
        $offset = 0;

        while (true) {
            $rows = DB::select("SELECT * FROM `{$tabel}` LIMIT " . self::CHUNK . " OFFSET {$offset}");
            if (!$rows) break;

            foreach ($rows as $row) {
                $data = (array) $row;

                $kolom = implode('`, `', array_keys($data));
                $nilai = implode(', ', array_map(
                    fn ($v) => $v === null ? 'NULL' : $pdo->quote((string) $v),
                    array_values($data)
                ));

                // Satu pernyataan per baris — memudahkan pemulihan yang memecah
                // berkas berdasarkan ";\n"
                fwrite($handle, "INSERT INTO `{$tabel}` (`{$kolom}`) VALUES ({$nilai});\n");
            }

            if (count($rows) < self::CHUNK) break;
            $offset += self::CHUNK;
        }
    }

    /**
     * Memulihkan dari berkas .sql hasil dumpTo().
     *
     * Pemisahan pernyataan mengandalkan format yang ditulis dumpTo (satu
     * pernyataan per baris, diakhiri ";"). Berkas dari mysqldump versi lain
     * bisa memuat ";" di dalam string sehingga tidak dijamin aman —
     * pemulihan seperti itu sebaiknya lewat phpMyAdmin.
     *
     * @return int jumlah pernyataan yang dijalankan
     */
    public function restoreFrom(string $path): int
    {
        if (!is_readable($path)) {
            throw new RuntimeException('Berkas cadangan tidak terbaca.');
        }

        $handle = fopen($path, 'r');
        $jalan  = 0;
        $buffer = '';

        DB::statement('SET FOREIGN_KEY_CHECKS=0');

        try {
            while (($baris = fgets($handle)) !== false) {
                $trim = trim($baris);
                if ($trim === '' || str_starts_with($trim, '--')) continue;

                $buffer .= $baris;

                if (str_ends_with($trim, ';')) {
                    DB::unprepared($buffer);
                    $buffer = '';
                    $jalan++;
                }
            }
        } finally {
            fclose($handle);
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }

        return $jalan;
    }
}
