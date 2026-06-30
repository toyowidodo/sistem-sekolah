<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Classroom;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    // GET /api/grades?classroom_id=&subject_id=&semester=&academic_year=
    public function index(Request $request)
    {
        $classroomId  = $request->classroom_id;
        $subjectId    = $request->subject_id;
        $semester     = $request->semester ?? 1;
        $academicYear = $request->academic_year ?? date('Y').'/'.((int)date('Y')+1);

        // Ambil semua siswa aktif di kelas ini
        $students = Student::where('is_active', true)->orderBy('name')->get();

        // Ambil nilai yang sudah ada
        $query = Grade::with(['student','subject'])
            ->where('semester', $semester)
            ->where('academic_year', $academicYear);

        if ($classroomId) $query->where('classroom_id', $classroomId);
        if ($subjectId)   $query->where('subject_id', $subjectId);

        $grades = $query->get()->keyBy(fn($g) => $g->student_id.'_'.$g->subject_id);

        $result = $students->map(function ($student) use ($grades, $subjectId, $classroomId, $semester, $academicYear) {
            $key = $student->id.'_'.$subjectId;
            $g = $grades->get($key);
            return [
                'student_id'    => $student->id,
                'student_name'  => $student->name,
                'nisn'          => $student->nisn,
                'grade_id'      => $g?->id,
                'score_tugas'   => $g?->score_tugas,
                'score_uts'     => $g?->score_uts,
                'score_uas'     => $g?->score_uas,
                'final_score'   => $g?->final_score,
                'grade_letter'  => $g?->grade_letter ?? '-',
                'notes'         => $g?->notes ?? '',
            ];
        });

        return response()->json([
            'data'          => $result,
            'semester'      => $semester,
            'academic_year' => $academicYear,
        ]);
    }

    // POST /api/grades/bulk
    public function storeBulk(Request $request)
    {
        $request->validate([
            'classroom_id'  => 'required|exists:classrooms,id',
            'subject_id'    => 'required|exists:subjects,id',
            'semester'      => 'required|integer|in:1,2',
            'academic_year' => 'required|string',
            'grades'        => 'required|array',
            'grades.*.student_id' => 'required|exists:students,id',
        ]);

        $saved = 0;
        foreach ($request->grades as $item) {
            $tugas = isset($item['score_tugas']) && $item['score_tugas'] !== '' ? (float)$item['score_tugas'] : null;
            $uts   = isset($item['score_uts'])   && $item['score_uts']   !== '' ? (float)$item['score_uts']   : null;
            $uas   = isset($item['score_uas'])   && $item['score_uas']   !== '' ? (float)$item['score_uas']   : null;

            $final  = Grade::computeFinal($tugas, $uts, $uas);
            $letter = Grade::letterGrade($final);

            Grade::updateOrCreate(
                [
                    'student_id'    => $item['student_id'],
                    'subject_id'    => $request->subject_id,
                    'classroom_id'  => $request->classroom_id,
                    'academic_year' => $request->academic_year,
                    'semester'      => $request->semester,
                ],
                [
                    'score_tugas'  => $tugas,
                    'score_uts'    => $uts,
                    'score_uas'    => $uas,
                    'final_score'  => $final,
                    'grade_letter' => $letter,
                    'notes'        => $item['notes'] ?? null,
                ]
            );
            $saved++;
        }

        return response()->json(['message' => "Nilai berhasil disimpan untuk $saved siswa.", 'saved' => $saved]);
    }

    // GET /api/grades/report?student_id=&academic_year=&semester=&classroom_id=
    public function report(Request $request)
    {
        $request->validate(['student_id'=>'required|exists:students,id']);

        $semester     = $request->semester ?? 1;
        $academicYear = $request->academic_year ?? date('Y').'/'.((int)date('Y')+1);

        $student = Student::findOrFail($request->student_id);
        $grades = Grade::with(['subject','classroom'])
            ->where('student_id', $request->student_id)
            ->where('semester', $semester)
            ->where('academic_year', $academicYear)
            ->get();

        $average = $grades->whereNotNull('final_score')->avg('final_score');

        return response()->json([
            'student'       => $student,
            'grades'        => $grades,
            'semester'      => $semester,
            'academic_year' => $academicYear,
            'average'       => $average ? round($average, 1) : null,
            'grade_letter'  => Grade::letterGrade($average),
        ]);
    }

    // GET /api/grades/recap?classroom_id=&semester=&academic_year=
    public function recap(Request $request)
    {
        $semester     = $request->semester ?? 1;
        $academicYear = $request->academic_year ?? date('Y').'/'.((int)date('Y')+1);

        $grades = Grade::with(['student','subject'])
            ->where('semester', $semester)
            ->where('academic_year', $academicYear);

        if ($request->classroom_id) $grades->where('classroom_id', $request->classroom_id);

        $data = $grades->get()
            ->groupBy('student_id')
            ->map(function ($studentGrades) {
                $avg = $studentGrades->whereNotNull('final_score')->avg('final_score');
                return [
                    'student_id'   => $studentGrades->first()->student_id,
                    'student_name' => $studentGrades->first()->student->name,
                    'nisn'         => $studentGrades->first()->student->nisn,
                    'subjects'     => $studentGrades->map(fn($g) => [
                        'subject'      => $g->subject->name,
                        'final_score'  => $g->final_score,
                        'grade_letter' => $g->grade_letter,
                    ])->values(),
                    'average'      => $avg ? round($avg, 1) : null,
                    'grade_letter' => Grade::letterGrade($avg),
                ];
            })->values()
            ->sortByDesc('average')
            ->values()
            ->map(function ($item, $index) {
                $item['rank'] = $index + 1;
                return $item;
            });

        return response()->json(['data' => $data, 'semester' => $semester, 'academic_year' => $academicYear]);
    }
}
