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
        $student = Student::findOrFail($id);
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
            Excel::import(new StudentsImport, $request->file('file'));
            return response()->json(['message' => 'Data siswa berhasil diimport'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengimport data: ' . $e->getMessage()], 500);
        }
    }
}