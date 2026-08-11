<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Grade;
use App\Models\Student;
use App\Models\StudentEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PromotionController extends Controller
{
    /**
     * Daftar siswa di sebuah kelas beserta bahan pertimbangan (rata-rata nilai &
     * jumlah alpha), untuk dipakai admin saat menentukan naik/tinggal/lulus.
     */
    public function preview(Request $request)
    {
        $request->validate([
            'classroom_id'  => 'required|exists:classrooms,id',
            'academic_year' => 'nullable|string',
        ]);

        $academicYear = $request->academic_year ?: AcademicYear::activeName();
        $classroom    = Classroom::findOrFail($request->classroom_id);

        $students = Student::where('classroom_id', $classroom->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        $data = $students->map(function ($student) use ($academicYear) {
            $average = Grade::where('student_id', $student->id)
                ->where('academic_year', $academicYear)
                ->whereNotNull('final_score')
                ->avg('final_score');

            $enrollment = StudentEnrollment::where('student_id', $student->id)
                ->where('academic_year', $academicYear)
                ->first();

            return [
                'student_id'      => $student->id,
                'nisn'            => $student->nisn,
                'name'            => $student->name,
                'average'         => $average ? round($average, 1) : null,
                'already_decided' => $enrollment && $enrollment->status !== 'aktif',
                'decided_status'  => $enrollment && $enrollment->status !== 'aktif' ? $enrollment->status : null,
            ];
        });

        return response()->json([
            'data' => $data,
            'classroom' => [
                'id'          => $classroom->id,
                'name'        => $classroom->name,
                'grade_level' => $classroom->grade_level,
            ],
            'academic_year' => $academicYear,
        ]);
    }

    /**
     * Menjalankan kenaikan kelas.
     *
     * Sengaja per siswa, bukan per rombel, supaya sekolah yang memindahkan satu
     * rombel utuh maupun yang mengacak ulang kelasnya sama-sama terlayani:
     * pilih semua siswa ke kelas tujuan yang sama, atau sebagian ke kelas berbeda.
     */
    public function execute(Request $request)
    {
        $request->validate([
            'from_academic_year'              => 'required|string',
            'to_academic_year'                => 'required|string|different:from_academic_year',
            'promotions'                      => 'required|array|min:1',
            'promotions.*.student_id'         => 'required|exists:students,id',
            'promotions.*.action'             => 'required|in:naik,tinggal,lulus,keluar',
            'promotions.*.target_classroom_id' => 'nullable|exists:classrooms,id',
            'promotions.*.notes'              => 'nullable|string|max:500',
        ]);

        // Kelas tujuan wajib untuk siswa yang naik
        foreach ($request->promotions as $i => $p) {
            if ($p['action'] === 'naik' && empty($p['target_classroom_id'])) {
                return response()->json([
                    'message' => 'Siswa yang naik kelas harus punya kelas tujuan.',
                    'errors'  => ["promotions.$i.target_classroom_id" => ['Kelas tujuan wajib dipilih.']],
                ], 422);
            }
        }

        $result = DB::transaction(function () use ($request) {
            $counts = ['naik' => 0, 'tinggal' => 0, 'lulus' => 0, 'keluar' => 0];

            foreach ($request->promotions as $p) {
                $student = Student::find($p['student_id']);
                if (!$student) continue;

                $action = $p['action'];

                // 1. Kunci riwayat tahun ajaran yang ditinggalkan, memakai kelas
                //    siswa saat ini sebagai kelas asal
                StudentEnrollment::updateOrCreate(
                    ['student_id' => $student->id, 'academic_year' => $request->from_academic_year],
                    [
                        'classroom_id' => $student->classroom_id,
                        'status'       => $action,
                        'notes'        => $p['notes'] ?? null,
                    ]
                );

                // 2. Terapkan hasilnya ke data siswa & catat tahun ajaran baru
                if ($action === 'naik' || $action === 'tinggal') {
                    $targetClassroom = $action === 'naik'
                        ? $p['target_classroom_id']
                        : $student->classroom_id;

                    $student->update(['classroom_id' => $targetClassroom]);

                    StudentEnrollment::updateOrCreate(
                        ['student_id' => $student->id, 'academic_year' => $request->to_academic_year],
                        ['classroom_id' => $targetClassroom, 'status' => 'aktif']
                    );
                } else {
                    // Lulus atau keluar: tidak lagi menempati kelas mana pun
                    $student->update(['classroom_id' => null, 'is_active' => false]);
                }

                $counts[$action]++;
            }

            return $counts;
        });

        $message = "Proses selesai: {$result['naik']} naik kelas, {$result['tinggal']} tinggal kelas, "
            . "{$result['lulus']} lulus, {$result['keluar']} keluar.";

        return response()->json(['message' => $message, 'summary' => $result]);
    }

    /** Riwayat kelas seorang siswa lintas tahun ajaran */
    public function history($studentId)
    {
        $student = Student::with('classroom')->findOrFail($studentId);

        $history = StudentEnrollment::with('classroom')
            ->where('student_id', $student->id)
            ->orderByDesc('academic_year')
            ->get()
            ->map(fn ($e) => [
                'academic_year'  => $e->academic_year,
                'classroom_name' => $e->classroom?->name ?? '-',
                'status'         => $e->status,
                'notes'          => $e->notes,
            ]);

        return response()->json([
            'student' => [
                'id'   => $student->id,
                'nisn' => $student->nisn,
                'name' => $student->name,
                'classroom_name' => $student->classroom?->name,
                'is_active'      => $student->is_active,
            ],
            'data' => $history,
        ]);
    }
}
