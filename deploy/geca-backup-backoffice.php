<?php
$client = null;
$failed = false;
try {
    umask(0077);
    require 'vendor/autoload.php';
    $backup = $argv[2];
    if (realpath($backup) !== $backup || (fileperms($backup) & 0777) !== 0700
        || fileowner($backup) !== fileowner('.env') || is_link('.env')
        || dirname($backup) !== '/home2/fnksrwmy' || file_exists("$backup/base.sql")) {
        throw new RuntimeException();
    }
    $app = require 'bootstrap/app.php';
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    if (!$app->environment('production') || config('app.debug') !== false
        || !$app->isDownForMaintenance() || config('database.default') !== 'mysql') {
        throw new RuntimeException();
    }
    $cfg = config('database.connections.mysql');
    if ($cfg['database'] !== 'fnksrwmy_geca'
        || !in_array($cfg['host'], ['localhost', '127.0.0.1'], true)
        || $cfg['username'] !== 'fnksrwmy_geca_app' || !empty($cfg['read']) || !empty($cfg['write'])
        || (int) $cfg['port'] !== 3306 || !empty($cfg['unix_socket']) || !empty($cfg['url'])) {
        throw new RuntimeException();
    }
    $db = Illuminate\Support\Facades\DB::connection('mysql');
    if ($db->selectOne('SELECT DATABASE() AS db')->db !== 'fnksrwmy_geca') {
        throw new RuntimeException();
    }
    if ($db->selectOne('SELECT COUNT(*) AS total FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = DATABASE()')->total || $db->selectOne('SELECT COUNT(*) AS total FROM information_schema.EVENTS WHERE EVENT_SCHEMA = DATABASE()')->total || $db->selectOne('SELECT COUNT(*) AS total FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = DATABASE()')->total) throw new RuntimeException();
    $tables = $db->select('SELECT TABLE_NAME AS name, ENGINE AS engine FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()');
    foreach ($tables as $table) {
        if ($table->engine !== 'InnoDB') {
            throw new RuntimeException();
        }
    }
    $quote = function ($s) {
        if (preg_match('/[\x00-\x1f\x7f]/', $s)) {
            throw new RuntimeException();
        }
        return '"'.str_replace(['\\', '"'], ['\\\\', '\\"'], $s).'"';
    };
    if (file_exists($backup.'/login-path-absent') || is_link($backup.'/login-path-absent')) throw new RuntimeException();
    $client = "$backup/client-temporaire.cnf";
    $f = fopen($client, 'x');
    fwrite($f, "[client]\nhost=".$quote($cfg['host'])."\nport=3306\nuser=".$quote($cfg['username'])."\npassword=".$quote($cfg['password'])."\n");
    fclose($f);
    $args = [$argv[1], "--defaults-file=$client", '--single-transaction', '--quick', '--hex-blob', '--default-character-set=utf8mb4', '--no-tablespaces', '--set-gtid-purged=OFF', 'fnksrwmy_geca'];
    $out = fopen("$backup/base.sql", 'x');
    $err = fopen("$backup/erreur-export-privee.txt", 'x');
    $process = proc_open($args, [0 => ['file', '/dev/null', 'r'], 1 => $out, 2 => $err], $pipes, null, ['PATH' => '/usr/bin:/bin', 'HOME' => '/home2/fnksrwmy', 'LANG' => 'C', 'MYSQL_TEST_LOGIN_FILE' => $backup.'/login-path-absent']);
    if (!is_resource($process)) {
        throw new RuntimeException();
    }
    $status = proc_close($process);
    fclose($out);
    fclose($err);
    unlink($client);
    $client = null;
    $sql = file_get_contents("$backup/base.sql");
    if ($status !== 0 || !str_contains($sql, '-- Dump completed on ')
        || preg_match('/^(CREATE DATABASE|USE )/m', $sql)
        || substr_count($sql, 'CREATE TABLE `') !== count($tables)) {
        throw new RuntimeException();
    }
    foreach ($tables as $table) {
        if (!str_contains($sql, 'CREATE TABLE `'.$table->name.'`')) {
            throw new RuntimeException();
        }
    }
    file_put_contents("$backup/SHA256-BASE.txt", hash_file('sha256', "$backup/base.sql")."  base.sql\n", LOCK_EX);
    echo 'Sauvegarde SQL terminée : '.count($tables)." tables.\n";
    echo "Compte et contenus inchangés. Maintenance conservée.\n";
} catch (Throwable $e) {
    fwrite(STDERR, "Sauvegarde SQL interrompue. Aucun changement de base. Ne pas poursuivre.\n");
    $failed = true;
} finally {
    if ($client !== null && is_file($client)) {
        unlink($client);
    }
}

if ($failed) {
    exit(1);
}
