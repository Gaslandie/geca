"""Réception SSH forcée : outils locaux immuables, jamais de script fourni à exécuter."""
import getpass
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import runpy
import shutil
import signal
import stat
import subprocess
import sys
import tempfile

HOME = Path('/home2/fnksrwmy')
TOOLS = HOME / 'geca-deploy-backoffice'
LIMIT = 10_000_000


def require(ok):
    if not ok:
        raise RuntimeError('Réception refusée.')


def main():
    require(getpass.getuser() == 'fnksrwmy')
    for path in [HOME, TOOLS]:
        require(path.is_dir() and path.resolve() == path and path.stat().st_uid == os.getuid())
    require(stat.S_IMODE(TOOLS.stat().st_mode) == 0o700)
    for name in ['receive-backoffice.py', 'update-backoffice.py', 'check-backoffice.php', 'backup-backoffice.php']:
        path = TOOLS / name
        require(path.resolve() == path and stat.S_ISREG(path.stat().st_mode)
                and path.stat().st_uid == os.getuid() and stat.S_IMODE(path.stat().st_mode) == 0o600)
    command = os.environ.get('SSH_ORIGINAL_COMMAND', '')
    if command == 'check-backoffice-connection':
        print('Connexion dédiée au back-office : OK. Aucun changement effectué.')
        return
    if command == 'get-backoffice-manifest':
        updater = runpy.run_path(str(TOOLS / 'update-backoffice.py'))
        root = HOME / 'geca-backoffice'
        updater['directory'](root, True)
        require(not (root / 'storage/framework/down').exists())
        raw = (root / 'MANIFEST.json').read_bytes()
        entries = json.loads(raw)
        updater['manifest'](root, hashlib.sha256(raw).hexdigest(), len(entries))
        sys.stdout.buffer.write(raw)
        return
    match = re.fullmatch(r'deploy-backoffice ([a-f0-9]{64})', command)
    require(match is not None)
    descriptor = os.open(TOOLS / 'reception.lock', os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
    lock = os.fdopen(descriptor, 'wb')
    require(stat.S_IMODE(os.fstat(lock.fileno()).st_mode) == 0o600 and os.fstat(lock.fileno()).st_uid == os.getuid())
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BaseException:
        lock.close()
        raise
    work = Path(tempfile.mkdtemp(prefix='geca-auto-backoffice-', dir=HOME))
    archive = work / 'livraison.zip'
    digest = hashlib.sha256()
    total = 0
    try:
        signal.alarm(180)
        with archive.open('xb') as target:
            while chunk := sys.stdin.buffer.read(1024 * 1024):
                total += len(chunk)
                require(total < LIMIT)
                digest.update(chunk)
                target.write(chunk)
        signal.alarm(0)
        require(total > 0 and digest.hexdigest() == match[1])
        for name in ['check-backoffice.php', 'backup-backoffice.php']:
            shutil.copyfile(TOOLS / name, work / name)
            (work / name).chmod(0o600)
        subprocess.run([sys.executable, str(TOOLS / 'update-backoffice.py'), str(work)],
                       check=True, timeout=1800)
    except BaseException:
        # Les diagnostics et sauvegardes restent privés pour inspection.
        print('Livraison interrompue. Dossier privé : ' + str(work), file=sys.stderr)
        raise
    finally:
        signal.alarm(0)
        lock.close()


if __name__ == '__main__':
    os.umask(0o077)
    try:
        main()
    except Exception:
        print('Automatisation arrêtée. Ne pas relancer sans vérifier.', file=sys.stderr)
        sys.exit(1)
