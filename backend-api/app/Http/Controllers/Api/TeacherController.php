<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\TeacherStoreRequest;
use App\Services\TeacherService;
use App\Http\Resources\TeacherResource;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TeachersExport;
use App\Exports\TeacherTemplateExport;
use App\Imports\TeachersImport;
use App\Models\Teacher;

class TeacherController extends Controller
{
    private $teacherService;

    public function __construct(TeacherService $teacherService)
    {
        $this->teacherService = $teacherService;
    }

    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $teachers = $this->teacherService->getAll($request);
        return TeacherResource::collection($teachers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nip' => 'required|string|unique:teachers,nip',
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'education' => 'required|string|max:255',
            'phone' => 'required|string|max:15|regex:/^[0-9+\-\s()]*$/',
        ], [
            'nip.unique' => 'NIP sudah terdaftar',
            'phone.regex' => 'Format nomor telepon tidak valid',
        ]);

        $teacher = $this->teacherService->create($request);
        return response()->json([
            'message' => 'Guru berhasil ditambahkan', 
            'data' => new TeacherResource($teacher)
        ], 201);
    }

    public function show($id)
    {
        $teacher = Teacher::findOrFail($id);
        return new TeacherResource($teacher);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nip' => 'required|string|unique:teachers,nip,' . $id,
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'education' => 'required|string|max:255',
            'phone' => 'required|string|max:15|regex:/^[0-9+\-\s()]*$/',
        ]);

        $teacher = $this->teacherService->update($id, $request);
        return response()->json([
            'message' => 'Guru berhasil diperbarui', 
            'data' => new TeacherResource($teacher)
        ]);
    }

    public function destroy($id)
    {
        $this->teacherService->delete($id);
        return response()->json(['message' => 'Guru berhasil dihapus'], 200);
    }

    public function exportExcel()
    {
        return Excel::download(new TeachersExport, 'data-guru.xlsx');
    }

    public function downloadTemplate()
    {
        return Excel::download(new TeacherTemplateExport, 'template-import-guru.xlsx');
    }

    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:csv,xls,xlsx|max:5120'
        ], [
            'file.required' => 'File wajib diupload',
            'file.mimes' => 'File harus format CSV atau Excel',
            'file.max' => 'Ukuran file maksimal 5MB',
        ]);

        try {
            Excel::import(new TeachersImport, $request->file('file'));
            return response()->json(['message' => 'Data guru berhasil diimport'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengimport data: ' . $e->getMessage(),
                'code' => 'IMPORT_FAILED'
            ], 422);
        }
    }
}
