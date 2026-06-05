<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Thread;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ForumApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_threads_list_and_search(): void
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'Test', 'slug' => 'test']);
        Thread::create([
            'title' => 'Laravel tips',
            'body' => 'Content here',
            'user_id' => $user->id,
            'category_id' => $category->id,
        ]);

        $this->getJson('/api/threads?q=Laravel')
            ->assertOk()
            ->assertJsonPath('data.0.title', 'Laravel tips');
    }

    public function test_authenticated_user_can_bookmark(): void
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'Test', 'slug' => 'test']);
        $thread = Thread::create([
            'title' => 'Hilo',
            'body' => 'Body',
            'user_id' => $user->id,
            'category_id' => $category->id,
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson("/api/threads/{$thread->id}/bookmark")
            ->assertOk()
            ->assertJson(['is_bookmarked' => true]);
    }
}
