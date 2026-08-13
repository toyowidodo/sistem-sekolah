<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StudentStoreRequest;
use App\Services\StudentService;
use App\Http\Resources\StudentResource;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\StudentsExport;
use App\Exports\StudentTemplateExport;
use App\Imports\StudentsImport;
use App\Models\Student;

class StudentController extends Controller
{
    private $studentService;

    public function __construct(StudentService $studentService)
    {
        $this->studentService = $studentService;
    }

    public function index(Request $request)
    {
        $students = $this->studentService->getAll($request);
        return StudentResource::collection($students);
    }

    public function store(StudentStoreRequest $request)
    {
        $student = $this->studentService->create($request);
        return response()->json([
            'message' => 'Siswa berhasil ditambahkan', 
            'data' => new StudentResource($student)
        ], 201);
    }

    public function show($id)
    {
        $student = Student::with('classroom')->findOrFail($id);
        return new StudentResource($student);
    }

    public function update(StudentStoreRequest $request, $id)
    {
        $student = $this->studentService->update($id, $request);
        return response()->json([
            'message' => 'Siswa berhasil diperbarui', 
            'data' => new StudentResource($student)
        ]);
    }

    public function destroy($id)
    {
        $this->studentService->delete($id);
        return response()->json(['message' => 'Siswa berhasil dihapus'], 200);
    }

    public function exportExcel()
    {
        return Excel::download(new StudentsExport, 'data-siswa.xlsx');
    }

    public function downloadTemplate()
    {
        return Excel::download(new StudentTemplateExport, 'template-import-siswa.xlsx');
    }

    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,xls,xlsx'
        ]);

        try {
            $import = new StudentsImport;
            Excel::import($import, $request->file('file'));

            $message = 'Data siswa berhasil diimport.';
            if ($import->placed > 0) {
                $message .= " {$import->placed} siswa langsung ditempatkan ke kelas.";
            }
            // Salah ketik nama kelas tidak menggagalkan impor, tapi harus
            // diberitahukan — kalau tidak, siswanya diam-diam tidak berkelas
            if (!empty($import->unknownClassrooms)) {
                $message .= ' Nama kelas berikut tidak dikenali dan dilewati: '
                    . implode(', ', array_values($import->unknownClassrooms))
                    . '. Siswa tetap tersimpan tanpa kelas.';
            }

            return response()->json([
                'message'            => $message,
                'placed'             => $import->placed,
                'unknown_classrooms' => array_values($import->unknownClassrooms),
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengimport data: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Menempatkan banyak siswa ke satu kelas sekaligus.
     *
     * Tanpa ini, mengisi kelas untuk ratusan siswa harus lewat modal edit satu
     * per satu — penghalang utama yang membuat data kelas tidak pernah terisi.
     */
    public function bulkAssignClassroom(Request $request)
    {
        $v = $request->validate([
            'student_ids'   => 'required|array|min:1',
            'student_ids.*' => 'integer|exists:students,id',
            'classroom_id'  => 'nullable|exists:classrooms,id',
        ]);

        $year = \App\Models\AcademicYear::where('is_active', true)->value('name')
            ?? \App\Models\Setting::where('key', 'active_academic_year')->value('value');

        $affected = \Illuminate\Support\Facades\DB::transaction(function () use ($v, $year) {
            Student::whereIn('id', $v['student_ids'])
                ->update(['classroom_id' => $v['classroom_id'] ?? null]);

            // Riwayat kelas per tahun ajaran ikut diperbarui supaya rapor dan
            // rekap tahun berjalan tetap konsisten dengan penempatan baru
            if ($year && !empty($v['classroom_id'])) {
                foreach ($v['student_ids'] as $id) {
                    \App\Models\StudentEnrollment::updateOrCreate(
                        ['student_id' => $id, 'academic_year' => $year],
                        ['classroom_id' => $v['classroom_id'], 'status' => 'aktif']
                    );
                }
            }

            return count($v['student_ids']);
        });

        $name = $v['classroom_id']
            ? \App\Models\Classroom::whereKey($v['classroom_id'])->value('name')
            : null;

        return response()->json([
            'message' => $name
                ? "{$affected} siswa ditempatkan ke kelas {$name}."
                : "{$affected} siswa dikeluarkan dari kelasnya.",
            'affected' => $affected,
        ]);
    }
}