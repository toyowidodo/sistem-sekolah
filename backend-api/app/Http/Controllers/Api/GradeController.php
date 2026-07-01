<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Classroom;
use App\Models\Schedule;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    /**
     * GET /api/grades?classroom_id=&subject_id=&semester=&academic_year=
     * Get grades for a specific classroom and subject
     */
    public function index(Request $request)
    {
        $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'subject_id' => 'required|exists:subjects,id',
            'semester' => 'nullable|integer|in:1,2',
            'academic_year' => 'nullable|string',
        ]);

        $classroomId  = $request->classroom_id;
        $subjectId    = $request->subject_id;
        $semester     = $request->semester ?? 1;
        $academicYear = $request->academic_year ?? date('Y').'/'.((int)date('Y')+1);

        // Ambil semua siswa aktif di kelas ini (FILTERED BY CLASSROOM)
        $students = Student::where('is_active', true)
            ->where('classroom_id', $classroomId)
            ->orderBy('name')
            ->get();

        // Ambil nilai yang sudah ada
        $query = Grade::with(['student','subject'])
            ->where('semester', $semester)
            ->where('academic_year', $academicYear)
            ->where('classroom_id', $classroomId);

        if ($subjectId) $query->where('subject_id', $subjectId);

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

    /**
     * POST /api/grades/bulk
     * Store multiple grades at once
     */
    public function storeBulk(Request $request)
    {
        $request->validate([
            'classroom_id'  => 'required|exists:classrooms,id',
            'subject_id'    => 'required|exists:subjects,id',
            'semester'      => 'required|integer|in:1,2',
            'academic_year' => 'required|string',
            'grades'        => 'required|array',
            'grades.*.student_id' => 'required|exists:students,id',
            'grades.*.score_tugas' => 'nullable|numeric|min:0|max:100',
            'grades.*.score_uts' => 'nullable|numeric|min:0|max:100',
            'grades.*.score_uas' => 'nullable|numeric|min:0|max:100',
        ], [
            'grades.*.score_tugas.max' => 'Nilai tugas tidak boleh melebihi 100',
            'grades.*.score_uts.max' => 'Nilai UTS tidak boleh melebihi 100',
            'grades.*.score_uas.max' => 'Nilai UAS tidak boleh melebihi 100',
            'grades.*.score_tugas.min' => 'Nilai tugas tidak boleh kurang dari 0',
            'grades.*.score_uts.min' => 'Nilai UTS tidak boleh kurang dari 0',
            'grades.*.score_uas.min' => 'Nilai UAS tidak boleh kurang dari 0',
        ]);

        // Verify all students belong to the specified classroom
        $studentIds = collect($request->grades)->pluck('student_id')->toArray();
        $validStudents = Student::whereIn('id', $studentIds)
            ->where('classroom_id', $request->classroom_id)
            ->count();

        if ($validStudents !== count($studentIds)) {
            return response()->json([
                'message' => 'Beberapa siswa tidak termasuk dalam kelas ini',
                'code' => 'INVALID_STUDENTS'
            ], 422);
        }

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

        return response()->json([
            'message' => "Nilai berhasil disimpan untuk $saved siswa.",
            'saved' => $saved
        ], 200);
    }

    /**
     * GET /api/grades/report?student_id=&academic_year=&semester=
     * Get grade report for a student
     */
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

    /**
     * GET /api/grades/recap?classroom_id=&semester=&academic_year=
     * Get grade recap/summary for a classroom
     */
    public function recap(Request $request)
    {
        $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'semester' => 'nullable|integer|in:1,2',
            'academic_year' => 'nullable|string',
        ]);

        $semester     = $request->semester ?? 1;
        $academicYear = $request->academic_year ?? date('Y').'/'.((int)date('Y')+1);

        $grades = Grade::with(['student','subject'])
            ->where('semester', $semester)
            ->where('academic_year', $academicYear)
            ->where('classroom_id', $request->classroom_id);

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

        return response()->json([
            'data' => $data,
            'semester' => $semester,
            'academic_year' => $academicYear
        ]);
    }
}
