<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Buat Permissions
        $permissions = [
            'manage-users', 'manage-role', 'manage-students', 'manage-teachers', 
            'manage-finance', 'manage-attendance', 'manage-report', 'manage-academic',
            'manage-announcements', 'manage-inventory', 'manage-student-points', 'manage-spp',
            'manage-eoffice'
        ];
        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p]);
        }

        // Buat Roles
        $roles = ['Superadmin', 'Admin Sekolah', 'Guru', 'Tata Usaha', 'Bendahara', 'Siswa', 'Orang Tua'];
        foreach ($roles as $r) {
            Role::firstOrCreate(['name' => $r]);
        }

        // Berikan semua permission ke Superadmin & Admin Sekolah
        Role::findByName('Superadmin')->syncPermissions(Permission::all());
        Role::findByName('Admin Sekolah')->syncPermissions(Permission::all());

        // Guru
        Role::findByName('Guru')->syncPermissions([
            'manage-attendance', 'manage-academic', 'manage-student-points', 'manage-announcements'
        ]);

        // Tata Usaha
        Role::findByName('Tata Usaha')->syncPermissions([
            'manage-students', 'manage-teachers', 'manage-inventory', 'manage-announcements', 'manage-eoffice'
        ]);

        // Bendahara
        Role::findByName('Bendahara')->syncPermissions([
            'manage-finance', 'manage-spp'
        ]);

        // Buat User Superadmin pertama
        $user = User::firstOrCreate(
            ['email' => 'admin@sekolah.id'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('password123')
            ]
        );
        
        // Assign Role ke User
        $user->assignRole('Superadmin');
    }
}