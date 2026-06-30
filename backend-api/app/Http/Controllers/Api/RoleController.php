<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Get all roles with their associated permissions.
     */
    public function index()
    {
        // Filter hanya guard web agar tidak ada duplikat nama role (misal Siswa di web dan api)
        $roles = Role::with('permissions')->where('guard_name', 'web')->get();
        return response()->json(['data' => $roles]);
    }

    /**
     * Get all available permissions in the system.
     */
    public function permissions()
    {
        $permissions = Permission::all();
        return response()->json(['data' => $permissions]);
    }

    /**
     * Update permissions for a specific role.
     */
    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        // Fail-safe: Prevent modifying Superadmin role permissions
        if ($role->name === 'Superadmin') {
            return response()->json(['message' => 'Role Superadmin tidak dapat dimodifikasi.'], 403);
        }

        $validated = $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name'
        ]);

        $permissions = $validated['permissions'] ?? [];
        $role->syncPermissions($permissions);

        return response()->json([
            'message' => 'Hak akses berhasil diperbarui.',
            'data' => $role->load('permissions')
        ]);
    }
}
