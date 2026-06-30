<?php

namespace App\Repositories;

use App\Models\Student;

class StudentRepository implements StudentRepositoryInterface {
    public function all() { return Student::all(); }
    
    public function paginate($perPage) { 
        return Student::latest()->paginate($perPage); 
    }
    
    public function find($id) { 
        return Student::findOrFail($id); 
    }
    
    public function create(array $data) { 
        return Student::create($data); 
    }
    
    public function update($id, array $data) {
        $student = $this->find($id);
        $student->update($data);
        return $student;
    }
    
    public function delete($id) { 
        return Student::destroy($id); 
    }
}