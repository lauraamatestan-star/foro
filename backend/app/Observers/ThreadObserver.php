<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Thread;

class ThreadObserver
{
    /** +10 karma al publicar un hilo. */
    public function created(Thread $thread): void
    {
        $thread->user?->addKarma(10);
    }
}
