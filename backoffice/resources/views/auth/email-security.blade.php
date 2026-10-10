@extends('layouts.admin')
@section('title', 'Sécurité du compte')
@section('content')
<div class="heading">
    <h1>Sécurité du compte</h1>
    <p>Chaque connexion demande votre mot de passe puis un code envoyé à l’adresse e-mail de votre compte.</p>
</div>
<div class="security-sections">
@include('partials.account-security')
<section class="card login mfa-card">
    <h2>Protéger ma boîte mail</h2>
    <p>Protégez votre boîte mail avec un mot de passe différent de celui du back-office. Ne partagez jamais vos codes de connexion.</p>
</section>
</div>
@endsection
