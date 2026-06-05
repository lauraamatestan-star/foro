<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'banner',
        'google_id',
        'provider',
        'karma',
        'banned_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['rank', 'is_admin'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'karma' => 'integer',
            'banned_at' => 'datetime',
        ];
    }

    public function isBanned(): bool
    {
        return $this->banned_at !== null;
    }

    /** Tramos de karma para badge en UI. */
    public function getRankAttribute(): string
    {
        return match (true) {
            $this->karma > 500 => 'Leyenda',
            $this->karma >= 100 => 'Colaborador',
            default => 'Novato',
        };
    }

    public function getIsAdminAttribute(): bool
    {
        if ($this->relationLoaded('roles')) {
            return $this->roles->contains('name', Role::ADMIN);
        }

        return $this->roles()->where('name', Role::ADMIN)->exists();
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    public function threads(): HasMany
    {
        return $this->hasMany(Thread::class);
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Reply::class);
    }

    public function bookmarkedThreads(): BelongsToMany
    {
        return $this->belongsToMany(Thread::class, 'thread_bookmarks')->withTimestamps();
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }

    public function isAdmin(): bool
    {
        return $this->is_admin;
    }

    public function addKarma(int $points): void
    {
        $this->increment('karma', max(0, $points));
    }
}
