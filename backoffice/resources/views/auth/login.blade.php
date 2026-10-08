@extends('layouts.admin')
@section('title', 'Connexion')
@section('inline-errors', '1')
@section('content')
<section class="card login">
    <p class="eyebrow">Accès réservé</p>
    <h1>Votre espace de gestion</h1>
    <p>Saisissez votre adresse e-mail et votre mot de passe. La double authentification sera demandée ensuite.</p>
    <form method="post" action="{{ route('login.store') }}" novalidate>
        @csrf
        <label for="email">Adresse e-mail</label>
        <input id="email" name="email" type="email" autocomplete="username" required maxlength="254" value="{{ old('email') }}"
            @if($errors->has('email')) aria-invalid="true" aria-describedby="email-error" autofocus
            @elseif($errors->has('credentials')) aria-invalid="true" aria-describedby="credentials-error" @endif>
        @error('email')<p id="email-error" class="field-error" role="alert">{{ $message }}</p>@enderror
        <label for="password">Mot de passe</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required maxlength="256"
            @if($errors->has('password')) aria-invalid="true" aria-describedby="password-error"
            @elseif($errors->has('credentials')) aria-invalid="true" aria-describedby="credentials-error" @endif
            @if(!$errors->has('email') && ($errors->has('password') || $errors->has('credentials'))) autofocus @endif>
        @error('password')<p id="password-error" class="field-error" role="alert">{{ $message }}</p>@enderror
        @error('credentials')<p id="credentials-error" class="field-error" role="alert">{{ $message }}</p>@enderror
        <button type="submit">Se connecter</button>
    </form>
    <p class="muted">Vous n’arrivez plus à vous connecter ? Contactez le responsable du site pour récupérer votre accès.</p>
</section>
@endsection
