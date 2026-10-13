@extends('layouts.admin')
@php
    $creating = !$account->exists;
    $oldRole = old('role');
    $selectedRole = is_string($oldRole) && \App\Enums\BackofficeRole::tryFrom($oldRole) ? $oldRole : ($account->backofficeRole()?->value ?? 'reader');
    $oldActive = old('is_active');
    $selectedActive = in_array($oldActive, ['0', '1', 0, 1], true) ? (int)$oldActive : (int)$account->is_active;
@endphp
@section('title', $creating ? 'Ajouter un compte' : 'Modifier les droits')
@section('content')
<x-admin-back :href="route('users.index')" />
<header class="heading content-page-heading"><p class="eyebrow">Comptes et rôles</p><h1>{{ $creating ? 'Ajouter un compte' : 'Modifier les droits' }}</h1></header>
<form class="card" method="post" action="{{ $creating ? route('users.store') : route('users.update', $account->id) }}">
@csrf
@if($creating)
<input type="hidden" name="creation_token" value="{{ $creationToken }}">
<label for="name">Nom de la personne</label><input id="name" name="name" required maxlength="255" autocomplete="name" value="{{ is_string(old('name')) ? old('name') : '' }}">
<label for="email">Adresse e-mail de la personne</label><input id="email" name="email" type="email" required maxlength="254" autocomplete="off" value="{{ is_string(old('email')) ? old('email') : '' }}" aria-describedby="email-help"><p id="email-help">Cette adresse recevra les codes de connexion.</p>
@else
@method('PUT')<input type="hidden" name="version" value="{{ $account->session_version }}">
<h2>{{ $account->name }}</h2><p class="heading">{{ $account->email }}</p>
@endif
<label for="role">Rôle</label><select id="role" name="role" required aria-describedby="role-help">
@foreach($roles as $role)<option value="{{ $role->value }}" @selected($selectedRole === $role->value)>{{ $role->label() }}</option>@endforeach
</select>
<div id="role-help">@foreach($roles as $role)<p><strong>{{ $role->label() }} :</strong> {{ $role->description() }}</p>@endforeach</div>
@if($creating)
<label for="password">Mot de passe de la personne</label><input id="password" name="password" type="password" required minlength="15" maxlength="72" autocomplete="new-password" aria-describedby="password-help"><p id="password-help">Une phrase de 15 caractères minimum. Transmettez-la par un canal privé. La personne pourra ensuite la changer dans Sécurité du compte.</p>
<label for="password_confirmation">Confirmer le mot de passe de la personne</label><input id="password_confirmation" name="password_confirmation" type="password" required autocomplete="new-password">
@else
<label for="is_active">État du compte</label><select id="is_active" name="is_active" required><option value="1" @selected($selectedActive === 1)>Actif</option><option value="0" @selected($selectedActive === 0)>Désactivé</option></select>
<p>Changer le rôle ou désactiver ce compte fermera ses anciennes connexions. Les contenus et documents seront conservés.</p>
@endif
<label for="current_password">Votre mot de passe actuel</label><input id="current_password" name="current_password" type="password" required autocomplete="current-password" aria-describedby="confirmation-help"><p id="confirmation-help">Il confirme que vous autorisez cette modification des accès.</p>
<div class="actions"><button type="submit">{{ $creating ? 'Ajouter le compte' : 'Enregistrer les droits' }}</button><a href="{{ route('users.index') }}">Annuler</a></div>
</form>
@endsection
