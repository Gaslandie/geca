@extends('layouts.admin')
@section('title', 'Tableau de bord')
@section('content')
<div class="dashboard-heading"><div><h1>Tableau de bord</h1><p>Choisissez une rubrique pour ajouter ou modifier les informations et les photos.</p></div><span class="private-badge">Espace privé</span></div>
<dl class="dashboard-stats">
    @foreach(['projects' => ['Projets et programmes', 'Projets enregistrés'], 'news' => ['Actualités', 'Actualités enregistrées'], 'team' => ['Équipe', 'Personnes dans l’équipe'], 'reports' => ['Rapports d’activités', 'Rapports enregistrés']] as $kind => [$label, $caption])
        <div class="card"><dt>{{ $label }}</dt><dd class="dashboard-count">{{ $counts[$kind] }}</dd><dd>{{ $caption }}</dd></div>
    @endforeach
</dl>
<section class="dashboard-management" aria-labelledby="management-title">
    <h2 id="management-title">{{ auth()->user()->editsContent() ? 'Que voulez-vous ajouter ou modifier ?' : 'Que voulez-vous consulter ?' }}</h2>
    <div class="dashboard-grid">
        @foreach([
            ['label' => 'Rapports d’activités', 'description' => 'Déposer les rapports PDF, les télécharger et modifier leurs informations.', 'action' => 'Ouvrir les rapports', 'url' => route('reports.index')],
            ['label' => 'Projets et programmes', 'description' => 'Ajouter ou modifier les projets et leurs photos.', 'action' => 'Ouvrir les projets', 'url' => route('content.index', 'projects')],
            ['label' => 'Actualités', 'description' => 'Ajouter ou modifier les actualités et leurs photos.', 'action' => 'Ouvrir les actualités', 'url' => route('content.index', 'news')],
            ['label' => 'Équipe', 'description' => 'Ajouter ou modifier les informations et les portraits des membres de l’équipe.', 'action' => 'Ouvrir l’équipe', 'url' => route('content.index', 'team')],
        ] as $card)
            <article class="card dashboard-card"><h3>{{ $card['label'] }}</h3><p>{{ auth()->user()->editsContent() ? $card['description'] : 'Consulter les informations enregistrées dans cette rubrique.' }}</p><a class="dashboard-link" href="{{ $card['url'] }}">{{ $card['action'] }}<x-admin-icon name="arrow" /></a></article>
        @endforeach
    </div>
</section>
@if(auth()->user()->managesAccounts())<div class="actions"><a class="button secondary" href="{{ route('users.index') }}">Gérer les comptes et rôles</a></div>@endif
<p class="dashboard-footnote">Les informations d’origine sont conservées, même après vos changements.</p>
@endsection
