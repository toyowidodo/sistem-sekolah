<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class MaintenanceController extends Controller
{
    public function clearCache()
    {
        try {
            Artisan::call('optimize:clear');
            return response()->json([
                'message' => 'Semua cache (route, config, view) berhasil dibersihkan.'
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal membersihkan cache: ' . $e->getMessage());
            return response()->json([
                'message' => 'Terjadi kesalahan saat membersihkan cache.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
