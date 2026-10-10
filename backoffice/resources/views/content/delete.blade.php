@extends('layouts.admin')
@section('title', 'Confirmer la suppression')
@section('content')
<div class="heading"><h1>Confirmer la suppression</h1></div>
<section class="card">
    <h2>{{ $currentLabel }}</h2>
    <p>Cette fiche sera retirée des listes du back-office. Vous pourrez la restaurer depuis la corbeille.</p>
    @if($related->isNotEmpty())
    <p class="notice">{{ $related->count() }} actualité(s) liée(s) à ce projet seront aussi retirées. Restaurer le projet les remettra dans la liste.</p>
    @endif
    <form method="post" action="{{ route('content.destroy', ['kind' => $entry->kind, 'entry' => $entry->id]) }}">
        @csrf @method('delete')
        <input type="hidden" name="revision" value="{{ $entry->revision }}">
        <input type="hidden" name="deletion_state" value="{{ $deletionState }}">
        <label class="consent"><input type="checkbox" name="confirm" value="1" required><span>{{ $related->isNotEmpty() ? 'Je confirme la suppression du projet et des actualités liées indiquées ci-dessus.' : 'Je confirme la suppression de cette fiche.' }}</span></label>
        <div class="actions"><button type="submit" class="danger">Confirmer la suppression</button><a class="button secondary" href="{{ route('content.edit', ['kind' => $entry->kind, 'entry' => $entry->id]) }}">Annuler</a></div>
    </form>
</section>
@endsection
