<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureNotBanned
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isBanned()) {
            $user->currentAccessToken()?->delete();

            return response()->json(['message' => 'Tu cuenta ha sido suspendida.'], 403);
        }

        return $next($request);
    }
}
