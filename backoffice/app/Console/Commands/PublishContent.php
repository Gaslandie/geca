<?php

namespace App\Console\Commands;

use App\Services\PublicPublication;
use Illuminate\Console\Command;

class PublishContent extends Command
{
    protected $signature = 'geca:publication {action : fetch, reference, authorize, complete ou fail} {id?} {hash?}';

    protected $description = 'Transport privé des seules données choisies pour publication';

    public function handle(PublicPublication $publication): int
    {
        try {
            if ($this->argument('action') === 'reference') {
                $bytes = stream_get_contents(STDIN, 5 * 1024 * 1024 + 1);
                if (strlen($bytes) > 5 * 1024 * 1024) {
                    return self::FAILURE;
                }
                $this->line(json_encode($publication->importReference(json_decode($bytes, true, 512, JSON_THROW_ON_ERROR)), JSON_THROW_ON_ERROR));

                return self::SUCCESS;
            }
            $result = $publication->worker($this->argument('action'), $this->argument('id'), $this->argument('hash'));
            $this->line(json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE));

            return self::SUCCESS;
        } catch (\Throwable $error) {
            $this->error('Publication interrompue. Vérifiez son état dans le back-office.');

            return self::FAILURE;
        }
    }
}
