"""Mise à jour de la vitrine seule ; sauvegarde privée et retour sur erreur."""
import getpass
import hashlib
import os
from pathlib import Path, PurePosixPath
import shutil
import stat
import sys
import tempfile
import zipfile

ROOT = Path('/home2/fnksrwmy/public_html/website_43934bdf')
HOME = Path('/home2/fnksrwmy')
ACCOUNT = 'fnksrwmy'
PUBLIC = {'.htaccess', '404', '404.html', '_next', '_not-found', 'en', 'fr',
          'icon.svg', 'images', 'index.html', 'robots.txt', 'sitemap.xml'}
PRESERVE = {'.well-known', 'cgi-bin'}


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def inventory(folder):
    result = {}
    for path in folder.rglob('*'):
        mode = path.lstat().st_mode
        require(stat.S_ISREG(mode) or stat.S_ISDIR(mode), 'Lien ou fichier spécial refusé.')
        require(path.stat().st_uid == os.getuid(), 'Propriétaire différent refusé.')
        name = path.relative_to(folder).as_posix()
        result[name] = hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None
    return result


def update(archive, digest):
    require(getpass.getuser() == ACCOUNT, 'Compte inattendu.')
    for folder in (ROOT, HOME):
        require(folder.is_dir() and folder.resolve() == folder, 'Chemin réel inattendu.')
        require(folder.stat().st_uid == os.getuid(), 'Propriétaire inattendu.')
    require(stat.S_IMODE(ROOT.stat().st_mode) == 0o750, 'Permissions de racine inattendues.')
    require(set(p.name for p in ROOT.iterdir()) <= PUBLIC | PRESERVE, 'Élément inconnu dans la racine : arrêt sans écriture.')
    require(archive.is_file() and not archive.is_symlink(), 'Archive invalide.')
    require(hashlib.sha256(archive.read_bytes()).hexdigest() == digest, 'Empreinte de livraison incorrecte.')
    require((ROOT / '.htaccess').is_file(), 'Protections Apache existantes absentes.')
    before = inventory(ROOT)
    with zipfile.ZipFile(archive) as zipped:
        entries = zipped.infolist()
        names = [e.filename for e in entries]
        require(len(names) == len(set(names)), 'Chemins répétés refusés.')
        require(sum(e.file_size for e in entries) < 200_000_000, 'Archive trop grande.')
        for entry in entries:
            path = PurePosixPath(entry.filename)
            mode = entry.external_attr >> 16
            require(not path.is_absolute() and '..' not in path.parts and '\\' not in entry.filename,
                    'Chemin dangereux refusé.')
            require(path.parts and path.parts[0] in PUBLIC and not entry.is_dir(), 'Fichier non public refusé.')
            require(stat.S_IFMT(mode) in (0, stat.S_IFREG), 'Type de fichier refusé.')
        require({'.htaccess', 'fr/index.html', 'en/index.html', 'icon.svg'} <= set(names), 'Livraison incomplète.')
        require(zipped.testzip() is None, 'Archive corrompue.')
        work = Path(tempfile.mkdtemp(prefix='geca-mise-a-jour-', dir=HOME))
        os.chmod(work, 0o700)
        backup = work / 'sauvegarde-verifiee'
        shutil.copytree(ROOT, backup)
        require(inventory(backup) == before == inventory(ROOT), 'Sauvegarde différente : arrêt.')
        stage = work / 'nouveau'
        stage.mkdir(mode=0o700)
        zipped.extractall(stage)
        staged = inventory(stage)
        require(set(names) == {n for n, value in staged.items() if value is not None}, 'Extraction différente.')
        for entry in entries:
            require(staged[entry.filename] == hashlib.sha256(zipped.read(entry)).hexdigest(), 'Contenu extrait différent.')
        for path in stage.rglob('*'):
            os.chmod(path, 0o755 if path.is_dir() else 0o644)
        old = work / 'ancienne-version'
        old.mkdir(mode=0o700)
        installed = []
        moved = []
        try:
            require(inventory(ROOT) == before, 'Site changé pendant la préparation : arrêt.')
            # Les règles Apache restent en place pendant le remplacement des autres fichiers.
            for name in sorted(PUBLIC - {'.htaccess'}):
                existing = ROOT / name
                if existing.exists():
                    existing.rename(old / name)
                    moved.append(name)
                incoming = stage / name
                if incoming.exists():
                    incoming.rename(existing)
                    installed.append(name)
            shutil.copy2(ROOT / '.htaccess', old / '.htaccess')
            os.replace(stage / '.htaccess', ROOT / '.htaccess')
            for name, value in staged.items():
                target = ROOT / name
                require(target.exists(), 'Fichier livré absent.')
                if value is not None:
                    require(hashlib.sha256(target.read_bytes()).hexdigest() == value, 'Fichier livré différent.')
            after = inventory(ROOT)
            require({n: v for n, v in after.items() if n.split('/')[0] in PRESERVE} ==
                    {n: v for n, v in before.items() if n.split('/')[0] in PRESERVE}, 'Dossier conservé différent.')
        except BaseException:
            failed = work / 'version-interrompue'
            failed.mkdir(mode=0o700)
            for name in reversed(installed):
                (ROOT / name).rename(failed / name)
            for name in reversed(moved):
                (old / name).rename(ROOT / name)
            if (old / '.htaccess').exists():
                os.replace(old / '.htaccess', ROOT / '.htaccess')
            require(inventory(ROOT) == before, 'Retour incomplet : sauvegarde privée à restaurer.')
            raise
    print('Vitrine mise à jour. Sauvegarde vérifiée conservée :', backup)
    print('Vérifier maintenant https://globalecoaction.org/fr/ et /en/.')


if __name__ == '__main__':
    require(len(sys.argv) == 3, 'Usage : python3 update-public.py archive.zip SHA256')
    os.umask(0o077)
    update(Path(sys.argv[1]), sys.argv[2])
