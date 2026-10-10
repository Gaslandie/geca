@extends('layouts.admin')
@section('title','Newsletter')
@section('content')
@php($preview = config('newsletter.mode') === 'preview')
<div class="heading">
    <h1>Newsletter</h1>
    <p>Gérez les inscriptions et les newsletters du site.</p>
    @if($preview)<p class="newsletter-mode">Mode test · aucun e-mail envoyé.</p>@endif
</div>
<div class="actions newsletter-actions">
    <a class="button" href="{{ route('newsletter.create') }}">Rédiger une newsletter</a>
    <a href="{{ route('newsletter.form','fr') }}">Voir le formulaire d’inscription</a>
</div>
<div class="newsletter-overview">
    <section class="card newsletter-admin-section" aria-labelledby="newsletter-subscribers">
        <h2 id="newsletter-subscribers">Abonnés</h2>
        <p>Seules les adresses confirmées peuvent recevoir la newsletter.</p>
        <ul class="newsletter-list">
            @forelse($subscribers as $s)
            <li>
                <span>{{ $s->email }}</span>
                <span>{{ ['pending'=>'À confirmer','subscribed'=>'Confirmé','unsubscribed'=>'Désinscrit'][$s->status] }} · {{ strtoupper($s->locale) }}</span>
                <details>
                    <summary>Supprimer cette adresse</summary>
                    <p>Cette action efface l’adresse et ses messages de la liste. Un e-mail déjà envoyé ne peut pas être rappelé.</p>
                    <form method="post" action="{{ route('newsletter.subscriber.delete',$s) }}">
                        @csrf @method('delete')
                        <button type="submit" class="secondary">Confirmer la suppression</button>
                    </form>
                </details>
            </li>
            @empty<li>Pas encore d’abonné.</li>@endforelse
        </ul>
        {{ $subscribers->withQueryString()->links('newsletter.pagination', ['label'=>'Pages des abonnés']) }}
    </section>
    <section class="card newsletter-admin-section" aria-labelledby="newsletter-campaigns">
        <h2 id="newsletter-campaigns">Mes newsletters</h2>
        <ul class="newsletter-list">
            @forelse($campaigns as $c)
            <li>
                <a href="{{ route('newsletter.edit',$c) }}">{{ $c->subject }}</a>
                <span>{{ ['draft'=>'Brouillon','approved'=>$preview?'Test préparé':'Envoi préparé','cancelled'=>'Arrêtée'][$c->status] }}</span>
            </li>
            @empty<li>Aucune newsletter pour le moment.</li>@endforelse
        </ul>
        {{ $campaigns->withQueryString()->links('newsletter.pagination', ['label'=>'Pages de mes newsletters']) }}
    </section>
</div>
<details class="card newsletter-admin-section newsletter-tracking" @if($deliveries->contains(fn ($delivery) => in_array($delivery->status, ['sending', 'needs_review'], true))) open @endif>
    <summary>{{ $preview ? 'Messages de test' : 'Suivi des envois' }}</summary>
    @if($preview)
        <p>Vérifiez ici les messages d’inscription et les newsletters, sans envoyer d’e-mail.</p>
        @if($deliveries->isNotEmpty())
        <form method="post" action="{{ route('newsletter.simulate') }}">@csrf<button type="submit" class="secondary">Lancer le test</button></form>
        @endif
    @endif
    @if($deliveries->contains('status', 'handed_off'))<p>« Remis au serveur » ne garantit pas la réception dans la boîte du destinataire.</p>@endif
    @if($deliveries->contains(fn ($delivery) => in_array($delivery->status, ['sending', 'needs_review'], true)))<p>Un message interrompu doit être vérifié. Il n’est pas réessayé automatiquement.</p>@endif
    <ul class="newsletter-list">
        @forelse($deliveries as $d)
        <li>
            <span>{{ $d->kind==='confirmation'?'Confirmation d’inscription':'Newsletter' }} · {{ ['pending'=>'En attente','sending'=>'En cours / à vérifier si interrompu','simulated'=>'Test terminé, aucun envoi','handed_off'=>'Remis au serveur','needs_review'=>'À vérifier','cancelled'=>'Annulé'][$d->status] }}</span>
            @if($preview)<a href="{{ route('newsletter.delivery',$d) }}">Voir le message de test</a>@endif
        </li>
        @empty<li>{{ $preview ? 'Aucun message de test.' : 'Aucun envoi pour le moment.' }}</li>@endforelse
    </ul>
</details>
@endsection
