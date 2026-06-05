<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ContentReport extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_RESOLVED = 'resolved';

    protected $fillable = [
        'user_id',
        'reportable_type',
        'reportable_id',
        'reason',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reportable(): MorphTo
    {
        return $this->morphTo();
    }
}
