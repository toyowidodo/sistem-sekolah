<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\SppSetting;
use App\Models\SppBill;
use App\Models\Student;
use Illuminate\Http\Request;

class SppController extends Controller
{
    /* ── Settings ── */
    public function getSettings()
    {
        return response()->json(['data' => SppSetting::orderBy('grade_level')->get()]);
    }

    public function saveSettings(Request $request)
    {
        $request->validate([
            'settings'               => 'required|array',
            'settings.*.grade_level' => 'required|string',
            'settings.*.amount'      => 'required|numeric|min:0',
            'settings.*.academic_year' => 'required|string',
        ]);
        foreach ($request->settings as $s) {
            SppSetting::updateOrCreate(
                ['grade_level' => $s['grade_level'], 'academic_year' => $s['academic_year']],
                ['amount' => $s['amount'], 'notes' => $s['notes'] ?? null]
            );
        }
        return response()->json(['message' => 'Pengaturan SPP disimpan']);
    }

    /* ── Generate bills for a month ── */
    public function generate(Request $request)
    {
        $request->validate([
            'month'         => 'required|integer|between:1,12',
            'year'          => 'required|integer',
            'academic_year' => 'required|string',
        ]);

        $students = Student::where('is_active', true)->get();
        $generated = 0;
        $skipped   = 0;

        foreach ($students as $student) {
            // Cari setting nominal berdasarkan grade_level siswa
            $gradeLevel = strtoupper(trim(explode(' ', $student->grade ?? 'X')[0]));
            $setting = SppSetting::where('grade_level', $gradeLevel)
                ->where('academic_year', $request->academic_year)
                ->first();

            $amount = $setting?->amount ?? 0;

            $exists = SppBill::where('student_id', $student->id)
                ->where('month', $request->month)
                ->where('year', $request->year)
                ->exists();

            if ($exists) { $skipped++; continue; }

            SppBill::create([
                'student_id'    => $student->id,
                'month'         => $request->month,
                'year'          => $request->year,
                'academic_year' => $request->academic_year,
                'amount'        => $amount,
                'status'        => 'belum',
            ]);
            $generated++;
        }

        return response()->json([
            'message'   => "Berhasil membuat $generated tagihan. $skipped dilewati (sudah ada).",
            'generated' => $generated,
            'skipped'   => $skipped,
        ]);
    }

    /* ── List bills ── */
    public function bills(Request $request)
    {
        $query = SppBill::with('student')->latest();

        if ($request->filled('month'))  $query->where('month', $request->month);
        if ($request->filled('year'))   $query->where('year',  $request->year);
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('search')) {
            $query->whereHas('student', fn($q) =>
                $q->where('name', 'like', '%'.$request->search.'%')
                  ->orWhere('nisn', 'like', '%'.$request->search.'%')
            );
        }

        $bills = $query->get()->map(fn($b) => [
            'id'            => $b->id,
            'student_id'    => $b->student_id,
            'student_name'  => $b->student?->name,
            'nisn'          => $b->student?->nisn,
            'month'         => $b->month,
            'year'          => $b->year,
            'academic_year' => $b->academic_year,
            'amount'        => $b->amount,
            'status'        => $b->status,
            'paid_at'       => $b->paid_at,
            'paid_by'       => $b->paid_by,
            'notes'         => $b->notes,
        ]);

        // Summary stats
        $all    = SppBill::when($request->month, fn($q) => $q->where('month', $request->month))
                          ->when($request->year,  fn($q) => $q->where('year', $request->year));
        $total  = $all->count();
        $lunas  = (clone $all)->where('status', 'lunas')->count();
        $belum  = $total - $lunas;
        $totalNominal = $all->sum('amount');
        $lunasNominal = (clone SppBill::when($request->month, fn($q) => $q->where('month', $request->month))
                          ->when($request->year,  fn($q) => $q->where('year', $request->year)))
                          ->where('status','lunas')->sum('amount');

        return response()->json([
            'data'    => $bills,
            'summary' => compact('total','lunas','belum','totalNominal','lunasNominal'),
        ]);
    }

    /* ── Pay a bill ── */
    public function pay(Request $request, $id)
    {
        $request->validate(['paid_by' => 'nullable|string']);
        $bill = SppBill::findOrFail($id);
        $bill->update([
            'status'  => 'lunas',
            'paid_at' => now(),
            'paid_by' => $request->paid_by ?? auth()->user()->name,
            'notes'   => $request->notes ?? $bill->notes,
        ]);
        return response()->json(['message' => 'Tagihan berhasil dilunasi', 'data' => $bill->load('student')]);
    }

    /* ── Unpay (batalkan) ── */
    public function unpay($id)
    {
        $bill = SppBill::findOrFail($id);
        $bill->update(['status' => 'belum', 'paid_at' => null, 'paid_by' => null]);
        return response()->json(['message' => 'Status tagihan direset']);
    }

    /* ── Rekap per bulan ── */
    public function recap(Request $request)
    {
        $year = $request->year ?? now()->year;
        $data = [];
        for ($m = 1; $m <= 12; $m++) {
            $bills = SppBill::where('month', $m)->where('year', $year);
            $total = $bills->count();
            $lunas = (clone $bills)->where('status','lunas')->count();
            $data[] = [
                'month'        => $m,
                'total'        => $total,
                'lunas'        => $lunas,
                'belum'        => $total - $lunas,
                'persen_lunas' => $total > 0 ? round($lunas / $total * 100) : 0,
                'nominal_lunas'=> (clone $bills)->where('status','lunas')->sum('amount'),
                'nominal_total'=> $bills->sum('amount'),
            ];
        }
        return response()->json(['data' => $data, 'year' => $year]);
    }
}
