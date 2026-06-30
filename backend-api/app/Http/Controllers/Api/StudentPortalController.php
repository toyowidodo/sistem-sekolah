<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Attendance;
use App\Models\SppBill;
use App\Models\Grade;
use App\Models\Schedule;
use Illuminate\Support\Facades\Auth;

class StudentPortalController extends Controller
{
    private function getStudent()
    {
        $user = Auth::user();
        if (!$user) return null;
        return Student::where('user_id', $user->id)->first();
    }

    public function dashboard()
    {
        $student = $this->getStudent();
        if (!$student) return response()->json(['message' => 'Student data not found'], 404);

        $now = now();
        $today = $now->toDateString();

        // 1. Kehadiran Hari Ini
        $attendanceToday = Attendance::where('student_id', $student->id)->whereDate('date', $today)->first();

        // 2. Kehadiran Bulan Ini (Percentage)
        $totalDays = Attendance::where('student_id', $student->id)->whereMonth('date', $now->month)->count();
        $presentDays = Attendance::where('student_id', $student->id)->whereMonth('date', $now->month)->where('status', 'hadir')->count();
        $attendancePercentage = $totalDays > 0 ? round(($presentDays / $totalDays) * 100) : 100;

        // 3. Tagihan Belum Lunas
        $unpaidBills = SppBill::where('student_id', $student->id)->where('status', 'belum_lunas')->sum('amount');

        // 4. Nilai Terakhir
        $latestGrades = Grade::with('subject')->where('student_id', $student->id)->orderBy('updated_at', 'desc')->take(5)->get();

        return response()->json([
            'student' => $student,
            'attendance_today' => $attendanceToday ? $attendanceToday->status : 'Belum Ada',
            'attendance_percentage' => $attendancePercentage,
            'unpaid_bills' => $unpaidBills,
            'latest_grades' => $latestGrades
        ]);
    }

    public function spp()
    {
        $student = $this->getStudent();
        if (!$student) return response()->json(['message' => 'Student data not found'], 404);

        $bills = SppBill::where('student_id', $student->id)->orderBy('year', 'desc')->orderBy('month', 'desc')->get();
        return response()->json(['data' => $bills]);
    }

    public function grades()
    {
        $student = $this->getStudent();
        if (!$student) return response()->json(['message' => 'Student data not found'], 404);

        $grades = Grade::with(['subject', 'classroom'])->where('student_id', $student->id)->orderBy('academic_year', 'desc')->orderBy('semester', 'desc')->get();
        return response()->json(['data' => $grades]);
    }

    public function schedules()
    {
        // Currently, students are not strictly tied to classrooms in the database schema.
        // We will just return all schedules or empty if we don't know the class.
        // As a fallback for the portal, we return all schedules grouped by day.
        $schedules = Schedule::with(['subject', 'classroom', 'teacher'])->get();
        return response()->json(['data' => $schedules]);
    }
}
