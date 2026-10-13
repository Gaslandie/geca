"""Livraison automatique de code seul ; outils locaux, schéma et secrets protégés."""
import fcntl
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import pwd
import re
import zipfile
import shutil
import stat
import subprocess
import sys
import tarfile
import tempfile
import traceback

HOME = Path('/home2/fnksrwmy')
ROOT = HOME / 'geca-backoffice'
PUBLIC = HOME / 'public_html/geca-admin'
ACCOUNT = 'fnksrwmy'
OLD = NEW = ''
OLD_COUNT = NEW_COUNT = 0
ADDED = set()
CHANGED = set()
ASSETS = ['admin.css', 'admin-theme.css', 'photo-preview.js', 'admin-navigation.js',
          'brand/geca-logo-client-20261010.webp', 'brand/geca-logo-client-20261010-480.webp']
MYSQLDUMP = '/bin/mysqldump'


def require(ok, message):
    if not ok:
        raise RuntimeError(message)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def directory(path, private=False):
    require(path.is_dir() and path.resolve() == path and path.stat().st_uid == os.getuid(), 'Dossier ou propriétaire incorrect.')
    require(path.stat().st_mode & 0o022 == 0 and (not private or stat.S_IMODE(path.stat().st_mode) == 0o700), 'Permissions de dossier incorrectes.')


def regular(path, private=False):
    require(path.is_file() and path.resolve() == path and path.stat().st_uid == os.getuid(), 'Fichier ou lien incorrect.')
    require(path.stat().st_mode & 0o022 == 0 and (not private or stat.S_IMODE(path.stat().st_mode) == 0o600), 'Permissions de fichier incorrectes.')


def manifest(folder, expected, count):
    regular(folder / 'MANIFEST.json', True)
    require(sha(folder / 'MANIFEST.json') == expected, 'Version différente. Arrêt avant installation.')
    entries = json.loads((folder / 'MANIFEST.json').read_text())
    require(isinstance(entries, dict) and len(entries) == count, 'Manifeste incorrect.')
    for name, digest in entries.items():
        p = PurePosixPath(name)
        require(not p.is_absolute() and '..' not in p.parts and '\\' not in name
                and isinstance(digest, str) and len(digest) == 64 and all(c in '0123456789abcdef' for c in digest), 'Chemin ou empreinte incorrect.')
        regular(folder / name)
        require(sha(folder / name) == digest, 'Code différent de la version validée.')
    return entries


def write(path, data, mode=0o600):
    require(path.resolve() == path, 'Lien refusé avant écriture.')
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    require(path.parent.resolve() == path.parent, 'Dossier lié refusé.')
    fd, temporary = tempfile.mkstemp(prefix='.geca-reports-', dir=str(path.parent))
    try:
        with os.fdopen(fd, 'wb') as output:
            output.write(data)
            output.flush()
            os.fsync(output.fileno())
        os.chmod(temporary, mode)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def allowed(name):
    return (re.fullmatch(r'app/[A-Za-z0-9_/-]+\.php', name) is not None
            or re.fullmatch(r'resources/views/[A-Za-z0-9_/-]+\.blade\.php', name) is not None
            or name == 'routes/web.php') and all(part not in ('', '.', '..') for part in name.split('/'))


def stage_archive(work):
    global OLD, NEW, ADDED, CHANGED, OLD_COUNT, NEW_COUNT
    source = work / 'livraison.zip'
    regular(source, True)
    require(source.stat().st_size < 10_000_000, 'Archive trop grande.')
    stage = work / 'code-verifie'
    require(not stage.exists(), 'Dossier déjà utilisé.')
    stage.mkdir(mode=0o700)
    with zipfile.ZipFile(source) as archive:
        members = archive.infolist()
        names = [entry.filename for entry in members]
        require(len(set(names)) == len(names) and len(names) <= 501
                and sum(entry.file_size for entry in members) <= 10_000_000, 'Archive inattendue.')
        for entry in members:
            require(stat.S_ISREG(entry.external_attr >> 16) and not entry.flag_bits & 1
                    and (entry.filename == 'release.json' or allowed(entry.filename)), 'Fichier refusé.')
        record = json.loads(archive.read('release.json'))
        require(set(record) == {'base', 'manifest'}, 'Description incorrecte.')
        OLD = record['base']
        require(isinstance(OLD, str) and re.fullmatch('[a-f0-9]{64}', OLD), 'Version source incorrecte.')
        entries = record['manifest']
        require(isinstance(entries, dict) and 1 <= len(entries) <= 500, 'Manifeste incorrect.')
        raw = (json.dumps(entries, indent=2) + '\n').encode()
        NEW = hashlib.sha256(raw).hexdigest()
        # La source installée doit correspondre entièrement à la version attendue.
        current = json.loads((ROOT / 'MANIFEST.json').read_text())
        OLD_COUNT, NEW_COUNT = len(current), len(entries)
        old = manifest(ROOT, OLD, OLD_COUNT)
        require(set(old) <= set(entries), 'Suppression automatique refusée.')
        ADDED = set(entries) - set(old)
        CHANGED = {name for name in old if old[name] != entries[name]}
        require(ADDED | CHANGED and all(allowed(name) for name in ADDED | CHANGED), 'Changement protégé ou livraison vide.')
        require(set(names) == (ADDED | CHANGED | {'release.json'}), 'Contenu différent du manifeste.')
        validate_delta(old, entries)
        for name in ADDED | CHANGED:
            digest = entries[name]
            require(isinstance(digest, str) and re.fullmatch('[a-f0-9]{64}', digest), 'Empreinte incorrecte.')
            data = archive.read(name)
            require(hashlib.sha256(data).hexdigest() == digest, 'Fichier altéré.')
            write(stage / name, data)
        write(stage / 'MANIFEST.json', raw)
    return stage, entries


def validate_delta(old, new):
    require(set(old) <= set(new), 'Suppression refusée.')
    changes = {name for name in new if old.get(name) != new[name]}
    require(changes and all(allowed(name) for name in changes), 'Changement hors code autorisé.')


def safe_tree(root):
    for folder, directories, files in os.walk(root, followlinks=False):
        for name in directories + files:
            path = Path(folder) / name
            require(path.lstat().st_uid == os.getuid(), 'Propriétaire inattendu dans la sauvegarde.')
            if path.is_symlink():
                try:
                    path.resolve(strict=True).relative_to(root)
                except (ValueError, OSError):
                    raise RuntimeError('Lien sortant ou rompu refusé dans la sauvegarde.')
            else:
                require(path.is_file() or path.is_dir(), 'Fichier spécial refusé dans la sauvegarde.')


def verify_restored(archive, destination):
    # Restitution privée : octets, liens internes et modes. Le groupe d'une copie
    # privée peut différer sur un compte sans droit de réattribuer un groupe Apache.
    with tarfile.open(archive) as saved:
        for entry in saved.getmembers():
            target = destination / entry.name
            require(target.lstat().st_uid == os.getuid(), 'Propriétaire de restitution incorrect.')
            if entry.issym():
                require(target.is_symlink() and os.readlink(target) == entry.linkname, 'Lien restitué différent.')
            elif entry.isdir():
                require(target.is_dir() and not target.is_symlink(), 'Dossier restitué incorrect.')
                require(stat.S_IMODE(target.stat().st_mode) == entry.mode, 'Mode du dossier restitué différent.')
            else:
                require(entry.isfile() or entry.islnk(), 'Type de sauvegarde inattendu.')
                require(target.is_file() and not target.is_symlink(), 'Fichier restitué incorrect.')
                require(stat.S_IMODE(target.stat().st_mode) == entry.mode, 'Mode du fichier restitué différent.')
                require(hashlib.sha256(saved.extractfile(entry).read()).hexdigest() == sha(target), 'Contenu restitué différent.')


def copy_changes(stage, old, new):
    before = {}
    touched = []
    paths = sorted(ADDED | CHANGED) + ['MANIFEST.json']
    for name in paths:
        target = ROOT / name
        require(target.resolve() == target, 'Lien de destination refusé.')
        if name in ADDED:
            require(not target.exists() and not target.is_symlink(), 'Nouveau fichier déjà présent.')
        elif target.exists():
            regular(target)
        before[target] = (target.read_bytes(), stat.S_IMODE(target.stat().st_mode)) if target.exists() else None
    try:
        for name in paths:
            target = ROOT / name
            touched.append(target)
            write(target, (stage / name).read_bytes())
        manifest(ROOT, NEW, NEW_COUNT)
    except BaseException:
        restore_code(before, touched)
        raise
    return before, touched


def restore_code(before, touched):
    for path in reversed(touched):
        if before[path] is None:
            if path.exists():
                path.unlink()
        else:
            write(path, *before[path])


def install(work):
    os.umask(0o077)
    require(pwd.getpwuid(os.getuid()).pw_name == ACCOUNT, 'Compte système incorrect.')
    directory(HOME)
    directory(ROOT, True)
    directory(PUBLIC)
    directory(ROOT / 'storage')
    directory(ROOT / 'storage/framework')
    directory(work, True)
    require(work.parent == HOME and work.name.startswith('geca-auto-backoffice-'), 'Destination privée incorrecte.')
    regular(ROOT / '.env', True)
    regular(PUBLIC / 'index.php')
    regular(PUBLIC / '.htaccess')
    for name in ['check-backoffice.php', 'backup-backoffice.php']:
        regular(work / name, True)
    stage, new = stage_archive(work)
    old = manifest(ROOT, OLD, OLD_COUNT)
    validate_delta(old, new)
    for name in ADDED:
        require(not (ROOT / name).exists() and not (ROOT / name).is_symlink(), 'Nouveau fichier déjà présent.')
    for name in ASSETS:
        regular(PUBLIC / name)
        require(sha(PUBLIC / name) == old['public/' + name], 'Ressource publique différente.')
    directory(ROOT / 'storage/app/private/reports', True)
    protected = {p: sha(p) for p in [ROOT / '.env', PUBLIC / 'index.php', PUBLIC / '.htaccess'] + [PUBLIC / n for n in ASSETS]}
    php = shutil.which('php')
    require(php is not None and Path(MYSQLDUMP).is_file(), 'PHP ou outil de sauvegarde absent.')
    source_bytes = sum(p.stat().st_size for base in [ROOT, PUBLIC] for p in base.rglob('*') if p.is_file() and not p.is_symlink())
    require(shutil.disk_usage(HOME).free > source_bytes * 2 + 64 * 1024 * 1024, 'Espace insuffisant pour les sauvegardes et leur extraction de test.')
    def command(args):
        with (work / 'diagnostic-prive.txt').open('ab') as log:
            subprocess.run(args, cwd=ROOT, stdout=log, stderr=log, check=True, timeout=300)
    def check(mode):
        command([php, str(work / 'check-backoffice.php'), mode, str(work)])
    def down():
        write(work / 'maintenance.blade.php', b'<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Mise a jour du back-office</title></head><body><main><h1>Mise a jour en cours</h1><p>Le back-office sera disponible apres les verifications.</p></main></body></html>')
        code = "require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap(); Illuminate\\Support\\Facades\\View::addNamespace('geca-deploy',$argv[1]); exit(Illuminate\\Support\\Facades\\Artisan::call('down',['--render'=>'geca-deploy::maintenance']));"
        command([php, '-r', code, str(work)])
    check('before')
    descriptor = os.open(ROOT / 'storage/framework/geca-deploy.lock', os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600)
    with os.fdopen(descriptor, 'wb') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        # Relire les contrôles après acquisition du verrou.
        manifest(ROOT, OLD, OLD_COUNT)
        check('before')
        down()
        print('Maintenance activée. Sauvegardes privées en cours.', flush=True)
        before, touched = {}, []
        try:
            check('snapshot')
            safe_tree(ROOT)
            safe_tree(PUBLIC)
            archive = work / 'fichiers-avant.tar.gz'
            command(['tar', '-czf', str(archive), '-C', str(HOME), 'geca-backoffice', 'public_html/geca-admin'])
            command(['tar', '-dzf', str(archive), '-C', str(HOME)])
            archive.chmod(0o600)
            write(work / 'SHA256-FICHIERS.txt', (sha(archive) + '  fichiers-avant.tar.gz\n').encode())
            restored = work / 'restauration-fichiers-test'
            restored.mkdir(mode=0o700)
            command(['tar', '--same-permissions', '--no-same-owner', '-xzf', str(archive), '-C', str(restored)])
            verify_restored(archive, restored)
            command([php, str(work / 'backup-backoffice.php'), MYSQLDUMP, str(work)])
            regular(work / 'base.sql', True)
            regular(work / 'SHA256-BASE.txt', True)
            require((work / 'SHA256-BASE.txt').read_text().split()[0] == sha(work / 'base.sql'), 'Sauvegarde SQL différente.')
            print('Fichiers sauvegardés et extraction testée ; export MySQL vérifié.', flush=True)
            manifest(ROOT, OLD, OLD_COUNT)
            require(all(sha(p) == digest for p, digest in protected.items()), 'Configuration ou entrée publique différente.')
            before, touched = copy_changes(stage, old, new)
            require(all(sha(p) == digest for p, digest in protected.items()), 'Configuration privée modifiée.')
            command([php, 'artisan', 'config:clear'])
            command([php, 'artisan', 'route:clear'])
            check('code')
            command([php, 'artisan', 'view:cache'])
            check('after')
            manifest(ROOT, NEW, NEW_COUNT)
            require(all(sha(p) == digest for p, digest in protected.items()), 'Configuration ou entrée publique modifiée.')
            command([php, 'artisan', 'up'])
            try:
                check('http')
            except BaseException:
                down()
                raise
            print('Code du back-office installé et vérifié ; aucune migration.')
            print('Comptes, contenus, configuration, clé et fichiers publics conservés. Back-office rouvert.')
            print('16 contrôles Laravel internes réussis. Connexion et dépôt réels à vérifier dans le navigateur.')
            print('Sauvegarde et diagnostic privés : ' + str(work))
        except BaseException:
            if touched:
                restore_code(before, touched)
                command([php, 'artisan', 'config:clear'])
                command([php, 'artisan', 'route:clear'])
                command([php, 'artisan', 'view:cache'])
            with (work / 'diagnostic-prive.txt').open('a') as log:
                traceback.print_exc(file=log)
            print('Arrêt : ancien code restitué lorsque possible, maintenance conservée. Ne pas relancer sans vérifier.', file=sys.stderr)
            print('Sauvegarde et diagnostic privés : ' + str(work), file=sys.stderr)
            raise


if __name__ == '__main__':
    try:
        require(len(sys.argv) == 2, 'Une destination privée est nécessaire.')
        install(Path(sys.argv[1]))
    except Exception:
        print('Installation interrompue. Aucun secret affiché. Transmettre seulement le message de résultat.', file=sys.stderr)
        sys.exit(1)
