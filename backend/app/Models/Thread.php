<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Thread extends Model
{
    protected $fillable = [
        'title',
        'body',
        'user_id',
        'category_id',
        'upvotes',
        'downvotes',
        'views',
        'is_resolved',
    ];

    protected function casts(): array
    {
        return [
            'is_resolved' => 'boolean',
            'views' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Reply::class);
    }

    public function votes(): MorphMany
    {
        return $this->morphMany(Vote::class, 'votable');
    }

    public function bookmarkedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'thread_bookmarks')->withTimestamps();
    }

    public function scopeSortBy(Builder $query, ?string $sort): Builder
    {
        return match ($sort) {
            'top' => $query->orderByRaw('(upvotes - downvotes) DESC'),
            'unresolved' => $query->where('is_resolved', false)->orderByDesc('created_at'),
            default => $query->orderByDesc('created_at'),
        };
    }
}
