"""cPanel uniquement : trois fichiers connus, sauvegarde privée, clé SSH inchangée."""
import fcntl
import getpass
import hashlib
import os
from pathlib import Path
import re
import stat
import sys
import tempfile
import urllib.request

HOME = Path('/home2/fnksrwmy')
TOOLS = HOME / 'geca-deploy'
ROOT = HOME / 'public_html' / 'website_43934bdf'
OLD = {
    'receive-public.py': '0217a96cdfb62f167ed9aa69d11168ab7d31d5d89322cf80d83a1564cb776be0',
    'update-public.py': 'f60efe37f55ba6a399eda013f7d4d31fae89c24d3385bf2a8b6103a98d146096',
    '.htaccess': '6e613e2ef74e206dbb0b4d60208a943140567c5e76b732e4110c33f46e4f65f9',
}
PREVIOUS = {
    'receive-public.py': '55b90735ab91b798e3ad14563d9e79371b3b9c1a0e850310eb5d918d7cb18ae0',
    'update-public.py': 'fe4af749e25505aac5e87c7de6cbf28adb6b87862b8c2f2369b04d76f25aa5a6',
    '.htaccess': '36df22233acad5d8deecb93bcb9f6d4389577d7b50c38d2c5ee6e929a7d20540',
}


PREVIOUS_HOME_VIDEO = {
    'receive-public.py': 'a922920ec4a638cae9a1428926e92678230517016d1330e575eef552d589e81e',
    'update-public.py': 'fff16e08de65d655b66964a4c5b5257905eac1646d1b6dc1ad3a3a50ba655b8c',
    '.htaccess': '36df22233acad5d8deecb93bcb9f6d4389577d7b50c38d2c5ee6e929a7d20540',
}


NEW = {
    'receive-public.py': '63811df2249dc340e2b90528bb439e596302b859c212327dfcc636ee276fc89d',
    'update-public.py': '5f6b4bed38caa3bcda7aaa3105d9c03372c22ee74b8ca49f468664a3b632558b',
    '.htaccess': '36df22233acad5d8deecb93bcb9f6d4389577d7b50c38d2c5ee6e929a7d20540',
}


def require(ok, message):
    if not ok:
        raise RuntimeError(message)


def digest(body):
    return hashlib.sha256(body).hexdigest()


def regular(path, mode):
    info = path.lstat()
    require(stat.S_ISREG(info.st_mode) and info.st_uid == os.getuid()
            and stat.S_IMODE(info.st_mode) == mode, 'Fichier, propriétaire ou droits inattendus.')


def replace(path, body, mode):
    fd, temporary = tempfile.mkstemp(prefix='.geca-upgrade-', dir=path.parent)
    try:
        with os.fdopen(fd, 'wb') as target:
            target.write(body)
            target.flush()
            os.fsync(target.fileno())
        os.chmod(temporary, mode)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def upgrade(payload):
    require(getpass.getuser() == 'fnksrwmy', 'Compte système inattendu.')
    for folder, mode in [(HOME, None), (TOOLS, 0o700), (ROOT, 0o750)]:
        info = folder.lstat()
        require(stat.S_ISDIR(info.st_mode) and folder.resolve() == folder
                and info.st_uid == os.getuid(), 'Dossier inattendu.')
        require(mode is None or stat.S_IMODE(info.st_mode) == mode, 'Droits de dossier inattendus.')
    require(set(payload) == set(NEW), 'Livraison limitée aux trois fichiers connus.')
    require(all(digest(payload[name]) == NEW[name] for name in NEW), 'Source altérée ou inconnue.')
    targets = {name: (ROOT if name == '.htaccess' else TOOLS) / name for name in NEW}
    modes = {name: 0o644 if name == '.htaccess' else 0o600 for name in NEW}
    for name, path in targets.items():
        regular(path, modes[name])
    lock_path = TOOLS / 'publication.lock'
    descriptor = os.open(lock_path, os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
    with os.fdopen(descriptor, 'wb') as lock:
        regular(lock_path, 0o600)
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        before = {name: path.read_bytes() for name, path in targets.items()}
        if all(digest(before[name]) == NEW[name] for name in NEW):
            print('Ces trois fichiers sont déjà à jour. Aucune copie effectuée.')
            return
        observed = dict(before)
        # cPanel peut conserver CRLF ou une ligne vide finale ; directives inchangées.
        observed['.htaccess'] = observed['.htaccess'].replace(b'\r\n', b'\n').rstrip() + b'\n'
        require(any(all(digest(observed[name]) == version[name] for name in version)
                    for version in (OLD, PREVIOUS, PREVIOUS_HOME_VIDEO)),
                'Version distante inattendue ou partielle : arrêt sans remplacement.')
        backup = Path(tempfile.mkdtemp(prefix='geca-outils-sauvegarde-', dir=HOME))
        backup.chmod(0o700)
        for name, body in before.items():
            saved = backup / name
            saved.write_bytes(body)
            saved.chmod(0o600)
            require(saved.read_bytes() == body, 'Sauvegarde différente.')
        changed = []
        try:
            for name, path in targets.items():
                regular(path, modes[name])
                require(path.read_bytes() == before[name], 'Fichier changé pendant la préparation.')
                changed.append(name)
                replace(path, payload[name], modes[name])
                regular(path, modes[name])
                require(digest(path.read_bytes()) == NEW[name], 'Copie différente.')
        except BaseException:
            for name in reversed(changed):
                replace(targets[name], before[name], modes[name])
            require(all(path.read_bytes() == before[name] for name, path in targets.items()),
                    'Retour incomplet : consulter la sauvegarde privée.')
            raise
        print('Outils publics mis à jour. Protections Apache et redirection 301 conservées.')
        print('Sauvegarde privée vérifiée :', backup)
        print('Clé SSH, administration et base de données inchangées.')


def fetch(commit):
    require(re.fullmatch(r'[a-f0-9]{40}', commit) is not None, 'Commit exact requis.')
    payload = {}
    for name in NEW:
        source = 'public.htaccess' if name == '.htaccess' else name
        url = f'https://raw.githubusercontent.com/Gaslandie/geca/{commit}/deploy/{source}'
        with urllib.request.urlopen(url, timeout=30) as response:
            body = response.read(100_001)
        require(len(body) <= 100_000 and digest(body) == NEW[name], 'Téléchargement non conforme.')
        payload[name] = body
    return payload


if __name__ == '__main__':
    os.umask(0o077)
    require(len(sys.argv) == 2, 'Usage : python3 upgrade-public-delivery.py COMMIT')
    upgrade(fetch(sys.argv[1]))
