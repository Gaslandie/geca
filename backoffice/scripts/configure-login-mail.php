<?php

use Symfony\Component\Mailer\Transport\Dsn;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransportFactory;

// À exécuter depuis l'application privée, jamais servi par le serveur web.
require 'vendor/autoload.php';

$stage = 'précontrôle';
try {
    $work = $argv[1] ?? '';
    if (! is_dir($work) || is_link($work) || (fileperms($work) & 0777) !== 0700
        || ! is_file('.env') || is_link('.env') || (fileperms('.env') & 0777) !== 0600
        || fileowner('.env') !== fileowner($work)) {
        throw new RuntimeException;
    }
    $passwordFile = $work.'/password';
    if (! is_file($passwordFile) || is_link($passwordFile) || (fileperms($passwordFile) & 0777) !== 0600
        || fileowner($passwordFile) !== fileowner('.env')) {
        throw new RuntimeException;
    }
    $password = file_get_contents($passwordFile);
    if ($password === '' || preg_match('/[\x00-\x1f\x7f]/', $password)) {
        throw new RuntimeException;
    }
    $source = file_get_contents('.env');
    $before = Dotenv\Dotenv::parse($source);
    if (($before['APP_ENV'] ?? '') !== 'production' || ($before['APP_DEBUG'] ?? '') !== 'false'
        || ($before['DB_DATABASE'] ?? '') !== 'fnksrwmy_geca' || empty($before['APP_KEY'])) {
        throw new RuntimeException;
    }
    $stage = 'connexion SSL et authentification';
    $transport = (new EsmtpTransportFactory)->create(
        new Dsn('smtps', 'globalecoaction.org', 'contact@globalecoaction.org', $password, 465, ['require_tls' => true])
    );
    $transport->getStream()->setTimeout(15);
    $transport->start();
    $transport->stop();
    $stage = 'préparation de la configuration';
    $values = [
        'GECA_LOGIN_MAIL_FROM' => 'contact@globalecoaction.org',
        'GECA_LOGIN_MAIL_HOST' => 'globalecoaction.org', 'GECA_LOGIN_MAIL_PORT' => '465',
        'GECA_LOGIN_MAIL_SCHEME' => 'smtps', 'GECA_LOGIN_MAIL_USERNAME' => 'contact@globalecoaction.org',
        'GECA_LOGIN_MAIL_PASSWORD' => $password,
    ];
    $candidate = $source;
    foreach ($values as $name => $value) {
        if (isset($before[$name]) && strpbrk($before[$name], "\r\n") !== false) {
            throw new RuntimeException;
        }
        $candidate = preg_replace('/^(?:export\s+)?'.preg_quote($name, '/').'\s*=.*\R?/m', '', $candidate);
        $escaped = str_replace(['\\', '"', '$'], ['\\\\', '\\"', '\\$'], $value);
        $candidate = rtrim($candidate, "\r\n")."\n".$name.'="'.$escaped.'"'."\n";
    }
    $stage = 'validation de la configuration';
    $after = Dotenv\Dotenv::parse($candidate);
    foreach ($values as $name => $value) {
        if (($after[$name] ?? null) !== $value) {
            throw new RuntimeException;
        }
    }
    foreach ($before as $name => $value) {
        if (! array_key_exists($name, $values) && ($after[$name] ?? null) !== $value) {
            throw new RuntimeException;
        }
    }
    $stage = 'sauvegarde et installation';
    if (file_get_contents('.env') !== $source
        || file_put_contents($work.'/env-avant', $source, LOCK_EX) !== strlen($source)
        || file_put_contents($work.'/env-nouveau', $candidate, LOCK_EX) !== strlen($candidate)) {
        throw new RuntimeException;
    }
    chmod($work.'/env-avant', 0600);
    chmod($work.'/env-nouveau', 0600);
    if (file_get_contents($work.'/env-avant') !== $source || file_get_contents('.env') !== $source
        || ! rename($work.'/env-nouveau', '.env')) {
        throw new RuntimeException;
    }
    echo "Connexion SMTP SSL authentifiée et configuration privée enregistrée.\n";
    echo "Aucun e-mail envoyé. Mode de connexion et newsletter inchangés.\n";
    echo "Ancienne configuration conservée dans le dossier privé de cette étape.\n";
} catch (Throwable) {
    fwrite(STDERR, "Configuration interrompue ($stage). Vérifiez le mot de passe de la boîte mail et ses réglages. Aucun diagnostic sensible affiché.\n");
    exit(1);
}
