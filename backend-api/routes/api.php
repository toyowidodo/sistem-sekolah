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

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::get('/public-settings', [SettingController::class, 'publicSettings']);

Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Global Settings
    Route::get('/settings', [SettingController::class, 'index']);

    // Dashboard Stats
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/setup-progress', [DashboardController::class, 'setupProgress']);

    // Profil
    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);
    Route::put('profile/password', [ProfileController::class, 'changePassword']);
    
    // Modul Siswa
    Route::middleware('permission:manage-students')->group(function () {
        // Akun orang tua / wali per siswa
        Route::get('students/{student}/guardians', [\App\Http\Controllers\Api\GuardianController::class, 'index']);
        Route::post('students/{student}/guardians', [\App\Http\Controllers\Api\GuardianController::class, 'store']);
        Route::delete('students/{student}/guardians/{userId}', [\App\Http\Controllers\Api\GuardianController::class, 'destroy']);

        Route::get('students/import/template', [StudentController::class, 'downloadTemplate']);
        Route::post('students/import', [StudentController::class, 'importExcel']);
        Route::get('students/export/excel', [StudentController::class, 'exportExcel']);
        Route::post('students/bulk-classroom', [StudentController::class, 'bulkAssignClassroom']);
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

    // Daftar kelas dipakai juga oleh form data siswa, jadi dibuka untuk semua user
    // terautentikasi. Perubahan datanya tetap butuh permission manage-academic.
    Route::get('classrooms', [ClassroomController::class, 'index']);

    // Daftar tahun ajaran dibaca banyak modul (nilai, SPP, rapor)
    Route::get('academic-years', [\App\Http\Controllers\Api\AcademicYearController::class, 'index']);

    // Riwayat kelas siswa ditampilkan juga di detail data siswa, jadi tidak
    // dikunci di balik manage-academic
    Route::get('promotions/history/{studentId}', [\App\Http\Controllers\Api\PromotionController::class, 'history']);

    // Modul Akademik
    Route::middleware('permission:manage-academic')->group(function () {
        // Tahun Ajaran
        Route::post('academic-years', [\App\Http\Controllers\Api\AcademicYearController::class, 'store']);
        Route::put('academic-years/{id}', [\App\Http\Controllers\Api\AcademicYearController::class, 'update']);
        Route::delete('academic-years/{id}', [\App\Http\Controllers\Api\AcademicYearController::class, 'destroy']);
        Route::post('academic-years/{id}/activate', [\App\Http\Controllers\Api\AcademicYearController::class, 'setActive']);

        // Kenaikan Kelas
        Route::get('promotions/preview', [\App\Http\Controllers\Api\PromotionController::class, 'preview']);
        Route::post('promotions/execute', [\App\Http\Controllers\Api\PromotionController::class, 'execute']);

        // Harus sebelum apiResource, kalau tidak "generate" akan tertangkap
        // sebagai parameter {classroom} pada rute update/destroy
        Route::post('classrooms/generate', [ClassroomController::class, 'generate']);
        Route::apiResource('classrooms', ClassroomController::class)->except(['show', 'index']);
        Route::apiResource('subjects', SubjectController::class)->except(['show']);
        Route::apiResource('schedules', ScheduleController::class)->except(['show']);
    });

    // Modul Nilai & Rapor — terpisah dari manage-academic supaya guru bisa input
    // nilai tanpa ikut bisa mengubah master data kelas/mapel/jadwal
    Route::middleware('permission:manage-grades')->group(function () {
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
        Route::post('users/{id}/force-logout', [UserController::class, 'forceLogout']);
        Route::get('activity-logs', [ActivityLogController::class, 'index']);
        Route::get('activity-logs/filters', [ActivityLogController::class, 'filters']);
        
        Route::get('permissions', [RoleController::class, 'permissions']);
        Route::apiResource('roles', RoleController::class)->only(['index', 'update']);
        
        // Notifikasi keluar (WhatsApp/SMS)
        Route::get('notifications/templates', [\App\Http\Controllers\Api\NotificationController::class, 'templates']);
        Route::put('notifications/templates/{id}', [\App\Http\Controllers\Api\NotificationController::class, 'updateTemplate']);
        Route::get('notifications/logs', [\App\Http\Controllers\Api\NotificationController::class, 'logs']);
        Route::post('notifications/test', [\App\Http\Controllers\Api\NotificationController::class, 'test']);

        Route::post('settings', [SettingController::class, 'update']);
        Route::post('maintenance/clear-cache', [\App\Http\Controllers\Api\MaintenanceController::class, 'clearCache']);
    });

    // Portal Guru — hanya untuk akun yang terhubung ke data guru
    Route::prefix('teacher')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\Api\TeacherPortalController::class, 'dashboard']);
        Route::get('schedules', [\App\Http\Controllers\Api\TeacherPortalController::class, 'schedules']);
        Route::get('assignments', [\App\Http\Controllers\Api\TeacherPortalController::class, 'teachingAssignments']);
        Route::get('homeroom-students', [\App\Http\Controllers\Api\TeacherPortalController::class, 'homeroomStudents']);
    });

    // Portal Orang Tua
    Route::middleware('role:Orang Tua')->prefix('parent')->group(function () {
        Route::get('children', [\App\Http\Controllers\Api\ParentPortalController::class, 'children']);
        Route::get('dashboard', [\App\Http\Controllers\Api\ParentPortalController::class, 'dashboard']);
        Route::get('grades', [\App\Http\Controllers\Api\ParentPortalController::class, 'grades']);
        Route::get('spp', [\App\Http\Controllers\Api\ParentPortalController::class, 'spp']);
        Route::get('attendance', [\App\Http\Controllers\Api\ParentPortalController::class, 'attendance']);
        Route::get('points', [\App\Http\Controllers\Api\ParentPortalController::class, 'points']);
    });

    // Student Portal
    Route::middleware('role:Siswa')->prefix('portal')->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\Api\StudentPortalController::class, 'dashboard']);
        Route::get('spp', [\App\Http\Controllers\Api\StudentPortalController::class, 'spp']);
        Route::get('grades', [\App\Http\Controllers\Api\StudentPortalController::class, 'grades']);
        Route::get('schedules', [\App\Http\Controllers\Api\StudentPortalController::class, 'schedules']);
    });
});