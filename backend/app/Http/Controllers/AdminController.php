<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ContentReport;
use App\Models\Reply;
use App\Models\Thread;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        return response()->json([
            'stats' => [
                'users_count' => User::count(),
                'threads_count' => Thread::count(),
                'replies_count' => Reply::count(),
                'reports_pending' => ContentReport::where('status', ContentReport::STATUS_PENDING)->count(),
            ],
        ]);
    }

    public function users(): JsonResponse
    {
        $users = User::with('roles')
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json($users);
    }

    public function banUser(Request $request, User $user): JsonResponse
    {
        if ($user->isAdmin()) {
            return response()->json(['message' => 'No puedes suspender a un administrador'], 422);
        }

        $user->update(['banned_at' => now()]);
        $user->tokens()->delete();

        return response()->json(['message' => 'Usuario suspendido']);
    }

    public function unbanUser(User $user): JsonResponse
    {
        $user->update(['banned_at' => null]);

        return response()->json(['message' => 'Usuario reactivado']);
    }

    public function threads(): JsonResponse
    {
        $threads = Thread::with(['user:id,name,email', 'category:id,name'])
            ->withCount('replies')
            ->latest()
            ->paginate(15);

        return response()->json($threads);
    }

    public function destroyThread(Thread $thread): JsonResponse
    {
        $thread->delete();

        return response()->json(['message' => 'Hilo eliminado']);
    }

    public function reports(): JsonResponse
    {
        $reports = ContentReport::with(['user:id,name,email', 'reportable'])
            ->where('status', ContentReport::STATUS_PENDING)
            ->latest()
            ->paginate(20);

        return response()->json($reports);
    }

    public function resolveReport(ContentReport $report): JsonResponse
    {
        $report->update(['status' => ContentReport::STATUS_RESOLVED]);

        return response()->json(['message' => 'Reporte resuelto']);
    }

    public function categories(): JsonResponse
    {
        return response()->json(Category::orderBy('name')->get());
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:100', 'unique:categories,slug'],
        ]);

        $category = Category::create($data);

        return response()->json($category, 201);
    }

    public function destroyCategory(Category $category): JsonResponse
    {
        if ($category->threads()->exists()) {
            return response()->json(['message' => 'La categoría tiene hilos asociados'], 422);
        }

        $category->delete();

        return response()->json(['message' => 'Categoría eliminada']);
    }
}
