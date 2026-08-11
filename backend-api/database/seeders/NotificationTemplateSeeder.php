<?php

namespace Database\Seeders;

use App\Models\NotificationTemplate;
use Illuminate\Database\Seeder;

class NotificationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'key'  => 'siswa_alpha',
                'name' => 'Siswa Tidak Hadir (Alpha)',
                'body' => "Yth. Bapak/Ibu {nama_ortu},\n\n" .
                          "Kami informasikan bahwa ananda *{nama_siswa}* (kelas {kelas}) " .
                          "tercatat *tidak hadir tanpa keterangan* pada {tanggal}.\n\n" .
                          "Mohon konfirmasinya kepada pihak sekolah.\n\n" .
                          "Hormat kami,\n{nama_sekolah}",
            ],
            [
                'key'  => 'spp_jatuh_tempo',
                'name' => 'Pengingat Tagihan SPP',
                'body' => "Yth. Bapak/Ibu {nama_ortu},\n\n" .
                          "Kami informasikan bahwa ananda *{nama_siswa}* (kelas {kelas}) " .
                          "memiliki tunggakan SPP sebanyak *{jumlah_bulan} bulan* " .
                          "dengan total *{total}*.\n\n" .
                          "Mohon dapat diselesaikan melalui bagian keuangan sekolah. " .
                          "Abaikan pesan ini apabila pembayaran sudah dilakukan.\n\n" .
                          "Hormat kami,\n{nama_sekolah}",
            ],
        ];

        foreach ($templates as $t) {
            NotificationTemplate::updateOrCreate(
                ['key' => $t['key']],
                ['name' => $t['name'], 'body' => $t['body'], 'is_active' => true]
            );
        }
    }
}
