<?php

namespace App\Http\Controllers;

use App\Models\ContentEntry;
use App\Models\MediaAsset;
use App\Services\PreparePhoto;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ContentController extends Controller
{
    private const LABELS = ['projects' => 'Projets et programmes', 'news' => 'Actualités', 'team' => 'Équipe'];

    public function index(string $kind)
    {
        $entries = ContentEntry::where('kind', $kind)->orderBy('id')->paginate(30);
        $photos = [];
        if ($kind === 'team') {
            $media = MediaAsset::whereIn('id', $entries->getCollection()->pluck('draft_payload.photo_id')->filter())->get()->keyBy('id');
            foreach ($entries as $entry) {
                $mediaId = $entry->draft_payload['photo_id'] ?? null;
                $photos[$entry->id] = $mediaId
                    ? ($media->has($mediaId) && Storage::disk('media')->exists($mediaId.'/preview.webp') ? route('media.thumbnail', ['media' => $mediaId, 'size' => 'thumbnail']) : null)
                    : ($this->referencePhoto($entry, 192) !== null ? route('content.thumbnail', ['kind' => $kind, 'entry' => $entry->id, 'size' => 'thumbnail']) : null);
            }
        }

        return view('content.index', [
            'kind' => $kind, 'label' => self::LABELS[$kind],
            'entries' => $entries, 'labels' => $this->labels($entries),
            'photos' => $photos,
        ]);
    }

    public function create(Request $request, string $kind)
    {
        $record = new ContentEntry;
        $record->kind = $kind;
        $token = (string) Str::uuid();
        $pending = collect($request->session()->get('content_creation', []))
            ->filter(fn ($item) => ($item['expires'] ?? 0) > time())->take(-9)->all();
        $pending[$token] = ['kind' => $kind, 'user' => $request->user()->id, 'expires' => time() + 3600];
        $request->session()->put('content_creation', $pending);
        $photoAvailable = PreparePhoto::available();
        $photoPreviewNonce = $photoAvailable ? base64_encode(random_bytes(18)) : null;
        $request->attributes->set('photo_preview_nonce', $photoPreviewNonce);

        return view('content.edit', [
            'entry' => $record, 'label' => self::LABELS[$kind], 'payload' => [], 'creationToken' => $token,
            'currentLabel' => match ($kind) {
                'projects' => 'Ajouter un projet', 'news' => 'Ajouter une actualité', 'team' => 'Ajouter un membre'
            },
            'linkedProject' => null, 'media' => null, 'photoAvailable' => $photoAvailable,
            'photoPreviewNonce' => $photoPreviewNonce, 'referencePhotoAvailable' => false,
        ]);
    }

    public function store(Request $request, string $kind, PreparePhoto $processor)
    {
        $request->validate(['creation_token' => ['required', 'uuid']]);
        $pending = $request->session()->get('content_creation', []);
        $token = $request->input('creation_token');
        $authorization = $pending[$token] ?? null;
        if (! is_array($authorization) || ($authorization['kind'] ?? null) !== $kind
            || ($authorization['user'] ?? null) !== $request->user()->id || ($authorization['expires'] ?? 0) <= time()) {
            throw ValidationException::withMessages(['creation_token' => 'Ce formulaire a expiré ou a déjà été utilisé. Rouvrez la page d’ajout avant de recommencer.']);
        }
        $record = new ContentEntry;
        $record->kind = $kind;
        $record->source_key = 'admin-'.Str::uuid();
        $record->source_payload = [];
        $record->revision = 0;
        $response = $this->saveEntry($request, $record, $processor, true);
        unset($pending[$token]);
        $request->session()->put('content_creation', $pending);

        return $response;
    }

    private function labels($entries, bool $includeDeleted = false)
    {
        $projectKeys = $entries->getCollection()->pluck('source_payload.linked_project')->filter()->unique();
        $query = ContentEntry::where('kind', 'projects')->whereIn('source_key', $projectKeys);
        $projects = ($includeDeleted ? $query->withTrashed() : $query)->get()->keyBy('source_key');

        return $entries->getCollection()->mapWithKeys(function ($entry) use ($projects) {
            $project = isset($entry->source_payload['linked_project'])
                ? ($projects->get($entry->source_payload['linked_project']) ?? abort(404)) : null;
            $payload = $this->texts($entry, $project);

            return [$entry->id => $payload['fr']['title'] ?? $payload['fr']['name']];
        });
    }

    public function trash(string $kind)
    {
        $entries = ContentEntry::onlyTrashed()->where('kind', $kind)->orderByDesc('deleted_at')->orderBy('id')->paginate(30);

        return view('content.trash', ['kind' => $kind, 'label' => self::LABELS[$kind], 'entries' => $entries, 'labels' => $this->labels($entries, true)]);
    }

    public function trashAll()
    {
        $entries = ContentEntry::onlyTrashed()->whereIn('kind', array_keys(self::LABELS))
            ->orderByDesc('deleted_at')->orderBy('id')->paginate(30);

        return view('content.trash', [
            'kind' => null, 'label' => 'Projets, actualités et équipe',
            'entries' => $entries, 'labels' => $this->labels($entries, true), 'kindLabels' => self::LABELS,
        ]);
    }

    private function linkedNews(ContentEntry $project)
    {
        return ContentEntry::where('kind', 'news')->where('source_payload->linked_project', $project->source_key)->orderBy('id');
    }

    private function deletionState(ContentEntry $entry, $related): string
    {
        return hash('sha256', json_encode([[$entry->id, $entry->revision], $related->map(fn ($item) => [$item->id, $item->revision])->all()], JSON_THROW_ON_ERROR));
    }

    public function confirmDelete(string $kind, string $entry)
    {
        $record = $this->entry($kind, $entry);
        $payload = $this->texts($record, $this->linkedProject($record));
        $related = $kind === 'projects' ? $this->linkedNews($record)->get() : collect();

        return view('content.delete', ['entry' => $record, 'currentLabel' => $payload['fr']['title'] ?? $payload['fr']['name'], 'related' => $related, 'deletionState' => $this->deletionState($record, $related)]);
    }

    private function recordRemoval(ContentEntry $entry, int $actor, string $note): void
    {
        DB::table('content_revisions')->insert([
            'content_entry_id' => $entry->id, 'user_id' => $actor, 'revision' => $entry->revision,
            'payload' => json_encode($entry->draft_payload ?? $entry->source_payload, JSON_THROW_ON_ERROR),
            'source_note' => $note, 'created_at' => now(),
        ]);
    }

    public function destroy(Request $request, string $kind, string $entry)
    {
        $this->entry($kind, $entry);
        $data = $request->validate(['revision' => 'required|integer|min:0', 'deletion_state' => ['required', 'string', 'regex:/^[a-f0-9]{64}$/'], 'confirm' => 'accepted']);
        DB::transaction(function () use ($request, $kind, $entry, $data) {
            $current = ContentEntry::where('kind', $kind)->whereKey($entry)->lockForUpdate()->firstOrFail();
            $related = $kind === 'projects' ? $this->linkedNews($current)->lockForUpdate()->get() : collect();
            if ($current->revision !== (int) $data['revision'] || ! hash_equals($this->deletionState($current, $related), $data['deletion_state'])) {
                throw ValidationException::withMessages(['revision' => 'La fiche ou une actualité liée a changé. Relisez cette confirmation avant de supprimer.']);
            }
            $batch = (string) Str::uuid();
            foreach (collect([$current])->concat($related) as $record) {
                $record->deleted_by = $request->user()->id;
                $record->deletion_batch = $batch;
                $record->revision++;
                $record->save();
                $record->delete();
                $this->recordRemoval($record, $request->user()->id, 'Suppression de la fiche vers la corbeille.');
            }
        }, 3);

        return redirect()->route('content.index', $kind)->with('status', 'Suppression enregistrée. Vous pouvez retrouver la fiche dans la corbeille.');
    }

    public function restore(Request $request, string $kind, string $entry)
    {
        $record = ContentEntry::onlyTrashed()->where('kind', $kind)->findOrFail($entry);
        $data = $request->validate(['revision' => 'required|integer|min:0']);
        DB::transaction(function () use ($request, $record, $data) {
            if (isset($record->source_payload['linked_project'])) {
                $project = ContentEntry::withTrashed()->where('kind', 'projects')->where('source_key', $record->source_payload['linked_project'])->lockForUpdate()->firstOrFail();
                if ($project->trashed()) {
                    throw ValidationException::withMessages(['project' => 'Restaurez d’abord le projet associé depuis la corbeille des projets.']);
                }
            }
            $current = ContentEntry::onlyTrashed()->where('kind', $record->kind)->whereKey($record->id)->lockForUpdate()->firstOrFail();
            if ($current->revision !== (int) $data['revision']) {
                throw ValidationException::withMessages(['revision' => 'Cette fiche a changé. Rechargez la corbeille avant de la restaurer.']);
            }
            $related = $current->kind === 'projects'
                ? $this->linkedNews($current)->onlyTrashed()->where('deletion_batch', $current->deletion_batch)->lockForUpdate()->get() : collect();
            foreach (collect([$current])->concat($related) as $item) {
                $item->deleted_by = null;
                $item->deletion_batch = null;
                $item->revision++;
                $item->restore();
                $this->recordRemoval($item, $request->user()->id, 'Restauration de la fiche depuis la corbeille.');
            }
        }, 3);

        return redirect()->route('content.index', $kind)->with('status', 'La fiche a été restaurée.');
    }

    private function entry(string $kind, string $id): ContentEntry
    {
        // Portée GECA unique : seuls les administrateurs actifs peuvent gérer ces contenus.
        // Le type ne peut pas être changé par modification de l'identifiant dans l'URL.
        return ContentEntry::where('kind', $kind)->findOrFail($id);
    }

    private function linkedProject(ContentEntry $record): ?ContentEntry
    {
        if (! isset($record->source_payload['linked_project'])) {
            return null;
        }

        return ContentEntry::where('kind', 'projects')->where('source_key', $record->source_payload['linked_project'])->firstOrFail();
    }

    private function texts(ContentEntry $record, ?ContentEntry $project): array
    {
        $payload = ($project ?? $record)->draft_payload ?? ($project ?? $record)->source_payload;
        foreach (['fr', 'en'] as $locale) {
            $payload[$locale] = array_intersect_key($payload[$locale] ?? [], $record->fields());
        }

        return $payload;
    }

    // Source et variantes issues des registres locaux de confiance, jamais de la requête.
    private function referencePhoto(ContentEntry $record, int $targetWidth = 640): ?string
    {
        $photo = $record->source_payload['photo'] ?? null;
        $source = $photo['src'] ?? $photo['fr']['src'] ?? null;
        $root = dirname(base_path());
        $manifestPath = $root.'/src/content/image-variants.json';
        if (! is_string($source) || ! is_file($manifestPath)) {
            return null;
        }
        $manifest = json_decode(file_get_contents($manifestPath), true, 512, JSON_THROW_ON_ERROR);
        $variants = $manifest[$source] ?? [];
        $variant = collect($variants)->first(fn ($item) => $item['width'] >= $targetWidth) ?? end($variants);
        $path = $variant['src'] ?? '';
        if (! preg_match('#^/images/optimized/[a-z0-9-]+\.webp$#', $path)) {
            return null;
        }

        return is_file($root.'/public'.$path) ? $root.'/public'.$path : null;
    }

    public function photo(string $kind, string $entry, string $size = 'preview')
    {
        $record = $this->entry($kind, $entry);
        abort_unless(in_array($size, ['preview', 'thumbnail'], true), 404);
        $path = $this->referencePhoto($record, $size === 'thumbnail' ? 192 : 640);
        abort_unless($path, 404);

        return response()->file($path, ['Content-Type' => 'image/webp']);
    }

    public function edit(string $kind, string $entry)
    {
        $record = $this->entry($kind, $entry);
        $project = $this->linkedProject($record);
        $payload = $this->texts($record, $project);
        $mediaId = $record->draft_payload['photo_id'] ?? null;
        $media = $mediaId ? MediaAsset::findOrFail($mediaId) : null;
        $photoAvailable = PreparePhoto::available();
        $photoPreviewNonce = $photoAvailable ? base64_encode(random_bytes(18)) : null;
        request()->attributes->set('photo_preview_nonce', $photoPreviewNonce);

        return view('content.edit', [
            'entry' => $record, 'label' => self::LABELS[$kind], 'payload' => $payload,
            'currentLabel' => $payload['fr']['title'] ?? $payload['fr']['name'],
            'linkedProject' => $project, 'media' => $media,
            'photoAvailable' => $photoAvailable, 'photoPreviewNonce' => $photoPreviewNonce,
            'referencePhotoAvailable' => ! $media && $this->referencePhoto($record) !== null,
        ]);
    }

    public function update(Request $request, string $kind, string $entry, PreparePhoto $processor)
    {
        $record = $this->entry($kind, $entry);

        return $this->saveEntry($request, $record, $processor);
    }

    private function saveEntry(Request $request, ContentEntry $record, PreparePhoto $processor, bool $creating = false)
    {
        $fields = array_keys($record->fields());
        $rules = [
            'revision' => $creating ? ['prohibited'] : ['required', 'integer', 'min:0'],
            'source_note' => ['required', 'string', 'min:10', 'max:2000'],
            'payload' => ['required', 'array:fr,en'],
            'photo' => ['nullable', 'file', 'max:6144'],
        ];
        foreach (['fr', 'en'] as $locale) {
            $rules["payload.$locale"] = [$locale === 'fr' ? 'required' : 'sometimes', 'array:'.implode(',', $fields)];
            foreach ($fields as $field) {
                $required = $locale === 'fr' && in_array($field, $record->requiredFields(), true);
                $rules["payload.$locale.$field"] = [$required ? 'required' : 'nullable', 'string', 'max:'.($field === 'description' ? '20000' : '1500')];
            }
        }
        $attributes = ['payload' => 'textes'];
        foreach (['fr' => 'français', 'en' => 'anglais'] as $locale => $language) {
            $attributes["payload.$locale"] = "textes en $language";
            foreach ($record->fields() as $field => $label) {
                $attributes["payload.$locale.$field"] = "$label (en $language)";
            }
        }
        $data = $request->validate($rules, [], $attributes);
        $photo = $request->hasFile('photo') ? $processor->prepare($request->file('photo')) : null;
        $newMediaId = null;
        $save = function () use ($record, $data, $request, $fields, $photo, $creating, &$newMediaId) {
            DB::transaction(function () use ($record, $data, $request, $fields, $photo, $creating, &$newMediaId) {
                // Même ordre que la suppression/restauration : projet, puis actualité liée.
                $project = $this->linkedProject($record);
                if ($project) {
                    $project = ContentEntry::whereKey($project->id)->lockForUpdate()->firstOrFail();
                }
                $current = $creating ? $record : ContentEntry::whereKey($record->id)->lockForUpdate()->firstOrFail();
                if (! $creating && $current->revision !== (int) $data['revision']) {
                    throw ValidationException::withMessages(['revision' => 'Quelqu’un a modifié ce texte pendant que vous travailliez. Copiez vos changements, puis rouvrez la page pour consulter la dernière version. Vos changements sont encore affichés ci-dessous.']);
                }
                if ($project) {
                    $linkedTexts = $this->texts($current, $project);
                    if ($data['payload']['fr'] !== $linkedTexts['fr']
                        || (isset($data['payload']['en']) && array_map(fn ($value) => $value ?? '', $data['payload']['en']) !== $linkedTexts['en'])) {
                        throw ValidationException::withMessages(['payload' => 'Ces informations sont liées au projet associé. Ouvrez le projet pour les changer, puis rechargez cette actualité.']);
                    }
                }
                $english = $project ? $linkedTexts['en'] : (($current->draft_payload ?? $current->source_payload)['en'] ?? []);
                foreach ($fields as $field) {
                    if (array_key_exists($field, $data['payload']['en'] ?? [])) {
                        $english[$field] = $data['payload']['en'][$field] ?? '';
                    }
                    $english[$field] ??= '';
                }
                $french = [];
                foreach ($fields as $field) {
                    $french[$field] = $data['payload']['fr'][$field] ?? '';
                }
                $payload = ['fr' => $french, 'en' => $english];
                if (isset($current->draft_payload['photo_id'])) {
                    $payload['photo_id'] = $current->draft_payload['photo_id'];
                }
                if ($photo) {
                    $disk = Storage::disk('media');
                    $bytes = 0;
                    foreach ($disk->allFiles() as $path) {
                        $bytes += $disk->size($path);
                    }
                    if (MediaAsset::count() >= 200 || $bytes + strlen($photo['original']) + strlen($photo['preview']) + strlen($photo['thumbnail']) > 256 * 1024 * 1024) {
                        throw ValidationException::withMessages(['photo' => 'Il n’y a plus de place pour ajouter des photos. Contactez le responsable du site.']);
                    }
                    $newMediaId = (string) Str::uuid();
                    $disk->put($newMediaId.'/original.bin', $photo['original'], ['visibility' => 'private']);
                    $disk->put($newMediaId.'/preview.webp', $photo['preview'], ['visibility' => 'private']);
                    $disk->put($newMediaId.'/thumbnail.webp', $photo['thumbnail'], ['visibility' => 'private']);
                    $asset = new MediaAsset;
                    $asset->id = $newMediaId;
                    $asset->user_id = $request->user()->id;
                    // Le libellé décrit l’association à la fiche, jamais le contenu supposé de la photo.
                    $label = $french['name'] ?? $french['title'];
                    $englishLabel = $english['name'] ?? $english['title'] ?? '';
                    $asset->title = mb_substr($label, 0, 200);
                    $asset->alt_fr = 'Photo associée à la fiche « '.mb_substr($label, 0, 900).' ».';
                    $asset->alt_en = $englishLabel !== '' ? 'Photo attached to the record “'.mb_substr($englishLabel, 0, 900).'”.' : 'Photo attached to this record.';
                    $asset->source = 'Non précisée';
                    $asset->credit = null;
                    $asset->license = 'Non précisée';
                    $asset->illustrative = true;
                    foreach (['mime', 'width', 'height'] as $field) {
                        $asset->$field = $photo[$field];
                    }
                    $asset->original_bytes = strlen($photo['original']);
                    $asset->preview_bytes = strlen($photo['preview']);
                    $asset->sha256 = hash('sha256', $photo['original']);
                    $asset->save();
                    $payload['photo_id'] = $newMediaId;
                }
                $current->draft_payload = $payload;
                if ($creating) {
                    $current->source_payload = $payload + ['origin' => 'admin', 'source_note' => $data['source_note']];
                }
                $current->revision++;
                $current->save();
                DB::table('content_revisions')->insert([
                    'content_entry_id' => $current->id, 'user_id' => $request->user()->id,
                    'revision' => $current->revision, 'payload' => json_encode($current->draft_payload, JSON_THROW_ON_ERROR),
                    'source_note' => $data['source_note'], 'created_at' => now(),
                ]);
            });
        };
        try {
            if ($photo) {
                Cache::lock('geca-media-upload', 60)->block(5, $save);
            } else {
                $save();
            }
        } catch (\Throwable $exception) {
            if ($newMediaId && ! MediaAsset::whereKey($newMediaId)->exists()) {
                Storage::disk('media')->deleteDirectory($newMediaId);
            }
            if ($exception instanceof LockTimeoutException) {
                throw ValidationException::withMessages(['photo' => 'Un autre envoi est en cours. Réessayez dans quelques instants.']);
            }
            throw $exception;
        }

        return redirect()->route('content.edit', ['kind' => $record->kind, 'entry' => $record->id])
            ->with('status', $creating ? 'La fiche a été ajoutée au back-office. Elle n’est pas publiée sur le site.' : 'Vos changements sont enregistrés.');
    }
}
