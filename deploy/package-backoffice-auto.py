"""Préparer une différence vérifiée depuis le manifeste de production connu."""
import hashlib
import importlib.util
import json
from pathlib import Path
import stat
import zipfile

REPO = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('updater', REPO / 'deploy/update-backoffice.py')
updater = importlib.util.module_from_spec(spec)
spec.loader.exec_module(updater)


def build(baseline, source, destination):
    old_raw = baseline.read_bytes()
    old = json.loads(old_raw)
    new = dict(old)
    # Ne pas laisser de côté une nouvelle migration/configuration : les tests
    # pourraient utiliser un schéma absent de la vraie installation.
    for folder in ['config', 'database/migrations', 'bootstrap']:
        actual = {path.relative_to(source).as_posix() for path in (source / folder).rglob('*.php')
                  if not path.relative_to(source / folder).as_posix().startswith('cache/')}
        expected = {name for name in old if name.startswith(folder + '/') and name.endswith('.php')}
        if actual != expected:
            raise RuntimeError('Ajout ou retrait protégé : ' + folder)
    # Toute modification de dépendance, configuration, migration ou ressource
    # installée doit être préparée séparément, pas ignorée silencieusement.
    for name, digest in old.items():
        path = source / name
        if updater.allowed(name):
            if not path.is_file() or path.is_symlink():
                raise RuntimeError('Suppression ou lien refusé : ' + name)
            new[name] = hashlib.sha256(path.read_bytes()).hexdigest()
        elif name != 'database/reference/image-variants.json':
            if not path.is_file() or path.is_symlink() or hashlib.sha256(path.read_bytes()).hexdigest() != digest:
                raise RuntimeError('Modification protégée : ' + name)
    # Le registre distant est gelé : la copie locale Next.js peut être différente.
    for folder, pattern in [('app', '*.php'), ('resources/views', '*.blade.php')]:
        for path in (source / folder).rglob(pattern):
            name = path.relative_to(source).as_posix()
            if not updater.allowed(name) or path.is_symlink() or path.resolve() != path:
                raise RuntimeError('Chemin refusé : ' + name)
            new[name] = hashlib.sha256(path.read_bytes()).hexdigest()
    if old == new:
        return []
    updater.validate_delta(old, new)
    changed = sorted(name for name in new if old.get(name) != new[name])
    record = {'base': hashlib.sha256(old_raw).hexdigest(), 'manifest': new}
    destination.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    with zipfile.ZipFile(destination, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for name, body in [('release.json', (json.dumps(record, indent=2) + '\n').encode())] + [
                (name, (source / name).read_bytes()) for name in changed]:
            entry = zipfile.ZipInfo(name)
            entry.external_attr = (stat.S_IFREG | 0o600) << 16
            archive.writestr(entry, body, compress_type=zipfile.ZIP_DEFLATED)
    destination.chmod(0o600)
    if destination.stat().st_size >= 10_000_000:
        raise RuntimeError('Archive trop grande.')
    return changed


if __name__ == '__main__':
    changes = build(REPO / 'deploy/backoffice-baseline.json', REPO / 'backoffice', REPO / 'release/backoffice-auto.zip')
    print(str(len(changes)) + ' fichiers préparés. Configuration et schéma conservés.')
