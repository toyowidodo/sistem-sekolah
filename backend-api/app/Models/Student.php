<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class Student extends Model
{
    use HasFactory, LogsActivity;
    
    protected $fillable = [
        'nisn', 'name', 'gender', 'religion', 'previous_school', 'classroom_id',
        'birth_place', 'birth_date', 'address', 'phone', 'photo', 'is_active',
        'father_name', 'mother_name', 'father_job', 'mother_job',
        'parent_address_street', 'parent_address_village', 'parent_address_district', 
        'parent_address_city', 'parent_address_province',
        'guardian_name', 'guardian_job', 'guardian_address'
    ];

    protected $casts = [
        'birth_date' => 'date',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function classroom()
    {
        return $this->belongsTo(Classroom::class);
    }

    /** Riwayat kelas siswa per tahun ajaran */
    public function enrollments()
    {
        return $this->hasMany(StudentEnrollment::class);
    }

    /** Akun orang tua / wali yang memantau siswa ini */
    public function guardians()
    {
        return $this->belongsToMany(User::class, 'student_guardians')
            ->withPivot('relation', 'phone')
            ->withTimestamps();
    }

    /**
     * Kelas siswa pada tahun ajaran tertentu. Dipakai laporan historis supaya
     * rapor tahun lalu tetap menunjuk kelas yang benar, bukan kelas sekarang.
     */
    public function classroomForYear(string $academicYear): ?Classroom
    {
        $enrollment = $this->enrollments()
            ->where('academic_year', $academicYear)
            ->first();

        return $enrollment?->classroom ?? $this->classroom;
    }

    public function points()
    {
        return $this->hasMany(StudentPoint::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::created(function ($student) {
            // Auto create user account for the student
            if (!$student->user_id) {
                $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Siswa', 'guard_name' => 'web']);
                $email = $student->nisn . '@siswa.com';
                
                $user = User::firstOrCreate(
                    ['email' => $email],
                    [
                        'name' => $student->name,
                        'password' => \Illuminate\Support\Facades\Hash::make($student->nisn),
                    ]
                );
                
                $user->assignRole($role);

                // Update student with user_id
                $student->user_id = $user->id;
                $student->saveQuietly(); // avoid triggering updated event
            }
        });
    }
}