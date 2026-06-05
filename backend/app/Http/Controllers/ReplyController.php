<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Reply;
use App\Models\Thread;
use App\Services\VoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReplyController extends Controller
{
    public function __construct(private readonly VoteService $voteService) {}

    public function index(Request $request, Thread $thread): JsonResponse
    {
        $replies = $thread->replies()
            ->whereNull('parent_id')
            ->with(['user:id,name,avatar,karma', 'children.user:id,name,avatar,karma', 'children.children.user:id,name,avatar,karma'])
            ->orderByDesc('is_best')
            ->orderBy('created_at')
            ->get();

        $this->voteService->attachToReplyTree($replies, $request->user('sanctum'));

        return response()->json($replies);
    }

    public function store(Request $request, Thread $thread): JsonResponse
    {
        $data = $request->validate([
            'body' => ['required', 'string', 'max:10000'],
            'parent_id' => ['nullable', 'integer', 'exists:replies,id'],
        ]);

        if (! empty($data['parent_id'])) {
            Reply::where('thread_id', $thread->id)->findOrFail($data['parent_id']);
        }

        $reply = $thread->replies()->create([
            'body' => $data['body'],
            'user_id' => $request->user()->id,
            'parent_id' => $data['parent_id'] ?? null,
        ]);

        return response()->json($reply->load('user:id,name,avatar,karma'), 201);
    }

    public function update(Request $request, Reply $reply): JsonResponse
    {
        if ($reply->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'body' => ['required', 'string', 'max:50000'],
        ]);

        $reply->update(['body' => $data['body']]);

        return response()->json($reply->fresh()->load('user:id,name,avatar,karma'));
    }

    public function destroy(Request $request, Reply $reply): JsonResponse
    {
        if ($reply->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $reply->delete();

        return response()->json(['message' => 'Respuesta eliminada']);
    }

    public function markBest(Request $request, Reply $reply): JsonResponse
    {
        if ($reply->thread->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        Reply::where('thread_id', $reply->thread_id)->update(['is_best' => false]);
        $reply->update(['is_best' => true]);
        $reply->thread->update(['is_resolved' => true]);

        return response()->json($reply->fresh()->load('user:id,name,avatar,karma'));
    }

    public function vote(Request $request, Reply $reply): JsonResponse
    {
        $data = $request->validate(['value' => ['required', 'integer', 'in:1,-1']]);

        return response()->json(
            $this->voteService->cast($request->user(), $reply, (int) $data['value'])
        );
    }
}
