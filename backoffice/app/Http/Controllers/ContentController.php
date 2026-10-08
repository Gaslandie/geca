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
        return view('content.index', [
            'kind' => $kind, 'label' => self::LABELS[$kind],
            'entries' => ContentEntry::where('kind', $kind)->orderBy('id')->paginate(30),
        ]);
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
    private function referencePhoto(ContentEntry $record): ?string
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
        $variant = collect($variants)->first(fn ($item) => $item['width'] >= 640) ?? end($variants);
        $path = $variant['src'] ?? '';
        if (! preg_match('#^/images/optimized/[a-z0-9-]+\.webp$#', $path)) {
            return null;
        }

        return is_file($root.'/public'.$path) ? $root.'/public'.$path : null;
    }

    public function photo(string $kind, string $entry)
    {
        $record = $this->entry($kind, $entry);
        $path = $this->referencePhoto($record);
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

        return view('content.edit', [
            'entry' => $record, 'label' => self::LABELS[$kind], 'payload' => $payload,
            'linkedProject' => $project, 'media' => $media,
            'photoAvailable' => PreparePhoto::available(),
            'referencePhotoAvailable' => ! $media && $this->referencePhoto($record) !== null,
        ]);
    }

    public function update(Request $request, string $kind, string $entry, PreparePhoto $processor)
    {
        $record = $this->entry($kind, $entry);
        $fields = array_keys($record->fields());
        $rules = [
            'revision' => ['required', 'integer', 'min:0'],
            'source_note' => ['required', 'string', 'min:10', 'max:2000'],
            'payload' => ['required', 'array:fr,en'],
            'photo' => ['nullable', 'file', 'max:6144'],
            'alt_fr' => ['required_with:photo', 'nullable', 'string', 'max:1000'],
            'alt_en' => ['nullable', 'string', 'max:1000'],
            'source' => ['nullable', 'string', 'max:2000'],
            'credit' => ['nullable', 'string', 'max:2000'],
            'license' => ['nullable', 'string', 'max:2000'],
            'illustrative' => ['sometimes', 'boolean'],
        ];
        foreach (['fr', 'en'] as $locale) {
            $rules["payload.$locale"] = [$locale === 'fr' ? 'required' : 'sometimes', 'array:'.implode(',', $fields)];
            foreach ($fields as $field) {
                $rules["payload.$locale.$field"] = [$locale === 'fr' ? 'required' : 'nullable', 'string', 'max:'.($field === 'description' ? '20000' : '1500')];
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
        $save = function () use ($record, $data, $request, $fields, $photo, &$newMediaId) {
            DB::transaction(function () use ($record, $data, $request, $fields, $photo, &$newMediaId) {
                $current = ContentEntry::whereKey($record->id)->lockForUpdate()->firstOrFail();
                if ($current->revision !== (int) $data['revision']) {
                    throw ValidationException::withMessages(['revision' => 'Quelqu’un a modifié ce texte pendant que vous travailliez. Copiez vos changements, puis rouvrez la page pour consulter la dernière version. Vos changements sont encore affichés ci-dessous.']);
                }
                $project = $this->linkedProject($current);
                if ($project) {
                    $project = ContentEntry::whereKey($project->id)->lockForUpdate()->firstOrFail();
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
                $payload = ['fr' => $data['payload']['fr'], 'en' => $english];
                if (isset($current->draft_payload['photo_id'])) {
                    $payload['photo_id'] = $current->draft_payload['photo_id'];
                }
                if ($photo) {
                    $disk = Storage::disk('media');
                    $bytes = 0;
                    foreach ($disk->allFiles() as $path) {
                        $bytes += $disk->size($path);
                    }
                    if (MediaAsset::count() >= 200 || $bytes + strlen($photo['original']) + strlen($photo['preview']) > 256 * 1024 * 1024) {
                        throw ValidationException::withMessages(['photo' => 'Il n’y a plus de place pour ajouter des photos. Contactez le responsable du site.']);
                    }
                    $newMediaId = (string) Str::uuid();
                    $disk->put($newMediaId.'/original.bin', $photo['original'], ['visibility' => 'private']);
                    $disk->put($newMediaId.'/preview.webp', $photo['preview'], ['visibility' => 'private']);
                    $asset = new MediaAsset;
                    $asset->id = $newMediaId;
                    $asset->user_id = $request->user()->id;
                    $asset->title = mb_substr($data['alt_fr'], 0, 200);
                    foreach (['alt_fr', 'alt_en', 'source', 'credit', 'license', 'illustrative'] as $field) {
                        $asset->$field = $data[$field] ?? match ($field) {
                            'source', 'license' => 'Non précisée', 'alt_en' => '', 'illustrative' => true, default => null,
                        };
                    }
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

        return redirect()->route('content.edit', ['kind' => $kind, 'entry' => $record->id])->with('status', 'Vos changements sont enregistrés. Ils ne sont pas encore visibles sur le site.');
    }
}
