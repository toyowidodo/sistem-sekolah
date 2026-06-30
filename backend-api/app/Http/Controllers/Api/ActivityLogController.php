<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::with('causer')
            ->latest()
            ->limit(200);

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

        $logs = $query->get()->map(function($log) {
            return [
                'id'           => $log->id,
                'log_name'     => $log->log_name,
                'description'  => $log->description,
                'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
                'subject_id'   => $log->subject_id,
                'event'        => $log->event,
                'causer_name'  => $log->causer?->name ?? 'System',
                'causer_id'    => $log->causer_id,
                'properties'   => $log->properties,
                'created_at'   => $log->created_at,
            ];
        });

        return response()->json(['data' => $logs, 'total' => $logs->count()]);
    }
}
