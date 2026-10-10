<?php

namespace App\Console\Commands;

use App\Models\ContentEntry;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportReference extends Command
{
    protected $signature = 'geca:import-reference';

    protected $description = 'Importer une fois les données publiques authentiques, sans écraser un contenu existant';

    public function handle(): int
    {
        $items = json_decode(file_get_contents(database_path('reference/site.json')), true, 512, JSON_THROW_ON_ERROR);
        $created = 0;
        DB::transaction(function () use ($items, &$created) {
            foreach ($items['entries'] as $item) {
                if (ContentEntry::withTrashed()->where('kind', $item['kind'])->where('source_key', $item['key'])->exists()) {
                    continue;
                }
                if (isset($item['payload']['linked_project']) && ContentEntry::onlyTrashed()->where('kind', 'projects')->where('source_key', $item['payload']['linked_project'])->exists()) {
                    continue;
                }
                $entry = new ContentEntry;
                $entry->kind = $item['kind'];
                $entry->source_key = $item['key'];
                $entry->source_payload = $item['payload'];
                $entry->save();
                $created++;
            }
        });
        $this->info($created.' références importées. Aucun contenu existant remplacé.');

        return self::SUCCESS;
    }
}
