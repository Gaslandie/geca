@extends('layouts.admin')
@section('title', match ($entry->kind) { 'projects' => 'Modifier le projet', 'news' => 'Modifier l’actualité', 'team' => 'Modifier la fiche du membre', default => 'Modifier la fiche' })
@section('content')
<a href="{{ route('content.index', $entry->kind) }}">Retour à la liste : {{ $label }}</a>
<div class="heading"><p class="eyebrow">{{ $label }}</p><h1>{{ $entry->label() }}</h1></div>
<p class="notice">Vous pouvez enregistrer le français sans remplir l’anglais. Vos changements ne sont pas encore visibles sur le site.</p>
<form class="card" method="post" enctype="multipart/form-data" action="{{ route('content.update', ['kind' => $entry->kind, 'entry' => $entry->id]) }}">
@csrf @method('PUT')
<input type="hidden" name="revision" value="{{ old('revision', $entry->revision) }}">
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
<label for="{{ $locale }}-{{ $field }}">{{ $fieldLabel }}{{ $locale === 'en' ? ' (facultatif)' : '' }}</label>
@if($field === 'description')
<textarea lang="{{ $locale }}" id="{{ $locale }}-{{ $field }}" name="payload[{{ $locale }}][{{ $field }}]" maxlength="20000" @required($locale === 'fr') @readonly($linkedProject !== null)>{{ old('payload.'.$locale.'.'.$field, $payload[$locale][$field] ?? '') }}</textarea>
@else
<input lang="{{ $locale }}" id="{{ $locale }}-{{ $field }}" name="payload[{{ $locale }}][{{ $field }}]" maxlength="1500" value="{{ old('payload.'.$locale.'.'.$field, $payload[$locale][$field] ?? '') }}" @required($locale === 'fr') @readonly($linkedProject !== null)>
@endif
@endforeach
</fieldset>
@if($locale === 'en')</details>@endif
@endforeach
<fieldset class="entry-photo-fields"><legend>{{ match ($entry->kind) { 'projects' => 'Photo du projet', 'news' => 'Photo de l’actualité', 'team' => 'Photo du membre', default => 'Photo' } }}</legend>
@if($media || $referencePhotoAvailable)
<img class="entry-photo" src="{{ $media ? route('media.preview', $media) : route('content.photo', ['kind' => $entry->kind, 'entry' => $entry->id]) }}" alt="{{ $media?->alt_fr ?? $entry->label() }}">
<p>Photo actuelle. Sans nouveau fichier, elle reste conservée.</p>
@if($media)
<details class="media-details"><summary>Informations sur la photo actuelle</summary>
<dl><dt>Origine</dt><dd>{{ $media->source }}</dd><dt>Photographe</dt><dd>{{ $media->credit ?: 'Non précisé' }}</dd><dt>Autorisation d’utilisation</dt><dd>{{ $media->license }}</dd></dl>
</details>
@endif
@endif
@if($photoAvailable)
<label for="photo">{{ $media || $referencePhotoAvailable ? 'Remplacer la photo (facultatif)' : 'Ajouter une photo (facultatif)' }}</label>
<p id="photo-help">JPEG, PNG ou WebP · 6 Mo maximum.</p>
<input type="file" id="photo" name="photo" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-help">
<label for="alt_fr">Que montre la nouvelle photo ?</label>
<input id="alt_fr" name="alt_fr" value="{{ old('alt_fr', $media?->alt_fr ?? '') }}" maxlength="1000">
<details class="media-details" @if(collect(['source', 'credit', 'license', 'alt_en', 'illustrative'])->contains(fn ($field) => $errors->has($field))) open @endif>
<summary>Informations sur la photo (facultatives)</summary>
@foreach(['source' => 'D’où vient la photo ?', 'credit' => 'Nom du photographe', 'license' => 'Autorisation d’utiliser la photo', 'alt_en' => 'Description de la photo en anglais'] as $field => $fieldLabel)
<label for="photo-{{ $field }}">{{ $fieldLabel }} (facultatif)</label>
<input id="photo-{{ $field }}" name="{{ $field }}" value="{{ old($field) }}" maxlength="{{ $field === 'alt_en' ? 1000 : 2000 }}">
@endforeach
<label for="illustrative">Cette photo montre-t-elle une activité de GECA ?</label>
<p id="illustrative-help">Si aucun document ne le confirme, choisissez « Illustration du sujet ».</p>
<select id="illustrative" name="illustrative" aria-describedby="illustrative-help"><option value="1" @selected(old('illustrative', '1') === '1')>Illustration du sujet</option><option value="0" @selected(old('illustrative') === '0')>Activité de GECA confirmée</option></select>
</details>
@else
<p>L’ajout de photos est indisponible pour le moment.</p>
@endif
</fieldset>
<label for="source_note">Qu’avez-vous changé ?</label>
<p id="source_help">Exemple : « J’ai corrigé le lieu du projet à la demande de GECA. » Cette note reste ici. Elle n’apparaît pas sur le site. Ne mettez pas de mot de passe ni d’information privée.</p>
<textarea id="source_note" name="source_note" required minlength="10" maxlength="2000" aria-describedby="source_help" placeholder="J’ai corrigé…">{{ old('source_note') }}</textarea>
<div class="actions"><button type="submit">Enregistrer les changements</button><a href="{{ route('content.index', $entry->kind) }}">Retour à la liste</a></div>
</form>
@endsection
