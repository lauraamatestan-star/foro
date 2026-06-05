<?php

namespace App\Providers;

use App\Models\Reply;
use App\Models\Thread;
use App\Observers\ReplyObserver;
use App\Observers\ThreadObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Thread::observe(ThreadObserver::class);
        Reply::observe(ReplyObserver::class);
    }
}
