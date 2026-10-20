"""Mise à jour ponctuelle depuis cPanel : CSS connu, sauvegarde, aucune donnée SQL."""
import fcntl
import hashlib
import json
import os
from pathlib import Path
import stat
import tempfile

OLD = 'c0ed4a1512a5ce8fc27231ae1ac87aa6488dbde9a401a50794174287879108e4'
NEW = 'ab7a67f014a38e350609135b107969a29f07e4168fc9e90041d12d5b7b04fae2'
ANCHOR = b'.admin-shell main .heading,.admin-shell main h1,.admin-shell main h2,.admin-shell main h3,.admin-shell main .eyebrow { text-align:center; }\n'
RULE = b'.admin-shell main .report-entry h2 { text-align:left; }\n'


def check(path, directory=False):
    info = path.lstat()
    assert path.resolve() == path and info.st_uid == os.getuid(), 'Chemin ou propriétaire incorrect'
    assert not info.st_mode & 0o022, 'Permissions trop larges'
    assert stat.S_ISDIR(info.st_mode) if directory else stat.S_ISREG(info.st_mode)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def write(path, data, mode):
    fd, name = tempfile.mkstemp(prefix='.geca-style-', dir=path.parent)
    try:
        with os.fdopen(fd, 'wb') as stream:
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.chmod(name, mode)
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def update(home):
    root = home / 'geca-backoffice'
    public = home / 'public_html/geca-admin'
    for path in [home, root, public, root / 'storage/framework']:
        check(path, True)
    fd = os.open(root / 'storage/framework/geca-deploy.lock', os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, 'wb') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        assert not (root / 'storage/framework/down').exists(), 'Maintenance en cours'
        paths = [root / 'public/admin.css', public / 'admin.css', root / 'MANIFEST.json']
        for path in paths:
            check(path)
        original = [path.read_bytes() for path in paths]
        manifest = json.loads(original[2])
        current = manifest['public/admin.css']
        assert current in [OLD, NEW], 'Version du manifeste inconnue'
        assert digest(original[0]) == digest(original[1]) == current, 'CSS divergent'
        if current == NEW:
            print('Style déjà installé et vérifié.')
            return
        assert original[0].count(ANCHOR) == 1
        css = original[0].replace(ANCHOR, ANCHOR + RULE)
        assert digest(css) == NEW, 'Résultat CSS inattendu'
        backup = Path(tempfile.mkdtemp(prefix='geca-report-style-', dir=home))
        os.chmod(backup, 0o700)
        for i, data in enumerate(original):
            write(backup / str(i), data, 0o600)
            assert (backup / str(i)).read_bytes() == data
        manifest['public/admin.css'] = NEW
        replacement = [css, css, (json.dumps(manifest, indent=2) + '\n').encode()]
        modes = [stat.S_IMODE(path.stat().st_mode) for path in paths]
        try:
            for path, data, mode in zip(paths, replacement, modes):
                write(path, data, mode)
            assert all(path.read_bytes() == data for path, data in zip(paths, replacement))
        except BaseException:
            for path, data, mode in zip(paths, original, modes):
                write(path, data, mode)
            raise
        print('Style installé et vérifié. Sauvegarde privée :', backup)
        print('Comptes, base, configuration et protections de livraison inchangés.')


if __name__ == '__main__':
    import getpass
    assert getpass.getuser() == 'fnksrwmy', 'Exécuter uniquement dans cPanel Bluehost'
    update(Path('/home2/fnksrwmy'))
