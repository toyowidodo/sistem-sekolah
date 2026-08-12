<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles, HasApiTokens, \App\Traits\LogsActivity;

    /**
     * Password & token tidak pernah masuk log (sudah dijamin di trait), tapi
     * kolom teknis ini juga tidak perlu memenuhi riwayat audit.
     */
    protected array $activitylogExcept = ['email_verified_at', 'updated_at'];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class);
    }

    public function student()
    {
        return $this->hasOne(Student::class);
    }

    /** Anak-anak yang diikuti akun ini (untuk role Orang Tua) */
    public function children()
    {
        return $this->belongsToMany(Student::class, 'student_guardians')
            ->withPivot('relation', 'phone')
            ->withTimestamps();
    }

    /**
     * Admin melihat seluruh data sekolah; guru dibatasi ke kelas & mapel yang
     * diampu atau diwalikan.
     */
    public function isSchoolAdmin(): bool
    {
        return $this->hasAnyRole(['Superadmin', 'Admin Sekolah']);
    }
}
