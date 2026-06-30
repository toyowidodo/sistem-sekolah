<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;

class ScheduleController extends Controller {
    public function index(Request $request) {
        $query = Schedule::with(['classroom','subject','teacher']);
        if ($request->classroom_id) $query->where('classroom_id', $request->classroom_id);
        if ($request->day) $query->where('day', $request->day);
        $schedules = $query->orderByRaw("FIELD(day,'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu')")->orderBy('start_time')->get();
        return response()->json(['data' => $schedules]);
    }
    public function store(Request $request) {
        $v = $request->validate(['classroom_id'=>'required|exists:classrooms,id','subject_id'=>'required|exists:subjects,id','teacher_id'=>'nullable|exists:teachers,id','day'=>'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu','start_time'=>'required','end_time'=>'required|after:start_time','room'=>'nullable|string']);
        return response()->json(['message'=>'Jadwal berhasil ditambahkan','data'=>Schedule::create($v)->load(['classroom','subject','teacher'])], 201);
    }
    public function update(Request $request, $id) {
        $sch = Schedule::findOrFail($id);
        $v = $request->validate(['classroom_id'=>'required|exists:classrooms,id','subject_id'=>'required|exists:subjects,id','teacher_id'=>'nullable|exists:teachers,id','day'=>'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu','start_time'=>'required','end_time'=>'required','room'=>'nullable|string']);
        $sch->update($v);
        return response()->json(['message'=>'Jadwal diperbarui','data'=>$sch->load(['classroom','subject','teacher'])]);
    }
    public function destroy($id) {
        Schedule::destroy($id);
        return response()->json(['message'=>'Jadwal dihapus']);
    }
}
