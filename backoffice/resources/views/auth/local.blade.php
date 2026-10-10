@extends('layouts.admin')
@section('title', 'Accès local')
@section('content')
<section class="card login">
    <p class="eyebrow">Sur cet ordinateur</p>
    <h1>Ouvrir le back-office local</h1>
    <p>Entrez sans saisir d’e-mail, de mot de passe ou de code. Vous travaillez sur les données locales. Cet accès est temporaire.</p>
    <form method="post" action="{{ route('local-access.store') }}">
        @csrf
        <button type="submit">Entrer dans le back-office</button>
    </form>
</section>
@endsection
