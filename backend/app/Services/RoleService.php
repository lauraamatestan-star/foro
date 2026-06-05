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

    /**
     * Promueve a admin si el email del usuario está en ADMIN_EMAILS.
     * Formato esperado: ADMIN_EMAILS=email1@x.com,email2@x.com
     */
    public function syncAdminByConfiguredEmails(User $user): void
    {
        $email = strtolower(trim((string) $user->email));
        if ($email === '') {
            return;
        }

        $adminEmails = array_values(array_filter(array_map(
            static fn (string $value): string => strtolower(trim($value)),
            explode(',', (string) env('ADMIN_EMAILS', ''))
        )));

        if (! in_array($email, $adminEmails, true)) {
            return;
        }

        $adminRole = Role::firstOrCreate(['name' => Role::ADMIN]);
        if (! $user->roles()->where('role_id', $adminRole->id)->exists()) {
            $user->roles()->attach($adminRole->id);
        }
    }
}
