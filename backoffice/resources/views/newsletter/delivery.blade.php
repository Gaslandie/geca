@extends('layouts.admin')
@section('title','Message de test')
@section('content')<section class="card"><h1>Message de test</h1><p>Aucun e-mail réel n’est envoyé en mode simulation.</p><p>Destinataire : {{ $subscriber->email }}</p><h2>{{ $delivery->payload['subject'] }}</h2><pre class="newsletter-message">{{ $delivery->payload['body'] }}</pre><p><a href="{{ $delivery->payload['link'] }}">{{ $delivery->kind==='confirmation'?'Ouvrir la confirmation de test':'Ouvrir la désinscription de test' }}</a></p><a href="{{ route('newsletter.index') }}">Retour à la newsletter</a></section>@endsection
