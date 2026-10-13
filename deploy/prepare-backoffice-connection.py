"""Préparer une commande autonome : outils publics intégrés, clé privée jamais incluse."""
import base64
import gzip
import hashlib
import json
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]


def prepare(public, destination):
    files = {name: base64.b64encode((REPO / 'deploy' / source).read_bytes()).decode() for name, source in {
        'receive-backoffice.py': 'receive-backoffice.py',
        'update-backoffice.py': 'update-backoffice.py',
        'check-backoffice.php': 'check-backoffice.php',
        'backup-backoffice.php': 'geca-backup-backoffice.php',
        'installer.py': 'install-backoffice-connection.py',
    }.items()}
    compressed = gzip.compress(json.dumps(files).encode(), mtime=0)
    encoded = base64.b64encode(compressed).decode()
    body = """python3 - <<'PY'
import base64, gzip, hashlib, json, sys
try:
    data = base64.b64decode(ENCODED, validate=True)
    assert hashlib.sha256(data).hexdigest() == DIGEST
    files = {name: base64.b64decode(value, validate=True) for name, value in json.loads(gzip.decompress(data)).items()}
    namespace = {'__name__': 'geca_setup'}
    exec(compile(files.pop('installer.py'), '<installation GECA>', 'exec'), namespace)
    namespace['install'](files, PUBLIC)
except Exception:
    print('Configuration interrompue. Aucun secret affiché. Transmettre ce message avant toute relance.', file=sys.stderr)
    raise SystemExit(1)
PY
""".replace('ENCODED', repr(encoded)).replace('DIGEST', repr(hashlib.sha256(compressed).hexdigest())).replace('PUBLIC', repr(public.strip()))
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(body); destination.chmod(0o600)
    return destination


if __name__ == '__main__':
    prepare((REPO / 'release/backoffice-connection/identity.pub').read_text(), REPO / 'backoffice/artifacts/commande-automatisation-backoffice-cpanel.sh')
    print('Commande préparée sans clé privée ni ZIP à transférer.')
