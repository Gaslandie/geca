@extends('layouts.admin')
@php
    $creating = ! $report->exists;
    $dates = $report->dateFields();
    $fieldValue = static function ($field, $default = '') {
        $value = old($field, $default);
        return is_string($value) || is_int($value) ? $value : '';
    };
@endphp
@section('title', $creating ? 'Ajouter un rapport' : 'Modifier le rapport')
@section('content')
<a class="page-back" href="{{ route('reports.index') }}">Retour aux rapports d’activités</a>
<header class="heading content-page-heading"><p class="eyebrow">Rapports d’activités</p><h1>{{ $creating ? 'Ajouter un rapport' : 'Modifier le rapport' }}</h1></header>
<form class="card" method="post" enctype="multipart/form-data" action="{{ $creating ? route('reports.store') : route('reports.update', $report) }}">
@csrf
@if($creating)<input type="hidden" name="creation_token" value="{{ $creationToken }}">@else @method('PUT')<input type="hidden" name="revision" value="{{ $fieldValue('revision', $report->revision) }}">@endif
<p>Déposez un rapport de GECA. Il reste dans le back-office et n’est pas publié sur le site.</p>
<label for="title">Titre du rapport</label>
<input id="title" name="title" maxlength="200" required value="{{ $fieldValue('title', $report->title) }}" @if($errors->has('title')) aria-invalid="true" aria-describedby="title-error" @endif>
@error('title')<p id="title-error">{{ $message }}</p>@enderror
<fieldset><legend>Période couverte</legend>
<p id="period-help">Choisissez le premier et le dernier jour couverts par le rapport. Les deux dates sont obligatoires. La fin ne peut pas venir avant le début.</p>
@if(!$creating && !$dates)<p>Période précédemment enregistrée : {{ $report->period }}. Choisissez les dates exactes avant d’enregistrer une modification.</p>@endif
@foreach(['start_date' => 'Date de début', 'end_date' => 'Date de fin'] as $field => $label)
<label for="{{ $field }}">{{ $label }}</label>
<input type="date" id="{{ $field }}" name="{{ $field }}" min="0001-01-01" max="9999-12-31" required value="{{ $fieldValue($field, $dates[$field] ?? '') }}" aria-describedby="period-help{{ $errors->has($field) ? ' '.$field.'-error' : '' }}" @if($errors->has($field)) aria-invalid="true" @endif>
@error($field)<p id="{{ $field }}-error">{{ $message }}</p>@enderror
@endforeach
</fieldset>
<label for="description">Description (facultative)</label>
<textarea id="description" name="description" maxlength="5000" @if($errors->has('description')) aria-invalid="true" aria-describedby="description-error" @endif>{{ $fieldValue('description', $report->description) }}</textarea>
@error('description')<p id="description-error">{{ $message }}</p>@enderror
<fieldset><legend>Document PDF</legend>
@if(!$creating)<p>Fichier actuel : {{ max(1, (int) ceil($report->bytes / 1024)) }} Ko. <a href="{{ route('reports.download', $report) }}">Télécharger le PDF actuel</a>.</p>@endif
<label for="document">{{ $creating ? 'Choisir le rapport PDF' : 'Remplacer le PDF (facultatif)' }}</label>
<p id="document-help">PDF uniquement · 10 Mo maximum.{{ $creating ? '' : ' Sans nouveau fichier, le PDF actuel est conservé. Une ancienne version remplacée reste conservée en privé.' }}</p>
<input id="document" name="document" type="file" accept=".pdf,application/pdf" @required($creating) aria-describedby="document-help{{ $errors->has('document') ? ' document-error' : '' }}" @if($errors->has('document')) aria-invalid="true" @endif>
@error('document')<p id="document-error">{{ $message }}</p>@enderror
@if($errors->any())<p>Si vous aviez choisi un nouveau fichier, sélectionnez-le à nouveau avant d’enregistrer.</p>@endif
</fieldset>
<div class="actions"><button type="submit">{{ $creating ? 'Ajouter le rapport' : 'Enregistrer les changements' }}</button><a href="{{ route('reports.index') }}">Annuler</a></div>
</form>
@if(!$creating)
<details class="media-details"><summary>Retirer ce rapport de la liste</summary>
<form class="card" method="post" action="{{ route('reports.destroy', $report) }}">@csrf @method('DELETE')<input type="hidden" name="revision" value="{{ $report->revision }}">
<p>Le document sera conservé. Vous pourrez le retrouver et le restaurer dans Rapports retirés.</p>
<label class="checkbox" for="confirm"><input id="confirm" name="confirm" type="checkbox" value="1" required>Je confirme le retrait de « {{ $report->title }} ».</label>
<button type="submit" class="secondary">Retirer le rapport</button>
</form></details>
@endif
@endsection
