@extends('layouts.admin')
@section('title', $label)
@section('content')
<a href="{{ route('dashboard') }}">Retour au tableau de bord</a>
<div class="heading"><p class="eyebrow">Fiches enregistrées</p><h1>{{ $label }}</h1></div>
<p class="notice">Choisissez une fiche à modifier. Vos changements restent dans cet espace ; ils ne sont pas encore visibles sur le site.</p>
<div class="entries">
@forelse($entries as $entry)
<article class="card entry">
    <div><h2>{{ $entry->label() }}</h2><p>{{ isset($entry->source_payload['linked_project']) ? 'Cette actualité est liée à un projet.' : ($entry->draft_payload ? 'Modifications enregistrées · non visibles sur le site' : 'Fiche d’origine · pas encore modifiée') }}</p></div>
    <a class="button secondary" href="{{ route('content.edit', ['kind' => $kind, 'entry' => $entry->id]) }}">{{ match ($kind) { 'projects' => 'Modifier le projet', 'news' => 'Modifier l’actualité', 'team' => 'Modifier les informations', default => 'Modifier la fiche' } }}</a>
</article>
@empty
<p>Aucune fiche n’a encore été ajoutée. Contactez le responsable du site pour ajouter du contenu.</p>
@endforelse
</div>
@if($entries->hasPages())<nav class="actions" aria-label="Pagination">@if($entries->previousPageUrl())<a href="{{ $entries->previousPageUrl() }}">Précédent</a>@endif @if($entries->nextPageUrl())<a href="{{ $entries->nextPageUrl() }}">Suivant</a>@endif</nav>@endif
@endsection
