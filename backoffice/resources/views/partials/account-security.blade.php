@if(!$accountActionsAvailable)
<section class="card login mfa-card">
    <h2>Vous utilisez l’accès local temporaire</h2>
    <p>Pour changer votre mot de passe ou fermer vos connexions, connectez-vous avec votre mot de passe et votre code de connexion.</p>
    @if(!$normalLoginConfigured)
    <p>L’envoi des codes e-mail n’est pas encore configuré sur cette copie locale. Ces deux commandes seront disponibles après cette configuration et une connexion complète. Vous pouvez continuer à vérifier les autres rubriques avec votre accès local.</p>
    @endif
    @if($normalLoginConfigured)
    <form method="post" action="{{ route('logout') }}">@csrf<button type="submit" class="secondary">Quitter l’accès local pour me connecter</button></form>
    @endif
</section>
@endif
<section class="card login mfa-card">
    <h2>Changer mon mot de passe</h2>
    <p>Choisissez une phrase d’au moins 15 caractères, différente du mot de passe de votre boîte mail. Toutes vos connexions seront fermées après le changement, y compris celle-ci.</p>
    <form method="post" action="{{ route('security.password') }}">
        @csrf
        @method('PUT')
        <fieldset @disabled(!$accountActionsAvailable)>
            <legend>Votre mot de passe</legend>
            <label for="current-password">Mot de passe actuel</label>
            <input id="current-password" name="current_password" type="password" autocomplete="current-password" required maxlength="256">
            <label for="new-password">Nouveau mot de passe</label>
            <p id="password-help">15 à 72 caractères. Les accents utilisent plus de place ; une phrase très longue peut être refusée.</p>
            <input id="new-password" name="password" type="password" autocomplete="new-password" required minlength="15" maxlength="72" aria-describedby="password-help">
            <label for="password-confirmation">Confirmer le nouveau mot de passe</label>
            <input id="password-confirmation" name="password_confirmation" type="password" autocomplete="new-password" required minlength="15" maxlength="72">
            <button type="submit">Changer mon mot de passe</button>
        </fieldset>
    </form>
</section>
<section class="card login mfa-card">
    <h2>Déconnecter tous les appareils</h2>
    <p>Fermez vos connexions au back-office sur les autres navigateurs et appareils, ainsi que celle-ci. Votre mot de passe restera le même.</p>
    <form method="post" action="{{ route('security.logout-all') }}">
        @csrf
        <fieldset @disabled(!$accountActionsAvailable)>
            <legend>Confirmer la déconnexion</legend>
            <label for="logout-password">Mot de passe actuel</label>
            <input id="logout-password" name="current_password" type="password" autocomplete="current-password" required maxlength="256">
            <button type="submit" class="secondary">Déconnecter tous les appareils</button>
        </fieldset>
    </form>
</section>
