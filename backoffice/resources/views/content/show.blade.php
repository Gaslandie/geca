@extends('layouts.admin')
@section('title', $currentLabel)
@section('content')
<x-admin-back :href="route('content.index', $entry->kind)" />
<header class="heading content-page-heading"><p class="eyebrow">{{ $label }}</p><h1>{{ $currentLabel }}</h1><p>Consultation du contenu enregistré.</p></header>
<section class="card">
@foreach(['fr' => 'Français', 'en' => 'Anglais'] as $locale => $language)
@if(!empty($payload[$locale]))
<h2>{{ $language }}</h2><dl>@foreach($entry->fields() as $field => $fieldLabel)
@if(is_string($payload[$locale][$field] ?? null) && $payload[$locale][$field] !== '')<dt>{{ $fieldLabel }}</dt><dd>{{ $payload[$locale][$field] }}</dd>@endif
@endforeach</dl>
@endif
@endforeach
</section>
@endsection
