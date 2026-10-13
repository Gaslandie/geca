"""Paquet privé de la rubrique Rapports ; aucun commit, envoi ou accès Bluehost."""
from pathlib import Path
import hashlib
import gzip
import io
import json
import subprocess
import tarfile

root = Path(__file__).resolve().parents[1]
source = root / 'backoffice/artifacts/geca-backoffice-code.tar.gz'
destination = root / 'backoffice/artifacts/geca-rapports-code.tar.gz'
# Le registre actuellement installé est conservé : la rubrique ne change aucune photo.
registry = subprocess.check_output(['git', 'show', 'd1ad00a:src/content/image-variants.json'], cwd=root)
with tarfile.open(source) as archive:
    files = {entry.name: archive.extractfile(entry).read() for entry in archive.getmembers() if entry.isfile()}
manifest = json.loads(files.pop('MANIFEST.json'))
assert len(manifest) == 107 and set(files) == set(manifest)
assert all(hashlib.sha256(files[name]).hexdigest() == digest for name, digest in manifest.items())
files['database/reference/image-variants.json'] = registry
manifest['database/reference/image-variants.json'] = hashlib.sha256(registry).hexdigest()
files['MANIFEST.json'] = (json.dumps(manifest, indent=2)+'\n').encode()
buffer = io.BytesIO()
with tarfile.open(fileobj=buffer, mode='w') as archive:
    for name, data in files.items():
        entry = tarfile.TarInfo(name)
        entry.size = len(data)
        entry.mode = 0o600
        archive.addfile(entry, io.BytesIO(data))
destination.write_bytes(gzip.compress(buffer.getvalue(), mtime=0))
destination.chmod(0o600)
print('Manifeste :', hashlib.sha256(files['MANIFEST.json']).hexdigest())
print('Archive :', hashlib.sha256(destination.read_bytes()).hexdigest())
