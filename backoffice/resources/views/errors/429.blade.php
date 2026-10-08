@extends('layouts.admin')
@section('title', 'Trop de tentatives')
@section('content')
<section class="card login"><h1>Trop de tentatives</h1><p>Patientez une minute avant de réessayer.</p><a href="{{ route('login') }}">Revenir à la connexion</a></section>
@endsection
