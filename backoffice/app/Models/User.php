<?php

namespace App\Models;

use App\Enums\BackofficeRole;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_hashes', 'two_factor_confirmed_at', 'two_factor_last_step'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public function backofficeRole(): ?BackofficeRole
    {
        // Compatibilité des comptes installés, sans ouvrir les comptes ordinaires.
        if ($this->role === null) {
            return $this->is_admin ? BackofficeRole::Admin : null;
        }
        $role = is_string($this->role) ? BackofficeRole::tryFrom($this->role) : null;

        return $role && $this->is_admin === ($role === BackofficeRole::Admin) ? $role : null;
    }

    public function hasBackofficeAccess(): bool
    {
        return $this->backofficeRole() !== null;
    }

    public function managesAccounts(): bool
    {
        return $this->backofficeRole() === BackofficeRole::Admin;
    }

    public function editsContent(): bool
    {
        return in_array($this->backofficeRole(), [BackofficeRole::Admin, BackofficeRole::Editor], true);
    }

    public function canAccessRoute(?string $name): bool
    {
        $role = $this->backofficeRole();
        if ($role === null) {
            return false;
        }
        $read = ['dashboard', 'security', 'security.password', 'security.logout-all', 'security.regenerate',
            'media.preview', 'media.thumbnail', 'content.index', 'content.show', 'content.photo', 'content.thumbnail',
            'reports.index', 'reports.download'];
        $edit = ['content.create', 'content.store', 'content.edit', 'content.update', 'content.confirm-delete',
            'content.destroy', 'content.restore', 'content.trash', 'content.trash-all', 'reports.create',
            'reports.store', 'reports.edit', 'reports.update', 'reports.archives', 'reports.destroy', 'reports.restore'];
        $admin = ['publication.index', 'publication.store', 'users.index', 'users.create', 'users.store', 'users.edit', 'users.update',
            'newsletter.index', 'newsletter.subscriber.delete', 'newsletter.simulate', 'newsletter.create',
            'newsletter.store', 'newsletter.delivery', 'newsletter.edit', 'newsletter.update', 'newsletter.approve', 'newsletter.cancel'];

        return in_array($name, $read, true)
            || ($this->editsContent() && in_array($name, $edit, true))
            || ($this->managesAccounts() && in_array($name, $admin, true));
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'is_active' => 'boolean',
            'session_version' => 'integer',
            'two_factor_secret' => 'encrypted',
            'two_factor_recovery_hashes' => 'array',
            'two_factor_confirmed_at' => 'datetime',
            'two_factor_last_step' => 'integer',
        ];
    }
}
