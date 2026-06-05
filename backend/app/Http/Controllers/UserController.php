<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function show(User $user): JsonResponse
    {
        if ($user->isBanned()) {
            return response()->json(['message' => 'Usuario no disponible'], 404);
        }

        $user->loadCount(['threads', 'replies']);

        return response()->json([
            'user' => $user->only(['id', 'name', 'avatar', 'banner', 'karma', 'rank', 'created_at']),
            'stats' => [
                'threads_count' => $user->threads_count,
                'replies_count' => $user->replies_count,
                'karma' => $user->karma,
                'rank' => $user->rank,
            ],
        ]);
    }

    public function threads(User $user): JsonResponse
    {
        if ($user->isBanned()) {
            return response()->json(['message' => 'Usuario no disponible'], 404);
        }

        $threads = $user->threads()
            ->with(['category:id,name,slug', 'user:id,name,avatar,karma'])
            ->withCount('replies')
            ->latest()
            ->paginate(10);

        return response()->json($threads);
    }
}
