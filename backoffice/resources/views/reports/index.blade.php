@extends('layouts.admin')
@section('title', $archived ? 'Rapports retirés' : 'Rapports d’activités')
@section('content')
<x-admin-back :href="route('dashboard')" />
<header class="heading content-page-heading"><p class="eyebrow">Espace privé</p><h1>{{ $archived ? 'Rapports retirés' : 'Rapports d’activités' }}</h1><p>Les documents sont accessibles aux administrateurs autorisés de GECA.</p></header>
<div class="content-create-action actions">
@if($archived)
<a class="button secondary" href="{{ route('reports.index') }}">Retour aux rapports</a>
@elseif(auth()->user()->editsContent())
<a class="button" href="{{ route('reports.create') }}">Ajouter un rapport</a>
<a class="button secondary" href="{{ route('reports.archives') }}">Rapports retirés</a>
@endif
</div>
<div class="entries">
@forelse($reports as $report)
<article class="card entry report-entry">
<div><h2>{{ $report->title }}</h2><p><strong>Période :</strong> {{ $report->periodLabel() }}</p><p>PDF · {{ max(1, (int) ceil($report->bytes / 1024)) }} Ko · Ajouté le {{ $report->created_at->format('d/m/Y') }}</p></div>
@if($archived)
<form method="post" action="{{ route('reports.restore', $report) }}">@csrf<input type="hidden" name="revision" value="{{ $report->revision }}"><button type="submit" class="secondary">Restaurer<span class="visually-hidden"> : {{ $report->title }}</span></button></form>
@else
<div class="actions"><a class="button secondary" href="{{ route('reports.download', $report) }}">Télécharger le PDF<span class="visually-hidden"> : {{ $report->title }}</span></a>@if(auth()->user()->editsContent())<a class="button secondary" href="{{ route('reports.edit', $report) }}">Modifier<span class="visually-hidden"> : {{ $report->title }}</span></a>@endif</div>
@endif
</article>
@empty
<p class="heading media-list">{{ $archived ? 'Aucun rapport retiré.' : (auth()->user()->editsContent() ? 'Aucun rapport pour le moment. Utilisez Ajouter un rapport pour déposer le premier document.' : 'Aucun rapport pour le moment.') }}</p>
@endforelse
</div>
{{ $reports->links('newsletter.pagination', ['label' => 'Pages des rapports']) }}
@endsection
