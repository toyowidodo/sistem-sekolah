<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificationLog;
use App\Models\NotificationTemplate;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /** Placeholder yang tersedia per template, ditampilkan sebagai bantuan di UI */
    private const PLACEHOLDERS = [
        'siswa_alpha'     => ['nama_ortu', 'nama_siswa', 'kelas', 'tanggal', 'nama_sekolah'],
        'spp_jatuh_tempo' => ['nama_ortu', 'nama_siswa', 'kelas', 'jumlah_bulan', 'total', 'nama_sekolah'],
    ];

    public function templates()
    {
        $templates = NotificationTemplate::orderBy('name')->get()->map(fn ($t) => [
            'id'           => $t->id,
            'key'          => $t->key,
            'name'         => $t->name,
            'body'         => $t->body,
            'is_active'    => $t->is_active,
            'placeholders' => self::PLACEHOLDERS[$t->key] ?? [],
        ]);

        return response()->json([
            'data'   => $templates,
            'driver' => config('notification.driver'),
            // Supaya admin sadar sistem belum benar-benar mengirim apa pun
            'gateway_configured' => !empty(config('notification.http.url')),
            'redirect_all_to'    => config('notification.redirect_all_to'),
        ]);
    }

    public function updateTemplate(Request $request, $id)
    {
        $template = NotificationTemplate::findOrFail($id);

        $v = $request->validate([
            'name'      => 'required|string|max:255',
            'body'      => 'required|string|max:2000',
            'is_active' => 'boolean',
        ]);

        $template->update($v);

        return response()->json(['message' => 'Template diperbarui', 'data' => $template]);
    }

    public function logs(Request $request)
    {
        $logs = NotificationLog::with('student:id,name')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->status))
            ->when($request->filled('template_key'), fn ($q) => $q->where('template_key', $request->template_key))
            ->latest()
            ->paginate($request->per_page ?? 25);

        return response()->json($logs);
    }

    /**
     * Kirim uji coba ke satu nomor. Berguna untuk memastikan kredensial gateway
     * benar sebelum menjalankan pengiriman massal ke orang tua.
     */
    public function test(Request $request, NotificationService $notifier)
    {
        $v = $request->validate([
            'phone'   => 'required|string|max:25',
            'message' => 'required|string|max:1000',
        ]);

        $log = $notifier->send($v['phone'], $v['message'], ['recipient_name' => 'Uji Coba']);

        return response()->json([
            'message' => match ($log->status) {
                'terkirim' => 'Pesan berhasil dikirim ke gateway.',
                'dilewati' => 'Pesan tidak dikirim: ' . $log->error,
                default    => 'Pengiriman gagal: ' . $log->error,
            },
            'data' => $log,
        ]);
    }
}
