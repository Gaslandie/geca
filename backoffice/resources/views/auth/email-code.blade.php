@extends('layouts.admin')
@section('title', 'Code de connexion')
@section('inline-errors', '1')
@section('content')
<section class="card login mfa-card">
    <p class="eyebrow">Vérification de connexion</p>
    <h1>Saisissez le code reçu par e-mail</h1>
    <p>Un code a été envoyé à l’adresse e-mail de votre compte. Vérifiez aussi les courriers indésirables.</p>
    <form method="post" action="{{ route('two-factor.verify') }}" novalidate>
        @csrf
        <label for="code">Code à six chiffres</label>
        <input id="code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required
            @if($errors->has('code')) aria-invalid="true" aria-describedby="code-error" autofocus @endif>
        @error('code')<p id="code-error" class="field-error" role="alert">{{ $message }}</p>@enderror
        <button type="submit">Confirmer la connexion</button>
    </form>
    <p class="muted">Le code expire après cinq minutes et fonctionne une seule fois. Ne le partagez pas.</p>
    <form method="post" action="{{ route('two-factor.cancel') }}">@csrf<button class="secondary" type="submit">Recommencer la connexion</button></form>
</section>
@endsection
