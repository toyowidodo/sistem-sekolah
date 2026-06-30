<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Student;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class GenerateStudentUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'students:generate-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate user accounts for all students who do not have one';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Ensure "Siswa" role exists
        $role = Role::firstOrCreate(['name' => 'Siswa', 'guard_name' => 'web']);

        $students = Student::whereNull('user_id')->get();
        $count = 0;

        foreach ($students as $student) {
            $email = $student->nisn . '@siswa.com';
            
            // Check if user already exists
            $user = User::where('email', $email)->first();
            
            if (!$user) {
                $user = User::create([
                    'name' => $student->name,
                    'email' => $email,
                    'password' => Hash::make($student->nisn),
                ]);
                $user->assignRole($role);
            }

            $student->user_id = $user->id;
            $student->save();
            $count++;
        }

        $this->info("Successfully generated/linked {$count} student users.");
    }
}
