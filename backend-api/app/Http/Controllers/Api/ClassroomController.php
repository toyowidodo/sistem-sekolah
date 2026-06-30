<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Classroom;
use Illuminate\Http\Request;

class ClassroomController extends Controller {
    public function index() {
        return response()->json(['data' => Classroom::with('homeroomTeacher')->orderBy('grade_level')->orderBy('name')->get()]);
    }
    public function store(Request $request) {
        $v = $request->validate(['name'=>'required|string','grade_level'=>'required|string','major'=>'nullable|string','homeroom_teacher_id'=>'nullable|exists:teachers,id','capacity'=>'integer|min:1']);
        return response()->json(['message'=>'Kelas berhasil dibuat','data'=>Classroom::create($v)->load('homeroomTeacher')], 201);
    }
    public function update(Request $request, $id) {
        $cls = Classroom::findOrFail($id);
        $v = $request->validate(['name'=>'required|string','grade_level'=>'required|string','major'=>'nullable|string','homeroom_teacher_id'=>'nullable|exists:teachers,id','capacity'=>'integer|min:1']);
        $cls->update($v);
        return response()->json(['message'=>'Kelas diperbarui','data'=>$cls->load('homeroomTeacher')]);
    }
    public function destroy($id) {
        Classroom::destroy($id);
        return response()->json(['message'=>'Kelas dihapus']);
    }
}
