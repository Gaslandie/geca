@extends('layouts.admin')
@section('title', 'Comptes et rôles')
@section('content')
<x-admin-back :href="route('dashboard')" />
<header class="heading content-page-heading"><p class="eyebrow">Accès au back-office</p><h1>Comptes et rôles</h1><p>Chaque personne utilise son propre compte et les droits de son rôle.</p></header>
<div class="content-create-action actions"><a class="button" href="{{ route('users.create') }}">Ajouter un compte</a></div>
<div class="entries">
@foreach($users as $account)
<article class="card entry">
<div class="heading"><h2>{{ $account->name }}</h2><p>{{ $account->email }}</p><p>{{ $account->backofficeRole()?->label() ?? 'Aucun accès' }} · {{ $account->is_active ? 'Actif' : 'Désactivé' }}</p></div>
@if($account->id === auth()->id())<p>Votre compte. Utilisez Sécurité du compte pour changer votre mot de passe.</p>
@else<a class="button secondary" href="{{ route('users.edit', $account->id) }}">Modifier les droits<span class="visually-hidden"> : {{ $account->name }}</span></a>@endif
</article>
@endforeach
</div>
{{ $users->links('newsletter.pagination', ['label' => 'Pages des comptes']) }}
@endsection
