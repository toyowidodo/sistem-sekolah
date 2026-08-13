<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * inventories.image sebelumnya menyimpan URL lengkap, mis.
     *   https://api.niswa.online/storage/inventories/abc.png
     *
     * Domain ikut terkunci ke dalam data, sehingga seluruh gambar lama akan
     * rusak begitu domain berubah — dan data produksi tidak bisa dipakai di
     * lingkungan pengembangan karena menunjuk domain produksi.
     *
     * Nilainya diubah menjadi path relatif ("inventories/abc.png"). URL-nya
     * kini dibangun saat dibaca oleh accessor di model Inventory, berdasarkan
     * APP_URL.
     */
    public function up(): void
    {
        DB::table('inventories')
            ->whereNotNull('image')
            ->where('image', '<>', '')
            ->orderBy('id')
            ->chunkById(100, function ($rows) {
                foreach ($rows as $row) {
                    $marker = '/storage/';
                    $pos = strpos($row->image, $marker);

                    // Lewati yang sudah relatif
                    if ($pos === false) {
                        continue;
                    }

                    DB::table('inventories')
                        ->where('id', $row->id)
                        ->update(['image' => substr($row->image, $pos + strlen($marker))]);
                }
            });
    }

    public function down(): void
    {
        $base = rtrim(config('app.url'), '/') . '/storage/';

        DB::table('inventories')
            ->whereNotNull('image')
            ->where('image', '<>', '')
            ->orderBy('id')
            ->chunkById(100, function ($rows) use ($base) {
                foreach ($rows as $row) {
                    // Lewati yang sudah berupa URL lengkap
                    if (str_starts_with($row->image, 'http')) {
                        continue;
                    }

                    DB::table('inventories')
                        ->where('id', $row->id)
                        ->update(['image' => $base . $row->image]);
                }
            });
    }
};
