<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller {
    public function index() {
        return response()->json(['data' => Subject::orderBy('name')->get()]);
    }
    public function store(Request $request) {
        $v = $request->validate(['code'=>'required|string|unique:subjects,code','name'=>'required|string','description'=>'nullable|string','hours_per_week'=>'integer|min:1']);
        return response()->json(['message'=>'Mata pelajaran berhasil dibuat','data'=>Subject::create($v)], 201);
    }
    public function update(Request $request, $id) {
        $subj = Subject::findOrFail($id);
        $v = $request->validate(['code'=>'required|string|unique:subjects,code,'.$id,'name'=>'required|string','description'=>'nullable|string','hours_per_week'=>'integer|min:1']);
        $subj->update($v);
        return response()->json(['message'=>'Mata pelajaran diperbarui','data'=>$subj]);
    }
    public function destroy($id) {
        Subject::destroy($id);
        return response()->json(['message'=>'Mata pelajaran dihapus']);
    }
}
