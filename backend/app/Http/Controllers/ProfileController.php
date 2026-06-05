<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\VoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function __construct(private readonly VoteService $voteService) {}

    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles');

        return response()->json([
            'user' => $user,
            'stats' => [
                'threads_count' => $user->threads()->count(),
                'replies_count' => $user->replies()->count(),
                'karma' => $user->karma,
                'rank' => $user->rank,
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($request->user()->id)],
            'avatar' => ['nullable', 'url', 'max:500'],
        ]);

        $request->user()->update($data);

        return response()->json($request->user()->fresh()->load('roles'));
    }

    public function updateImages(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'banner' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
        ]);

        $user = $request->user();
        $updates = [];

        if ($request->hasFile('avatar')) {
            if ($user->avatar && str_contains($user->avatar, '/storage/')) {
                $old = str_replace('/storage/', '', parse_url($user->avatar, PHP_URL_PATH) ?? '');
                Storage::disk('public')->delete(ltrim($old, '/'));
            }
            $path = $request->file('avatar')->store("users/{$user->id}", 'public');
            $updates['avatar'] = Storage::disk('public')->url($path);
        }

        if ($request->hasFile('banner')) {
            if ($user->banner && str_contains($user->banner, '/storage/')) {
                $old = str_replace('/storage/', '', parse_url($user->banner, PHP_URL_PATH) ?? '');
                Storage::disk('public')->delete(ltrim($old, '/'));
            }
            $path = $request->file('banner')->store("users/{$user->id}", 'public');
            $updates['banner'] = Storage::disk('public')->url($path);
        }

        if ($updates !== []) {
            $user->update($updates);
        }

        return response()->json($user->fresh()->load('roles'));
    }

    public function threads(Request $request): JsonResponse
    {
        $threads = $request->user()
            ->threads()
            ->with(['category:id,name,slug'])
            ->withCount('replies')
            ->latest()
            ->paginate(10);

        return response()->json($threads);
    }

    public function replies(Request $request): JsonResponse
    {
        $replies = $request->user()
            ->replies()
            ->with(['thread:id,title', 'user:id,name'])
            ->latest()
            ->paginate(10);

        return response()->json($replies);
    }

    public function bookmarks(Request $request): JsonResponse
    {
        $threads = $request->user()
            ->bookmarkedThreads()
            ->with(['user:id,name,avatar,karma', 'category:id,name,slug'])
            ->withCount('replies')
            ->orderByPivot('created_at', 'desc')
            ->paginate(10);

        $collection = $threads->getCollection();
        $this->voteService->attachToThreads($collection, $request->user());
        foreach ($collection as $thread) {
            $thread->setAttribute('is_bookmarked', true);
        }

        return response()->json($threads);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        if ($request->user()->provider !== 'local') {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], (string) $user->password)) {
            return response()->json(['message' => 'Contraseña actual incorrecta'], 422);
        }

        $user->update(['password' => $data['password']]);

        return response()->json(['message' => 'Contraseña actualizada']);
    }

    public function destroyAccount(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Cuenta eliminada']);
    }
}
