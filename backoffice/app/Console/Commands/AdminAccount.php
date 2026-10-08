<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AdminAccount extends Command
{
    protected $signature = 'geca:admin {action : create, reset, recover-mfa ou revoke}';

    protected $description = 'Gérer un accès administrateur avec saisie masquée du mot de passe';

    public function handle(): int
    {
        if (! $this->input->isInteractive()) {
            $this->error('Cette commande exige un terminal interactif. Aucun secret en argument.');

            return self::FAILURE;
        }
        $action = $this->argument('action');
        if (! in_array($action, ['create', 'reset', 'recover-mfa', 'revoke'], true)) {
            $this->error('Action inconnue.');

            return self::FAILURE;
        }
        $email = mb_strtolower(trim((string) $this->ask('Adresse e-mail du compte')));
        if (Validator::make(['email' => $email], ['email' => 'required|email|max:254'])->fails()) {
            $this->error('Adresse invalide.');

            return self::FAILURE;
        }
        $user = User::where('email', $email)->first();
        if (($action === 'create' && $user) || ($action !== 'create' && (! $user || ! $user->is_admin))) {
            $this->error('Création : compte existant, ou gestion : administrateur introuvable.');

            return self::FAILURE;
        }
        if ($action === 'revoke') {
            if (! $this->confirm('Révoquer cet accès et toutes ses sessions ?', false)) {
                return self::FAILURE;
            }
            DB::transaction(function () use ($user) {
                $current = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
                $current->is_active = false;
                $current->session_version++;
                $current->remember_token = null;
                $current->save();
                DB::table('sessions')->where('user_id', $current->id)->delete();
            });
            $this->info('Accès révoqué.');

            return self::SUCCESS;
        }
        if ($action === 'recover-mfa' && ! $this->confirm('Avez-vous vérifié hors ligne l’identité et l’autorisation de la personne ? Cette opération impose un nouveau mot de passe et annule le téléphone, les codes de secours et toutes les sessions.', false)) {
            return self::FAILURE;
        }
        $name = $action === 'create' ? trim((string) $this->ask('Nom de la personne autorisée')) : $user->name;
        // Pas de saisie visible si le terminal ne sait pas masquer les secrets.
        $password = $this->secret('Mot de passe : 15 caractères minimum, 72 caractères simples maximum', false);
        $confirmation = $this->secret('Confirmer le mot de passe', false);
        $validator = Validator::make(
            ['name' => $name, 'password' => $password, 'password_confirmation' => $confirmation],
            ['name' => 'required|string|max:255', 'password' => ['required', 'string', 'min:15', 'max:72', 'confirmed', function ($attribute, $value, $fail) {
                if (strlen($value) > 72) {
                    $fail('Mot de passe trop long en octets.');
                }
            }]]
        );
        if ($validator->fails()) {
            $this->error('Nom ou mot de passe invalide, ou confirmation différente. Aucun changement.');

            return self::FAILURE;
        }
        if ($action === 'reset' && ! $this->confirm('Réinitialiser le mot de passe et fermer les sessions ? Un compte révoqué restera révoqué.', false)) {
            return self::FAILURE;
        }
        DB::transaction(function () use ($action, $user, $name, $email, $password) {
            $current = $action === 'create' ? new User : User::whereKey($user->id)->lockForUpdate()->firstOrFail();
            $current->name = $name;
            $current->email = $email;
            $current->password = $password;
            if ($action === 'create') {
                $current->is_admin = true;
                $current->is_active = true;
            }
            if ($action === 'recover-mfa') {
                $current->two_factor_secret = null;
                $current->two_factor_recovery_hashes = null;
                $current->two_factor_confirmed_at = null;
                $current->two_factor_last_step = null;
            }
            $current->session_version = ($current->session_version ?? 0) + 1;
            $current->remember_token = Str::random(60);
            $current->save();
            DB::table('sessions')->where('user_id', $current->id)->delete();
        });
        $this->info('Compte enregistré. Aucun e-mail envoyé.');

        return self::SUCCESS;
    }
}
