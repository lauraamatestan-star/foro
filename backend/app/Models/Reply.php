<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Reply extends Model
{
    protected $fillable = [
        'body',
        'user_id',
        'thread_id',
        'parent_id',
        'is_best',
        'upvotes',
        'downvotes',
    ];

    protected function casts(): array
    {
        return ['is_best' => 'boolean'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function thread(): BelongsTo
    {
        return $this->belongsTo(Thread::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Reply::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Reply::class, 'parent_id')->with(['user', 'children']);
    }

    public function votes(): MorphMany
    {
        return $this->morphMany(Vote::class, 'votable');
    }
}
