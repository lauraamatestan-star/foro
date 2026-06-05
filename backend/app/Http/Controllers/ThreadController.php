<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\ContentReport;
use App\Models\Reply;
use App\Models\Thread;
use App\Services\VoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ThreadController extends Controller
{
    public function __construct(private readonly VoteService $voteService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Thread::query()
            ->with(['user:id,name,avatar,karma', 'category:id,name,slug'])
            ->withCount('replies')
            ->sortBy($request->query('sort', 'recent'));

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('q')) {
            $term = '%'.$request->string('q')->trim().'%';
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', $term)->orWhere('body', 'like', $term);
            });
        }

        $threads = $query->paginate(10);
        $this->voteService->attachToThreads($threads->items(), $request->user('sanctum'));

        return response()->json($threads);
    }

    public function show(Request $request, Thread $thread): JsonResponse
    {
        $thread->increment('views');
        $thread->load(['user:id,name,avatar,karma', 'category:id,name,slug']);
        $thread->loadCount('replies');

        $this->voteService->attachToThreads([$thread], $request->user('sanctum'));

        return response()->json($thread);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
        ]);

        $thread = Thread::create([
            'title' => $data['title'],
            'body' => $data['body'],
            'user_id' => $request->user()->id,
            'category_id' => $data['category_id'],
        ]);

        $thread->load(['user:id,name,avatar,karma', 'category:id,name,slug']);
        $thread->loadCount('replies');

        return response()->json($thread, 201);
    }

    public function update(Request $request, Thread $thread): JsonResponse
    {
        if ($thread->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'body' => ['sometimes', 'string', 'max:50000'],
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
        ]);

        $thread->update($data);
        $thread->load(['user:id,name,avatar,karma', 'category:id,name,slug']);
        $thread->loadCount('replies');

        return response()->json($thread);
    }

    public function destroy(Request $request, Thread $thread): JsonResponse
    {
        if ($thread->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $thread->delete();

        return response()->json(['message' => 'Hilo eliminado']);
    }

    public function vote(Request $request, Thread $thread): JsonResponse
    {
        $data = $request->validate(['value' => ['required', 'integer', 'in:1,-1']]);

        return response()->json(
            $this->voteService->cast($request->user(), $thread, (int) $data['value'])
        );
    }

    public function bookmark(Request $request, Thread $thread): JsonResponse
    {
        $request->user()->bookmarkedThreads()->syncWithoutDetaching([$thread->id]);

        return response()->json(['is_bookmarked' => true]);
    }

    public function unbookmark(Request $request, Thread $thread): JsonResponse
    {
        $request->user()->bookmarkedThreads()->detach($thread->id);

        return response()->json(['is_bookmarked' => false]);
    }

    public function categories(): JsonResponse
    {
        return response()->json(Category::orderBy('name')->get(['id', 'name', 'slug']));
    }

    public function storeReport(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['thread', 'reply'])],
            'id' => ['required', 'integer', 'min:1'],
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $reportable = match ($data['type']) {
            'thread' => Thread::findOrFail($data['id']),
            'reply' => Reply::findOrFail($data['id']),
        };

        $exists = ContentReport::where('user_id', $request->user()->id)
            ->where('reportable_type', $reportable->getMorphClass())
            ->where('reportable_id', $reportable->id)
            ->where('status', ContentReport::STATUS_PENDING)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Ya has reportado este contenido'], 422);
        }

        $report = ContentReport::create([
            'user_id' => $request->user()->id,
            'reportable_type' => $reportable->getMorphClass(),
            'reportable_id' => $reportable->id,
            'reason' => $data['reason'],
        ]);

        return response()->json($report, 201);
    }
}
