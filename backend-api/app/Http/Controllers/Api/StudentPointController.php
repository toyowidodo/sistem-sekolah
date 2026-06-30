<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\StudentPoint;
use App\Models\Student;
use Illuminate\Support\Facades\Auth;

class StudentPointController extends Controller
{
    public function index()
    {
        // Get all points with relationships
        $points = StudentPoint::with(['student', 'category', 'recorder'])->orderBy('date', 'desc')->get();
        return response()->json(['data' => $points]);
    }

    public function summary()
    {
        // Get total violations and achievements per student
        $students = Student::with(['points.category'])->get()->map(function($student) {
            $pelanggaran = 0;
            $prestasi = 0;
            
            foreach($student->points as $point) {
                if ($point->category->type === 'pelanggaran') {
                    $pelanggaran += $point->category->point_value;
                } else if ($point->category->type === 'prestasi') {
                    $prestasi += $point->category->point_value;
                }
            }
            
            return [
                'id' => $student->id,
                'nisn' => $student->nisn,
                'name' => $student->name,
                'total_pelanggaran' => $pelanggaran,
                'total_prestasi' => $prestasi
            ];
        });
        
        return response()->json(['data' => $students]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'point_category_id' => 'required|exists:point_categories,id',
            'date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $validated['recorded_by'] = Auth::id();

        $point = StudentPoint::create($validated);
        return response()->json(['message' => 'Poin berhasil dicatat.', 'data' => $point], 201);
    }

    public function destroy($id)
    {
        $point = StudentPoint::findOrFail($id);
        $point->delete();
        return response()->json(['message' => 'Catatan poin berhasil dihapus.']);
    }
}
