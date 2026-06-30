<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\AcademicEvent;
use Illuminate\Http\Request;

class AcademicEventController extends Controller
{
    public function index(Request $request)
    {
        $query = AcademicEvent::with('creator')->orderBy('start_date');

        if ($request->filled('month') && $request->filled('year')) {
            $query->where(function($q) use ($request) {
                $q->whereYear('start_date', $request->year)
                  ->whereMonth('start_date', $request->month);
            })->orWhere(function($q) use ($request) {
                $q->whereYear('end_date', $request->year)
                  ->whereMonth('end_date', $request->month);
            });
        } elseif ($request->filled('year')) {
            $query->where(function($q) use ($request) {
                $q->whereYear('start_date', $request->year)
                  ->orWhereYear('end_date', $request->year);
            });
        }

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request)
    {
        $v = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'category'    => 'required|in:akademik,ujian,libur,kegiatan,rapat,lainnya',
            'priority'    => 'required|in:normal,penting,urgent',
            'color'       => 'nullable|string|max:7',
            'is_holiday'  => 'boolean',
        ]);
        $v['created_by'] = auth()->id();
        if (empty($v['color'])) {
            $colors = ['akademik'=>'#6366f1','ujian'=>'#f59e0b','libur'=>'#ef4444','kegiatan'=>'#10b981','rapat'=>'#8b5cf6','lainnya'=>'#64748b'];
            $v['color'] = $colors[$v['category']] ?? '#6366f1';
        }
        $event = AcademicEvent::create($v);
        return response()->json(['message' => 'Event berhasil dibuat', 'data' => $event->load('creator')], 201);
    }

    public function update(Request $request, $id)
    {
        $event = AcademicEvent::findOrFail($id);
        $v = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'category'    => 'required|in:akademik,ujian,libur,kegiatan,rapat,lainnya',
            'priority'    => 'required|in:normal,penting,urgent',
            'color'       => 'nullable|string|max:7',
            'is_holiday'  => 'boolean',
        ]);
        $event->update($v);
        return response()->json(['message' => 'Event diperbarui', 'data' => $event->load('creator')]);
    }

    public function destroy($id)
    {
        AcademicEvent::destroy($id);
        return response()->json(['message' => 'Event dihapus']);
    }
}
