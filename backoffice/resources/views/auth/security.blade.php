@extends('layouts.admin')
@section('title', 'Sécurité du compte')
@section('content')
<div class="heading">
    <h1>Sécurité du compte</h1>
    <p>Chaque connexion demande votre mot de passe puis un code Authenticator.</p>
</div>
<div class="security-sections">
@include('partials.account-security')
@if($accountActionsAvailable)
<section class="card login mfa-card">
    <h2>Créer de nouveaux codes de secours</h2>
    <p>Il vous reste {{ $remaining }} codes de secours.</p>
    <p>Les anciens codes seront annulés. Vos autres sessions seront fermées.</p>
    <form method="post" action="{{ route('security.regenerate') }}" novalidate>
        @csrf
        <label for="password">Mot de passe actuel</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required maxlength="256">
        <label for="code">Code Authenticator ou code de secours inutilisé</label>
        <input id="code" name="code" type="text" autocomplete="off" required maxlength="35">
        <button type="submit">Créer mes nouveaux codes</button>
    </form>
    <p class="muted">Si vous avez perdu votre téléphone et tous vos codes, contactez le responsable du site. Aucun e-mail seul ne permet de retirer cette protection.</p>
</section>
@endif
</div>
@endsection
