<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TeacherController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\ClassroomController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SppController;
use App\Http\Controllers\Api\AcademicEventController;
use App\Http\Controllers\Api\SettingController;

Route::post('/login', [AuthController::class, 'login']);

Route::get('/public-settings', function() {
    return response()->json([
        'school_name' => \App\Models\Setting::where('key', 'school_name')->value('value') ?: 'EduAdmin',
        'school_subtitle' => \App\Models\Setting::where('key', 'school_subtitle')->value('value') ?: 'School System',
        'app_logo' => \App\Models\Setting::where('key', 'app_logo')->value('value') ?: null,
    ]);
});

Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Global Settings
    Route::get('/settings', [SettingController::class, 'index']);

    // Dashboard Stats
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Profil
    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);
    Route::put('profile/password', [ProfileController::class, 'changePassword']);
    
    // Modul Siswa
    Route::middleware('permission:manage-students')->group(function () {
        Route::get('students/import/template', [StudentController::class, 'downloadTemplate']);
        Route::post('students/import', [StudentController::class, 'importExcel']);
        Route::get('students/export/excel', [StudentController::class, 'exportExcel']);
        Route::apiResource('students', StudentController::class);
    });

    // Modul Guru
    Route::middleware('permission:manage-teachers')->group(function () {
        Route::get('teachers/import/template', [TeacherController::class, 'downloadTemplate']);
        Route::post('teachers/import', [TeacherController::class, 'importExcel']);
        Route::get('teachers/export/excel', [TeacherController::class, 'exportExcel']);
        Route::apiResource('teachers', TeacherController::class);
    });

    // Modul Keuangan
    Route::middleware('permission:manage-finance')->group(function () {
        Route::get('payments/{id}/receipt', [PaymentController::class, 'receipt']);
        Route::apiResource('payments', PaymentController::class);
    });

    // Modul Absensi
    Route::middleware('permission:manage-attendance')->group(function () {
        Route::post('attendances/bulk', [AttendanceController::class, 'storeBulk']);
        Route::get('attendances', [AttendanceController::class, 'index']);
        Route::get('attendances/summary', [AttendanceController::class, 'summary']);
    });

    // Modul Kedisiplinan
    Route::middleware('permission:manage-student-points')->group(function () {
        Route::apiResource('point-categories', \App\Http\Controllers\Api\PointCategoryController::class);
        Route::get('student-points/summary', [\App\Http\Controllers\Api\StudentPointController::class, 'summary']);
        Route::apiResource('student-points', \App\Http\Controllers\Api\StudentPointController::class)->except(['update', 'show']);
    });

    // Modul Pengumuman
    Route::get('announcements', [AnnouncementController::class, 'index']);
    Route::get('announcements/{announcement}', [AnnouncementController::class, 'show']);
    Route::middleware('permission:manage-announcements')->group(function () {
        Route::post('announcements', [AnnouncementController::class, 'store']);
        Route::put('announcements/{announcement}', [AnnouncementController::class, 'update']);
        Route::delete('announcements/{announcement}', [AnnouncementController::class, 'destroy']);
    });

    // Modul Akademik
    Route::middleware('permission:manage-academic')->group(function () {
        Route::apiResource('classrooms', ClassroomController::class)->except(['show']);
        Route::apiResource('subjects', SubjectController::class)->except(['show']);
        Route::apiResource('schedules', ScheduleController::class)->except(['show']);
    });

    // Modul Nilai & Rapor
    Route::middleware('permission:manage-academic')->group(function () {
        Route::get('grades', [GradeController::class, 'index']);
        Route::post('grades/bulk', [GradeController::class, 'storeBulk']);
        Route::get('grades/report', [GradeController::class, 'report']);
        Route::get('grades/recap', [GradeController::class, 'recap']);
    });

    // Modul SPP
    Route::middleware('permission:manage-spp')->group(function () {
        Route::get('spp/settings', [SppController::class, 'getSettings']);
        Route::post('spp/settings', [SppController::class, 'saveSettings']);
        Route::post('spp/generate', [SppController::class, 'generate']);
        Route::get('spp/bills', [SppController::class, 'bills']);
        Route::post('spp/bills/{id}/pay', [SppController::class, 'pay']);
        Route::post('spp/bills/{id}/unpay', [SppController::class, 'unpay']);
        Route::get('spp/recap', [SppController::class, 'recap']);
    });

    // Modul Kalender Akademik
    Route::get('academic-events', [AcademicEventController::class, 'index']);
    Route::middleware('permission:manage-academic')->group(function () {
        Route::post('academic-events', [AcademicEventController::class, 'store']);
        Route::put('academic-events/{id}', [AcademicEventController::class, 'update']);
        Route::delete('academic-events/{id}', [AcademicEventController::class, 'destroy']);
    });

    // Modul Inventaris
    Route::middleware('permission:manage-inventory')->group(function () {
        Route::get('inventories', [InventoryController::class, 'index']);
        Route::post('inventories', [InventoryController::class, 'store']);
        Route::put('inventories/{id}', [InventoryController::class, 'update']);
        Route::delete('inventories/{id}', [InventoryController::class, 'destroy']);
        
        Route::get('inventory-loans', [InventoryController::class, 'loans']);
        Route::post('inventory-loans', [InventoryController::class, 'storeLoan']);
        Route::post('inventory-loans/{id}/return', [InventoryController::class, 'returnLoan']);
    });

    // Modul Tata Persuratan & Arsip (E-Office)
    Route::middleware('permission:manage-eoffice')->group(function () {
        Route::apiResource('mails', \App\Http\Controllers\Api\MailController::class);
    });

    // Superadmin Panel
    Route::middleware('role:Superadmin')->group(function () {
        Route::get('backup/download', [\App\Http\Controllers\Api\BackupController::class, 'download']);
        Route::post('backup/restore', [\App\Http\Controllers\Api\BackupController::class, 'restore']);
        
        Route::apiResource('users', UserController::class)->except(['show']);
        Route::post('users/{id}/toggle-active', [UserController::class, 'toggleActive']);
        Route::get('activity-logs', [ActivityLogController::class, 'index']);
        
        Route::get('permissions', [RoleController::class, 'permissions']);
        Route::apiResource('roles', RoleController::class)->only(['index', 'update']);
        
        Route::post('settings', [SettingController::class, 'update']);
        Route::post('maintenance/clear-cache', [\App\Http\Controllers\Api\MaintenanceController::class, 'clearCache']);
    });

    // Student Portal
    Route::middleware('role:Siswa')->prefix('portal')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\Api\StudentPortalController::class, 'dashboard']);
        Route::get('spp', [\App\Http\Controllers\Api\StudentPortalController::class, 'spp']);
        Route::get('grades', [\App\Http\Controllers\Api\StudentPortalController::class, 'grades']);
        Route::get('schedules', [\App\Http\Controllers\Api\StudentPortalController::class, 'schedules']);
    });
});