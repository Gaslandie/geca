"""Configuration cPanel unique ; aucune écriture dans l'application ou sa base."""
import fcntl
import getpass
import hashlib
import os
from pathlib import Path
import re
import shutil
import stat
import tempfile

HOME = Path('/home2/fnksrwmy')
NAMES = {'receive-backoffice.py', 'update-backoffice.py', 'check-backoffice.php', 'backup-backoffice.php'}


def require(ok):
    if not ok:
        raise RuntimeError('Configuration arrêtée : chemin, propriétaire ou contenu inattendu.')


def directory(path, private=False):
    require(path.is_dir() and path.resolve() == path and path.stat().st_uid == os.getuid()
            and not path.stat().st_mode & 0o022 and (not private or stat.S_IMODE(path.stat().st_mode) == 0o700))


def regular(path):
    require(path.is_file() and path.resolve() == path and path.stat().st_uid == os.getuid()
            and stat.S_ISREG(path.stat().st_mode) and not path.stat().st_mode & 0o022)


def atomic(path, body):
    require(path.resolve() == path)
    descriptor, temporary = tempfile.mkstemp(prefix='.geca-auto-', dir=path.parent)
    try:
        with os.fdopen(descriptor, 'wb') as target:
            target.write(body); target.flush(); os.fsync(target.fileno())
        os.chmod(temporary, 0o600); os.replace(temporary, path)
    finally:
        if os.path.exists(temporary): os.unlink(temporary)


def install(payload, public):
    os.umask(0o077)
    require(getpass.getuser() == 'fnksrwmy' and set(payload) == NAMES)
    require(re.fullmatch(r'ssh-ed25519 [A-Za-z0-9+/]{68} geca-backoffice-20261013', public) is not None)
    directory(HOME)
    root = HOME / 'geca-backoffice'; directory(root, True)
    regular(root / 'MANIFEST.json'); regular(root / '.env')
    ssh = HOME / '.ssh'; directory(ssh, True)
    authorized = ssh / 'authorized_keys'; regular(authorized)
    require(authorized.stat().st_size < 1_000_000)
    tools = HOME / 'geca-deploy-backoffice'
    line = ('restrict,command="/bin/python3 /home2/fnksrwmy/geca-deploy-backoffice/receive-backoffice.py" ' + public).encode()
    descriptor = os.open(ssh / 'geca-auto-install.lock', os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
    with os.fdopen(descriptor, 'wb') as lock:
        require(os.fstat(lock.fileno()).st_uid == os.getuid() and stat.S_IMODE(os.fstat(lock.fileno()).st_mode) == 0o600)
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        previous = authorized.read_bytes()
        if public.split()[1].encode() in previous:
            require(line in previous.splitlines())
        if tools.exists() or tools.is_symlink():
            directory(tools, True)
            require(set(p.name for p in tools.iterdir()) <= NAMES | {'reception.lock'})
            for name, body in payload.items():
                regular(tools / name)
                require(stat.S_IMODE((tools / name).stat().st_mode) == 0o600 and (tools / name).read_bytes() == body)
        work = Path(tempfile.mkdtemp(prefix='geca-auto-connexion-', dir=HOME))
        atomic(work / 'authorized_keys-avant', previous)
        if not tools.exists():
            stage = work / 'outils'; stage.mkdir(mode=0o700)
            for name, body in payload.items(): atomic(stage / name, body)
            os.rename(stage, tools)
        if line not in previous.splitlines():
            atomic(authorized, previous + (b'\n' if previous and not previous.endswith(b'\n') else b'') + line + b'\n')
        require(line in authorized.read_bytes().splitlines())
    print('Connexion automatique du back-office installée. Anciennes clés conservées.')
    print('Application, comptes et rapports inchangés. Aucune mise à jour lancée.')
    print('Sauvegarde privée des clés : ' + str(work))
