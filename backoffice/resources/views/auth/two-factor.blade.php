@extends('layouts.admin')
@section('title', 'Double authentification')
@section('inline-errors', '1')
@section('content')
<section class="card login mfa-card">
    <p class="eyebrow">Deuxième étape</p>
    <h1>{{ $setup ? 'Protéger votre compte' : 'Confirmer votre connexion' }}</h1>
    @if($setup)
        <ol>
            <li>Ouvrez votre application Authenticator sur votre téléphone.</li>
            <li>Ajoutez un compte en scannant ce QR code.</li>
            <li>Saisissez le code à six chiffres affiché dans l’application.</li>
        </ol>
        <img class="mfa-qr" src="{{ route('two-factor.qr') }}" width="240" height="240" alt="QR code pour ajouter votre compte à Authenticator">
        <details><summary>Ajouter le compte sans scanner</summary>
            <p>Choisissez une clé de configuration : compte Global EcoAction, code basé sur le temps.</p>
            <p class="mfa-secret"><code>{{ $secret }}</code></p>
        </details>
        <p class="muted">Gardez cette clé privée. Ne partagez ni le QR code ni les codes avec une autre personne.</p>
    @else
        <p>Ouvrez Authenticator et saisissez le code de votre compte Global EcoAction.</p>
    @endif
    <form method="post" action="{{ route('two-factor.verify') }}" novalidate>
        @csrf
        <label for="code">Code Authenticator à six chiffres</label>
        <input id="code" name="code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required
            @if($errors->has('code')) aria-invalid="true" aria-describedby="code-error" autofocus @endif>
        @error('code')<p id="code-error" class="field-error" role="alert">{{ $message }}</p>@enderror
        <button type="submit">{{ $setup ? 'Activer la double authentification' : 'Confirmer la connexion' }}</button>
    </form>
    @unless($setup)
        <details class="mfa-alternative" @if($errors->has('recovery_code')) open @endif><summary>Utiliser un code de secours</summary>
            <p>Chaque code de secours fonctionne une seule fois.</p>
            <form method="post" action="{{ route('two-factor.verify') }}" novalidate>
                @csrf
                <label for="recovery-code">Code de secours</label>
                <input id="recovery-code" name="recovery_code" type="text" autocomplete="off" maxlength="35" required
                    @if($errors->has('recovery_code')) aria-invalid="true" aria-describedby="recovery-error" autofocus @endif>
                @error('recovery_code')<p id="recovery-error" class="field-error" role="alert">{{ $message }}</p>@enderror
                <button type="submit">Confirmer avec ce code de secours</button>
            </form>
        </details>
    @endunless
    <p class="muted">Cette étape expire après cinq minutes. Si un code vient d’être utilisé, attendez le suivant. Vérifiez l’heure automatique du téléphone.</p>
    <form method="post" action="{{ route('two-factor.cancel') }}">@csrf<button class="secondary" type="submit">Recommencer la connexion</button></form>
</section>
@endsection
