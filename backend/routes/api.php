<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReplyController;
use App\Http\Controllers\ThreadController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// ─── Público ───────────────────────────────────────────────────────────────
Route::middleware('throttle:30,1')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('password/forgot', [AuthController::class, 'forgotPassword']);
    Route::post('password/reset', [AuthController::class, 'resetPassword']);
});

Route::get('auth/google/redirect', [GoogleAuthController::class, 'redirect']);
Route::get('auth/google/callback', [GoogleAuthController::class, 'callback']);

Route::get('categories', [ThreadController::class, 'categories']);
Route::get('threads', [ThreadController::class, 'index']);
Route::get('threads/{thread}', [ThreadController::class, 'show']);
Route::get('threads/{thread}/replies', [ReplyController::class, 'index']);
Route::get('users/{user}', [UserController::class, 'show']);
Route::get('users/{user}/threads', [UserController::class, 'threads']);

// ─── Con sesión ────────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'not.banned'])->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);

    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);
    Route::post('profile/update-images', [ProfileController::class, 'updateImages']);
    Route::put('profile/password', [ProfileController::class, 'updatePassword']);
    Route::delete('profile', [ProfileController::class, 'destroyAccount']);
    Route::get('profile/threads', [ProfileController::class, 'threads']);
    Route::get('profile/replies', [ProfileController::class, 'replies']);
    Route::get('profile/bookmarks', [ProfileController::class, 'bookmarks']);

    Route::post('threads', [ThreadController::class, 'store'])->middleware('throttle:10,1');
    Route::put('threads/{thread}', [ThreadController::class, 'update']);
    Route::delete('threads/{thread}', [ThreadController::class, 'destroy']);
    Route::post('threads/{thread}/vote', [ThreadController::class, 'vote']);
    Route::post('threads/{thread}/bookmark', [ThreadController::class, 'bookmark']);
    Route::delete('threads/{thread}/bookmark', [ThreadController::class, 'unbookmark']);
    Route::post('reports', [ThreadController::class, 'storeReport'])->middleware('throttle:5,1');

    Route::post('threads/{thread}/replies', [ReplyController::class, 'store'])->middleware('throttle:20,1');
    Route::put('replies/{reply}', [ReplyController::class, 'update']);
    Route::delete('replies/{reply}', [ReplyController::class, 'destroy']);
    Route::post('replies/{reply}/best', [ReplyController::class, 'markBest']);
    Route::post('replies/{reply}/vote', [ReplyController::class, 'vote']);

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('dashboard', [AdminController::class, 'dashboard']);
        Route::get('users', [AdminController::class, 'users']);
        Route::post('users/{user}/ban', [AdminController::class, 'banUser']);
        Route::post('users/{user}/unban', [AdminController::class, 'unbanUser']);
        Route::get('threads', [AdminController::class, 'threads']);
        Route::delete('threads/{thread}', [AdminController::class, 'destroyThread']);
        Route::get('reports', [AdminController::class, 'reports']);
        Route::post('reports/{report}/resolve', [AdminController::class, 'resolveReport']);
        Route::get('categories', [AdminController::class, 'categories']);
        Route::post('categories', [AdminController::class, 'storeCategory']);
        Route::delete('categories/{category}', [AdminController::class, 'destroyCategory']);
    });
});
