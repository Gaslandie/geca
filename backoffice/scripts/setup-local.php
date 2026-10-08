<?php

// Exécuter seulement dans une copie locale neuve. Ne remplace aucun .env.
$base = dirname(__DIR__);
if (PHP_SAPI !== 'cli' || file_exists($base.'/.env')) {
    fwrite(STDERR, "Arrêt : usage CLI local uniquement et aucun .env existant.\n");
    exit(1);
}
$database = $base.'/database/local.sqlite';
if (file_exists($database)) {
    fwrite(STDERR, "Arrêt : la base locale existe déjà.\n");
    exit(1);
}
umask(0077);
$config = file_get_contents($base.'/.env.example');
$config = str_replace([
    'APP_ENV=production', 'APP_KEY='.PHP_EOL,
    'APP_URL=https://admin.globalecoaction.org', 'DB_CONNECTION=mysql',
    'DB_DATABASE='.PHP_EOL, 'SESSION_SECURE_COOKIE=true', 'GECA_MEDIA_UPLOADS_ENABLED=false',
    'GECA_PUBLIC_SITE_URL=https://globalecoaction.org',
], [
    'APP_ENV=local', 'APP_KEY=base64:'.base64_encode(random_bytes(32)).PHP_EOL,
    'APP_URL=http://127.0.0.1:8000', 'DB_CONNECTION=sqlite',
    'DB_DATABASE="'.$database.'"'.PHP_EOL, 'SESSION_SECURE_COOKIE=false', 'GECA_MEDIA_UPLOADS_ENABLED=true',
    'GECA_PUBLIC_SITE_URL=http://127.0.0.1:3000/fr',
], $config);
file_put_contents($base.'/.env', $config);
touch($database);
echo "Configuration et base locales créées. Aucun secret affiché.\n";
