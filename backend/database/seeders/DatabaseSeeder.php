<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use App\Services\RoleService;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        app(RoleService::class)->ensureRolesExist();

        $categories = [
            ['name' => 'General', 'slug' => 'general'],
            ['name' => 'Desarrollo', 'slug' => 'desarrollo'],
            ['name' => 'Off-topic', 'slug' => 'off-topic'],
        ];

        foreach ($categories as $cat) {
            Category::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        $user = User::firstOrCreate(
            ['email' => 'demo@foro.test'],
            [
                'name' => 'Usuario Demo',
                'password' => 'password123',
                'karma' => 120,
                'avatar' => 'https://ui-avatars.com/api/?name=Usuario+Demo&background=6366f1&color=fff',
                'provider' => 'local',
            ]
        );

        $adminRole = Role::where('name', Role::ADMIN)->first();
        if ($adminRole && ! $user->roles()->where('role_id', $adminRole->id)->exists()) {
            $user->roles()->attach($adminRole->id);
        }

        $general = Category::where('slug', 'general')->first();
        if ($general && \App\Models\Thread::count() === 0) {
            \App\Models\Thread::create([
                'title' => 'Bienvenido al Foro Comunidad',
                'body' => 'Este es un hilo de ejemplo. Regístrate o inicia sesión para participar.',
                'user_id' => $user->id,
                'category_id' => $general->id,
            ]);
        }
    }
}
