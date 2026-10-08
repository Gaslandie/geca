@extends('layouts.admin')
@section('title', 'Page introuvable')
@section('content')
<section class="card login"><h1>Page introuvable</h1><p>Cette adresse ne correspond à aucune page disponible.</p><a href="{{ route('login') }}">Revenir à la connexion</a></section>
@endsection
