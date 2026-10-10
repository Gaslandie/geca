<?php
// Deux réglages uniquement ; aucun secret fourni dans les arguments ou la sortie.
try {
    umask(0077);
    require 'vendor/autoload.php';
    $work = $argv[1];
    $path = '/home2/fnksrwmy/public_html/website_43934bdf';
    if (realpath($work) !== $work || dirname($work) !== '/home2/fnksrwmy'
        || (fileperms($work) & 0777) !== 0700 || realpath($path) !== $path
        || fileowner($path) !== fileowner('.env') || is_link('.env')
        || (fileperms('.env') & 0777) !== 0600) throw new RuntimeException();
    $old = file_get_contents('.env');
    $before = Dotenv\Dotenv::parse($old);
    $new = $old;
    $values = ['GECA_MEDIA_UPLOADS_ENABLED'=>'true', 'GECA_REFERENCE_PUBLIC_PATH'=>$path];
    foreach ($values as $key => $value) {
        $count = preg_match_all('/^'.preg_quote($key,'/').'\s*=.*$/m',$old);
        if ($count > 1) throw new RuntimeException();
        if ($key === 'GECA_REFERENCE_PUBLIC_PATH' && isset($before[$key])
            && !in_array($before[$key], ['', 'null', $path],true)) throw new RuntimeException();
        if ($key === 'GECA_MEDIA_UPLOADS_ENABLED' && isset($before[$key])
            && !in_array($before[$key], ['true','false'],true)) throw new RuntimeException();
        $line = $key.'='.$value;
        $new = $count === 1 ? preg_replace('/^'.preg_quote($key,'/').'\s*=.*$/m',$line,$new) : rtrim($new,"\r\n")."\n".$line."\n";
    }
    $after = Dotenv\Dotenv::parse($new);
    foreach ($values as $key => $value) {
        if (($after[$key] ?? null) !== $value) throw new RuntimeException();
        unset($before[$key],$after[$key]);
    }
    if ($before !== $after || file_exists($work.'/env-avant-photos')) throw new RuntimeException();
    $backup = fopen($work.'/env-avant-photos','x');
    if (fwrite($backup,$old) !== strlen($old)) throw new RuntimeException();
    fclose($backup);
    $temporary = tempnam(getcwd(), '.geca-env-');
    if ($temporary === false || file_put_contents($temporary,$new,LOCK_EX) !== strlen($new)
        || !chmod($temporary,0600) || !rename($temporary,'.env')) throw new RuntimeException();
    echo "Ajout de photos et lecture des portraits configurés. Autres réglages conservés.\n";
} catch (Throwable $e) {
    fwrite(STDERR,"Réglage photos interrompu. Ne pas poursuivre.\n");
    exit(1);
}
