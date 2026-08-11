<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\TeacherRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class TeacherService {
    private $teacherRepo;

    public function __construct(TeacherRepositoryInterface $teacherRepo) {
        $this->teacherRepo = $teacherRepo;
    }

    public function getAll(Request $request) {
        return $this->teacherRepo->paginate($request->per_page ?? 10);
    }

    /**
     * Setiap guru dibuatkan akun login sekaligus, supaya bisa dibatasi ke kelas &
     * mapel yang diampunya. Passwordnya diacak dan hanya dikembalikan sekali di
     * response agar admin bisa menyerahkannya ke guru yang bersangkutan.
     */
    public function create(Request $request) {
        $data = $request->validated();

        return DB::transaction(function () use ($data) {
            $plainPassword = null;

            if (empty($data['user_id'])) {
                $email = $data['email'] ?: $data['nip'] . '@guru.sekolah.id';
                $plainPassword = Str::password(10, true, true, false);

                $user = User::create([
                    'name'     => $data['name'],
                    'email'    => $email,
                    'password' => $plainPassword,
                ]);
                $user->assignRole(Role::firstOrCreate(['name' => 'Guru', 'guard_name' => 'web']));

                $data['user_id'] = $user->id;
                $data['email']   = $email;
            }

            $teacher = $this->teacherRepo->create($data);

            // Atribut sementara, tidak disimpan ke database
            $teacher->generated_password = $plainPassword;

            return $teacher;
        });
    }

    public function update($id, Request $request) {
        $data = $request->validated();

        return DB::transaction(function () use ($id, $data) {
            $teacher = $this->teacherRepo->update($id, $data);

            // Jaga agar nama & email akun login tetap sinkron dengan data guru
            if ($teacher->user) {
                $teacher->user->update(array_filter([
                    'name'  => $data['name'] ?? null,
                    'email' => $data['email'] ?? null,
                ]));
            }

            return $teacher;
        });
    }

    public function delete($id) {
        return $this->teacherRepo->delete($id);
    }
}
