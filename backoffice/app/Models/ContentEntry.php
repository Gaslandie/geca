<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContentEntry extends Model
{
    use SoftDeletes;

    protected $guarded = ['id', 'kind', 'source_key', 'source_payload', 'revision', 'deleted_at', 'deleted_by', 'deletion_batch'];

    protected function casts(): array
    {
        return ['source_payload' => 'array', 'draft_payload' => 'array', 'revision' => 'integer'];
    }

    public function fields(): array
    {
        return match ($this->kind) {
            'projects' => ['title' => 'Titre', 'description' => 'Description', 'zone' => 'Ville, commune ou lieu du projet', 'period' => 'Période du projet', 'partner' => 'Partenaire ou organisme qui finance le projet'],
            'news' => ['title' => 'Titre', 'description' => 'Description', 'period' => 'Date ou période concernée'],
            'team' => ['name' => 'Nom', 'role' => 'Poste'],
            default => [],
        };
    }

    public function label(): string
    {
        $payload = $this->draft_payload ?? $this->source_payload;

        return $payload['fr']['title'] ?? $payload['fr']['name'];
    }

    public function requiredFields(): array
    {
        // Les références importées conservent leurs contraintes existantes.
        if ($this->exists && ! str_starts_with($this->source_key, 'admin-')) {
            return array_keys($this->fields());
        }

        return $this->kind === 'team' ? ['name', 'role'] : ['title', 'description'];
    }
}
