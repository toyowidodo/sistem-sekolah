<?php

namespace App\Services;

use App\Models\Teacher;
use Illuminate\Support\Facades\Auth;

/**
 * Menentukan sejauh mana seorang user boleh melihat/mengubah data akademik.
 *
 * Admin sekolah bebas ke seluruh data. User yang terhubung ke sebuah data guru
 * dibatasi ke kelas yang dia ampu (lewat jadwal) atau dia walikan.
 */
class TeachingScope
{
    /** Guru yang terhubung ke user aktif, null kalau bukan guru */
    public static function currentTeacher(): ?Teacher
    {
        $user = Auth::user();
        if (!$user || $user->isSchoolAdmin()) {
            return null;
        }

        return $user->teacher;
    }

    /** Apakah akses user aktif perlu dibatasi */
    public static function isRestricted(): bool
    {
        return static::currentTeacher() !== null;
    }

    /** ID kelas yang boleh diakses; null berarti tidak dibatasi */
    public static function allowedClassroomIds(): ?array
    {
        $teacher = static::currentTeacher();

        return $teacher ? $teacher->accessibleClassroomIds() : null;
    }

    /** Batasi query yang punya kolom classroom_id */
    public static function applyToQuery($query, string $column = 'classroom_id')
    {
        $allowed = static::allowedClassroomIds();

        if ($allowed !== null) {
            $query->whereIn($column, $allowed ?: [0]);
        }

        return $query;
    }

    /** Boleh melihat data sebuah kelas (mengajar di sana atau jadi walinya) */
    public static function canAccessClassroom($classroomId): bool
    {
        $allowed = static::allowedClassroomIds();

        return $allowed === null || in_array((int) $classroomId, array_map('intval', $allowed), true);
    }

    /** Boleh mengubah nilai mapel tertentu di kelas tertentu */
    public static function canManageGrades($classroomId, $subjectId): bool
    {
        $teacher = static::currentTeacher();

        if (!$teacher) {
            return true;
        }

        return $teacher->teaches($classroomId, $subjectId);
    }
}
