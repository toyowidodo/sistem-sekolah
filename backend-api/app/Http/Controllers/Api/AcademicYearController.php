<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Grade;
use App\Models\Setting;
use App\Models\SppBill;
use App\Models\SppSetting;
use App\Models\StudentEnrollment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcademicYearController extends Controller
{
    public function index()
    {
        $years = AcademicYear::orderByDesc('name')->get()->map(fn ($y) => [
            'id'          => $y->id,
            'name'        => $y->name,
            'semester'    => $y->semester,
            'start_date'  => $y->start_date?->format('Y-m-d'),
            'end_date'    => $y->end_date?->format('Y-m-d'),
            'is_active'   => $y->is_active,
            'students'    => StudentEnrollment::where('academic_year', $y->name)->count(),
        ]);

        return response()->json(['data' => $years, 'active' => AcademicYear::activeName()]);
    }

    public function store(Request $request)
    {
        $v = $request->validate([
            'name'       => 'required|string|max:20|unique:academic_years,name',
            'semester'   => 'required|in:Ganjil,Genap',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
        ]);

        $year = AcademicYear::create($v);

        return response()->json(['message' => 'Tahun ajaran ditambahkan', 'data' => $year], 201);
    }

    public function update(Request $request, $id)
    {
        $year = AcademicYear::findOrFail($id);

        $v = $request->validate([
            'name'       => 'required|string|max:20|unique:academic_years,name,' . $id,
            'semester'   => 'required|in:Ganjil,Genap',
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date',
        ]);

        DB::transaction(function () use ($year, $v) {
            // Nama tahun ajaran dipakai sebagai kunci teks di beberapa tabel.
            // Kalau diganti tanpa ikut merapikan, data lama jadi yatim.
            if ($year->name !== $v['name']) {
                StudentEnrollment::where('academic_year', $year->name)->update(['academic_year' => $v['name']]);
                Grade::where('academic_year', $year->name)->update(['academic_year' => $v['name']]);
                SppBill::where('academic_year', $year->name)->update(['academic_year' => $v['name']]);
                SppSetting::where('academic_year', $year->name)->update(['academic_year' => $v['name']]);
            }

            $year->update($v);

            if ($year->is_active) {
                $this->syncSettings($year);
            }
        });

        return response()->json(['message' => 'Tahun ajaran diperbarui', 'data' => $year]);
    }

    public function destroy($id)
    {
        $year = AcademicYear::findOrFail($id);

        if ($year->is_active) {
            return response()->json(['message' => 'Tahun ajaran yang sedang aktif tidak bisa dihapus.'], 422);
        }

        $used = StudentEnrollment::where('academic_year', $year->name)->count();
        if ($used > 0) {
            return response()->json([
                'message' => "Tahun ajaran ini sudah dipakai oleh $used data siswa dan tidak bisa dihapus."
            ], 422);
        }

        $year->delete();

        return response()->json(['message' => 'Tahun ajaran dihapus']);
    }

    /** Menandai tahun ajaran yang sedang berjalan */
    public function setActive($id)
    {
        $year = AcademicYear::findOrFail($id);

        DB::transaction(function () use ($year) {
            AcademicYear::where('is_active', true)->update(['is_active' => false]);
            $year->update(['is_active' => true]);
            $this->syncSettings($year);
        });

        return response()->json([
            'message' => "Tahun ajaran {$year->name} ({$year->semester}) kini aktif.",
            'data'    => $year->fresh(),
        ]);
    }

    /**
     * Modul lama membaca tahun ajaran dari tabel settings. Nilainya ikut
     * disinkronkan supaya tidak ada dua sumber kebenaran yang berbeda.
     */
    private function syncSettings(AcademicYear $year): void
    {
        Setting::updateOrCreate(['key' => 'active_academic_year'], ['value' => $year->name]);
        Setting::updateOrCreate(['key' => 'active_semester'], ['value' => $year->semester]);
    }
}
