<?php

namespace App\Services;

use App\Repositories\StudentRepositoryInterface;
use Illuminate\Http\Request;

class StudentService {
    private $studentRepo;

    public function __construct(StudentRepositoryInterface $studentRepo) {
        $this->studentRepo = $studentRepo;
    }

    public function getAll(Request $request) {
        return $this->studentRepo->paginate($request->per_page ?? 10);
    }

    public function create(Request $request) {
        $data = $request->validated();
        return $this->studentRepo->create($data);
    }

    public function update($id, Request $request) {
        $data = $request->validated();
        return $this->studentRepo->update($id, $data);
    }

    public function delete($id) {
        return $this->studentRepo->delete($id);
    }
}