<?php

namespace App\Http\Controllers;

use App\Enums\BackofficeRole;
use App\Models\User;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserManagementController extends Controller
{
    public function index()
    {
        return view('users.index', ['users' => User::orderBy('name')->orderBy('id')->paginate(30)]);
    }

    public function create(Request $request)
    {
        $token = (string) Str::uuid();
        $request->session()->put('users_creation', ['token' => $token, 'user' => $request->user()->id, 'expires' => time() + 3600]);

        return view('users.edit', ['account' => new User, 'roles' => BackofficeRole::cases(), 'creationToken' => $token]);
    }

    public function edit(string $user)
    {
        return view('users.edit', ['account' => User::findOrFail($user), 'roles' => BackofficeRole::cases()]);
    }

    public function store(Request $request)
    {
        foreach (['name', 'email'] as $field) {
            if (is_string($request->input($field))) {
                $value = trim($request->input($field));
                $request->merge([$field => $field === 'email' ? mb_strtolower($value) : $value]);
            }
        }
        $data = $request->validate([
            'creation_token' => ['required', 'uuid'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:254', Rule::unique('users', 'email')],
            'role' => ['required', Rule::enum(BackofficeRole::class)],
            'current_password' => ['required', 'string', 'max:256'],
            'password' => ['bail', 'required', 'string', 'min:15', 'max:72', 'confirmed', function ($attribute, $value, $fail) {
                if (strlen($value) > 72 || str_contains($value, "\0")) {
                    $fail('Choisissez un mot de passe sans caractère nul et de 72 octets maximum.');
                }
            }],
        ], ['password.min' => 'Le mot de passe doit contenir au moins 15 caractères.', 'password.confirmed' => 'Les deux mots de passe doivent être identiques.']);
        $pending = $request->session()->get('users_creation');
        if (! is_array($pending) || ($pending['user'] ?? null) !== $request->user()->id
            || ($pending['token'] ?? null) !== $data['creation_token'] || ($pending['expires'] ?? 0) <= time()) {
            throw ValidationException::withMessages(['creation_token' => 'Ce formulaire a expiré ou a déjà été utilisé. Rouvrez Ajouter un compte.']);
        }
        $this->locked(function () use ($request, $data) {
            $actor = $this->actor($request, $data['current_password']);
            // Comparaison normalisée également pour les anciens comptes.
            if (User::whereRaw('LOWER(email) = ?', [$data['email']])->exists()) {
                throw ValidationException::withMessages(['email' => 'Cette adresse possède déjà un compte.']);
            }
            $role = BackofficeRole::from($data['role']);
            $user = new User;
            $user->name = $data['name'];
            $user->email = $data['email'];
            $user->password = $data['password'];
            $user->role = $role->value;
            $user->is_admin = $role === BackofficeRole::Admin;
            $user->is_active = true;
            $user->session_version = 1;
            $user->save();
            $this->event($actor, $user, 'create', ['role' => $role->value, 'active' => true]);
        });
        $request->session()->forget('users_creation');

        return redirect()->route('users.index')->with('status', 'Compte ajouté. Transmettez le mot de passe à la personne par un canal privé. Elle devra aussi saisir le code reçu par e-mail pour se connecter.');
    }

    public function update(Request $request, string $user)
    {
        $data = $request->validate([
            'role' => ['required', Rule::enum(BackofficeRole::class)],
            'is_active' => ['required', 'boolean'],
            'version' => ['required', 'integer', 'min:1'],
            'current_password' => ['required', 'string', 'max:256'],
        ]);
        $this->locked(function () use ($request, $user, $data) {
            $actor = $this->actor($request, $data['current_password']);
            $target = User::whereKey($user)->lockForUpdate()->firstOrFail();
            if ($actor->id === $target->id) {
                throw ValidationException::withMessages(['role' => 'Vous ne pouvez pas modifier votre propre rôle ou désactiver votre compte ici.']);
            }
            abort_unless($target->session_version === (int) $data['version'], 409, 'Ce compte a changé. Actualisez la page avant de recommencer.');
            $role = BackofficeRole::from($data['role']);
            $active = (bool) $data['is_active'];
            $before = ['role' => $target->backofficeRole()?->value, 'active' => $target->is_active];
            if ($before === ['role' => $role->value, 'active' => $active]) {
                return;
            }
            if ($target->managesAccounts() && $target->is_active && ($role !== BackofficeRole::Admin || ! $active)) {
                abort_unless(User::where('is_active', true)->get()->filter(fn ($account) => $account->managesAccounts())->count() > 1, 409, 'Conservez au moins un administrateur actif.');
            }
            $target->role = $role->value;
            $target->is_admin = $role === BackofficeRole::Admin;
            $target->is_active = $active;
            $target->session_version++;
            $target->remember_token = Str::random(60);
            $target->save();
            DB::table('sessions')->where('user_id', $target->id)->delete();
            DB::table('login_email_challenges')->where('user_id', $target->id)->delete();
            $this->event($actor, $target, 'access', ['before' => $before, 'after' => ['role' => $role->value, 'active' => $active]]);
        });

        return redirect()->route('users.index')->with('status', 'Droits enregistrés. Les anciennes connexions de cette personne sont fermées.');
    }

    private function actor(Request $request, string $password): User
    {
        $user = User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
        abort_unless($user->managesAccounts() && $user->is_active
            && $user->session_version === $request->session()->get('admin_version'), 403);
        if (! app(AccountSecurityController::class)->confirmed($request, $user)) {
            throw ValidationException::withMessages(['current_password' => 'Connectez-vous avec votre mot de passe et votre code avant de gérer les comptes.']);
        }
        if (! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages(['current_password' => 'Votre mot de passe actuel est incorrect.']);
        }

        return $user;
    }

    private function event(User $actor, User $user, string $action, array $changes): void
    {
        DB::table('user_access_events')->insert(['actor_id' => $actor->id, 'user_id' => $user->id,
            'action' => $action, 'changes' => json_encode($changes, JSON_THROW_ON_ERROR), 'created_at' => now()]);
    }

    private function locked(callable $action): void
    {
        try {
            Cache::lock('geca-user-management', 120)->block(10, fn () => DB::transaction($action, 3));
        } catch (LockTimeoutException) {
            abort(409, 'Une modification des comptes est en cours. Recommencez dans quelques instants.');
        }
    }
}
