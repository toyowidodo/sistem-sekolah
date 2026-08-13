<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Services\TeachingScope;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Pencarian lintas modul untuk command palette.
 *
 * Dengan 100+ siswa, menemukan satu orang berarti membuka menu Data Siswa lalu
 * menyusuri halaman demi halaman. Endpoint ini menyatukan pencarian siswa,
 * guru, kelas, dan mapel dalam satu permintaan.
 *
 * Hasilnya disaring per peran: guru hanya melihat siswa di kelas yang dia
 * ampu, dan pengguna tanpa permission modul tertentu tidak mendapat hasil dari
 * modul itu sama sekali. Tanpa penyaringan ini, pencarian jadi celah untuk
 * membaca data yang tidak boleh diakses lewat menu biasa.
 */
class SearchController extends Controller
{
    private const LIMIT = 6;

    public function __invoke(Request $request)
    {
        $q = trim((string) $request->get('q', ''));

        if (mb_strlen($q) < 2) {
            return response()->json(['data' => [], 'query' => $q]);
        }

        $user  = Auth::user();
        $admin = $user->isSchoolAdmin();
        $hasil = [];

        // Guru tidak punya manage-students, tapi jelas berhak menemukan siswa di
        // kelas yang dia ampu — mereka melihat siswa yang sama di halaman
        // Absensi dan Nilai. Cakupannya tetap dipersempit TeachingScope di bawah.
        if ($admin || $user->canAny(['manage-students', 'manage-grades', 'manage-attendance'])) {
            $siswa = Student::with('classroom')
                ->where(fn ($w) => $w->where('name', 'like', "%{$q}%")->orWhere('nisn', 'like', "%{$q}%"));

            // Guru dibatasi ke kelas yang diampu atau diwalikan
            TeachingScope::applyToQuery($siswa);

            foreach ($siswa->limit(self::LIMIT)->get() as $s) {
                $hasil[] = [
                    'type'  => 'siswa',
                    'label' => $s->name,
                    'meta'  => trim(($s->nisn ? "NISN {$s->nisn}" : '') . ($s->classroom ? " · {$s->classroom->name}" : '')),
                    'path'  => '/students',
                ];
            }
        }

        if ($admin || $user->can('manage-teachers')) {
            foreach (Teacher::where('name', 'like', "%{$q}%")->orWhere('nip', 'like', "%{$q}%")
                ->limit(self::LIMIT)->get() as $t) {
                $hasil[] = [
                    'type'  => 'guru',
                    'label' => $t->name,
                    'meta'  => trim(($t->nip ? "NIP {$t->nip}" : '') . ($t->subject ? " · {$t->subject}" : '')),
                    'path'  => '/teachers',
                ];
            }
        }

        // Kelas & mapel dipakai lintas modul, jadi terbuka untuk semua yang
        // bisa melihat akademik atau nilai
        if ($admin || $user->can('manage-academic') || $user->can('manage-grades')) {
            foreach (Classroom::where('name', 'like', "%{$q}%")->limit(self::LIMIT)->get() as $c) {
                $hasil[] = [
                    'type'  => 'kelas',
                    'label' => $c->name,
                    'meta'  => 'Tingkat ' . $c->grade_level . ($c->major ? " · {$c->major}" : ''),
                    'path'  => '/academic',
                ];
            }

            foreach (Subject::where('name', 'like', "%{$q}%")->orWhere('code', 'like', "%{$q}%")
                ->limit(self::LIMIT)->get() as $m) {
                $hasil[] = [
                    'type'  => 'mapel',
                    'label' => $m->name,
                    'meta'  => $m->code,
                    'path'  => '/academic',
                ];
            }
        }

        return response()->json(['data' => $hasil, 'query' => $q]);
    }
}
