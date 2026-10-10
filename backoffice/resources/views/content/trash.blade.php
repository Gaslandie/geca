@extends('layouts.admin')
@section('title', 'Corbeille · '.$label)
@section('content')
@if($kind)
<a class="page-back" href="{{ route('content.index', $kind) }}">Retour à la liste : {{ $label }}</a>
@else
<x-admin-back :href="route('dashboard')" />
@endif
<header class="heading content-page-heading"><h1>Corbeille</h1><p>{{ $label }}</p></header>
<div class="entries">
    @forelse($entries as $entry)
    <article class="card entry">
        <div>@if(!$kind)<p class="eyebrow">{{ $kindLabels[$entry->kind] }}</p>@endif<h2>{{ $labels[$entry->id] }}</h2><p>Supprimé le {{ $entry->deleted_at->format('d/m/Y à H:i') }}.</p>@if($entry->kind === 'projects')<p>Les actualités retirées avec ce projet seront aussi restaurées.</p>@elseif(isset($entry->source_payload['linked_project']))<p>Le projet associé doit être présent dans la liste pour restaurer cette actualité.</p>@endif</div>
        <form method="post" action="{{ route('content.restore', ['kind' => $entry->kind, 'entry' => $entry->id]) }}">
            @csrf<input type="hidden" name="revision" value="{{ $entry->revision }}">
            <button class="secondary" type="submit">Restaurer</button>
        </form>
    </article>
    @empty<p>La corbeille est vide.</p>@endforelse
</div>
{{ $entries->withQueryString()->links('newsletter.pagination', ['label'=>'Pages de la corbeille']) }}
@endsection
