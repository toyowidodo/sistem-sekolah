<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'nisn', 'name', 'gender', 'religion', 'previous_school', 
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