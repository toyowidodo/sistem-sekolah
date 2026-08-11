<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'start_date', 'end_date', 'semester', 'is_active'];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
        'is_active'  => 'boolean',
    ];

    public function enrollments()
    {
        return $this->hasMany(StudentEnrollment::class, 'academic_year', 'name');
    }

    /** Tahun ajaran yang sedang berjalan */
    public static function active(): ?self
    {
        return static::where('is_active', true)->first();
    }

    /**
     * Nama tahun ajaran aktif. Fallback ke pola tahun berjalan supaya modul lama
     * yang mengetik tahun ajaran sebagai teks tetap berfungsi.
     */
    public static function activeName(): string
    {
        return static::active()?->name ?? date('Y') . '/' . ((int) date('Y') + 1);
    }
}
