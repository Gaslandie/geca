@extends('layouts.admin')
@php $creating = ! $entry->exists; @endphp
@section('title', $creating ? $currentLabel : match ($entry->kind) { 'projects' => 'Modifier le projet', 'news' => 'Modifier l’actualité', 'team' => 'Modifier la fiche du membre', default => 'Modifier la fiche' })
@section('content')
<a class="page-back" href="{{ route('content.index', $entry->kind) }}">Retour à la liste : {{ $label }}</a>
<header class="heading content-page-heading"><p class="eyebrow">{{ $label }}</p><h1>{{ $currentLabel }}</h1></header>
<form class="card" method="post" enctype="multipart/form-data" action="{{ $creating ? route('content.store', $entry->kind) : route('content.update', ['kind' => $entry->kind, 'entry' => $entry->id]) }}">
@csrf
@if($creating)
<input type="hidden" name="creation_token" value="{{ $creationToken }}">
<p>Cette fiche sera enregistrée dans le back-office. Elle ne sera pas publiée sur le site. Saisissez uniquement des informations confirmées par GECA.</p>
@else
@method('PUT')
<input type="hidden" name="revision" value="{{ old('revision', $entry->revision) }}">
@endif
@if($linkedProject)
<p>Cette actualité reprend les informations du projet associé. <a href="{{ route('content.edit', ['kind' => 'projects', 'entry' => $linkedProject->id]) }}">Ouvrir le projet associé</a>. Vous pouvez choisir une photo différente pour cette actualité ci-dessous.</p>
@endif
@foreach(['fr' => 'Informations en français', 'en' => 'Informations en anglais'] as $locale => $language)
@if($locale === 'en')
<details class="english-version" @if(collect($errors->keys())->contains(fn ($key) => $key === 'payload.en' || str_starts_with($key, 'payload.en.'))) open @endif>
<summary>Version anglaise (facultative)</summary>
<p>Vous pouvez vous en occuper plus tard. Les textes anglais déjà présents sont conservés si vous ne les changez pas. Après une correction du français, pensez à vérifier aussi la traduction.</p>
@endif
<fieldset><legend>{{ $language }}</legend>
@foreach($entry->fields() as $field => $fieldLabel)
<label for="{{ $locale }}-{{ $field }}">{{ $fieldLabel }}{{ $locale === 'en' || !in_array($field, $entry->requiredFields(), true) ? ' (facultatif)' : '' }}</label>
@if($field === 'description')
<textarea lang="{{ $locale }}" id="{{ $locale }}-{{ $field }}" name="payload[{{ $locale }}][{{ $field }}]" maxlength="20000" @required($locale === 'fr' && in_array($field, $entry->requiredFields(), true)) @readonly($linkedProject !== null)>{{ old('payload.'.$locale.'.'.$field, $payload[$locale][$field] ?? '') }}</textarea>
@else
<input lang="{{ $locale }}" id="{{ $locale }}-{{ $field }}" name="payload[{{ $locale }}][{{ $field }}]" maxlength="1500" value="{{ old('payload.'.$locale.'.'.$field, $payload[$locale][$field] ?? '') }}" @required($locale === 'fr' && in_array($field, $entry->requiredFields(), true)) @readonly($linkedProject !== null)>
@endif
@endforeach
</fieldset>
@if($locale === 'en')</details>@endif
@endforeach
<fieldset class="entry-photo-fields"><legend>{{ match ($entry->kind) { 'projects' => 'Photo du projet', 'news' => 'Photo de l’actualité', 'team' => 'Photo du membre', default => 'Photo' } }}</legend>
@if($media || $referencePhotoAvailable)
<div data-photo-current>
<img class="entry-photo" src="{{ $media ? route('media.preview', $media) : route('content.photo', ['kind' => $entry->kind, 'entry' => $entry->id]) }}" alt="{{ $media?->alt_fr ?? $entry->label() }}">
<p>Photo actuelle. Sans nouveau fichier, elle reste conservée.</p>
@if($media)
<p>Version allégée : {{ max(1, (int) ceil($media->preview_bytes / 1024)) }} Ko. Original conservé : {{ max(1, (int) ceil($media->original_bytes / 1024)) }} Ko.</p>
@endif
</div>
@endif
@if($photoAvailable)
<div class="photo-preview-panel" data-photo-preview-panel hidden>
    <img class="photo-preview-image" data-photo-preview-image alt="Aperçu de la nouvelle photo" hidden>
    <button type="button" class="secondary" data-photo-preview-cancel>Annuler le choix de la photo</button>
</div>
<p id="photo-preview-status" class="photo-preview-status" aria-live="polite"></p>
<label for="photo">{{ $media || $referencePhotoAvailable ? 'Remplacer la photo (facultatif)' : 'Ajouter une photo (facultatif)' }}</label>
<p id="photo-help">JPEG, PNG ou WebP · 6 Mo maximum. La photo sera allégée automatiquement à l’enregistrement.</p>
<input type="file" id="photo" name="photo" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-help photo-preview-status" data-photo-preview-input>
<noscript><p>L’aperçu apparaît après l’enregistrement lorsque JavaScript est désactivé.</p></noscript>
@else
<p>L’ajout de photos est indisponible pour le moment.</p>
@endif
</fieldset>
<label for="source_note">{{ $creating ? 'D’où viennent ces informations ?' : 'Qu’avez-vous changé ?' }}</label>
<p id="source_help">{{ $creating ? 'Indiquez le document ou la personne de GECA qui a confirmé ces informations.' : 'Exemple : « J’ai corrigé le lieu du projet à la demande de GECA. »' }} Cette note reste ici. Elle n’apparaît pas sur le site. Ne mettez pas de mot de passe ni d’information privée.</p>
<textarea id="source_note" name="source_note" required minlength="10" maxlength="2000" aria-describedby="source_help" placeholder="{{ $creating ? 'Document ou personne ayant confirmé les informations…' : 'J’ai corrigé…' }}">{{ old('source_note') }}</textarea>
<div class="actions"><button type="submit">{{ $creating ? match ($entry->kind) { 'projects' => 'Ajouter le projet', 'news' => 'Ajouter l’actualité', 'team' => 'Ajouter le membre' } : 'Enregistrer les changements' }}</button><a href="{{ route('content.index', $entry->kind) }}">{{ $creating ? 'Annuler' : 'Retour à la liste' }}</a></div>
</form>
@if(!$creating)
<div class="actions"><a class="delete-link" href="{{ route('content.confirm-delete', ['kind' => $entry->kind, 'entry' => $entry->id]) }}">{{ match ($entry->kind) { 'projects' => 'Supprimer le projet', 'news' => 'Supprimer l’actualité', 'team' => 'Supprimer la fiche du membre' } }}</a></div>
@endif
@endsection
@if($photoAvailable)
@push('scripts')
<script src="{{ asset('photo-preview.js') }}" nonce="{{ $photoPreviewNonce }}" defer></script>
@endpush
@endif
