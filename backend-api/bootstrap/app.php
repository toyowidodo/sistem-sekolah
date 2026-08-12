<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Mendaftarkan Middleware Spatie Permission
        $middleware->alias([
            'permission'          => PermissionMiddleware::class,
            'role'                => RoleMiddleware::class,
            'role_or_permission'  => RoleOrPermissionMiddleware::class,
        ]);

        /**
         * Tamu di rute /api tidak boleh dialihkan ke halaman login web — rute
         * itu tidak ada di aplikasi API ini, dan percobaannya menghasilkan 500
         * "Route [login] not defined". Mengembalikan null membuat Laravel
         * melempar AuthenticationException sehingga jawabannya 401.
         */
        $middleware->redirectGuestsTo(fn ($request) => $request->is('api/*') ? null : '/login');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        /**
         * Request ke /api tanpa header Accept: application/json sebelumnya
         * membuat Laravel mencoba mengalihkan ke halaman login web yang tidak
         * ada, sehingga menjawab 500 "Route [login] not defined" — bukan 401.
         * Aplikasi ini murni API, jadi seluruh error di /api dipaksa JSON.
         */
        $exceptions->shouldRenderJsonWhen(
            fn ($request) => $request->is('api/*') || $request->expectsJson()
        );
    })->create();