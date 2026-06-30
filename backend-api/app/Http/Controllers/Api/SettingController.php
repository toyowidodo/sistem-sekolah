<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Setting;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->pluck('value', 'key');
        return response()->json(['data' => $settings]);
    }

    public function update(Request $request)
    {
        $data = $request->except('app_logo');

        if ($request->hasFile('app_logo')) {
            $file = $request->file('app_logo');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('uploads/logos'), $filename);
            
            Setting::updateOrCreate(
                ['key' => 'app_logo'],
                ['value' => '/uploads/logos/' . $filename]
            );
        }

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        return response()->json([
            'message' => 'Pengaturan berhasil diperbarui.',
            'data' => Setting::all()->pluck('value', 'key')
        ]);
    }
}
