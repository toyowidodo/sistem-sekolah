<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Grade;
use App\Models\SppBill;
use App\Models\Student;
use App\Models\StudentPoint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ParentPortalController extends Controller
{
    /**
     * Mengambil anak yang diminta, sekaligus memastikan akun yang login memang
     * terhubung ke siswa tersebut. Semua endpoint di bawah wajib lewat sini —
     * tanpa ini, orang tua mana pun bisa membaca data siswa lain hanya dengan
     * mengganti student_id di URL.
     */
    private function resolveChild(Request $request): Student|\Illuminate\Http\JsonResponse
    {
        $user = Auth::user();

        $query = $user->children()->with('classroom');

        $child = $request->filled('student_id')
            ? $query->where('students.id', $request->student_id)->first()
            : $query->orderBy('name')->first();

        if (!$child) {
            return response()->json([
                'message' => $request->filled('student_id')
                    ? 'Anda tidak punya akses ke data siswa ini.'
                    : 'Akun Anda belum terhubung ke data siswa mana pun. Hubungi administrator sekolah.',
            ], $request->filled('student_id') ? 403 : 404);
        }

        return $child;
    }

    /** Daftar anak yang bisa dipantau akun ini */
    public function children()
    {
        $children = Auth::user()->children()->with('classroom')->orderBy('name')->get()
            ->map(fn ($c) => [
                'id'             => $c->id,
                'nisn'           => $c->nisn,
                'name'           => $c->name,
                'classroom_name' => $c->classroom?->name,
                'relation'       => $c->pivot->relation,
                'is_active'      => $c->is_active,
            ]);

        return response()->json(['data' => $children]);
    }

    public function dashboard(Request $request)
    {
        $child = $this->resolveChild($request);
        if (!$child instanceof Student) return $child;

        $now = now();

        $totalDays   = Attendance::where('student_id', $child->id)->whereMonth('date', $now->month)->whereYear('date', $now->year)->count();
        $presentDays = Attendance::where('student_id', $child->id)->whereMonth('date', $now->month)->whereYear('date', $now->year)->where('status', 'hadir')->count();

        $attendanceToday = Attendance::where('student_id', $child->id)->whereDate('date', $now->toDateString())->first();

        $points = StudentPoint::with('category')->where('student_id', $child->id)->get();
        $pelanggaran = $points->filter(fn ($p) => $p->category?->type === 'pelanggaran')->sum(fn ($p) => $p->category->point_value);
        $prestasi    = $points->filter(fn ($p) => $p->category?->type === 'prestasi')->sum(fn ($p) => $p->category->point_value);

        return response()->json([
            'child' => [
                'id'             => $child->id,
                'nisn'           => $child->nisn,
                'name'           => $child->name,
                'classroom_name' => $child->classroom?->name,
            ],
            'attendance_today'      => $attendanceToday?->status ?? 'Belum Ada',
            'attendance_percentage' => $totalDays > 0 ? round(($presentDays / $totalDays) * 100) : 100,
            'attendance_recorded'   => $totalDays,
            'unpaid_bills'          => SppBill::where('student_id', $child->id)->where('status', 'belum')->sum('amount'),
            'unpaid_count'          => SppBill::where('student_id', $child->id)->where('status', 'belum')->count(),
            'points'                => ['pelanggaran' => $pelanggaran, 'prestasi' => $prestasi],
            'latest_grades'         => Grade::with('subject')->where('student_id', $child->id)
                ->orderByDesc('updated_at')->take(5)->get()
                ->map(fn ($g) => [
                    'subject'       => $g->subject?->name,
                    'academic_year' => $g->academic_year,
                    'semester'      => $g->semester,
                    'final_score'   => $g->final_score,
                    'grade_letter'  => $g->grade_letter,
                ]),
        ]);
    }

    public function grades(Request $request)
    {
        $child = $this->resolveChild($request);
        if (!$child instanceof Student) return $child;

        $grades = Grade::with(['subject', 'classroom'])
            ->where('student_id', $child->id)
            ->orderByDesc('academic_year')
            ->orderByDesc('semester')
            ->get();

        $average = $grades->whereNotNull('final_score')->avg('final_score');

        return response()->json([
            'child'   => ['id' => $child->id, 'name' => $child->name],
            'data'    => $grades,
            'average' => $average ? round($average, 1) : null,
        ]);
    }

    public function spp(Request $request)
    {
        $child = $this->resolveChild($request);
        if (!$child instanceof Student) return $child;

        $bills = SppBill::where('student_id', $child->id)
            ->orderByDesc('year')->orderByDesc('month')
            ->get();

        return response()->json([
            'child'   => ['id' => $child->id, 'name' => $child->name],
            'data'    => $bills,
            'summary' => [
                'total'  => $bills->sum('amount'),
                'lunas'  => $bills->where('status', 'lunas')->sum('amount'),
                'belum'  => $bills->where('status', 'belum')->sum('amount'),
            ],
        ]);
    }

    public function attendance(Request $request)
    {
        $child = $this->resolveChild($request);
        if (!$child instanceof Student) return $child;

        $month = $request->get('month', now()->month);
        $year  = $request->get('year', now()->year);

        $records = Attendance::where('student_id', $child->id)
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->orderBy('date')
            ->get();

        return response()->json([
            'child'   => ['id' => $child->id, 'name' => $child->name],
            'data'    => $records,
            'month'   => (int) $month,
            'year'    => (int) $year,
            'summary' => [
                'hadir' => $records->where('status', 'hadir')->count(),
                'sakit' => $records->where('status', 'sakit')->count(),
                'izin'  => $records->where('status', 'izin')->count(),
                'alpha' => $records->where('status', 'alpha')->count(),
            ],
        ]);
    }

    /** Catatan kedisiplinan & prestasi anak */
    public function points(Request $request)
    {
        $child = $this->resolveChild($request);
        if (!$child instanceof Student) return $child;

        $points = StudentPoint::with('category')
            ->where('student_id', $child->id)
            ->orderByDesc('date')
            ->get()
            ->map(fn ($p) => [
                'date'        => $p->date,
                'category'    => $p->category?->name,
                'type'        => $p->category?->type,
                'point_value' => $p->category?->point_value,
                'notes'       => $p->notes,
            ]);

        return response()->json([
            'child' => ['id' => $child->id, 'name' => $child->name],
            'data'  => $points,
        ]);
    }
}
