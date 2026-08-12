<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\LogsActivity;

class Attendance extends Model {
    use HasFactory, LogsActivity;

    /**
     * Sengaja hanya mencatat perubahan, bukan pembuatan. Absensi diinput massal
     * setiap hari untuk seluruh siswa — mencatat event 'created' akan membanjiri
     * activity log ribuan baris per hari tanpa nilai forensik.
     *
     * Yang penting justru kasus sengketa: absensi yang diubah setelah terlanjur
     * disimpan. Itu yang direkam di sini.
     */
    protected static $recordEvents = ['updated', 'deleted'];

    protected $fillable = ['student_id', 'date', 'status', 'notes'];
    protected $casts = ['date' => 'date'];

    public function student() {
        return $this->belongsTo(Student::class);
    }
}
