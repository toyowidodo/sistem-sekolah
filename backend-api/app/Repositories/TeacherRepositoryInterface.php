<?php

namespace App\Repositories;

interface TeacherRepositoryInterface {
    public function all();
    public function paginate($perPage);
    public function find($id);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);
}