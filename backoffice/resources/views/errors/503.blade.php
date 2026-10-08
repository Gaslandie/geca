@extends('layouts.admin')
@section('title', 'Espace temporairement fermé')
@section('content')
<section class="card login"><h1>Espace temporairement fermé</h1><p>Nous travaillons sur cet espace. Réessayez plus tard.</p><a href="{{ route('login') }}">Revenir à la connexion</a></section>
@endsection
