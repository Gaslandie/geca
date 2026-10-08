@extends('layouts.admin')
@section('title', 'Une erreur est survenue')
@section('content')
<section class="card login"><h1>Une erreur est survenue</h1><p>Votre demande n’a pas pu être terminée. Réessayez dans quelques instants.</p><a href="{{ route('login') }}">Revenir à la connexion</a></section>
@endsection
