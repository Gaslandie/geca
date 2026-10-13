<?php

use App\Http\Controllers\ActivityReportController;
use App\Models\ActivityReport;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

// Vérifications de livraison : aucune clé, adresse privée ou donnée de ligne dans la sortie.
try {
    umask(0077);
    require 'vendor/autoload.php';
    $app = require 'bootstrap/app.php';
    $app->make(Kernel::class)->bootstrap();
    $mode = $argv[1] ?? '';
    $work = $argv[2] ?? '';
    $assert = static function (bool $condition): void {
        if (! $condition) {
            throw new RuntimeException('Contrôle refusé.');
        }
    };
    $assert(in_array($mode, ['before', 'snapshot', 'code', 'migrated', 'http'], true));
    $assert(realpath($work) === $work && dirname($work) === '/home2/fnksrwmy'
        && (fileperms($work) & 0777) === 0700 && fileowner($work) === fileowner('.env'));
    $assert(PHP_VERSION_ID >= 80400 && $app->environment('production') && config('app.debug') === false
        && config('app.url') === 'https://admin.globalecoaction.org'
        && config('database.default') === 'mysql'
        && config('database.connections.mysql.database') === 'fnksrwmy_geca'
        && config('database.connections.mysql.username') === 'fnksrwmy_geca_app'
        && in_array(config('database.connections.mysql.host'), ['localhost', '127.0.0.1'], true)
        && (int) config('database.connections.mysql.port') === 3306
        && ! config('database.connections.mysql.url') && ! config('database.connections.mysql.unix_socket')
        && ! config('database.connections.mysql.read') && ! config('database.connections.mysql.write')
        && config('login.verification') === 'email'
        && (int) config('login.local_user') === 0 && (int) config('login.local_until') === 0
        && config('session.driver') === 'database' && config('cache.default') === 'database'
        && config('session.secure') === true && config('session.http_only') === true
        && in_array(config('session.same_site'), ['lax', 'strict'], true) && config('session.domain') === null
        && config('app.maintenance.driver') === 'file'
        && config('mail.default') === 'array' && config('newsletter.mode') === 'preview'
        && config('mail.mailers.login.transport') === 'smtp' && config('mail.mailers.login.scheme') === 'smtps'
        && config('mail.mailers.login.host') === 'globalecoaction.org'
        && (int) config('mail.mailers.login.port') === 465 && config('mail.mailers.login.require_tls') === true
        && config('login.from') === 'contact@globalecoaction.org'
        && realpath(public_path()) === '/home2/fnksrwmy/public_html/geca-admin'
        && config('geca.media_uploads_enabled') === true
        && config('geca.reference_public_path') === '/home2/fnksrwmy/public_html/website_43934bdf');
    $assert($app->isDownForMaintenance() === in_array($mode, ['snapshot', 'code', 'migrated'], true));
    if ($app->isDownForMaintenance()) {
        $maintenance = json_decode(file_get_contents(storage_path('framework/down')), true, flags: JSON_THROW_ON_ERROR);
        // Laravel garde son contrôle de santé /up ; aucune route privée ne peut être exclue.
        $assert(empty($maintenance['secret']) && empty($maintenance['redirect'])
            && (int) ($maintenance['status'] ?? 0) === 503
            && in_array($maintenance['except'] ?? [], [[], ['/up'], ['up']], true));
    }
    $db = DB::connection('mysql');
    $assert($db->selectOne('SELECT DATABASE() AS db')->db === 'fnksrwmy_geca');
    $tables = $db->select('SELECT TABLE_NAME AS name, ENGINE AS engine FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()');
    $new = in_array($mode, ['migrated', 'http'], true);
    $assert(count($tables) === ($new ? 19 : 18));
    $migration = '2026_10_13_000002_add_backoffice_roles';
    $migrations = $db->table('migrations')->orderBy('id')->get()->map(fn ($row) => (array) $row)->all();
    $assert(count($migrations) === ($new ? 12 : 11));
    $expected = array_map(fn ($path) => basename($path, '.php'), glob('database/migrations/*.php'));
    if ($mode === 'code') { $expected = array_values(array_diff($expected, [$migration])); }
    $names = array_column($migrations, 'migration');
    sort($expected);
    sort($names);
    $assert($names === $expected && in_array($migration, $names, true) === $new);
    $schema = $db->getSchemaBuilder();
    foreach (['activity_reports', 'activity_report_revisions'] as $name) {
        $assert($schema->hasTable($name));
    }

    $assert($schema->hasColumn('users', 'role') === $new && $schema->hasTable('user_access_events') === $new);
    if ($new) {
        $assert($db->table('users')->whereNotNull('role')->count() === 0 && $db->table('user_access_events')->count() === 0);
        $columns = $schema->getColumns('users');
        $roleColumn = collect($columns)->firstWhere('name', 'role');
        $assert($roleColumn !== null && $roleColumn['nullable'] === true && $roleColumn['type'] === 'varchar(16)' && $roleColumn['default'] === null);
    }
    $state = [];
    foreach ($tables as $table) {
        $assert($table->engine === 'InnoDB' && preg_match('/^[a-z_]+$/D', $table->name) === 1);
        if (in_array($table->name, ['sessions', 'cache', 'cache_locks', 'migrations', 'user_access_events'], true)) {
            continue;
        }
        $rows = $db->table($table->name)->get()->map(function ($row) use ($table) {
            if ($table->name === 'users') { unset($row->role); }
            return json_encode($row, JSON_THROW_ON_ERROR);
        })->sort()->values()->all();
        $definition = $db->select('SHOW CREATE TABLE `'.$table->name.'`');
        if ($new && $table->name === 'users') {
            foreach ($definition as $row) {
                foreach ($row as $key => $value) {
                    if (str_contains($key, 'Create')) {
                        $row->$key = preg_replace('/^  `role` varchar\\(16\\)(?: COLLATE [a-z0-9_]+)? DEFAULT NULL,\\n/m', '', $value, -1, $removed);
                        $assert($removed === 1);
                    }
                }
            }
        }
        $state[$table->name] = ['count' => count($rows), 'hash' => hash('sha256', json_encode($rows, JSON_THROW_ON_ERROR)),
            'schema' => hash('sha256', json_encode($definition, JSON_THROW_ON_ERROR))];
    }
    ksort($state);
    $settings = hash('sha256', json_encode(collect(['app.key', 'database', 'login', 'session', 'mail', 'newsletter', 'cache', 'queue', 'geca.media_uploads_enabled', 'geca.reference_public_path', 'geca.public_path'])
        ->mapWithKeys(fn ($key) => [$key => config($key)])->all(), JSON_THROW_ON_ERROR));
    $snapshot = $work.'/etat-avant-roles.json';
    if ($mode === 'snapshot') {
        $assert(! file_exists($snapshot));
        file_put_contents($snapshot, json_encode(['state' => $state, 'settings' => $settings, 'migrations' => $migrations], JSON_THROW_ON_ERROR), LOCK_EX);
        chmod($snapshot, 0600);
    } elseif ($new || $mode === 'code') {
        $assert(is_file($snapshot) && ! is_link($snapshot) && (fileperms($snapshot) & 0777) === 0600);
        $before = json_decode(file_get_contents($snapshot), true, flags: JSON_THROW_ON_ERROR);
        $assert($before['state'] === $state && hash_equals($before['settings'], $settings));
        $assert($mode === 'code' ? $migrations === $before['migrations'] : array_slice($migrations, 0, 11) === $before['migrations'] && $migrations[11]['migration'] === $migration);
        $assert(count(\App\Enums\BackofficeRole::cases()) === 3);
        $assert(class_exists(ActivityReport::class) && class_exists(ActivityReportController::class));
        $assert(config('geca.reports_quota_bytes') === 250 * 1024 * 1024
            && config('filesystems.disks.reports.driver') === 'local'
            && config('filesystems.disks.reports.root') === storage_path('app/private/reports')
            && config('filesystems.disks.reports.serve') === false
            && config('filesystems.disks.reports.visibility') === 'private'
            && config('filesystems.disks.reports.throw') === true);
        if ($new) {
            $folder = storage_path('app/private/reports');
            $assert(realpath($folder) === $folder && (fileperms($folder) & 0777) === 0700
                && fileowner($folder) === fileowner('.env') && is_writable($folder));
            $probe = $folder.'/.geca-test-'.bin2hex(random_bytes(8));
            try {
                $file = fopen($probe, 'x');
                $assert($file !== false);
                fwrite($file, 'test de permissions');
                fclose($file);
                $assert((fileperms($probe) & 0777) === 0600);
            } finally {
                if (is_file($probe)) {
                    unlink($probe);
                }
            }
        }
        $routes = Route::getRoutes();
        foreach (['index','create','store','edit','update'] as $name) {
            $route = $routes->getByName('users.'.$name);
            $assert($route !== null);
            foreach (['web','auth','admin','auth.session'] as $middleware) { $assert(in_array($middleware, $route->gatherMiddleware(), true)); }
        }
        foreach (['admin','editor','reader'] as $role) {
            $sample = new \App\Models\User;
            $sample->role = $role; $sample->is_admin = $role === 'admin';
            $assert($sample->hasBackofficeAccess() && $sample->canAccessRoute('reports.download'));
            $assert($sample->canAccessRoute('users.store') === ($role === 'admin'));
            $assert($sample->canAccessRoute('reports.store') === ($role !== 'reader'));
        }

        foreach (['index', 'create', 'store', 'archives', 'download', 'edit', 'update', 'destroy', 'restore'] as $name) {
            $route = $routes->getByName('reports.'.$name);
            $assert($route !== null);
            foreach (['web', 'auth', 'admin', 'auth.session'] as $middleware) {
                $assert(in_array($middleware, $route->gatherMiddleware(), true));
            }
        }
    }
    if ($mode === 'http') {
        $id = '00000000-0000-4000-8000-000000000000';
        $cases = [['GET', '/connexion', 200], ['GET', '/connexion-locale', 404], ['GET', '/administration', 302],
            ['GET', '/administration/rapports', 302], ['GET', '/administration/rapports/ajouter', 302],
            ['GET', '/administration/rapports/archives', 302], ['GET', "/administration/rapports/$id/modifier", 302],
            ['GET', "/administration/rapports/$id/telecharger", 302], ['POST', '/administration/rapports', 419],
            ['PUT', "/administration/rapports/$id", 419], ['DELETE', "/administration/rapports/$id", 419],
            ['POST', "/administration/rapports/$id/restaurer", 419], ['GET', "/storage/reports/$id/rapport.pdf", 404],
            ['GET', '/administration/corbeille', 302], ['GET', '/administration/team/ajouter', 302],
            ['GET', '/administration/securite', 302], ['GET','/administration/comptes',302], ['GET','/administration/comptes/ajouter',302], ['GET','/administration/comptes/1/modifier',302], ['POST','/administration/comptes',419], ['PUT','/administration/comptes/1',419]];
        foreach ($cases as [$method, $path, $expectedStatus]) {
            $app = require 'bootstrap/app.php';
            $request = Request::create('https://admin.globalecoaction.org'.$path, $method);
            $app->instance('request', $request);
            $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
            $kernel->bootstrap();
            $db = DB::connection();
            $db->beginTransaction();
            try {
                $response = $kernel->handle($request);
                $kernel->terminate($request, $response);
                $assert($response->getStatusCode() === $expectedStatus
                    && $response->headers->get('X-Frame-Options') === 'DENY'
                    && $response->headers->get('X-Content-Type-Options') === 'nosniff'
                    && str_contains($response->headers->get('Cache-Control', ''), 'no-store'));
                if ($expectedStatus === 302) {
                    $assert($response->headers->get('Location') === 'https://admin.globalecoaction.org/connexion');
                }
                echo "$method $path : $expectedStatus conforme\n";
            } finally {
                while ($db->transactionLevel() > 0) {
                    $db->rollBack();
                }
            }
        }
    }
    echo "Contrôle $mode réussi. Comptes, contenus et réglages conservés.\n";
} catch (Throwable $error) {
    fwrite(STDERR, "Contrôle du back-office interrompu. Diagnostic privé. Ne pas rouvrir ni relancer sans vérifier.\n");
    exit(1);
}
