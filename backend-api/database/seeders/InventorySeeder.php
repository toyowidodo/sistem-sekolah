<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\InventoryLoan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Data contoh modul Inventaris — 10 aset beserta riwayat peminjamannya.
 *
 * Isinya bukan sekadar sepuluh baris acak. Tiap baris dipilih untuk menyalakan
 * satu jalur yang berbeda, supaya seluruh fitur modul benar-benar teruji
 * saling terhubung, bukan cuma terlihat penuh:
 *
 *   - kelima kategori dan ketiga kondisi terwakili, jadi filter kategori,
 *     ringkasan "Kondisi Baik" dan "Rusak" punya isi
 *   - beberapa lokasi berbeda, supaya filter lokasi ada yang disaring
 *   - jumlah bervariasi (1 sampai 40), sehingga "Total Item" dan "Total Nilai
 *     Aset" tidak sekadar menghitung jumlah baris
 *   - ada aset yang seluruh unitnya sedang dipinjam, agar tombol "Pinjamkan"
 *     pada hasil pindaian benar-benar tersembunyi dan bukan hanya diasumsikan
 *   - ada aset rusak berat, jalur penolakan peminjaman yang lain
 *   - satu aset sengaja dikosongkan lokasi, harga, dan tanggal belinya untuk
 *     menguji tampilan "—" pada dialog hasil pindaian. Ini realistis: barang
 *     yang dicatat buru-buru memang sering belum lengkap
 *   - peminjaman dibuat dalam dua status, agar hitungan unit tersedia terbukti
 *     hanya memotong yang berstatus dipinjam
 *
 * Kode aset mengikuti format yang sudah dipakai sekolah:
 * SD.<lokasi>.<singkatan barang>.<urut>.<tahun>
 *
 * Seeder ini TIDAK menghapus aset lain. Ia hanya mengurus sepuluh kode di
 * bawah, dicocokkan lewat item_code, sehingga inventaris asli yang sudah
 * dicatat sekolah tetap utuh berdampingan dengan data contoh ini.
 *
 * Idempoten — dijalankan berulang kali tidak menggandakan apa pun. Peminjaman
 * yang dibuat di sini disusun ulang setiap kali agar hitungan unit tersedia
 * selalu sesuai daftar, tetapi peminjaman aset lain tidak disentuh.
 *
 * Jalankan dengan:
 *
 *   php artisan db:seed --class=InventorySeeder
 */
class InventorySeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $aset = collect($this->daftarAset())->mapWithKeys(
                fn ($data, $kunci) => [$kunci => Inventory::updateOrCreate(
                    ['item_code' => $data['item_code']],
                    $data
                )]
            );

            // Hanya peminjaman milik sepuluh aset ini yang dibersihkan.
            // Menghapus seluruh tabel akan ikut membuang riwayat peminjaman
            // aset lain yang bukan urusan seeder ini.
            InventoryLoan::whereIn('inventory_id', $aset->pluck('id'))->delete();

            foreach ($this->daftarPeminjaman() as $pinjam) {
                InventoryLoan::create([
                    'inventory_id'  => $aset[$pinjam['aset']]->id,
                    'borrower_name' => $pinjam['peminjam'],
                    'loan_date'     => $pinjam['tanggal_pinjam'],
                    'return_date'   => $pinjam['tanggal_kembali'] ?? null,
                    'status'        => $pinjam['status'],
                    'notes'         => $pinjam['catatan'] ?? null,
                ]);
            }

            $this->laporkan($aset);
        });
    }

    private function daftarAset(): array
    {
        return [
            // Seluruh 2 unitnya dipinjam — unit tersedia jadi 0.
            'proyektor' => [
                'item_code'     => 'SD.1A.PR.0001.26',
                'name'          => 'Proyektor Epson EB-X06',
                'category'      => 'elektronik',
                'quantity'      => 2,
                'condition'     => 'baik',
                'location'      => 'Ruang Kelas 1A',
                'purchase_date' => '2025-03-14',
                'price'         => 4750000,
                'notes'         => 'Termasuk kabel HDMI dan remote.',
            ],
            // Sebagian dipinjam, sebagian sudah kembali — hitungan tersedia
            // harus 4 - 2 = 2, bukan 4 - 3.
            'laptop' => [
                'item_code'     => 'SD.KANTOR.LP.0002.26',
                'name'          => 'Laptop Acer Aspire 5',
                'category'      => 'elektronik',
                'quantity'      => 4,
                'condition'     => 'baik',
                'location'      => 'Ruang Kantor',
                'purchase_date' => '2024-08-20',
                'price'         => 7200000,
                'notes'         => 'Dipakai bergantian untuk administrasi dan ANBK.',
            ],
            'meja_baca' => [
                'item_code'     => 'SD.PERPUS.MJ.0003.26',
                'name'          => 'Meja Baca Perpustakaan',
                'category'      => 'furnitur',
                'quantity'      => 12,
                'condition'     => 'baik',
                'location'      => 'Perpustakaan',
                'purchase_date' => '2023-01-10',
                'price'         => 850000,
            ],
            // Kondisi rusak ringan — jalur penolakan peminjaman.
            'kursi' => [
                'item_code'     => 'SD.2B.KR.0004.26',
                'name'          => 'Kursi Lipat Chitose',
                'category'      => 'furnitur',
                'quantity'      => 40,
                'condition'     => 'rusak_ringan',
                'location'      => 'Ruang Kelas 2B',
                'purchase_date' => '2022-07-05',
                'price'         => 275000,
                'notes'         => 'Beberapa engsel longgar, masih bisa dipakai.',
            ],
            'buku_mtk' => [
                'item_code'     => 'SD.PERPUS.BK.0005.26',
                'name'          => 'Buku Paket Matematika Kelas 4',
                'category'      => 'buku',
                'quantity'      => 35,
                'condition'     => 'baik',
                'location'      => 'Perpustakaan',
                'purchase_date' => '2025-06-01',
                'price'         => 95000,
            ],
            // Rusak berat — tidak boleh dipinjamkan sama sekali.
            'printer' => [
                'item_code'     => 'SD.KANTOR.PN.0006.26',
                'name'          => 'Printer Epson L3210',
                'category'      => 'elektronik',
                'quantity'      => 1,
                'condition'     => 'rusak_berat',
                'location'      => 'Ruang Kantor',
                'purchase_date' => '2021-11-12',
                'price'         => 2850000,
                'notes'         => 'Head buntu, menunggu keputusan perbaikan atau penghapusan.',
            ],
            'spidol' => [
                'item_code'     => 'SD.GUDANG.AT.0007.26',
                'name'          => 'Spidol Whiteboard (kotak isi 12)',
                'category'      => 'alat_tulis',
                'quantity'      => 24,
                'condition'     => 'baik',
                'location'      => 'Gudang ATK',
                'purchase_date' => '2026-01-15',
                'price'         => 96000,
            ],
            'sound' => [
                'item_code'     => 'SD.AULA.SS.0008.26',
                'name'          => 'Sound System Aula',
                'category'      => 'elektronik',
                'quantity'      => 1,
                'condition'     => 'baik',
                'location'      => 'Aula',
                'purchase_date' => '2024-02-28',
                'price'         => 6500000,
            ],
            'tandu' => [
                'item_code'     => 'SD.UKS.TD.0009.26',
                'name'          => 'Tandu Lipat UKS',
                'category'      => 'lainnya',
                'quantity'      => 2,
                'condition'     => 'baik',
                'location'      => 'Ruang UKS',
                'purchase_date' => '2023-09-09',
                'price'         => 1150000,
            ],
            // Sengaja tanpa lokasi, harga, dan tanggal beli — menguji tampilan
            // "—" pada dialog hasil pindaian.
            'lemari' => [
                'item_code'     => 'SD.GUDANG.LM.0010.26',
                'name'          => 'Lemari Arsip Besi',
                'category'      => 'furnitur',
                'quantity'      => 3,
                'condition'     => 'baik',
                'location'      => null,
                'purchase_date' => null,
                'price'         => null,
                'notes'         => 'Data pembelian belum ditemukan, menunggu arsip bendahara.',
            ],
        ];
    }

    private function daftarPeminjaman(): array
    {
        return [
            // Proyektor: 2 unit, dua-duanya sedang keluar → tersedia 0.
            ['aset' => 'proyektor', 'peminjam' => 'Bu Siti Aminah', 'tanggal_pinjam' => '2026-08-10',
             'status' => 'dipinjam', 'catatan' => 'Untuk pembelajaran tematik kelas 1A.'],
            ['aset' => 'proyektor', 'peminjam' => 'Pak Hendra Gunawan', 'tanggal_pinjam' => '2026-08-12',
             'status' => 'dipinjam', 'catatan' => 'Rapat komite.'],

            // Laptop: 4 unit, 2 keluar dan 1 sudah kembali → tersedia 2.
            ['aset' => 'laptop', 'peminjam' => 'Pak Ahmad Fauzi', 'tanggal_pinjam' => '2026-08-05',
             'status' => 'dipinjam', 'catatan' => 'Persiapan ANBK.'],
            ['aset' => 'laptop', 'peminjam' => 'Bu Ratna Dewi', 'tanggal_pinjam' => '2026-08-11',
             'status' => 'dipinjam'],
            ['aset' => 'laptop', 'peminjam' => 'Pak Yusuf Maulana', 'tanggal_pinjam' => '2026-07-20',
             'tanggal_kembali' => '2026-07-28', 'status' => 'dikembalikan',
             'catatan' => 'Dikembalikan lengkap dengan tas dan charger.'],

            // Buku: 5 dari 35 dipinjam → tersedia 30.
            ['aset' => 'buku_mtk', 'peminjam' => 'Bu Lestari Ningsih', 'tanggal_pinjam' => '2026-08-01',
             'status' => 'dipinjam', 'catatan' => 'Dipakai kelas 4B selama satu semester.'],
            ['aset' => 'buku_mtk', 'peminjam' => 'Bu Lestari Ningsih', 'tanggal_pinjam' => '2026-08-01',
             'status' => 'dipinjam'],
            ['aset' => 'buku_mtk', 'peminjam' => 'Bu Lestari Ningsih', 'tanggal_pinjam' => '2026-08-01',
             'status' => 'dipinjam'],
            ['aset' => 'buku_mtk', 'peminjam' => 'Pak Rizal Effendi', 'tanggal_pinjam' => '2026-08-03',
             'status' => 'dipinjam'],
            ['aset' => 'buku_mtk', 'peminjam' => 'Pak Rizal Effendi', 'tanggal_pinjam' => '2026-08-03',
             'status' => 'dipinjam'],

            // Riwayat yang sudah selesai, supaya tab Peminjaman punya isi pada
            // filter "dikembalikan" dan bukan cuma daftar yang masih berjalan.
            ['aset' => 'sound', 'peminjam' => 'Panitia Wisuda 2026', 'tanggal_pinjam' => '2026-06-14',
             'tanggal_kembali' => '2026-06-15', 'status' => 'dikembalikan'],
            ['aset' => 'tandu', 'peminjam' => 'Tim UKS', 'tanggal_pinjam' => '2026-05-02',
             'tanggal_kembali' => '2026-05-02', 'status' => 'dikembalikan',
             'catatan' => 'Dipakai saat lomba olahraga antar kelas.'],
        ];
    }

    private function laporkan($aset): void
    {
        $this->command?->info(sprintf(
            '%d aset contoh siap. Total inventaris sekarang %d aset.',
            $aset->count(), Inventory::count()
        ));

        foreach ($aset as $a) {
            $dipinjam = $a->loans()->where('status', 'dipinjam')->count();
            $this->command?->line(sprintf(
                '  %-22s %-34s %2d unit, %d dipinjam, %d tersedia',
                $a->item_code, $a->name, $a->quantity, $dipinjam, max(0, $a->quantity - $dipinjam)
            ));
        }
    }
}
