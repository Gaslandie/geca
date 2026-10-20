@extends('layouts.admin')
@section('title', 'Publier sur le site')
@section('content')
<x-admin-back :href="route('dashboard')" />
<header class="heading"><h1>Publier sur le site</h1><p>Publiez les projets, actualités, membres et photos que vous avez préparés. Les rapports, comptes, abonnés et notes internes restent privés.</p></header>
<section class="card">
<h2>État de la publication</h2>
@php($current = $state['current'])
@if($current)
<p>{{ ['queued'=>'En attente de préparation.', 'building'=>'Préparation en cours. Le site actuel reste disponible.', 'published'=>'Version publiée sur le site.', 'failed'=>'La publication n’a pas été confirmée. Vérifiez le site avant de réessayer.', 'cancelled'=>'Publication annulée : les droits du demandeur ont changé.'][$current['status']] }}</p>
@else<p>Aucune publication demandée depuis cet espace.</p>@endif
<p>La préparation peut prendre plusieurs minutes. Rechargez cette page pour voir le résultat.</p>
<div class="actions"><a class="button secondary" href="{{ route('publication.index') }}">Actualiser l’état</a><a href="{{ config('geca.public_site_url') }}" target="_blank" rel="noopener noreferrer">Voir le site (nouvel onglet)</a></div>
</section>
<section class="card media-list">
<h2>Contenus préparés</h2>
<p>Les changements ci-dessous sont ajoutés à la version du site. Les contenus déjà présents et non modifiés sont conservés. Les champs anglais laissés vides ne sont pas traduits automatiquement.</p>
<ul>
@forelse($candidate['entries'] as $item)
<li>{{ ['projects'=>'Projet', 'news'=>'Actualité', 'team'=>'Membre'][$item['kind']] }} — {{ $item['texts']['fr']['title'] ?? $item['texts']['fr']['name'] ?? $item['key'] }} : {{ $item['deleted'] ? 'retrait du site' : 'ajout ou modification' }}@if(isset($item['photo'])) · photo incluse
@endif
@if(!$item['deleted'])
<details><summary>Relire les textes modifiés</summary>
@foreach(($item['texts'] ?? []) as $locale => $fields)
<h3>{{ $locale === 'fr' ? 'Français' : 'Anglais' }}</h3>
<dl>@foreach($fields as $field => $value)<dt>{{ ['title'=>'Titre', 'description'=>'Description', 'zone'=>'Lieu', 'period'=>'Période', 'partner'=>'Partenaire', 'name'=>'Nom', 'role'=>'Poste'][$field] }}</dt><dd>{{ $value === '' ? 'Non renseigné' : $value }}</dd>@endforeach</dl>
@endforeach
</details>
@endif
</li>
@empty<li>Aucun texte ou portrait modifié dans cet espace.</li>@endforelse
</ul>
@if(!$enabled)<p>La liaison de publication doit encore être activée par le responsable du site.</p>
@elseif(!in_array($current['status'] ?? '', ['queued', 'building'], true))
<form method="post" action="{{ route('publication.store') }}">@csrf
<input type="hidden" name="fingerprint" value="{{ $fingerprint }}">
<label class="checkbox"><input type="checkbox" name="confirm" value="1" required>J’ai vérifié ces changements et j’autorise leur publication avec les photos associées.</label>
<button type="submit">Publier sur le site</button>
</form>
@endif
</section>
@endsection
