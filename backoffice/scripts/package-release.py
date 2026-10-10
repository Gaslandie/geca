#!/usr/bin/env python3
"""Archive de code uniquement ; aucune livraison ni secret."""
from pathlib import Path
import hashlib
import io
import json
import tarfile

base = Path(__file__).resolve().parents[1]
output = base / 'artifacts' / 'geca-backoffice-code.tar.gz'
output.parent.mkdir(exist_ok=True)
files = [base / name for name in ['artisan', 'composer.json', 'composer.lock', '.env.example', 'bootstrap/app.php', 'bootstrap/providers.php']]
for name in ['app', 'config', 'routes', 'resources/views', 'lang', 'database/migrations', 'database/reference']:
    files += [p for p in (base / name).rglob('*') if p.is_file()]
# L'entrée HTTP Bluehost et son .htaccess HTTPS existants restent hors de ce paquet.
files += [base / 'public/admin.css', base / 'public/brand/geca-logo-client-20261010.webp']
manifest = {}
with tarfile.open(output, 'w:gz') as archive:
    for path in sorted(files):
        if path.is_symlink():
            raise SystemExit('Lien symbolique refusé')
        relative = path.relative_to(base).as_posix()
        data = path.read_bytes()
        manifest[relative] = hashlib.sha256(data).hexdigest()
        info = tarfile.TarInfo(relative)
        info.size = len(data)
        info.mode = 0o600
        archive.addfile(info, io.BytesIO(data))
    data = (json.dumps(manifest, indent=2)+'\n').encode()
    info = tarfile.TarInfo('MANIFEST.json')
    info.size = len(data)
    info.mode = 0o600
    archive.addfile(info, io.BytesIO(data))
output.chmod(0o600)
print(f'{len(manifest)} fichiers de code ; aucun .env privé, base, vendor, journal, sauvegarde ou compte.')
print(f'SHA256 : {hashlib.sha256(output.read_bytes()).hexdigest()}')
