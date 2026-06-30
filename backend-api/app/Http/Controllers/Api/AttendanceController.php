<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Student;
use Illuminate\Http\Request;

class AttendanceController extends Controller {
    public function index(Request $request) {
        $date = $request->get('date', today()->toDateString());

        // Ambil semua siswa aktif
        $students = Student::where('is_active', true)->orderBy('name')->get();

        // Ambil absensi yang sudah ada untuk tanggal ini
        $attendances = Attendance::with('student')
            ->whereDate('date', $date)
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
        $month = $request->get('month', now()->month);
        $year  = $request->get('year', now()->year);

        $data = Attendance::with('student')
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
