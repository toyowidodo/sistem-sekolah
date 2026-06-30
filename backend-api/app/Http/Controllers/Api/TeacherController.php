<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\TeacherStoreRequest;
use App\Services\TeacherService;
use App\Http\Resources\TeacherResource;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
    private $teacherService;

    public function __construct(TeacherService $teacherService)
    {
        $this->teacherService = $teacherService;
        // Pengamanan sudah ditangani di routes/api.php
    }

    public function index(Request $request)
    {
        $teachers = $this->teacherService->getAll($request);
        return TeacherResource::collection($teachers);
    }

    public function store(TeacherStoreRequest $request)
    {
        $teacher = $this->teacherService->create($request);
        return response()->json([
            'message' => 'Guru berhasil ditambahkan', 
            'data' => new TeacherResource($teacher)
        ], 201);
    }

    public function show($id)
    {
        $teacher = $this->teacherService->getAll(request())->find($id) ?? abort(404);
        return new TeacherResource($teacher);
    }

    public function update(TeacherStoreRequest $request, $id)
    {
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
}