<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Student;
use App\Services\TeachingScope;
use Illuminate\Http\Request;

class AttendanceController extends Controller {
    public function index(Request $request) {
        $date        = $request->get('date', today()->toDateString());
        $classroomId = $request->get('classroom_id');

        if ($classroomId && !TeachingScope::canAccessClassroom($classroomId)) {
            return response()->json(['message' => 'Anda tidak mengampu kelas ini.'], 403);
        }

        // Ambil siswa aktif, dibatasi kelas yang dipilih / yang boleh diakses
        $students = Student::where('is_active', true)
            ->when($classroomId, fn($q) => $q->where('classroom_id', $classroomId))
            ->when(!$classroomId, fn($q) => TeachingScope::applyToQuery($q))
            ->orderBy('name')
            ->get();

        // Ambil absensi yang sudah ada untuk tanggal ini, hanya untuk siswa di atas
        // supaya ringkasannya konsisten dengan daftar yang ditampilkan
        $attendances = Attendance::whereDate('date', $date)
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        // Gabungkan: siswa yang belum absen = 'hadir' by default
        $result = $students->map(function ($student) use ($attendances, $date) {
            $att = $attendances->get($student->id);
            return [
                'student_id' => $student->id,
                'student_name' => $student->name,
                'nisn' => $student->nisn,
                'attendance_id' => $att?->id,
                'date' => $date,
                'status' => $att?->status ?? null,
                'notes' => $att?->notes ?? '',
            ];
        });

        // Summary stats
        $saved = $attendances;
        $summary = [
            'hadir' => $saved->where('status', 'hadir')->count(),
            'sakit' => $saved->where('status', 'sakit')->count(),
            'izin'  => $saved->where('status', 'izin')->count(),
            'alpha' => $saved->where('status', 'alpha')->count(),
            'total' => $students->count(),
            'recorded' => $saved->count(),
        ];

        return response()->json([
            'data' => $result,
            'summary' => $summary,
            'date' => $date,
        ]);
    }

    public function storeBulk(Request $request) {
        $request->validate([
            'date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.status' => 'required|in:hadir,sakit,izin,alpha',
            'attendances.*.notes' => 'nullable|string',
        ]);

        $date = $request->date;

        // Guru hanya boleh mengabsen siswa di kelas yang dia ampu atau walikan
        if (TeachingScope::isRestricted()) {
            $studentIds = collect($request->attendances)->pluck('student_id');
            $allowed    = TeachingScope::allowedClassroomIds() ?: [0];

            $outsideScope = Student::whereIn('id', $studentIds)
                ->where(fn($q) => $q->whereNotIn('classroom_id', $allowed)->orWhereNull('classroom_id'))
                ->exists();

            if ($outsideScope) {
                return response()->json([
                    'message' => 'Ada siswa di luar kelas yang Anda ampu.'
                ], 403);
            }
        }

        $saved = 0;

        foreach ($request->attendances as $item) {
            Attendance::updateOrCreate(
                ['student_id' => $item['student_id'], 'date' => $date],
                ['status' => $item['status'], 'notes' => $item['notes'] ?? null]
            );
            $saved++;
        }

        return response()->json([
            'message' => "Absensi berhasil disimpan untuk $saved siswa.",
            'date' => $date,
            'saved' => $saved,
        ]);
    }

    public function summary(Request $request) {
        $month       = $request->get('month', now()->month);
        $year        = $request->get('year', now()->year);
        $classroomId = $request->get('classroom_id');

        if ($classroomId && !TeachingScope::canAccessClassroom($classroomId)) {
            return response()->json(['message' => 'Anda tidak mengampu kelas ini.'], 403);
        }

        $studentIds = Student::where('is_active', true)
            ->when($classroomId, fn($q) => $q->where('classroom_id', $classroomId))
            ->when(!$classroomId, fn($q) => TeachingScope::applyToQuery($q))
            ->pluck('id');

        $data = Attendance::with('student')
            ->whereIn('student_id', $studentIds)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->get()
            ->groupBy('student_id')
            ->map(function ($records) {
                return [
                    'student' => $records->first()->student->name,
                    'nisn' => $records->first()->student->nisn,
                    'hadir' => $records->where('status', 'hadir')->count(),
                    'sakit' => $records->where('status', 'sakit')->count(),
                    'izin'  => $records->where('status', 'izin')->count(),
                    'alpha' => $records->where('status', 'alpha')->count(),
                ];
            })->values();

        return response()->json(['data' => $data, 'month' => $month, 'year' => $year]);
    }
}
