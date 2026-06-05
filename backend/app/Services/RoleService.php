<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Role;
use App\Models\User;

class RoleService
{
    /** Asigna rol user; el primer usuario registrado recibe admin. */
    public function assignDefaultRole(User $user, bool $isFirstUser = false): void
    {
        $roleName = $isFirstUser ? Role::ADMIN : Role::USER;
        $role = Role::firstOrCreate(['name' => $roleName]);

        if (! $user->roles()->where('role_id', $role->id)->exists()) {
            $user->roles()->attach($role->id);
        }
    }

    public function ensureRolesExist(): void
    {
        Role::firstOrCreate(['name' => Role::ADMIN]);
        Role::firstOrCreate(['name' => Role::USER]);
    }
}
