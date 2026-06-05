<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Reply;
use App\Models\Thread;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class VoteService
{
    /** @param Thread|Reply $votable */
    public function cast(User $user, Model $votable, int $value): array
    {
        $value = $value > 0 ? 1 : -1;

        $existing = Vote::where('user_id', $user->id)
            ->where('votable_type', $votable->getMorphClass())
            ->where('votable_id', $votable->id)
            ->first();

        if ($existing && $existing->value === $value) {
            $this->revertVote($votable, $existing);
            $existing->delete();

            return $this->counts($votable, null);
        }

        $isNew = $existing === null;

        if ($existing) {
            $this->revertVote($votable, $existing);
            $existing->update(['value' => $value]);
        } else {
            Vote::create([
                'user_id' => $user->id,
                'votable_type' => $votable->getMorphClass(),
                'votable_id' => $votable->id,
                'value' => $value,
            ]);
        }

        $this->applyVote($votable, $value);

        if ($isNew && $value === 1) {
            $this->rewardAuthorKarma($votable, $user);
        }

        return $this->counts($votable, $value);
    }

    /** @param Thread|Reply $votable */
    private function rewardAuthorKarma(Model $votable, User $voter): void
    {
        $author = $votable->user()->first();
        if ($author && $author->id !== $voter->id) {
            $author->addKarma(1);
        }
    }

    private function applyVote(Model $votable, int $value): void
    {
        if ($value === 1) {
            $votable->increment('upvotes');
        } else {
            $votable->increment('downvotes');
        }
    }

    private function revertVote(Model $votable, Vote $vote): void
    {
        if ($vote->value === 1) {
            $votable->decrement('upvotes');
        } else {
            $votable->decrement('downvotes');
        }
    }

    /** @param Thread|Reply $votable */
    private function counts(Model $votable, ?int $userVote): array
    {
        $votable->refresh();

        return [
            'upvotes' => $votable->upvotes,
            'downvotes' => $votable->downvotes,
            'score' => (int) $votable->upvotes - (int) $votable->downvotes,
            'user_vote' => $userVote,
        ];
    }

    /** @param iterable<Thread> $threads */
    public function attachToThreads(iterable $threads, ?User $user): void
    {
        if (! $user) {
            return;
        }

        $ids = collect($threads)->pluck('id');
        if ($ids->isEmpty()) {
            return;
        }

        $votes = $this->votesFor(Thread::class, $ids, $user->id);
        $bookmarks = $user->bookmarkedThreads()->whereIn('threads.id', $ids)->pluck('threads.id');

        foreach ($threads as $thread) {
            $thread->setAttribute('user_vote', $votes->get($thread->id));
            $thread->setAttribute('is_bookmarked', $bookmarks->contains($thread->id));
        }
    }

    /** @param Collection<int, Reply> $replies */
    public function attachToReplyTree(Collection $replies, ?User $user): void
    {
        if (! $user || $replies->isEmpty()) {
            return;
        }

        $votes = $this->votesFor(Reply::class, $this->collectReplyIds($replies), $user->id);
        $this->applyVotesToReplies($replies, $votes);
    }

    /** @param Collection<int, Reply> $replies */
    private function collectReplyIds(Collection $replies): Collection
    {
        $ids = collect();
        foreach ($replies as $reply) {
            $ids->push($reply->id);
            if ($reply->relationLoaded('children') && $reply->children->isNotEmpty()) {
                $ids = $ids->merge($this->collectReplyIds($reply->children));
            }
        }

        return $ids->unique();
    }

    /** @param Collection<int, Reply> $replies */
    private function applyVotesToReplies(Collection $replies, Collection $votes): void
    {
        foreach ($replies as $reply) {
            $reply->setAttribute('user_vote', $votes->get($reply->id));
            if ($reply->relationLoaded('children') && $reply->children->isNotEmpty()) {
                $this->applyVotesToReplies($reply->children, $votes);
            }
        }
    }

    private function votesFor(string $modelClass, Collection $ids, int $userId): Collection
    {
        if ($ids->isEmpty()) {
            return collect();
        }

        $instance = new $modelClass;

        return Vote::where('user_id', $userId)
            ->where('votable_type', $instance->getMorphClass())
            ->whereIn('votable_id', $ids)
            ->pluck('value', 'votable_id');
    }
}
