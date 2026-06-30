<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    // GET /api/profile
    public function show(Request $request)
    {
        $user = $request->user();
        return response()->json(array_merge($user->toArray(), [
            'roles' => $user->getRoleNames(),
        ]));
    }

    // PUT /api/profile
    public function update(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
        ]);
        $user->update($validated);
        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user'    => array_merge($user->fresh()->toArray(), [
                'roles' => $user->getRoleNames(),
            ]),
        ]);
    }

    // PUT /api/profile/password
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password'          => 'required|string',
            'new_password'              => 'required|string|min:6',
            'new_password_confirmation' => 'required|same:new_password',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Password lama tidak sesuai'], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Password berhasil diubah']);
    }
}
