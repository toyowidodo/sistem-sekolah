<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ValidateFileUpload
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        if ($request->hasFile('file')) {
            $file = $request->file('file');

            // Check file size (max 5MB)
            if ($file->getSize() > 5 * 1024 * 1024) {
                return response()->json([
                    'message' => 'Ukuran file terlalu besar (maksimal 5MB)',
                    'code' => 'FILE_TOO_LARGE'
                ], 422);
            }

            // Check MIME type strictly
            $allowedMimes = [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/csv',
            ];

            $fileMime = $file->getMimeType();
            if (!in_array($fileMime, $allowedMimes)) {
                return response()->json([
                    'message' => 'Tipe file tidak didukung. Gunakan CSV atau Excel.',
                    'code' => 'INVALID_FILE_TYPE'
                ], 422);
            }
        }

        return $next($request);
    }
}
