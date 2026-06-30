<?php

namespace App\Repositories;

use App\Models\Teacher;

class TeacherRepository implements TeacherRepositoryInterface {
    public function all() { return Teacher::all(); }
    
    public function paginate($perPage) { 
        return Teacher::latest()->paginate($perPage); 
    }
    
    public function find($id) { 
        return Teacher::findOrFail($id); 
    }
    
    public function create(array $data) { 
        return Teacher::create($data); 
    }
    
    public function update($id, array $data) {
        $teacher = $this->find($id);
        $teacher->update($data);
        return $teacher;
    }
    
    public function delete($id) { 
        return Teacher::destroy($id); 
    }
}