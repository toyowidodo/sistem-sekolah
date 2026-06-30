<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json(['data' => $settings]);
    }

    /**
     * Endpoint publik untuk branding aplikasi (tidak perlu autentikasi).
     */
    public function publicSettings()
    {
        $settings = Setting::whereIn('key', ['school_name', 'school_subtitle', 'app_logo'])
            ->pluck('value', 'key');

        return response()->json([
            'school_name'     => $settings->get('school_name', 'EduAdmin'),
            'school_subtitle' => $settings->get('school_subtitle', 'School System'),
            'app_logo'        => $settings->get('app_logo', null),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->except('app_logo');

        if ($request->hasFile('app_logo')) {
            $file     = $request->file('app_logo');
            $filename = time() . '_' . $file->getClientOriginalName();
            $dir      = public_path('uploads/logos');

            if (!is_dir($dir)) {
                mkdir($dir, 0775, true);
            }

            $file->move($dir, $filename);

            Setting::updateOrCreate(
                ['key' => 'app_logo'],
                ['value' => '/uploads/logos/' . $filename]
            );
        }

        foreach ($data as $key => $value) {
            if (!empty($key)) {
                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
            }
        }

        return response()->json([
            'message' => 'Pengaturan berhasil diperbarui.',
            'data'    => Setting::all()->pluck('value', 'key')
        ]);
    }
}
