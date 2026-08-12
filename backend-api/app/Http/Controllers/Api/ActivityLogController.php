<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::with('causer')->latest();

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('description', 'like', '%'.$request->search.'%')
                  ->orWhere('log_name', 'like', '%'.$request->search.'%');
            });
        }

        if ($request->filled('causer_id')) {
            $query->where('causer_id', $request->causer_id);
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->date);
        }

        // Filter per modul, mis. "Grade" untuk melihat semua perubahan nilai
        if ($request->filled('subject_type')) {
            $query->where('subject_type', 'App\\Models\\'.$request->subject_type);
        }

        if ($request->filled('event')) {
            $query->where('event', $request->event);
        }

        // Sebelumnya hasilnya dipotong keras di 200 baris terbaru tanpa cara
        // melihat sisanya. Dengan 18 model yang kini tercatat, riwayat lama
        // akan tenggelam dalam hitungan hari kalau tidak dipaginasi.
        $logs = $query->paginate($request->per_page ?? 50);

        $logs->through(fn($log) => [
            'id'           => $log->id,
            'log_name'     => $log->log_name,
            'description'  => $log->description,
            'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
            'subject_id'   => $log->subject_id,
            'event'        => $log->event,
            'causer_name'  => $log->causer?->name ?? 'Sistem',
            'causer_id'    => $log->causer_id,
            'properties'   => $log->properties,
            'created_at'   => $log->created_at,
        ]);

        return response()->json($logs);
    }

    /** Daftar modul & jenis aksi yang ada di log, untuk mengisi dropdown filter */
    public function filters()
    {
        return response()->json([
            'subject_types' => Activity::query()
                ->whereNotNull('subject_type')
                ->distinct()
                ->pluck('subject_type')
                ->map(fn($t) => class_basename($t))
                ->unique()
                ->sort()
                ->values(),
            'events' => Activity::query()
                ->whereNotNull('event')
                ->distinct()
                ->pluck('event')
                ->sort()
                ->values(),
        ]);
    }
}
