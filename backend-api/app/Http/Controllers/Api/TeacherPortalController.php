<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Grade;
use App\Models\Schedule;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TeacherPortalController extends Controller
{
    private const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    private function getTeacher()
    {
        return Auth::user()?->teacher;
    }

    private function todayName(): string
    {
        // Carbon::dayOfWeek: 0 = Minggu
        $map = [1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu', 4 => 'Kamis', 5 => 'Jumat', 6 => 'Sabtu'];

        return $map[now()->dayOfWeek] ?? 'Minggu';
    }

    public function dashboard()
    {
        $teacher = $this->getTeacher();
        if (!$teacher) {
            return response()->json(['message' => 'Akun Anda belum terhubung ke data guru.'], 404);
        }

        $today = $this->todayName();

        $todaySchedules = Schedule::with(['subject', 'classroom'])
            ->where('teacher_id', $teacher->id)
            ->where('day', $today)
            ->orderBy('start_time')
            ->get();

        $homeroom = $teacher->homeroomClassrooms()->get();
        $homeroomStudentIds = Student::whereIn('classroom_id', $homeroom->pluck('id'))
            ->where('is_active', true)
            ->pluck('id');

        // Kehadiran kelas perwalian hari ini
        $attendanceToday = null;
        if ($homeroomStudentIds->isNotEmpty()) {
            $records = Attendance::whereIn('student_id', $homeroomStudentIds)
                ->whereDate('date', today())
                ->get();

            $attendanceToday = [
                'total'    => $homeroomStudentIds->count(),
                'recorded' => $records->count(),
                'hadir'    => $records->where('status', 'hadir')->count(),
                'sakit'    => $records->where('status', 'sakit')->count(),
                'izin'     => $records->where('status', 'izin')->count(),
                'alpha'    => $records->where('status', 'alpha')->count(),
            ];
        }

        return response()->json([
            'teacher' => [
                'id'       => $teacher->id,
                'nip'      => $teacher->nip,
                'name'     => $teacher->name,
                'position' => $teacher->position,
                'subject'  => $teacher->subject,
            ],
            'today'             => $today,
            'today_schedules'   => $todaySchedules,
            'homeroom_classes'  => $homeroom,
            'homeroom_students' => $homeroomStudentIds->count(),
            'attendance_today'  => $attendanceToday,
            'teaching_load'     => Schedule::where('teacher_id', $teacher->id)->count(),
        ]);
    }

    /** Jadwal mengajar guru, dikelompokkan per hari */
    public function schedules()
    {
        $teacher = $this->getTeacher();
        if (!$teacher) {
            return response()->json(['message' => 'Akun Anda belum terhubung ke data guru.'], 404);
        }

        $schedules = Schedule::with(['subject', 'classroom'])
            ->where('teacher_id', $teacher->id)
            ->orderBy('start_time')
            ->get()
            ->groupBy('day');

        $data = collect(self::DAYS)->map(fn ($day) => [
            'day'       => $day,
            'schedules' => $schedules->get($day, collect())->values(),
        ]);

        return response()->json(['data' => $data]);
    }

    /**
     * Kombinasi kelas + mapel yang diampu guru. Dipakai frontend untuk membatasi
     * dropdown input nilai agar hanya menampilkan yang benar-benar dia ampu.
     */
    public function teachingAssignments()
    {
        $teacher = $this->getTeacher();
        if (!$teacher) {
            return response()->json(['message' => 'Akun Anda belum terhubung ke data guru.'], 404);
        }

        $assignments = Schedule::with(['subject', 'classroom'])
            ->where('teacher_id', $teacher->id)
            ->get()
            ->unique(fn ($s) => $s->classroom_id . '-' . $s->subject_id)
            ->map(fn ($s) => [
                'classroom_id'   => $s->classroom_id,
                'classroom_name' => $s->classroom?->name,
                'subject_id'     => $s->subject_id,
                'subject_name'   => $s->subject?->name,
            ])
            ->sortBy('classroom_name')
            ->values();

        return response()->json([
            'data'     => $assignments,
            'homeroom' => $teacher->homeroomClassrooms()->get(['id', 'name', 'grade_level']),
        ]);
    }

    /** Daftar siswa di kelas perwalian, untuk wali kelas */
    public function homeroomStudents(Request $request)
    {
        $teacher = $this->getTeacher();
        if (!$teacher) {
            return response()->json(['message' => 'Akun Anda belum terhubung ke data guru.'], 404);
        }

        $classroomIds = $teacher->homeroomClassrooms()->pluck('id');

        if ($classroomIds->isEmpty()) {
            return response()->json(['data' => [], 'message' => 'Anda belum ditugaskan sebagai wali kelas.']);
        }

        $classroomId = $request->classroom_id && $classroomIds->contains($request->classroom_id)
            ? $request->classroom_id
            : $classroomIds->first();

        $students = Student::with('classroom')
            ->where('classroom_id', $classroomId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        // Ringkasan singkat per siswa: rata-rata nilai & jumlah alpha bulan ini
        $summary = $students->map(function ($student) {
            return [
                'id'      => $student->id,
                'nisn'    => $student->nisn,
                'name'    => $student->name,
                'gender'  => $student->gender,
                'average' => round(Grade::where('student_id', $student->id)->whereNotNull('final_score')->avg('final_score') ?? 0, 1),
                'alpha'   => Attendance::where('student_id', $student->id)
                    ->whereMonth('date', now()->month)
                    ->whereYear('date', now()->year)
                    ->where('status', 'alpha')
                    ->count(),
            ];
        });

        return response()->json([
            'data'         => $summary,
            'classroom_id' => (int) $classroomId,
            'classrooms'   => $teacher->homeroomClassrooms()->get(['id', 'name']),
        ]);
    }
}
