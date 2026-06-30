<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TokenMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Jika ada parameter token di URL, masukkan ke header Authorization
        if ($request->has('token')) {
            $request->headers->set('Authorization', 'Bearer ' . $request->get('token'));
        }

        return $next($request);
    }
}