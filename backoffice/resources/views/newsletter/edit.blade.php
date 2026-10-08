@extends('layouts.admin')
@section('title','Rédiger une newsletter')
@section('content')
<div class="heading"><h1>{{ $campaign->exists?'Newsletter':'Nouvelle newsletter' }}</h1><p>Texte simple, sans HTML. Vérifiez les faits avant toute préparation d’envoi.</p></div>
<section class="card">
<form method="post" action="{{ $campaign->exists?route('newsletter.update',$campaign):route('newsletter.store') }}">@csrf @if($campaign->exists)@method('put')<input type="hidden" name="revision" value="{{ $campaign->revision }}">@endif
<label for="subject">Objet</label><input id="subject" name="subject" maxlength="180" required value="{{ old('subject',$campaign->subject) }}" @disabled($campaign->exists && $campaign->status!=='draft')>
<label for="locale">Langue des destinataires</label><select id="locale" name="locale" @disabled($campaign->exists && $campaign->status!=='draft')><option value="fr" @selected(old('locale',$campaign->locale)==='fr')>Français</option><option value="en" @selected(old('locale',$campaign->locale)==='en')>Anglais</option></select>
<label for="body">Message</label><textarea id="body" name="body" required maxlength="20000" @disabled($campaign->exists && $campaign->status!=='draft')>{{ old('body',$campaign->body) }}</textarea>
@if(!$campaign->exists || $campaign->status==='draft')<button type="submit">Enregistrer le brouillon</button>@endif</form>
@if($campaign->exists)
<h2>Aperçu du message enregistré</h2><p>{{ $campaign->subject }}</p><pre class="newsletter-message">{{ $campaign->body }}</pre><p>Un lien de désinscription propre au destinataire sera ajouté.</p>
@if($campaign->status==='draft')<form method="post" action="{{ route('newsletter.approve',$campaign) }}">@csrf<input type="hidden" name="revision" value="{{ $campaign->revision }}"><label class="consent"><input type="checkbox" name="approve" value="1" required><span>J’ai vérifié le message enregistré et les informations GECA.</span></label><button type="submit">{{ config('newsletter.mode')==='preview'?'Préparer la simulation':'Préparer l’envoi' }}</button></form>@endif
@if($campaign->status==='approved')<form method="post" action="{{ route('newsletter.cancel',$campaign) }}">@csrf<button type="submit" class="secondary">Arrêter les messages en attente</button></form>@endif
@endif
<div class="actions"><a href="{{ route('newsletter.index') }}">Retour à la newsletter</a></div>
</section>
@endsection
