<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentGuardian;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class GuardianController extends Controller
{
    /** Akun orang tua / wali yang terhubung ke seorang siswa */
    public function index($studentId)
    {
        $student = Student::findOrFail($studentId);

        $guardians = $student->guardians()->get()->map(fn ($u) => [
            'user_id'   => $u->id,
            'name'      => $u->name,
            'email'     => $u->email,
            'relation'  => $u->pivot->relation,
            'phone'     => $u->pivot->phone,
            'is_active' => (bool) $u->is_active,
        ]);

        return response()->json([
            'student'   => ['id' => $student->id, 'name' => $student->name, 'nisn' => $student->nisn],
            'data'      => $guardians,
            // Diambil dari data siswa supaya admin tinggal menyalin nama ortunya
            'suggested' => array_values(array_filter([
                $student->father_name   ? ['relation' => 'ayah', 'name' => $student->father_name] : null,
                $student->mother_name   ? ['relation' => 'ibu', 'name' => $student->mother_name] : null,
                $student->guardian_name ? ['relation' => 'wali', 'name' => $student->guardian_name] : null,
            ])),
        ]);
    }

    /**
     * Membuat (atau menghubungkan) akun orang tua untuk seorang siswa.
     *
     * Kalau emailnya sudah terdaftar, akun itu dipakai ulang dan hanya
     * ditautkan ke anak ini — supaya orang tua dengan beberapa anak di sekolah
     * yang sama tetap memakai satu akun.
     */
    public function store(Request $request, $studentId)
    {
        $student = Student::findOrFail($studentId);

        $v = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|max:255',
            'relation' => 'required|in:ayah,ibu,wali',
            'phone'    => 'nullable|string|max:20',
        ]);

        $existing = User::where('email', $v['email'])->first();

        if ($existing && StudentGuardian::where('user_id', $existing->id)->where('student_id', $student->id)->exists()) {
            return response()->json(['message' => 'Akun ini sudah terhubung ke siswa tersebut.'], 422);
        }

        $result = DB::transaction(function () use ($v, $student, $existing) {
            $plainPassword = null;

            if ($existing) {
                $user = $existing;
            } else {
                $plainPassword = Str::password(10, true, true, false);
                $user = User::create([
                    'name'     => $v['name'],
                    'email'    => $v['email'],
                    'password' => $plainPassword,
                ]);
            }

            if (!$user->hasRole('Orang Tua')) {
                $user->assignRole(Role::firstOrCreate(['name' => 'Orang Tua', 'guard_name' => 'web']));
            }

            StudentGuardian::create([
                'user_id'    => $user->id,
                'student_id' => $student->id,
                'relation'   => $v['relation'],
                'phone'      => $v['phone'] ?? null,
            ]);

            return [$user, $plainPassword];
        });

        [$user, $plainPassword] = $result;

        return response()->json([
            'message' => $plainPassword
                ? 'Akun orang tua berhasil dibuat dan dihubungkan.'
                : 'Akun yang sudah ada berhasil dihubungkan ke siswa ini.',
            // Password hanya dikembalikan sekali, saat akun baru dibuat
            'account' => $plainPassword ? ['email' => $user->email, 'password' => $plainPassword] : null,
        ], 201);
    }

    /** Memutus hubungan akun orang tua dari seorang siswa */
    public function destroy($studentId, $userId)
    {
        $link = StudentGuardian::where('student_id', $studentId)->where('user_id', $userId)->firstOrFail();
        $link->delete();

        // Akun yang tidak lagi memantau anak mana pun ikut dinonaktifkan supaya
        // tidak ada akun menggantung yang masih bisa login
        $remaining = StudentGuardian::where('user_id', $userId)->count();
        if ($remaining === 0) {
            User::where('id', $userId)->update(['is_active' => false]);
        }

        return response()->json([
            'message' => $remaining === 0
                ? 'Hubungan diputus. Akun dinonaktifkan karena tidak lagi terhubung ke siswa mana pun.'
                : 'Hubungan dengan siswa ini diputus.',
        ]);
    }
}
