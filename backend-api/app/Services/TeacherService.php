<?php

namespace App\Services;

use App\Repositories\TeacherRepositoryInterface;
use Illuminate\Http\Request;

class TeacherService {
    private $teacherRepo;

    public function __construct(TeacherRepositoryInterface $teacherRepo) {
        $this->teacherRepo = $teacherRepo;
    }

    public function getAll(Request $request) {
        return $this->teacherRepo->paginate($request->per_page ?? 10);
    }

    public function create(Request $request) {
        $data = $request->validated();
        return $this->teacherRepo->create($data);
    }

    public function update($id, Request $request) {
        $data = $request->validated();
        return $this->teacherRepo->update($id, $data);
    }

    public function delete($id) {
        return $this->teacherRepo->delete($id);
    }
}