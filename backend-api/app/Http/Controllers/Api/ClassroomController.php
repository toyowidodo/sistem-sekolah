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

    /**
     * Membuat banyak kelas sekaligus dari kombinasi tingkat x rombel.
     *
     * Membuat kelas satu per satu lewat modal jadi penghalang nyata: satu SD
     * butuh belasan kelas (1A sampai 6B), dan selama kelasnya belum ada, siswa
     * tidak bisa ditempatkan sehingga absensi dan nilai ikut tertahan.
     *
     * Idempoten — nama yang sudah ada dilewati, bukan digandakan atau ditolak,
     * supaya aman dijalankan ulang untuk menambah rombel baru.
     */
    public function generate(Request $request) {
        $v = $request->validate([
            'grade_levels'   => 'required|array|min:1|max:20',
            'grade_levels.*' => 'required|string|max:10',
            'rombel'         => 'required|array|min:1|max:12',
            'rombel.*'       => 'required|string|max:5',
            'major'          => 'nullable|string|max:50',
            'capacity'       => 'nullable|integer|min:1|max:100',
        ]);

        $existing = Classroom::pluck('name')
            ->mapWithKeys(fn ($n) => [mb_strtolower(trim($n)) => true])
            ->all();

        $dibuat = [];
        $dilewati = [];

        foreach ($v['grade_levels'] as $level) {
            foreach ($v['rombel'] as $rombel) {
                $level  = trim($level);
                $rombel = trim($rombel);
                $name   = $level . $rombel;

                if (isset($existing[mb_strtolower($name)])) {
                    $dilewati[] = $name;
                    continue;
                }

                Classroom::create([
                    'name'        => $name,
                    'grade_level' => $level,
                    'major'       => $v['major'] ?? null,
                    'capacity'    => $v['capacity'] ?? 30,
                ]);

                // Cegah duplikat dalam satu permintaan, mis. rombel dikirim ganda
                $existing[mb_strtolower($name)] = true;
                $dibuat[] = $name;
            }
        }

        $pesan = count($dibuat) . ' kelas dibuat';
        if ($dilewati) {
            $pesan .= ', ' . count($dilewati) . ' dilewati karena sudah ada (' . implode(', ', $dilewati) . ')';
        }

        return response()->json([
            'message'  => $pesan . '.',
            'created'  => $dibuat,
            'skipped'  => $dilewati,
            'data'     => Classroom::with('homeroomTeacher')->orderBy('grade_level')->orderBy('name')->get(),
        ], 201);
    }
}
