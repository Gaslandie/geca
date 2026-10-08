@extends('layouts.admin')
@section('title', 'Accès refusé')
@section('content')
<section class="card login"><h1>Accès refusé</h1><p>Ce compte n’a pas l’autorisation d’ouvrir cet espace. Contactez le responsable du site.</p><a href="{{ route('login') }}">Revenir à la connexion</a></section>
@endsection
