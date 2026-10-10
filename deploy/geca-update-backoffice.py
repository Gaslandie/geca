"""Livraison GECA 0a00b71 : code seul, sauvegardes privées, aucune migration."""
import fcntl
import getpass
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import subprocess
import sys
import tarfile
import tempfile

HOME = Path('/home2/fnksrwmy')
ROOT = HOME / 'geca-backoffice'
PUBLIC = HOME / 'public_html/geca-admin'
OLD = 'c1f686490e34c2c1486821e16f7d4aef957b2174e0846a1fc6d0960df3bd15f8'
NEW = '087a942c86b8b1f8e5b0794bf45f87424de9541f57791c72e3719a50f22f7a24'
ARCHIVE = 'd70b56139e7952ae90dd430779db0f1fb5d8552398bcf4d46c673275e2951f45'
ASSETS = ['admin.css', 'admin-theme.css', 'photo-preview.js', 'admin-navigation.js', 'brand/geca-logo-client-20261010.webp', 'brand/geca-logo-client-20261010-480.webp']

def require(ok, message):
    if not ok:
        raise RuntimeError(message)

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def directory(path, private=False):
    require(path.is_dir() and path.resolve() == path and path.stat().st_uid == os.getuid(), 'Dossier ou propriétaire incorrect.')
    require(path.stat().st_mode & 0o022 == 0 and (not private or stat.S_IMODE(path.stat().st_mode) == 0o700), 'Permissions du dossier incorrectes.')

def regular(path):
    require(path.is_file() and path.resolve() == path and path.stat().st_uid == os.getuid(), 'Fichier ou lien incorrect.')

def manifest(folder, expected):
    regular(folder / 'MANIFEST.json')
    require(sha(folder / 'MANIFEST.json') == expected, 'Version du code différente. Arrêt avant installation.')
    entries = json.loads((folder / 'MANIFEST.json').read_text())
    require(isinstance(entries, dict) and 80 <= len(entries) <= 110, 'Manifeste incorrect.')
    for name, digest in entries.items():
        p = PurePosixPath(name)
        require(not p.is_absolute() and '..' not in p.parts and '\\' not in name and re.fullmatch('[a-f0-9]{64}', digest), 'Chemin incorrect.')
        regular(folder / name)
        require(sha(folder / name) == digest, 'Code modifié depuis la validation : ' + name)
    return entries

def write(path, data, mode):
    require(path.resolve() == path, 'Lien refusé avant écriture.')
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    fd, temporary = tempfile.mkstemp(prefix='.geca-update-', dir=path.parent)
    try:
        with os.fdopen(fd, 'wb') as f:
            f.write(data)
            f.flush()
            os.fsync(f.fileno())
        os.chmod(temporary, mode)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)

def install_code(root, public, stage, old, new, check):
    # Aucune suppression des anciennes ressources, originaux ou données.
    removed = set(old) - set(new)
    require(removed <= {'public/brand/geca-logo.webp'}, 'Retrait de code inattendu.')
    for name in ['composer.json', 'composer.lock']:
        require(old[name] == new[name], 'Dépendances différentes. Livraison refusée.')
    old_migrations = {n: h for n, h in old.items() if n.startswith('database/migrations/')}
    require(old_migrations == {n: h for n, h in new.items() if n.startswith('database/migrations/')}, 'Migration nouvelle ou modifiée refusée.')
    for name in set(new) - set(old):
        require(not (root / name).exists() and not (root / name).is_symlink(), 'Nouveau fichier déjà présent : ' + name)
    changes = [(root / n, (stage / n).read_bytes(), 0o600) for n, h in new.items() if old.get(n) != h]
    changes += [(public / n, (stage / 'public' / n).read_bytes(), 0o644) for n in ASSETS]
    changes += [(root / 'MANIFEST.json', (stage / 'MANIFEST.json').read_bytes(), 0o600)]
    before = {}
    for path, _, _ in changes:
        require(path.resolve() == path, 'Lien de destination refusé.')
        if path.exists():
            regular(path)
        before[path] = (path.read_bytes(), stat.S_IMODE(path.stat().st_mode)) if path.exists() else None
    touched = []
    try:
        for path, data, mode in changes:
            write(path, data, mode)
            touched.append(path)
            require(path.read_bytes() == data, 'Copie différente.')
        manifest(root, NEW)
        check()
    except BaseException:
        for path in reversed(touched):
            if before[path] is None:
                path.unlink()
            else:
                write(path, *before[path])
        raise
    return len(changes)

def main():
    os.umask(0o077)
    require(getpass.getuser() == 'fnksrwmy', 'Compte système incorrect.')
    work = Path(sys.argv[1])
    directory(HOME)
    directory(ROOT, True)
    directory(ROOT / 'storage')
    directory(ROOT / 'storage/framework')
    directory(PUBLIC)
    directory(work, True)
    require(work.parent == HOME and work.name.startswith('geca-actualisation-'), 'Destination privée incorrecte.')
    regular(work / 'geca-backoffice-code.tar.gz')
    require(sha(work / 'geca-backoffice-code.tar.gz') == ARCHIVE, 'Archive différente.')
    old = manifest(ROOT, OLD)
    regular(ROOT / '.env')
    protected = {p: sha(p) for p in [ROOT / '.env', PUBLIC / 'index.php', PUBLIC / '.htaccess']}
    env_original = (ROOT / '.env').read_bytes()
    stage = work / 'code-verifie'
    require(not stage.exists(), 'Dossier de livraison déjà utilisé.')
    stage.mkdir(mode=0o700)
    with tarfile.open(work / 'geca-backoffice-code.tar.gz') as tar:
        members = tar.getmembers()
        names = [m.name for m in members]
        require(len(names) == 103 and len(set(names)) == 103 and sum(m.size for m in members) < 10_000_000, 'Archive inattendue.')
        for member in members:
            p = PurePosixPath(member.name)
            require(member.isfile() and not p.is_absolute() and '..' not in p.parts and '\\' not in member.name, 'Type ou chemin refusé.')
            write(stage / member.name, tar.extractfile(member).read(), 0o600)
    new = manifest(stage, NEW)
    require(set(names) == set(new) | {'MANIFEST.json'}, 'Fichier hors manifeste.')
    require(all(old[n] == new.get(n) for n in old if n.startswith('database/migrations/') or n in ['composer.json', 'composer.lock']), 'Migration ou dépendance différente.')
    for name in set(new) - set(old):
        require(not (ROOT / name).exists() and not (ROOT / name).is_symlink(), 'Nouveau fichier déjà présent : ' + name)
    php = shutil.which('php')
    require(php is not None, 'PHP absent.')
    def command(args):
        with (work / 'diagnostic-prive.txt').open('ab') as log:
            subprocess.run(args, cwd=ROOT, stdout=log, stderr=log, check=True, timeout=180)
    def check(mode):
        command([php, str(work / 'geca-check-backoffice.php'), mode, str(work)])
    def down():
        # Vue autonome : le pré-rendu ne dépend ni de session, ni des vues remplacées.
        write(work / 'maintenance.blade.php', b'<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Mise a jour du back-office</title></head><body><main><h1>Mise a jour en cours</h1><p>Le back-office sera disponible apres les verifications.</p></main></body></html>', 0o600)
        code = "require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap(); Illuminate\\Support\\Facades\\View::addNamespace('geca-deploy',$argv[1]); exit(Illuminate\\Support\\Facades\\Artisan::call('down',['--render'=>'geca-deploy::maintenance']));"
        command([php, '-r', code, str(work)])
    check('before')
    # Refuse une exécution simultanée sans attente silencieuse.
    descriptor = os.open(ROOT / 'storage/framework/geca-deploy.lock', os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600)
    with os.fdopen(descriptor, 'wb') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        down()
        print('Maintenance activée. Préparation des sauvegardes.', flush=True)
        try:
            check('snapshot')
            archive = work / 'fichiers-avant.tar.gz'
            command(['tar', '-czf', str(archive), '-C', str(HOME), 'geca-backoffice', 'public_html/geca-admin'])
            command(['tar', '-dzf', str(archive), '-C', str(HOME)])
            archive.chmod(0o600)
            (work / 'SHA256-FICHIERS.txt').write_text(sha(archive) + '  fichiers-avant.tar.gz\n')
            command([php, str(work / 'geca-backup-backoffice.php'), '/bin/mysqldump', str(work)])
            print('Sauvegardes des fichiers et de MySQL vérifiées.', flush=True)
            manifest(ROOT, OLD)
            require(all(sha(p) == h for p, h in protected.items()), 'Configuration ou entrée HTTP différente.')
            def verify():
                require(all(sha(p) == h for p, h in protected.items()), 'Configuration modifiée.')
                command([php, str(work / 'geca-configure-photos.php'), str(work)])
                protected[ROOT / '.env'] = sha(ROOT / '.env')
                command([php, 'artisan', 'config:clear'])
                command([php, 'artisan', 'route:clear'])
                command([php, 'artisan', 'view:cache'])
                check('after')
            count = install_code(ROOT, PUBLIC, stage, old, new, verify)
            command([php, 'artisan', 'up'])
            try:
                check('http')
            except BaseException:
                down()
                raise
            print('Back-office mis à jour : 102 fichiers conformes ; ' + str(count) + ' copies contrôlées.')
            print('Contrôles Laravel et traitement photo réussis. Comptes et contenus conservés. Aucune migration.')
            print('Photos activées ; dossier de la vitrine configuré. Autres réglages et clé conservés.')
            print('Sauvegarde privée : ' + str(work))
        except BaseException:
            # Échec : code restitué pour les erreurs de copie ordinaires ; ne pas rouvrir.
            if (ROOT / '.env').read_bytes() != env_original:
                write(ROOT / '.env', env_original, 0o600)
            command([php, 'artisan', 'config:clear'])
            command([php, 'artisan', 'route:clear'])
            command([php, 'artisan', 'view:cache'])
            print('Arrêt : maintenance conservée. Diagnostic privé et sauvegardes dans ' + str(work), file=sys.stderr)
            raise

if __name__ == '__main__':
    try:
        main()
    except Exception:
        print('Mise à jour interrompue. Ne pas relancer sans vérifier l’état et les sauvegardes.', file=sys.stderr)
        sys.exit(1)
