<?php

namespace Database\Seeders;

use App\Models\AcademicEvent;
use App\Models\AcademicYear;
use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\Classroom;
use App\Models\Grade;
use App\Models\PointCategory;
use App\Models\Schedule;
use App\Models\SppBill;
use App\Models\SppSetting;
use App\Models\Student;
use App\Models\StudentEnrollment;
use App\Models\StudentGuardian;
use App\Models\StudentPoint;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

/**
 * Data kelengkapan untuk menjalankan aplikasi dari nol.
 *
 * Sepuluh baris untuk tiap entitas inti — guru, kelas, mata pelajaran, siswa,
 * dan orang tua — beserta seluruh data turunan yang membuat modul lain hidup:
 * jadwal, nilai, absensi, tagihan SPP, kalender pendidikan, pengumuman, dan
 * poin siswa.
 *
 * Angkanya sengaja saling mengunci supaya keterhubungan antarmodul benar-benar
 * terbukti, bukan sekadar tiap tabel terisi:
 *
 *   - tiap kelas punya wali kelas dari sepuluh guru, jadi relasi wali terisi
 *     penuh dan tidak ada kelas tanpa penanggung jawab
 *   - tiap siswa masuk ke satu kelas lewat students.classroom_id DAN lewat
 *     student_enrollments, karena modul yang berbeda membaca dari keduanya
 *   - jadwal dirakit dari kombinasi kelas x mapel x guru yang benar-benar ada,
 *     sehingga portal guru punya isi saat dibuka
 *   - nilai memakai guru yang memang mengajar mapel itu, bukan guru acak
 *   - tagihan SPP mengambil tarif dari spp_settings sesuai tingkat kelas, jadi
 *     jumlahnya konsisten dengan pengaturan, bukan angka lepas
 *   - absensi mencakup keempat status, agar rekap kehadiran tidak seragam
 *
 * YANG DIHAPUS: seluruh data akademik lama beserta akun guru, siswa, dan orang
 * tua. YANG DIPERTAHANKAN: akun staf (Superadmin, Admin Sekolah, Bendahara,
 * Tata Usaha), role, hak akses, pengaturan sekolah, dan inventaris.
 *
 * Jalankan dengan:
 *
 *   php artisan db:seed --class=SampleDataSeeder
 */
class SampleDataSeeder extends Seeder
{
    /**
     * Kata sandi seragam untuk seluruh akun contoh. Sengaja satu nilai supaya
     * mudah dicoba, dan sengaja tidak dipakai untuk akun staf mana pun.
     * Ganti sebelum sekolah memakai aplikasi ini sungguhan.
     */
    public const PASSWORD = 'sekolah123';

    /** Role yang pemiliknya TIDAK boleh ikut terhapus. */
    private const ROLE_STAF = ['Superadmin', 'Admin Sekolah', 'Bendahara', 'Tata Usaha'];

    private string $tahunAjaran = '2026/2027';

    public function run(): void
    {
        DB::transaction(function () {
            $this->bersihkan();

            $tahun  = $this->seedTahunAjaran();
            $mapel  = $this->seedMapel();
            $guru   = $this->seedGuru();
            $kelas  = $this->seedKelas($guru);
            $siswa  = $this->seedSiswa($kelas);

            $this->seedWali($siswa);
            $this->seedJadwal($kelas, $mapel, $guru);
            $this->seedNilai($siswa, $mapel, $guru);
            $this->seedAbsensi($siswa);
            $this->seedSpp($siswa);
            $this->seedKalender();
            $this->seedPengumuman();
            $this->seedPoin($siswa);

            $this->laporkan();
        });
    }

    /* ────────────────────────────── pembersihan ────────────────────────────── */

    private function bersihkan(): void
    {
        // Akun yang akan ikut terhapus dikumpulkan lebih dulu, selagi tabel
        // penghubungnya masih ada. Setelah students dan teachers dihapus, jejak
        // ke user-nya hilang dan akun akan menggantung tanpa pemilik.
        $idAkun = collect()
            ->merge(Teacher::pluck('user_id'))
            ->merge(Student::pluck('user_id'))
            ->merge(StudentGuardian::pluck('user_id'))
            ->merge(User::whereHas('roles', fn ($q) => $q->whereIn('name', ['Guru', 'Siswa', 'Orang Tua']))->pluck('id'))
            ->filter()
            ->unique();

        // Urutan mengikuti arah foreign key: yang menunjuk dihapus sebelum yang
        // ditunjuk. Tidak bersandar pada cascade, supaya maksudnya terbaca dan
        // tidak berubah kalau definisi tabel diubah.
        Attendance::query()->delete();
        Grade::query()->delete();
        SppBill::query()->delete();
        StudentPoint::query()->delete();
        Schedule::query()->delete();
        StudentGuardian::query()->delete();
        StudentEnrollment::query()->delete();
        DB::table('payments')->delete();

        Student::query()->delete();
        Classroom::query()->delete();   // setelah siswa: students.classroom_id
        Teacher::query()->delete();     // setelah kelas: classrooms.homeroom_teacher_id
        Subject::query()->delete();
        PointCategory::query()->delete();
        SppSetting::query()->delete();

        Announcement::query()->delete();
        AcademicEvent::query()->delete();

        // Akun staf disaring lagi di sini. Kalau seorang admin kebetulan juga
        // tercatat sebagai guru, akunnya tetap harus selamat — kehilangan akun
        // admin berarti kehilangan akses ke aplikasi.
        $staf = User::whereHas('roles', fn ($q) => $q->whereIn('name', self::ROLE_STAF))->pluck('id');

        User::whereIn('id', $idAkun->diff($staf))->delete();
    }

    /* ──────────────────────────────── master ──────────────────────────────── */

    private function seedTahunAjaran(): AcademicYear
    {
        AcademicYear::query()->update(['is_active' => false]);

        return AcademicYear::updateOrCreate(
            ['name' => $this->tahunAjaran],
            ['start_date' => '2026-07-13', 'end_date' => '2027-06-25',
             'semester' => 'Ganjil', 'is_active' => true]
        );
    }

    /** @return array<string,Subject> */
    private function seedMapel(): array
    {
        $data = [
            ['code' => 'PAI',   'name' => 'Pendidikan Agama Islam',      'hours_per_week' => 4],
            ['code' => 'PKN',   'name' => 'Pendidikan Pancasila',        'hours_per_week' => 3],
            ['code' => 'BIN',   'name' => 'Bahasa Indonesia',            'hours_per_week' => 6],
            ['code' => 'MTK',   'name' => 'Matematika',                  'hours_per_week' => 6],
            ['code' => 'IPAS',  'name' => 'Ilmu Pengetahuan Alam dan Sosial', 'hours_per_week' => 5],
            ['code' => 'SBDP',  'name' => 'Seni Budaya dan Prakarya',    'hours_per_week' => 3],
            ['code' => 'PJOK',  'name' => 'Pendidikan Jasmani dan Kesehatan', 'hours_per_week' => 3],
            ['code' => 'BING',  'name' => 'Bahasa Inggris',              'hours_per_week' => 2],
            ['code' => 'BTQ',   'name' => 'Baca Tulis Al-Quran',         'hours_per_week' => 2],
            ['code' => 'MULOK', 'name' => 'Muatan Lokal',                'hours_per_week' => 2],
        ];

        $out = [];
        foreach ($data as $d) {
            $out[$d['code']] = Subject::create($d + ['description' => 'Mata pelajaran ' . $d['name'] . '.']);
        }

        return $out;
    }

    /** @return array<int,Teacher> berindeks 0..9 */
    private function seedGuru(): array
    {
        $role = $this->role('Guru');

        $data = [
            ['Siti Aminah, S.Pd.',       'Guru Kelas',    'BIN',   'S1 PGSD'],
            ['Hendra Gunawan, S.Pd.',    'Guru Kelas',    'MTK',   'S1 PGSD'],
            ['Ratna Dewi, S.Pd.I.',      'Guru Mapel',    'PAI',   'S1 PAI'],
            ['Ahmad Fauzi, S.Pd.',       'Guru Mapel',    'PJOK',  'S1 Penjaskes'],
            ['Lestari Ningsih, S.Pd.',   'Guru Kelas',    'IPAS',  'S1 PGSD'],
            ['Rizal Effendi, S.Pd.',     'Guru Kelas',    'PKN',   'S1 PPKn'],
            ['Yusuf Maulana, S.Kom.',    'Guru Mapel',    'MULOK', 'S1 Ilmu Komputer'],
            ['Dewi Anggraini, S.Pd.',    'Guru Mapel',    'BING',  'S1 Sastra Inggris'],
            ['Bambang Sutrisno, S.Pd.',  'Wakil Kepala',  'MTK',   'S2 Manajemen Pendidikan'],
            ['Nur Halimah, S.Pd.',       'Guru Mapel',    'SBDP',  'S1 Seni Rupa'],
        ];

        $out = [];
        foreach ($data as $i => [$nama, $jabatan, $mapel, $pendidikan]) {
            $urut  = $i + 1;
            $email = 'guru' . $urut . '@sekolah.id';

            $user = User::create([
                'name'      => $nama,
                'email'     => $email,
                'password'  => Hash::make(self::PASSWORD),
                'is_active' => true,
            ]);
            $user->assignRole($role);

            $out[$i] = Teacher::create([
                'user_id'   => $user->id,
                'nip'       => sprintf('19850%03d20100%02d', $urut * 7, $urut),
                'email'     => $email,
                'name'      => $nama,
                'position'  => $jabatan,
                'subject'   => $mapel,
                'education' => $pendidikan,
                'phone'     => '08123456' . str_pad((string) $urut, 4, '0', STR_PAD_LEFT),
            ]);
        }

        return $out;
    }

    /** @return array<int,Classroom> berindeks 0..9 */
    private function seedKelas(array $guru): array
    {
        $data = [
            ['1A', 1], ['1B', 1], ['2A', 2], ['2B', 2], ['3A', 3],
            ['3B', 3], ['4A', 4], ['4B', 4], ['5A', 5], ['6A', 6],
        ];

        $out = [];
        foreach ($data as $i => [$nama, $tingkat]) {
            // Satu guru satu kelas — sepuluh guru untuk sepuluh kelas, jadi
            // tidak ada wali kelas yang merangkap dan tidak ada yang kosong.
            $out[$i] = Classroom::create([
                'name'                => $nama,
                'grade_level'         => $tingkat,
                'major'               => null,
                'homeroom_teacher_id' => $guru[$i]->id,
                'capacity'            => 28,
            ]);
        }

        return $out;
    }

    /** @return array<int,Student> berindeks 0..9 */
    private function seedSiswa(array $kelas): array
    {
        // Akun siswa TIDAK dibuat di sini. Model Student punya hook `created`
        // yang otomatis membuatkan user <nisn>@siswa.com dengan kata sandi
        // NISN, lalu menautkannya sendiri. Membuat akun tandingan di seeder
        // berarti melawan konvensi aplikasi: akun buatan hook jadi menggantung
        // tanpa pemilik begitu user_id ditimpa.
        $data = [
            ['Adinda Putri Maharani',  'P', '2018-04-12', 'Palembang', 'Bapak Sudirman',     'Ibu Kartini',      'Wiraswasta',  'Ibu Rumah Tangga'],
            ['Bagas Prasetyo',         'L', '2018-09-03', 'Palembang', 'Bapak Joko Susilo',  'Ibu Wulandari',    'Petani',      'Pedagang'],
            ['Citra Ayu Lestari',      'P', '2017-01-25', 'Prabumulih','Bapak Hasanuddin',   'Ibu Marlina',      'Guru',        'Ibu Rumah Tangga'],
            ['Dimas Aditya Nugroho',   'L', '2017-06-18', 'Palembang', 'Bapak Suryanto',     'Ibu Rahmawati',    'Karyawan Swasta', 'Perawat'],
            ['Elsa Ramadhani',         'P', '2016-03-07', 'Palembang', 'Bapak Iskandar',     'Ibu Nurhayati',    'PNS',         'Ibu Rumah Tangga'],
            ['Farhan Alfarizi',        'L', '2016-11-30', 'Baturaja',  'Bapak Zulkifli',     'Ibu Siti Aisyah',  'Sopir',       'Penjahit'],
            ['Gita Salsabila',         'P', '2015-08-14', 'Palembang', 'Bapak Munandar',     'Ibu Yuliana',      'Pedagang',    'Ibu Rumah Tangga'],
            ['Hafiz Ramadhan',         'L', '2015-02-21', 'Palembang', 'Bapak Syaiful Anwar','Ibu Nurjanah',     'Nelayan',     'Ibu Rumah Tangga'],
            ['Intan Permata Sari',     'P', '2014-07-09', 'Lahat',     'Bapak Rustam Efendi','Ibu Herlina',      'Wiraswasta',  'Guru'],
            ['Joko Firmansyah',        'L', '2013-12-02', 'Palembang', 'Bapak Darmawan',     'Ibu Sumiati',      'Buruh',       'Ibu Rumah Tangga'],
        ];

        $out = [];
        foreach ($data as $i => [$nama, $jk, $lahir, $kota, $ayah, $ibu, $kerjaAyah, $kerjaIbu]) {
            $urut = $i + 1;
            $nisn = sprintf('00%08d', 3120000 + $urut);

            $siswa = Student::create([
                'nisn'            => $nisn,
                'name'            => $nama,
                'gender'          => $jk,
                'religion'        => 'Islam',
                'previous_school' => $i < 4 ? 'TK Aisyiyah Bustanul Athfal' : 'SD Negeri 12 Palembang',
                'classroom_id'    => $kelas[$i]->id,
                'birth_place'     => $kota,
                'birth_date'      => $lahir,
                'address'         => 'Jl. Melati No. ' . ($urut * 3) . ', Palembang',
                'phone'           => '08217654' . str_pad((string) $urut, 4, '0', STR_PAD_LEFT),
                'is_active'       => true,
                'father_name'     => $ayah,
                'mother_name'     => $ibu,
                'father_job'      => $kerjaAyah,
                'mother_job'      => $kerjaIbu,
                'parent_address_street'   => 'Jl. Melati No. ' . ($urut * 3),
                'parent_address_village'  => 'Kelurahan Sukajaya',
                'parent_address_district' => 'Kecamatan Sukarami',
                'parent_address_city'     => 'Kota Palembang',
                'parent_address_province' => 'Sumatera Selatan',
            ]);

            // Modul yang berbeda membaca penempatan kelas dari tempat berbeda:
            // sebagian lewat students.classroom_id, sebagian lewat riwayat
            // enrollment. Keduanya diisi supaya tidak ada modul yang kosong.
            StudentEnrollment::create([
                'student_id'    => $siswa->id,
                'classroom_id'  => $kelas[$i]->id,
                'academic_year' => $this->tahunAjaran,
                'status'        => 'aktif',
            ]);

            $out[$i] = $siswa;
        }

        return $out;
    }

    private function seedWali(array $siswa): void
    {
        $role = $this->role('Orang Tua');

        foreach ($siswa as $i => $s) {
            $urut = $i + 1;

            // Bergantian ayah dan ibu supaya kolom relasi tidak seragam dan
            // tampilan portal orang tua terlihat apa adanya.
            $relasi = $i % 2 === 0 ? 'ayah' : 'ibu';
            $nama   = $relasi === 'ayah' ? $s->father_name : $s->mother_name;

            $user = User::create([
                'name'      => $nama,
                'email'     => 'wali' . $urut . '@sekolah.id',
                'password'  => Hash::make(self::PASSWORD),
                'is_active' => true,
            ]);
            $user->assignRole($role);

            StudentGuardian::create([
                'user_id'    => $user->id,
                'student_id' => $s->id,
                'relation'   => $relasi,
                'phone'      => '08529876' . str_pad((string) $urut, 4, '0', STR_PAD_LEFT),
            ]);
        }
    }

    /* ─────────────────────────────── turunan ─────────────────────────────── */

    private function seedJadwal(array $kelas, array $mapel, array $guru): void
    {
        $hari  = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
        $slot  = [['07:30', '08:40'], ['08:40', '09:50'], ['10:10', '11:20']];

        // Guru yang mengampu tiap mapel, supaya jadwal dan nilai memakai
        // pasangan yang sama dan tidak saling bertentangan.
        $pengampu = $this->pengampu($guru);
        $kode     = array_keys($mapel);

        foreach ($kelas as $ki => $k) {
            $n = 0;
            foreach ($hari as $h) {
                foreach ($slot as [$mulai, $selesai]) {
                    // Digeser per kelas supaya tiap kelas punya susunan berbeda,
                    // bukan sepuluh jadwal yang identik.
                    $m = $kode[($ki + $n) % count($kode)];

                    Schedule::create([
                        'classroom_id' => $k->id,
                        'subject_id'   => $mapel[$m]->id,
                        'teacher_id'   => $pengampu[$m]->id,
                        'day'          => $h,
                        'start_time'   => $mulai,
                        'end_time'     => $selesai,
                        'room'         => 'Ruang ' . $k->name,
                    ]);
                    $n++;
                }
            }
        }
    }

    private function seedNilai(array $siswa, array $mapel, array $guru): void
    {
        $pengampu = $this->pengampu($guru);
        $inti     = ['PAI', 'BIN', 'MTK', 'IPAS', 'PKN', 'BING'];

        foreach ($siswa as $i => $s) {
            foreach ($inti as $j => $kode) {
                $tugas = 75 + (($i * 3 + $j * 5) % 21);   // 75..95
                $uts   = 70 + (($i * 7 + $j * 3) % 26);   // 70..95
                $uas   = 72 + (($i * 5 + $j * 7) % 24);   // 72..95
                $akhir = round($tugas * 0.3 + $uts * 0.3 + $uas * 0.4, 2);

                Grade::create([
                    'student_id'    => $s->id,
                    'subject_id'    => $mapel[$kode]->id,
                    'classroom_id'  => $s->classroom_id,
                    'teacher_id'    => $pengampu[$kode]->id,
                    'academic_year' => $this->tahunAjaran,
                    // grades.semester bertipe tinyint dan divalidasi in:1,2 —
                    // bukan enum "Ganjil"/"Genap" seperti academic_years.
                    'semester'      => 1,
                    'score_tugas'   => $tugas,
                    'score_uts'     => $uts,
                    'score_uas'     => $uas,
                    'final_score'   => $akhir,
                    'grade_letter'  => $this->huruf($akhir),
                ]);
            }
        }
    }

    private function seedAbsensi(array $siswa): void
    {
        // Dua belas hari sekolah terakhir, melewati Sabtu dan Minggu.
        $tanggal = [];
        $t = new \DateTimeImmutable('2026-08-14');
        while (count($tanggal) < 12) {
            if (!in_array($t->format('N'), ['6', '7'])) {
                $tanggal[] = $t->format('Y-m-d');
            }
            $t = $t->modify('-1 day');
        }

        // Sebagian besar hadir, tetapi keempat status tetap muncul supaya rekap
        // kehadiran dan notifikasi alpha punya bahan.
        foreach ($siswa as $i => $s) {
            foreach ($tanggal as $j => $tgl) {
                $n = ($i * 5 + $j * 3) % 20;
                $status = match (true) {
                    $n === 3  => 'sakit',
                    $n === 9  => 'izin',
                    $n === 14 => 'alpha',
                    default   => 'hadir',
                };

                Attendance::create([
                    'student_id' => $s->id,
                    'date'       => $tgl,
                    'status'     => $status,
                    'notes'      => $status === 'sakit' ? 'Surat keterangan dokter diterima.'
                                  : ($status === 'izin' ? 'Keperluan keluarga.' : null),
                ]);
            }
        }
    }

    private function seedSpp(array $siswa): void
    {
        // Tarif per tingkat — makin tinggi tingkat, makin besar.
        $tarif = [];
        foreach (range(1, 6) as $tingkat) {
            $jumlah = 150000 + ($tingkat - 1) * 25000;
            SppSetting::create([
                'grade_level'   => $tingkat,
                'amount'        => $jumlah,
                'academic_year' => $this->tahunAjaran,
                'notes'         => 'Tarif SPP bulanan kelas ' . $tingkat . '.',
            ]);
            $tarif[$tingkat] = $jumlah;
        }

        // Juli sampai Desember 2026 — semester ganjil berjalan.
        foreach ($siswa as $i => $s) {
            $tingkat = $s->classroom->grade_level;

            foreach ([7, 8, 9, 10, 11, 12] as $k => $bulan) {
                // Bulan yang sudah lewat cenderung lunas, yang di depan belum.
                $lunas = $bulan <= 8 && ($i + $k) % 5 !== 0;

                SppBill::create([
                    'student_id'    => $s->id,
                    'month'         => $bulan,
                    'year'          => 2026,
                    'academic_year' => $this->tahunAjaran,
                    'amount'        => $tarif[$tingkat],
                    'status'        => $lunas ? 'lunas' : 'belum',
                    'paid_at'       => $lunas ? sprintf('2026-%02d-05 09:00:00', $bulan) : null,
                    // paid_by menyimpan NAMA petugas, bukan id — SppController
                    // mengisinya dari auth()->user()->name.
                    'paid_by'       => $lunas ? $this->namaAdmin() : null,
                ]);
            }
        }
    }

    private function seedKalender(): void
    {
        $admin = $this->idAdmin();

        $data = [
            ['Awal Tahun Ajaran 2026/2027',      '2026-07-13', '2026-07-13', 'akademik', 'penting', false],
            ['Masa Pengenalan Lingkungan Sekolah','2026-07-13', '2026-07-15', 'kegiatan', 'normal',  false],
            ['Peringatan HUT Kemerdekaan RI',    '2026-08-17', '2026-08-17', 'libur',    'normal',  true],
            ['Penilaian Tengah Semester Ganjil', '2026-09-21', '2026-09-26', 'ujian',    'penting', false],
            ['Rapat Wali Murid Semester Ganjil', '2026-10-10', '2026-10-10', 'rapat',    'penting', false],
            ['Peringatan Hari Sumpah Pemuda',    '2026-10-28', '2026-10-28', 'kegiatan', 'normal',  false],
            ['Penilaian Akhir Semester Ganjil',  '2026-12-01', '2026-12-10', 'ujian',    'urgent',  false],
            ['Pembagian Rapor Semester Ganjil',  '2026-12-19', '2026-12-19', 'akademik', 'penting', false],
            ['Libur Semester Ganjil',            '2026-12-21', '2027-01-02', 'libur',    'normal',  true],
            ['Awal Semester Genap',              '2027-01-05', '2027-01-05', 'akademik', 'penting', false],
        ];

        foreach ($data as [$judul, $mulai, $selesai, $kategori, $prioritas, $libur]) {
            AcademicEvent::create([
                'title'       => $judul,
                'description' => $judul . ' bagi seluruh warga sekolah.',
                'start_date'  => $mulai,
                'end_date'    => $selesai,
                'category'    => $kategori,
                'priority'    => $prioritas,
                'is_holiday'  => $libur,
                'created_by'  => $admin,
            ]);
        }
    }

    private function seedPengumuman(): void
    {
        $admin = $this->idAdmin();

        $data = [
            ['Jadwal Pelajaran Semester Ganjil Sudah Terbit', 'akademik', 'penting'],
            ['Pembayaran SPP Bulan Agustus',                  'umum',     'normal'],
            ['Lomba Kebersihan Kelas Antar Rombel',           'kegiatan', 'normal'],
            ['Rapat Wali Murid Kelas 6',                      'akademik', 'penting'],
            ['Perubahan Jam Masuk Hari Jumat',                'umum',     'penting'],
            ['Pendaftaran Ekstrakurikuler Dibuka',            'kegiatan', 'normal'],
            ['Persiapan Penilaian Tengah Semester',           'akademik', 'penting'],
            ['Imbauan Menjaga Kebersihan Lingkungan Sekolah', 'umum',     'normal'],
            ['Peringatan HUT Kemerdekaan RI ke-81',           'kegiatan', 'normal'],
            ['Penyesuaian Tarif SPP Tahun Ajaran Baru',       'umum',     'urgent'],
        ];

        foreach ($data as $i => [$judul, $kategori, $prioritas]) {
            Announcement::create([
                'user_id'      => $admin,
                'title'        => $judul,
                'content'      => $judul . '. Informasi selengkapnya dapat ditanyakan ke bagian tata usaha.',
                'category'     => $kategori,
                'priority'     => $prioritas,
                'is_published' => true,
                'published_at' => now()->subDays(10 - $i),
            ]);
        }
    }

    private function seedPoin(array $siswa): void
    {
        $kategori = [];
        $data = [
            ['Terlambat masuk sekolah',      'pelanggaran', -5],
            ['Tidak mengerjakan tugas',      'pelanggaran', -10],
            ['Tidak memakai atribut lengkap','pelanggaran', -5],
            ['Membuang sampah sembarangan',  'pelanggaran', -5],
            ['Juara lomba tingkat kecamatan','prestasi',     25],
            ['Aktif dalam kegiatan kelas',   'prestasi',     10],
            ['Membantu teman yang kesulitan','prestasi',     10],
            ['Peringkat 3 besar di kelas',   'prestasi',     20],
        ];
        foreach ($data as [$nama, $tipe, $nilai]) {
            $kategori[] = PointCategory::create(['name' => $nama, 'type' => $tipe, 'point_value' => $nilai]);
        }

        $admin = $this->idAdmin();

        foreach ($siswa as $i => $s) {
            // Dua catatan per siswa, satu pelanggaran dan satu prestasi, supaya
            // rekap poin tidak berat sebelah.
            StudentPoint::create([
                'student_id'        => $s->id,
                'point_category_id' => $kategori[$i % 4]->id,
                'date'              => '2026-08-' . str_pad((string) (3 + $i), 2, '0', STR_PAD_LEFT),
                'notes'             => 'Dicatat oleh wali kelas.',
                'recorded_by'       => $admin,
            ]);
            StudentPoint::create([
                'student_id'        => $s->id,
                'point_category_id' => $kategori[4 + ($i % 4)]->id,
                'date'              => '2026-08-' . str_pad((string) (5 + $i), 2, '0', STR_PAD_LEFT),
                'notes'             => 'Dicatat oleh wali kelas.',
                'recorded_by'       => $admin,
            ]);
        }
    }

    /* ─────────────────────────────── penunjang ─────────────────────────────── */

    /**
     * Peta kode mapel ke guru pengampunya. Guru dipilih dari kolom subject
     * miliknya sendiri; mapel yang tidak diampu siapa pun jatuh ke guru kelas
     * pertama, sehingga tidak ada jadwal atau nilai tanpa guru.
     *
     * @return array<string,Teacher>
     */
    private function pengampu(array $guru): array
    {
        $peta = [];
        foreach (['PAI', 'PKN', 'BIN', 'MTK', 'IPAS', 'SBDP', 'PJOK', 'BING', 'BTQ', 'MULOK'] as $kode) {
            $cocok = collect($guru)->firstWhere('subject', $kode);
            $peta[$kode] = $cocok ?? $guru[0];
        }

        return $peta;
    }

    /**
     * Ambil role pada guard yang dipakai model User.
     *
     * Tabel roles berisi dua baris bernama "Siswa": satu guard web, satu guard
     * api. Mengambil tanpa menyebut guard mengembalikan baris yang mana saja,
     * dan Spatie menolak assignRole() begitu guard-nya tidak cocok dengan model.
     */
    private function role(string $nama): Role
    {
        $guard = config('auth.defaults.guard', 'web');

        return Role::firstOrCreate(['name' => $nama, 'guard_name' => $guard]);
    }

    private function huruf(float $nilai): string
    {
        return match (true) {
            $nilai >= 90 => 'A',
            $nilai >= 80 => 'B',
            $nilai >= 70 => 'C',
            $nilai >= 60 => 'D',
            default      => 'E',
        };
    }

    private function idAdmin(): ?int
    {
        return User::whereHas('roles', fn ($q) => $q->whereIn('name', self::ROLE_STAF))->value('id');
    }

    private function namaAdmin(): string
    {
        return User::whereHas('roles', fn ($q) => $q->whereIn('name', self::ROLE_STAF))
            ->value('name') ?? 'Bendahara Sekolah';
    }

    private function laporkan(): void
    {
        $baris = [
            'Mata pelajaran'   => Subject::count(),
            'Guru'             => Teacher::count(),
            'Kelas'            => Classroom::count(),
            'Siswa'            => Student::count(),
            'Orang tua / wali' => StudentGuardian::count(),
            'Penempatan kelas' => StudentEnrollment::count(),
            'Jadwal pelajaran' => Schedule::count(),
            'Nilai'            => Grade::count(),
            'Absensi'          => Attendance::count(),
            'Tarif SPP'        => SppSetting::count(),
            'Tagihan SPP'      => SppBill::count(),
            'Kalender'         => AcademicEvent::count(),
            'Pengumuman'       => Announcement::count(),
            'Poin siswa'       => StudentPoint::count(),
        ];

        $this->command?->info('Data contoh siap.');
        foreach ($baris as $label => $jumlah) {
            $this->command?->line(sprintf('  %-18s %s', $label, $jumlah));
        }
        $this->command?->line('');
        $this->command?->line('  Guru & orang tua — kata sandi: ' . self::PASSWORD);
        $this->command?->line('    guru1@sekolah.id .. guru10@sekolah.id');
        $this->command?->line('    wali1@sekolah.id .. wali10@sekolah.id');
        $this->command?->line('');
        $this->command?->line('  Siswa — kata sandi SAMA DENGAN NISN (dibuat otomatis oleh model Student)');
        $this->command?->line('    0003120001@siswa.com .. 0003120010@siswa.com');
    }
}
