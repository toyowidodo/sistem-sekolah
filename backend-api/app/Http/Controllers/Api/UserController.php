<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->latest()->get()->map(function($u) {
            return [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'roles'      => $u->getRoleNames(),
                'is_active'  => $u->is_active ?? true,
                'created_at' => $u->created_at,
            ];
        });
        $roles = Role::orderBy('name')->get(['id','name']);
        return response()->json(['data' => $users, 'roles' => $roles]);
    }

    public function store(Request $request)
    {
        $v = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role'     => 'required|string|exists:roles,name',
        ]);
        $user = User::create([
            'name'     => $v['name'],
            'email'    => $v['email'],
            'password' => Hash::make($v['password']),
        ]);
        $user->assignRole($v['role']);
        return response()->json(['message' => 'User berhasil dibuat', 'data' => $user->load('roles')], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $v = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email,'.$id,
            'password' => 'nullable|string|min:6',
            'role'     => 'required|string|exists:roles,name',
        ]);
        $user->update([
            'name'  => $v['name'],
            'email' => $v['email'],
            ...(!empty($v['password']) ? ['password' => Hash::make($v['password'])] : []),
        ]);
        $user->syncRoles([$v['role']]);
        return response()->json(['message' => 'User diperbarui', 'data' => $user->load('roles')]);
    }

    public function destroy($id)
    {
        if (auth()->id() == $id) {
            return response()->json(['message' => 'Tidak bisa menghapus akun sendiri'], 403);
        }
        User::destroy($id);
        return response()->json(['message' => 'User dihapus']);
    }

    public function toggleActive($id)
    {
        if (auth()->id() == $id) {
            return response()->json(['message' => 'Tidak bisa menonaktifkan akun sendiri'], 403);
        }
        $user = User::findOrFail($id);
        // Add is_active column if it doesn't exist, use tokens as proxy
        $user->tokens()->delete(); // revoke all tokens to force logout
        return response()->json(['message' => 'Token user telah dicabut (paksa logout)']);
    }
}
