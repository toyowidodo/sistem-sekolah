<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $query = Announcement::with('author')
            ->orderBy('created_at', 'desc');
        
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }
        if ($request->has('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }
        
        $announcements = $query->paginate(20);
        return response()->json($announcements);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'content'      => 'required|string',
            'category'     => 'required|in:umum,akademik,kegiatan,darurat',
            'priority'     => 'required|in:normal,penting,urgent',
            'is_published' => 'boolean',
            'expires_at'   => 'nullable|date',
        ]);
        
        $validated['user_id'] = auth()->id();
        $validated['published_at'] = now();
        
        $announcement = Announcement::create($validated);
        return response()->json([
            'message' => 'Pengumuman berhasil dibuat',
            'data'    => $announcement->load('author')
        ], 201);
    }

    public function show($id)
    {
        $announcement = Announcement::with('author')->findOrFail($id);
        return response()->json(['data' => $announcement]);
    }

    public function update(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'content'      => 'required|string',
            'category'     => 'required|in:umum,akademik,kegiatan,darurat',
            'priority'     => 'required|in:normal,penting,urgent',
            'is_published' => 'boolean',
            'expires_at'   => 'nullable|date',
        ]);
        
        $announcement->update($validated);
        return response()->json([
            'message' => 'Pengumuman diperbarui',
            'data'    => $announcement->load('author')
        ]);
    }

    public function destroy($id)
    {
        Announcement::destroy($id);
        return response()->json(['message' => 'Pengumuman dihapus'], 200);
    }
}
