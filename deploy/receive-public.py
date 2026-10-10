"""Bluehost : commande SSH forcée ; seule la vitrine peut être mise à jour.

Installer avec update-public.py dans /home2/fnksrwmy/geca-deploy (700).
La clé dédiée ne doit autoriser ni terminal, ni SFTP, ni transfert de port.
"""
import fcntl
import getpass
import hashlib
import os
from pathlib import Path
import re
import runpy
import stat
import sys
import tempfile
import zipfile

HOME = Path('/home2/fnksrwmy')
TOOLS = HOME / 'geca-deploy'
LIMIT = 200_000_000
STEP = 'précontrôle'


def require(ok, message):
    if not ok:
        raise RuntimeError(message)


def private_file(path):
    mode = path.lstat()
    require(stat.S_ISREG(mode.st_mode) and mode.st_uid == os.getuid()
            and stat.S_IMODE(mode.st_mode) == 0o600, 'Outil privé incorrect.')


def main():
    global STEP
    require(getpass.getuser() == 'fnksrwmy', 'Compte incorrect.')
    for folder in (HOME, TOOLS):
        require(folder.is_dir() and folder.resolve() == folder
                and folder.stat().st_uid == os.getuid(), 'Dossier incorrect.')
    require(stat.S_IMODE(TOOLS.stat().st_mode) == 0o700, 'Dossier non privé.')
    private_file(TOOLS / 'receive-public.py')
    private_file(TOOLS / 'update-public.py')
    match = re.fullmatch(r'deploy-public ([a-f0-9]{64})',
                         os.environ.get('SSH_ORIGINAL_COMMAND', ''))
    require(match is not None, 'Commande SSH refusée : vitrine uniquement.')
    STEP = 'réception de l’archive'
    # Un verrou commun aux publications automatiques. Aucune attente silencieuse.
    descriptor = os.open(TOOLS / 'publication.lock', os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
    with os.fdopen(descriptor, 'wb') as lock:
        private_file(TOOLS / 'publication.lock')
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        with tempfile.TemporaryDirectory(prefix='geca-reception-', dir=HOME) as work:
            archive = Path(work) / 'site.zip'
            digest = hashlib.sha256()
            total = 0
            with archive.open('xb') as target:
                while chunk := sys.stdin.buffer.read(1024 * 1024):
                    total += len(chunk)
                    require(total < LIMIT, 'Livraison trop grande.')
                    digest.update(chunk)
                    target.write(chunk)
            require(total > 0 and digest.hexdigest() == match[1], 'Livraison différente.')
            STEP = 'contrôle des fichiers publics'
            # La clé de publication ne peut pas installer PHP, un secret ou modifier
            # les protections Apache. L’outil local reste hors de la vitrine.
            public_root = HOME / 'public_html' / 'website_43934bdf'
            allowed = re.compile(
                r'(?:_next/static/|images/optimized/|(?:fr|en|404|_not-found)/)'
                r'[a-zA-Z0-9_./\[\]$-]+\.(?:html|txt|xml|js|css|webp|ttf|woff2?|ico|json)'
                r'|(?:index|404|_not-found)\.(?:html|txt)'
                r'|(?:robots\.txt|sitemap\.xml|icon\.svg)'
                r'|images/brand/global-ecoaction-logo-client-transparent-20261010\.webp'
            )
            with zipfile.ZipFile(archive) as zipped:
                require(zipped.read('.htaccess') == (public_root / '.htaccess').read_bytes(),
                        'Modification des protections Apache refusée.')
                for entry in zipped.infolist():
                    if entry.filename == '.htaccess':
                        continue
                    require(allowed.fullmatch(entry.filename) is not None
                            and not any(part.startswith('.') for part in entry.filename.split('/')),
                            'Fichier hors vitrine refusé.')
            STEP = 'sauvegarde et installation'
            updater = runpy.run_path(str(TOOLS / 'update-public.py'))
            updater['update'](archive, match[1])


if __name__ == '__main__':
    os.umask(0o077)
    try:
        main()
    except Exception:
        print('Publication interrompue : ' + STEP + '. Consulter les sauvegardes privées avant toute relance.', file=sys.stderr)
        sys.exit(1)
