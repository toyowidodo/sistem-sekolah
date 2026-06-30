<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\SppBill;
use App\Models\Attendance;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $now = now();
        $today = $now->toDateString();
        $currentMonth = $now->month;
        $currentYear = $now->year;

        // 1. Total Siswa & Guru
        $totalStudents = Student::count();
        $totalTeachers = Teacher::count();

        // 2. Pemasukan SPP Bulan Ini
        $revenueThisMonth = SppBill::where('status', 'lunas')
            ->whereYear('paid_at', $currentYear)
            ->whereMonth('paid_at', $currentMonth)
            ->sum('amount');
        
        $revenueLastMonth = SppBill::where('status', 'lunas')
            ->whereYear('paid_at', $now->copy()->subMonth()->year)
            ->whereMonth('paid_at', $now->copy()->subMonth()->month)
            ->sum('amount');

        $revenueChange = 0;
        if ($revenueLastMonth > 0) {
            $revenueChange = round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100);
        }

        // 3. Kehadiran Hari Ini
        $totalAttendanceToday = Attendance::whereDate('date', $today)->count();
        $presentToday = Attendance::whereDate('date', $today)->where('status', 'hadir')->count();
        $attendancePercentage = $totalAttendanceToday > 0 ? round(($presentToday / $totalAttendanceToday) * 100) : 0;

        // 4. Chart Data: 6 Bulan Terakhir Pemasukan SPP
        $areaData = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = $now->copy()->subMonths($i);
            $val = SppBill::where('status', 'lunas')
                ->whereYear('paid_at', $m->year)
                ->whereMonth('paid_at', $m->month)
                ->sum('amount');
            
            $areaData[] = [
                'name' => $m->translatedFormat('M'), // Jan, Feb, Mar dll
                'value' => round($val / 1000000, 2) // dalam juta
            ];
        }

        // 5. Chart Data: Kehadiran 6 Hari Terakhir (sebagai pengganti bar chart siswa/guru)
        $barData = [];
        for ($i = 5; $i >= 0; $i--) {
            $d = $now->copy()->subDays($i);
            $total = Attendance::whereDate('date', $d->toDateString())->count();
            $hadir = Attendance::whereDate('date', $d->toDateString())->where('status', 'hadir')->count();
            $absen = $total - $hadir;

            $barData[] = [
                'name' => $d->translatedFormat('D'), // Sen, Sel, Rab
                'Hadir' => $hadir,
                'Absen' => $absen
            ];
        }

        return response()->json([
            'stats' => [
                'students' => $totalStudents,
                'teachers' => $totalTeachers,
                'revenue' => [
                    'current' => $revenueThisMonth,
                    'change' => $revenueChange
                ],
                'attendance' => $attendancePercentage
            ],
            'charts' => [
                'revenue' => $areaData,
                'attendance' => $barData
            ]
        ]);
    }
}
