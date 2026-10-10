@extends('layouts.admin')
@section('title', $label)
@section('content')
<x-admin-back :href="route('dashboard')" />
<header class="heading content-page-heading"><p class="eyebrow">Fiches enregistrées</p><h1>{{ $label }}</h1></header>
<div class="content-create-action"><a class="button" href="{{ route('content.create', $kind) }}">{{ match ($kind) { 'projects' => 'Ajouter un projet', 'news' => 'Ajouter une actualité', 'team' => 'Ajouter un membre' } }}</a></div>
<div class="entries">
@forelse($entries as $entry)
<article class="card entry">
    <div>
        @if($kind === 'team')
        <h2 class="team-entry-name">
            @if($photos[$entry->id])
            <img class="team-entry-avatar" src="{{ $photos[$entry->id] }}" alt="" width="56" height="56" loading="lazy" decoding="async">
            @else
            <span class="team-entry-avatar team-entry-avatar-placeholder" aria-hidden="true">{{ mb_strtoupper(mb_substr($labels[$entry->id], 0, 1)) }}</span>
            @endif
            <span>{{ $labels[$entry->id] }}</span>
        </h2>
        @else
        <h2>{{ $labels[$entry->id] }}</h2>
        @endif
        @if(isset($entry->source_payload['linked_project']))<p>Cette actualité est liée à un projet.</p>@elseif($entry->draft_payload)<p>{{ str_starts_with($entry->source_key, 'admin-') ? 'Brouillon enregistré' : 'Modifications enregistrées' }}</p>@endif
    </div>
    <a class="button secondary" href="{{ route('content.edit', ['kind' => $kind, 'entry' => $entry->id]) }}">{{ match ($kind) { 'projects' => 'Modifier le projet', 'news' => 'Modifier l’actualité', 'team' => 'Modifier les informations', default => 'Modifier la fiche' } }}</a>
</article>
@empty
<p>Aucune fiche pour le moment. Utilisez le bouton Ajouter pour commencer.</p>
@endforelse
</div>
@if($entries->hasPages())<nav class="actions" aria-label="Pagination">@if($entries->previousPageUrl())<a href="{{ $entries->previousPageUrl() }}">Précédent</a>@endif @if($entries->nextPageUrl())<a href="{{ $entries->nextPageUrl() }}">Suivant</a>@endif</nav>@endif
@endsection
