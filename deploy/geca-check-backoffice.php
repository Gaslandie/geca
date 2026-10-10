<?php
// Aucun secret ni donnée de ligne dans la sortie. Les contrôles HTTP annulent leurs sessions.
try {
    umask(0077);
    require 'vendor/autoload.php';
    $app = require 'bootstrap/app.php';
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    $mode = $argv[1];
    $work = $argv[2];
    if (PHP_VERSION_ID < 80400 || !$app->environment('production') || config('app.debug') !== false
        || config('database.default') !== 'mysql' || config('database.connections.mysql.database') !== 'fnksrwmy_geca'
        || config('login.verification') !== 'email' || config('session.secure') !== true
        || config('session.http_only') !== true || !in_array(config('session.same_site'), ['lax','strict'], true)
        || config('session.domain') !== null || config('session.driver') !== 'database'
        || config('mail.default') !== 'array' || config('newsletter.mode') !== 'preview'
        || config('mail.mailers.login.transport') !== 'smtp' || config('mail.mailers.login.scheme') !== 'smtps'
        || config('mail.mailers.login.host') !== 'globalecoaction.org' || (int)config('mail.mailers.login.port') !== 465
        || config('mail.mailers.login.require_tls') !== true || config('login.from') !== 'contact@globalecoaction.org'
        || realpath(public_path()) !== '/home2/fnksrwmy/public_html/geca-admin'
        || realpath($work) !== $work || dirname($work) !== '/home2/fnksrwmy'
        || (fileperms($work) & 0777) !== 0700 || !extension_loaded('gd')
        || !function_exists('imagewebp') || (imagetypes() & IMG_WEBP) === 0) throw new RuntimeException();
    if (!in_array($mode, ['before','snapshot','after','http'],true)
        || $app->isDownForMaintenance() !== in_array($mode,['snapshot','after'],true)) throw new RuntimeException();
    $db = Illuminate\Support\Facades\DB::connection('mysql');
    if ($db->selectOne('SELECT DATABASE() AS db')->db !== 'fnksrwmy_geca') throw new RuntimeException();
    $migrations = $db->table('migrations')->pluck('migration')->sort()->values()->all();
    $expected = array_map(fn($path)=>basename($path,'.php'),glob('database/migrations/*.php'));
    sort($expected);
    if (count($migrations) !== 10 || $migrations !== $expected
        || !$db->getSchemaBuilder()->hasColumn('content_entries', 'deleted_at')
        || !$db->getSchemaBuilder()->hasTable('login_email_challenges')) throw new RuntimeException();
    $state = [];
    $tables = $db->select('SELECT TABLE_NAME AS name, ENGINE AS engine FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()');
    foreach ($tables as $table) {
        if ($table->engine !== 'InnoDB' || !preg_match('/^[a-z_]+$/D',$table->name)) throw new RuntimeException();
        if (in_array($table->name, ['sessions','cache','cache_locks'],true)) continue;
        $rows = $db->table($table->name)->get()->map(fn($row)=>json_encode($row,JSON_THROW_ON_ERROR))->sort()->values()->all();
        $state[$table->name] = hash('sha256',json_encode($rows,JSON_THROW_ON_ERROR));
    }
    ksort($state);
    if ($mode === 'snapshot') {
        if (file_exists($work.'/etat-avant.json')) throw new RuntimeException();
        file_put_contents($work.'/etat-avant.json', json_encode($state,JSON_THROW_ON_ERROR), LOCK_EX);
    } elseif ($mode !== 'before') {
        if ($state !== json_decode(file_get_contents($work.'/etat-avant.json'),true,512,JSON_THROW_ON_ERROR)) throw new RuntimeException();
        if ((int)config('login.local_user') !== 0 || (int)config('login.local_until') !== 0) throw new RuntimeException();
        $request = Illuminate\Http\Request::create('https://admin.globalecoaction.org/connexion-locale');
        if (app(App\Services\LocalAccess::class)->available($request)) throw new RuntimeException();
    }
    if ($mode === 'after') {
        if (config('geca.media_uploads_enabled') !== true
            || config('geca.reference_public_path') !== '/home2/fnksrwmy/public_html/website_43934bdf') throw new RuntimeException();
        if (!extension_loaded('gd') || !function_exists('imagewebp') || (imagetypes() & IMG_WEBP) === 0) throw new RuntimeException();
        // Essai technique privé, sans fiche, base ou téléchargement public.
        config(['geca.media_uploads_enabled'=>true]);
        $image = imagecreatetruecolor(80,60);
        imagefill($image,0,0,imagecolorallocate($image,20,140,70));
        $path = $work.'/essai-photo.png';
        imagepng($image,$path);
        $original = file_get_contents($path);
        $file = new Illuminate\Http\UploadedFile($path,'essai.png','image/png',null,true);
        $prepared = app(App\Services\PreparePhoto::class)->prepare($file);
        if ($prepared['original'] !== $original || strlen($prepared['preview']) > 250*1024
            || strlen($prepared['thumbnail']) > 16*1024 || $prepared['width'] !== 80
            || getimagesizefromstring($prepared['preview'])['mime'] !== 'image/webp') throw new RuntimeException();
        unlink($path);
        echo "Photo technique allégée. Aucun média enregistré.\n";
        $registry = json_decode(file_get_contents(database_path('reference/image-variants.json')), true, 512, JSON_THROW_ON_ERROR);
        $root = config('geca.reference_public_path');
        $portraits = 0;
        foreach ($db->table('content_entries')->where('kind','team')->get() as $member) {
            $payload = json_decode($member->source_payload,true,512,JSON_THROW_ON_ERROR);
            $source = $payload['photo']['src'] ?? $payload['photo']['fr']['src'] ?? null;
            if ($source === null) continue;
            $variants = $registry[$source] ?? [];
            $variant = collect($variants)->first(fn($item)=>$item['width'] >= 192) ?? end($variants);
            $photo = $variant['src'] ?? '';
            if (!preg_match('#^/images/optimized/[a-z0-9-]+\.webp$#D',$photo)
                || !is_file($root.$photo) || realpath($root.$photo) !== $root.$photo) throw new RuntimeException();
            $portraits++;
        }
        echo "Portraits importés disponibles : $portraits.\n";
    }
    if ($mode === 'http') {
        $cases = [['GET','/connexion',200],['GET','/connexion-locale',404],
            ['POST','/connexion-locale',419],['GET','/administration',302],
            ['GET','/administration/corbeille',302],['GET','/administration/team/ajouter',302],
            ['GET','/administration/securite',302],['GET','/administration/team/1/photo/thumbnail',302],
            ['GET','/connexion/double-verification',302],['POST','/connexion',419],
            ['PUT','/administration/securite/mot-de-passe',419],
            ['POST','/administration/securite/deconnecter',419]];
        foreach ($cases as [$method,$path,$expectedStatus]) {
            $app = require 'bootstrap/app.php';
            $request = Illuminate\Http\Request::create('https://admin.globalecoaction.org'.$path,$method);
            $app->instance('request',$request);
            $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
            $kernel->bootstrap();
            $db = Illuminate\Support\Facades\DB::connection();
            $db->beginTransaction();
            try {
                $response = $kernel->handle($request);
                $kernel->terminate($request,$response);
                if ($response->getStatusCode() !== $expectedStatus
                    || $response->headers->get('X-Frame-Options') !== 'DENY'
                    || $response->headers->get('X-Content-Type-Options') !== 'nosniff'
                    || !str_contains($response->headers->get('Cache-Control',''),'no-store')) throw new RuntimeException();
                if ($expectedStatus === 302 && $response->headers->get('Location') !== 'https://admin.globalecoaction.org/connexion') throw new RuntimeException();
                if ($expectedStatus === 200 && !str_contains($response->getContent(),'name="_token"')) throw new RuntimeException();
                echo "$method $path : $expectedStatus conforme\n";
            } finally {
                while ($db->transactionLevel() > 0) $db->rollBack();
            }
        }
        echo 'Photos autorisées par le réglage réel : '.(config('geca.media_uploads_enabled')?'oui':'non')."\n";
    }
    echo "Contrôle $mode réussi. Données protégées conservées.\n";
} catch (Throwable $e) {
    fwrite(STDERR,"Contrôle interrompu. Aucun secret affiché. Ne pas ouvrir sans vérification.\n");
    exit(1);
}
