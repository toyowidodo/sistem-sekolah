<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            ['key' => 'school_name',          'value' => 'Sekolah Nusantara'],
            ['key' => 'school_subtitle',       'value' => 'Sistem Administrasi Sekolah'],
            ['key' => 'school_address',        'value' => 'Jl. Merdeka No. 10'],
            ['key' => 'school_phone',          'value' => '08123456789'],
            ['key' => 'school_email',          'value' => 'info@sekolah.com'],
            ['key' => 'active_academic_year',  'value' => '2025/2026'],
            ['key' => 'active_semester',       'value' => 'Ganjil'],
        ];

        foreach ($settings as $setting) {
            \App\Models\Setting::updateOrCreate(
                ['key' => $setting['key']],
                ['value' => $setting['value']]
            );
        }
    }
}
