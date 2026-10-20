<?php

namespace App\Services;

use App\Models\ContentEntry;
use App\Models\MediaAsset;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PublicPublication
{
    private const ROOT = 'publication/';

    public function enabled(): bool
    {
        return app()->environment('local', 'testing') || Storage::disk('local')->exists(self::ROOT.'enabled');
    }

    public function state(): array
    {
        return $this->read('state.json') ?? ['current' => null, 'published' => null];
    }

    private function read(string $path): ?array
    {
        $disk = Storage::disk('local');

        return $disk->exists(self::ROOT.$path) ? json_decode($disk->get(self::ROOT.$path), true, 512, JSON_THROW_ON_ERROR) : null;
    }

    private function write(string $path, array $data): void
    {
        // Remplacement atomique : une interruption ne tronque pas l'état précédent.
        $disk = Storage::disk('local');
        $disk->makeDirectory(self::ROOT);
        $target = $disk->path(self::ROOT.$path);
        $temporary = tempnam(dirname($target), '.publication-');
        try {
            $bytes = json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
            if ($temporary === false || file_put_contents($temporary, $bytes, LOCK_EX) !== strlen($bytes)
                || ! chmod($temporary, 0600) || ! rename($temporary, $target)) {
                throw new \RuntimeException('Écriture de publication impossible.');
            }
        } finally {
            if ($temporary && is_file($temporary)) {
                unlink($temporary);
            }
        }
    }

    public function locked(callable $action): mixed
    {
        return Cache::lock('geca-publication', 120)->block(10, $action);
    }

    public function candidate(): array
    {
        $entries = [];
        $media = [];
        $rows = ContentEntry::withTrashed()->orderBy('kind')->orderBy('source_key')->get();
        if ($rows->count() > 300) {
            throw ValidationException::withMessages(['publication' => 'Le nombre de fiches dépasse la limite de publication. Contactez le responsable du site.']);
        }
        foreach ($rows as $entry) {
            if (! in_array($entry->kind, ['projects', 'news', 'team'], true)) {
                continue;
            }
            $key = $entry->source_key;
            if (! preg_match('/\A[a-z0-9][a-z0-9-]{0,99}\z/D', $key)) {
                throw ValidationException::withMessages(['publication' => 'Une fiche possède un identifiant non publiable.']);
            }
            if ($entry->trashed()) {
                $entries[] = ['kind' => $entry->kind, 'key' => $key, 'deleted' => true];

                continue;
            }
            $draft = $entry->draft_payload;
            if (! $draft) {
                continue;
            }
            $new = str_starts_with($key, 'admin-');
            $patch = [];
            // Seulement les champs réellement modifiés : une référence ancienne ne remplace pas le site actuel.
            foreach (['fr', 'en'] as $locale) {
                foreach (array_keys($entry->fields()) as $field) {
                    $value = $draft[$locale][$field] ?? '';
                    if ($new || $value !== ($entry->source_payload[$locale][$field] ?? '')) {
                        if (! is_string($value) || mb_strlen($value) > ($field === 'description' ? 20000 : 1500)) {
                            throw ValidationException::withMessages(['publication' => 'Une fiche contient un texte invalide.']);
                        }
                        $patch[$locale][$field] = $value;
                    }
                }
            }
            $photo = null;
            if (isset($draft['photo_id'])) {
                $asset = MediaAsset::findOrFail($draft['photo_id']);
                if (! Str::isUuid($asset->id)) {
                    abort(422);
                }
                $bytes = Storage::disk('media')->get($asset->id.'/preview.webp');
                $size = @getimagesizefromstring($bytes);
                if (! $size || ($size['mime'] ?? '') !== 'image/webp' || strlen($bytes) > 256 * 1024
                    || $size[0] > 1280 || $size[1] > 1280) {
                    throw ValidationException::withMessages(['publication' => 'Une photo ne peut pas être publiée.']);
                }
                $hash = hash('sha256', $bytes);
                $media[$hash] = base64_encode($bytes);
                $photo = ['sha256' => $hash, 'width' => $size[0], 'height' => $size[1], 'alt' => ['fr' => $asset->alt_fr, 'en' => $asset->alt_en]];
            }
            if ($patch || $photo || $new) {
                $item = ['kind' => $entry->kind, 'key' => $key, 'deleted' => false, 'new' => $new, 'texts' => $patch];
                if ($photo) {
                    $item['photo'] = $photo;
                }
                $entries[] = $item;
            }
        }
        ksort($media);
        $data = ['version' => 1, 'entries' => $entries, 'media' => $media];
        if (strlen(json_encode($data, JSON_THROW_ON_ERROR)) > 80 * 1024 * 1024) {
            throw ValidationException::withMessages(['publication' => 'Cette publication dépasse la taille autorisée.']);
        }

        return $data;
    }

    public function fingerprint(array $data): string
    {
        return hash('sha256', json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE));
    }

    public function request(Request $request): string
    {
        abort_unless($this->enabled(), 503);
        $data = $request->validate(['fingerprint' => ['required', 'regex:/\A[a-f0-9]{64}\z/D'], 'confirm' => ['accepted']]);

        return $this->locked(fn () => DB::transaction(function () use ($request, $data) {
            $actor = app(BackofficeAuthorization::class)->writer($request);
            abort_unless($actor->managesAccounts(), 403);
            $state = $this->state();
            if (in_array($state['current']['status'] ?? '', ['queued', 'building'], true)) {
                throw ValidationException::withMessages(['publication' => 'Une publication est déjà en cours. Attendez son résultat.']);
            }
            $snapshot = $this->candidate();
            $hash = $this->fingerprint($snapshot);
            if (! hash_equals($hash, $data['fingerprint'])) {
                throw ValidationException::withMessages(['publication' => 'Les contenus ont changé. Rechargez la page et vérifiez-les avant de publier.']);
            }
            if (($state['published']['hash'] ?? null) === $hash) {
                throw ValidationException::withMessages(['publication' => 'Ces contenus sont déjà publiés.']);
            }
            $disk = Storage::disk('local');
            $used = collect($disk->allFiles(self::ROOT))->sum(fn ($file) => $disk->size($file));
            if ($used + strlen(json_encode($snapshot, JSON_THROW_ON_ERROR)) > 512 * 1024 * 1024) {
                throw ValidationException::withMessages(['publication' => 'Les archives de publication sont pleines. Contactez le responsable du site.']);
            }
            $id = (string) Str::uuid();
            $this->write($id.'.json', $snapshot);
            $state['current'] = ['id' => $id, 'hash' => $hash, 'status' => 'queued', 'actor' => $actor->id, 'actor_version' => $actor->session_version, 'created_at' => now()->toIso8601String()];
            $this->write('state.json', $state);

            return $id;
        }));
    }

    private function authorized(array $record): bool
    {
        $user = User::find($record['actor']);

        return $user && $user->is_active && $user->managesAccounts() && $user->session_version === $record['actor_version'];
    }

    public function importReference(array $input): array
    {
        $data = Validator::make($input, [
            'entries' => ['required', 'array', 'max:300'], 'images' => ['present', 'array'],
            'entries.*.kind' => ['required', 'in:projects,news,team'],
            'entries.*.key' => ['required', 'regex:/\A[a-z0-9][a-z0-9-]{0,99}\z/D'],
            'entries.*.payload' => ['required', 'array:fr,en,status,photo,linked_project'],
            'entries.*.payload.fr' => ['required', 'array'], 'entries.*.payload.en' => ['required', 'array'],
        ])->validate();
        foreach ($data['images'] as $source => $variants) {
            if (! is_string($source) || ! preg_match('#^/images/[a-zA-Z0-9_./-]+$#D', $source) || str_contains($source, '..') || ! is_array($variants) || count($variants) > 20) {
                throw new \RuntimeException('Registre public invalide.');
            }
            foreach ($variants as $variant) {
                if (! is_array($variant) || ! preg_match('#^/images/optimized/[a-z0-9-]+\.webp$#D', $variant['src'] ?? '') || ! is_int($variant['width'] ?? null) || $variant['width'] < 1 || $variant['width'] > 6000) {
                    throw new \RuntimeException('Variante publique invalide.');
                }
            }
        }

        return $this->locked(fn () => DB::transaction(function () use ($data) {
            $added = 0;
            foreach ($data['entries'] as $item) {
                if (str_starts_with($item['key'], 'admin-')) {
                    throw new \RuntimeException('Un brouillon ne peut pas devenir une référence.');
                }
                if (ContentEntry::withTrashed()->where('kind', $item['kind'])->where('source_key', $item['key'])->exists()) {
                    continue;
                }
                $entry = new ContentEntry;
                $entry->kind = $item['kind'];
                $entry->source_key = $item['key'];
                foreach (['fr', 'en'] as $locale) {
                    foreach ($item['payload'][$locale] as $field => $value) {
                        if (! array_key_exists($field, $entry->fields()) || ! is_string($value) || mb_strlen($value) > 20000) {
                            throw new \RuntimeException('Texte de référence invalide.');
                        }
                    }
                }
                if (isset($item['payload']['linked_project']) && ContentEntry::onlyTrashed()->where('kind', 'projects')->where('source_key', $item['payload']['linked_project'])->exists()) {
                    continue;
                }
                $entry->source_payload = $item['payload'];
                $entry->save();
                $added++;
            }
            $this->write('reference-images.json', $data['images']);

            return ['added' => $added];
        }));
    }

    // Appelé uniquement par le terminal/transport SSH limité ; aucune route HTTP de téléchargement.
    public function worker(string $action, ?string $id = null, ?string $hash = null): array
    {
        return $this->locked(function () use ($action, $id, $hash) {
            $state = $this->state();
            $current = $state['current'];
            if ($action === 'fetch') {
                if ($current && in_array($current['status'], ['queued', 'building'], true)) {
                    if (! $this->authorized($current)) {
                        $state['current']['status'] = 'cancelled';
                        $this->write('state.json', $state);
                        throw new \RuntimeException('Autorisation de publication révoquée.');
                    }
                    $state['current']['status'] = 'building';
                    $this->write('state.json', $state);
                    $record = $state['current'];
                    $pending = true;
                } else {
                    $record = $state['published'];
                    $pending = false;
                }
                if (! $record) {
                    return ['id' => null, 'pending' => false, 'snapshot' => ['version' => 1, 'entries' => [], 'media' => []]];
                }
                $snapshot = $this->read($record['id'].'.json');
                if (! $snapshot || ! hash_equals($record['hash'], $this->fingerprint($snapshot))) {
                    throw new \RuntimeException('Copie de publication invalide.');
                }

                return ['id' => $record['id'], 'hash' => $record['hash'], 'pending' => $pending, 'snapshot' => $snapshot];
            }
            $record = ($current['id'] ?? null) === $id ? $current : $state['published'];
            if (! $record || $record['id'] !== $id || ! hash_equals($record['hash'], $hash ?? '')) {
                throw new \RuntimeException('Publication différente.');
            }
            if ($record['status'] !== 'published' && (! $this->authorized($record) || ! in_array($record['status'], ['building', 'queued'], true))) {
                throw new \RuntimeException('Publication non autorisée.');
            }
            if ($action === 'complete' && $record['status'] !== 'published') {
                $state['current']['status'] = 'published';
                $state['current']['published_at'] = now()->toIso8601String();
                $state['published'] = $state['current'];
                $this->write('state.json', $state);
            } elseif ($action === 'fail' && $record['status'] !== 'published') {
                $state['current']['status'] = 'failed';
                $this->write('state.json', $state);
            } elseif (! in_array($action, ['authorize', 'complete', 'fail'], true)) {
                throw new \RuntimeException('Action inconnue.');
            }

            return ['ok' => true];
        });
    }
}
