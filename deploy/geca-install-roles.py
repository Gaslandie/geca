"""Installer les trois rôles : migration additive après sauvegardes privées."""
import fcntl
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import pwd
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
OLD = '8b3d4e1939fc8a04b014cb5486d5fdac9ad5aee85860bf55fc732a15db8c4ef8'
NEW = '2a3f2799d378cd8c4d1db26ebe61ac21b0738b15f0acf3ccb003b1f6e2082029'
ARCHIVE = '402b0e59eb095c83670e80bd57b612b786850ca00efc975b4609755f58deec15'
ADDED = {'resources/views/content/show.blade.php', 'database/migrations/2026_10_13_000002_add_backoffice_roles.php', 'app/Services/BackofficeAuthorization.php', 'resources/views/users/edit.blade.php', 'resources/views/users/index.blade.php', 'app/Enums/BackofficeRole.php', 'app/Http/Controllers/UserManagementController.php'}
CHANGED = {'app/Console/Commands/AdminAccount.php', 'app/Http/Controllers/TwoFactorController.php', 'app/Services/EmailLogin.php', 'app/Http/Controllers/ActivityReportController.php', 'app/Http/Controllers/ContentController.php', 'app/Services/TwoFactor.php', 'app/Providers/AppServiceProvider.php', 'resources/views/layouts/admin.blade.php', 'app/Console/Commands/ProcessNewsletter.php', 'resources/views/content/index.blade.php', 'routes/web.php', 'resources/views/dashboard.blade.php', 'app/Http/Controllers/AccountSecurityController.php', 'resources/views/reports/index.blade.php', 'app/Http/Controllers/SessionController.php', 'app/Models/User.php', 'app/Http/Middleware/RequireAdministrator.php'}
MIGRATION = 'database/migrations/2026_10_13_000002_add_backoffice_roles.php'
ASSETS = ['admin.css', 'admin-theme.css', 'photo-preview.js', 'admin-navigation.js',
          'brand/geca-logo-client-20261010.webp', 'brand/geca-logo-client-20261010-480.webp']
MYSQLDUMP = '/bin/mysqldump'
TOOLS = HOME / 'geca-deploy-backoffice'
TOOL_OLD = {'check-backoffice.php': 'ad416602adf6fabd1cb0e20b976b747779f2100fc8a366679631ef2aa857520b', 'receive-backoffice.py': '8bb0c22f2479c15db65befc4679cb53e4d1a89e7f8a22cf8db0f303eff0361e7'}
TOOL_NEW = {'check-backoffice.php': '81406f23383336f265b07b16d6126cff8db493bafa47e4eb62ecf1b876711cd8', 'receive-backoffice.py': '6e272b20ebba9cdf6207e1ebd193212a5c33781efa64702a4376180de0bd92d2'}


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


def stage_archive(work):
    source = work / 'geca-roles-code.tar.gz'
    regular(source, True)
    require(sha(source) == ARCHIVE, 'Archive différente.')
    stage = work / 'code-verifie'
    require(not stage.exists(), 'Dossier de livraison déjà utilisé.')
    stage.mkdir(mode=0o700)
    with tarfile.open(source) as archive:
        members = archive.getmembers()
        names = [entry.name for entry in members]
        require(len(members) == 115 and len(set(names)) == 115
                and sum(entry.size for entry in members) < 10_000_000, 'Archive inattendue.')
        for entry in members:
            path = PurePosixPath(entry.name)
            require(entry.isfile() and entry.size >= 0 and not path.is_absolute()
                    and '..' not in path.parts and '\\' not in entry.name, 'Chemin ou type refusé.')
            write(stage / entry.name, archive.extractfile(entry).read())
    new = manifest(stage, NEW, 114)
    require(set(names) == set(new) | {'MANIFEST.json'}, 'Fichier hors manifeste.')
    return stage, new


def validate_delta(old, new):
    require(set(new) - set(old) == ADDED and set(old) - set(new) == set(), 'Ajout ou retrait inattendu.')
    require({name for name in old if old[name] != new[name]} == CHANGED, 'Modification hors rubrique Rapports.')
    require(old['composer.json'] == new['composer.json'] and old['composer.lock'] == new['composer.lock'], 'Dépendances différentes.')
    require({n: h for n, h in old.items() if n.startswith('database/migrations/')} ==
            {n: h for n, h in new.items() if n.startswith('database/migrations/') and n != MIGRATION}, 'Ancienne migration modifiée.')


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
        manifest(ROOT, NEW, 114)
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
    require(work.parent == HOME and work.name.startswith('geca-roles-'), 'Destination privée incorrecte.')
    regular(ROOT / '.env', True)
    regular(PUBLIC / 'index.php')
    regular(PUBLIC / '.htaccess')
    for name in ['geca-check-roles.php', 'geca-backup-backoffice.php', 'check-backoffice.php', 'receive-backoffice.py']:
        regular(work / name, True)
    directory(TOOLS, True)
    for name, digest in TOOL_OLD.items():
        regular(TOOLS / name, True)
        require(sha(TOOLS / name) == digest, 'Outil automatique distant différent.')
        require(sha(work / name) == TOOL_NEW[name], 'Nouvel outil automatique différent.')
    old = manifest(ROOT, OLD, 107)
    stage, new = stage_archive(work)
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
        command([php, str(work / 'geca-check-roles.php'), mode, str(work)])
    def down():
        write(work / 'maintenance.blade.php', b'<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Mise a jour du back-office</title></head><body><main><h1>Mise a jour en cours</h1><p>Le back-office sera disponible apres les verifications.</p></main></body></html>')
        code = "require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap(); Illuminate\\Support\\Facades\\View::addNamespace('geca-deploy',$argv[1]); exit(Illuminate\\Support\\Facades\\Artisan::call('down',['--render'=>'geca-deploy::maintenance']));"
        command([php, '-r', code, str(work)])
    check('before')
    descriptor = os.open(ROOT / 'storage/framework/geca-deploy.lock', os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600)
    with os.fdopen(descriptor, 'wb') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        # Relire les contrôles après acquisition du verrou.
        manifest(ROOT, OLD, 107)
        check('before')
        down()
        print('Maintenance activée. Sauvegardes privées en cours.', flush=True)
        ddl_started = False
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
            command([php, str(work / 'geca-backup-backoffice.php'), MYSQLDUMP, str(work)])
            regular(work / 'base.sql', True)
            regular(work / 'SHA256-BASE.txt', True)
            require((work / 'SHA256-BASE.txt').read_text().split()[0] == sha(work / 'base.sql'), 'Sauvegarde SQL différente.')
            print('Fichiers sauvegardés et extraction testée ; export MySQL vérifié.', flush=True)
            manifest(ROOT, OLD, 107)
            require(all(sha(p) == digest for p, digest in protected.items()), 'Configuration ou entrée publique différente.')
            before, touched = copy_changes(stage, old, new)
            require(all(sha(p) == digest for p, digest in protected.items()), 'Configuration privée modifiée.')
            command([php, 'artisan', 'config:clear'])
            command([php, 'artisan', 'route:clear'])
            check('code')
            # Dès cet appel, un échec peut laisser du DDL MySQL partiel : aucun rollback automatique.
            ddl_started = True
            command([php, 'artisan', 'migrate', '--database=mysql', '--path=' + MIGRATION, '--force', '--no-interaction'])
            reports = ROOT / 'storage/app/private/reports'
            directory(reports, True)
            command([php, 'artisan', 'view:cache'])
            check('migrated')
            # Garder une copie privée des deux outils, sans toucher à la clé SSH.
            for name in TOOL_OLD:
                write(work / ('avant-' + name), (TOOLS / name).read_bytes())
                write(TOOLS / name, (work / name).read_bytes())
                require(sha(TOOLS / name) == TOOL_NEW[name], 'Outil automatique après installation différent.')
            manifest(ROOT, NEW, 114)
            require(all(sha(p) == digest for p, digest in protected.items()), 'Configuration ou entrée publique modifiée.')
            command([php, 'artisan', 'up'])
            try:
                check('http')
            except BaseException:
                down()
                raise
            print('Comptes et trois rôles installés : 114 fichiers conformes ; une colonne et un historique ajoutés.')
            print('Comptes, contenus, configuration, clé et fichiers publics conservés. Back-office rouvert.')
            print('21 contrôles Laravel internes réussis. Gestion réelle des comptes à vérifier dans le navigateur.')
            print('Sauvegarde et diagnostic privés : ' + str(work))
        except BaseException:
            if not ddl_started and touched:
                restore_code(before, touched)
                command([php, 'artisan', 'config:clear'])
                command([php, 'artisan', 'route:clear'])
                command([php, 'artisan', 'view:cache'])
            with (work / 'diagnostic-prive.txt').open('a') as log:
                traceback.print_exc(file=log)
            print('Arrêt : maintenance conservée. Ne pas relancer, effacer de table ou restaurer la base automatiquement.', file=sys.stderr)
            print('Sauvegarde et diagnostic privés : ' + str(work), file=sys.stderr)
            raise


if __name__ == '__main__':
    try:
        require(len(sys.argv) == 2, 'Une destination privée est nécessaire.')
        install(Path(sys.argv[1]))
    except Exception:
        print('Installation interrompue. Aucun secret affiché. Transmettre seulement le message de résultat.', file=sys.stderr)
        sys.exit(1)
