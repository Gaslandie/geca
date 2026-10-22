@extends('layouts.admin')
@section('title', $currentLabel)
@section('content')
<x-admin-back :href="route('content.index', $entry->kind)" />
<header class="heading content-page-heading"><p class="eyebrow">{{ $label }}</p><h1>{{ $currentLabel }}</h1><p>Consultation du contenu enregistré.</p></header>
<section class="card">
@if($entry->kind !== 'team' && !empty($entry->draft_payload['video']))
<video class="entry-photo" controls playsinline preload="none" aria-label="Vidéo de la fiche" src="{{ route('content.video', ['kind' => $entry->kind, 'entry' => $entry->id]) }}"></video>
@endif
@foreach(['fr' => 'Français', 'en' => 'Anglais'] as $locale => $language)
@if(!empty($payload[$locale]))
<h2>{{ $language }}</h2><dl>@foreach($entry->fields() as $field => $fieldLabel)
@if(is_string($payload[$locale][$field] ?? null) && $payload[$locale][$field] !== '')<dt>{{ $fieldLabel }}</dt><dd>{{ $payload[$locale][$field] }}</dd>@endif
@endforeach</dl>
@endif
@endforeach
</section>
@endsection
