"""Candidate des calendriers depuis la première livraison, quatre fichiers seulement."""
from pathlib import Path
import hashlib
import io
import json
import gzip
import tarfile

root = Path(__file__).resolve().parents[1]
folder = root / 'backoffice/artifacts'
source = folder / 'geca-rapports-code.tar.gz'
assert hashlib.sha256(source.read_bytes()).hexdigest() == 'b9960547d2e03c6aefbdb70844051b369e6af0f4020eac9c28c73043541abba7'
with tarfile.open(source) as archive:
    files = {m.name: archive.extractfile(m).read() for m in archive.getmembers()}
old_bytes = files.pop('MANIFEST.json')
assert hashlib.sha256(old_bytes).hexdigest() == '156473fa41bed6f3881b39caf0581a8a4167b98f11184b5b787a15e08c78ccf2'
old = json.loads(old_bytes)
assert len(old) == 107 and set(old) == set(files)
assert all(hashlib.sha256(files[name]).hexdigest() == digest for name, digest in old.items())
new = dict(old)
changes = ['app/Http/Controllers/ActivityReportController.php', 'app/Models/ActivityReport.php', 'resources/views/reports/edit.blade.php', 'resources/views/reports/index.blade.php']
for name in changes:
    files[name] = (root / 'backoffice' / name).read_bytes()
    new[name] = hashlib.sha256(files[name]).hexdigest()
assert {name for name in old if old[name] != new[name]} == set(changes)
files['MANIFEST.json'] = (json.dumps(new, indent=2) + '\n').encode()
buffer = io.BytesIO()
with tarfile.open(fileobj=buffer, mode='w') as archive:
    for name, data in files.items():
        entry = tarfile.TarInfo(name)
        entry.size = len(data)
        entry.mode = 0o600
        archive.addfile(entry, io.BytesIO(data))
destination = folder / 'geca-rapports-dates-code.tar.gz'
destination.write_bytes(gzip.compress(buffer.getvalue(), mtime=0))
destination.chmod(0o600)
record = {'manifest': hashlib.sha256(files['MANIFEST.json']).hexdigest(), 'archive': hashlib.sha256(destination.read_bytes()).hexdigest()}
(folder / 'geca-rapports-dates-code.json').write_text(json.dumps(record))
(folder / 'geca-rapports-dates-code.json').chmod(0o600)
print(record)
