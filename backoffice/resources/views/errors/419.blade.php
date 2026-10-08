@extends('layouts.admin')
@section('title', 'La page est restée ouverte trop longtemps')
@section('content')
<section class="card login"><h1>La page est restée ouverte trop longtemps</h1><p>Rouvrez la page, puis réessayez. Votre demande n’a pas été enregistrée.</p><a href="{{ route('login') }}">Revenir à la connexion</a></section>
@endsection
