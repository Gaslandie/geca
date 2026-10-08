@extends('layouts.admin')
@section('title', 'Codes de secours')
@section('content')
<section class="card login mfa-card">
    <h1>Conservez vos codes de secours</h1>
    @if(count($codes))
        <p>Gardez ces dix codes dans un endroit sûr, séparé de votre téléphone. Ils ne seront affichés qu’une fois.</p>
        <ul class="mfa-codes">@foreach($codes as $code)<li><code>{{ $code }}</code></li>@endforeach</ul>
        <p>Chaque code remplace le code Authenticator pour une seule connexion. Votre mot de passe reste nécessaire.</p>
    @else
        <p>Les codes ont déjà été affichés. Si vous ne les avez pas conservés, connectez-vous avec Authenticator puis créez-en de nouveaux dans Sécurité du compte.</p>
    @endif
    @if($regenerated ?? false)
        <p>Les anciens codes et les autres sessions ont été annulés.</p>
        <a class="button" href="{{ route('security') }}">Retour à la sécurité du compte</a>
    @else
        <form method="post" action="{{ route('two-factor.finish') }}">
            @csrf
            <label class="consent"><input type="checkbox" name="saved" value="1" required><span>J’ai conservé mes codes de secours.</span></label>
            <button type="submit">Accéder à mon espace</button>
        </form>
        <form method="post" action="{{ route('two-factor.cancel') }}">@csrf<button class="secondary" type="submit">Revenir à la connexion</button></form>
    @endif
</section>
@endsection
