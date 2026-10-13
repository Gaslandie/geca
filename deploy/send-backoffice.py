"""Connexion épinglée ; code envoyé uniquement après les tests GitHub."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

REPO = Path(__file__).resolve().parents[1]


def main(mode):
    host = os.environ.get('BLUEHOST_SSH_HOST', '')
    port = os.environ.get('BLUEHOST_SSH_PORT', '22')
    key = os.environ.get('BLUEHOST_BACKOFFICE_SSH_KEY', '')
    hosts = os.environ.get('BLUEHOST_KNOWN_HOSTS', '')
    if not re.fullmatch(r'[a-zA-Z0-9][a-zA-Z0-9.-]{0,252}', host) or not port.isdecimal() or not 1 <= int(port) <= 65535 or not key or not hosts:
        raise RuntimeError('Connexion du back-office incomplète.')
    if mode not in ['connection', 'deploy']:
        raise RuntimeError('Mode incorrect.')
    with tempfile.TemporaryDirectory(prefix='geca-backoffice-ssh-') as private:
        identity, known = Path(private) / 'identity', Path(private) / 'known_hosts'
        identity.write_text(key + '\n'); known.write_text(hosts + '\n')
        identity.chmod(0o600); known.chmod(0o600)
        command = ['ssh', '-F', '/dev/null', '-T', '-p', port, '-i', str(identity),
                   '-o', 'IdentitiesOnly=yes', '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes',
                   '-o', f'UserKnownHostsFile={known}', '-o', 'GlobalKnownHostsFile=/dev/null',
                   '-o', 'ConnectTimeout=20', '-o', 'ServerAliveInterval=15', '-o', 'ServerAliveCountMax=3',
                   f'fnksrwmy@{host}']
        if mode == 'connection':
            subprocess.run(command + ['check-backoffice-connection'], stdin=subprocess.DEVNULL, check=True, timeout=60)
            return
        result = subprocess.run(command + ['get-backoffice-manifest'], stdin=subprocess.DEVNULL,
                                capture_output=True, check=True, timeout=120)
        if len(result.stdout) > 100_000:
            raise RuntimeError('Manifeste distant trop grand.')
        entries = json.loads(result.stdout)
        if not isinstance(entries, dict) or not 1 <= len(entries) <= 500:
            raise RuntimeError('Manifeste distant incorrect.')
        baseline = Path(private) / 'baseline.json'
        baseline.write_bytes(result.stdout)
        spec = importlib.util.spec_from_file_location('builder', REPO / 'deploy/package-backoffice-auto.py')
        builder = importlib.util.module_from_spec(spec); spec.loader.exec_module(builder)
        archive = Path(private) / 'code.zip'
        changes = builder.build(baseline, REPO / 'backoffice', archive)
        if not changes:
            print('Code déjà installé et vérifié. Aucun changement ni maintenance nécessaire.')
            return
        digest = hashlib.sha256(archive.read_bytes()).hexdigest()
        print(str(len(changes)) + ' fichiers de code à livrer.', flush=True)
        with archive.open('rb') as stream:
            subprocess.run(command + ['deploy-backoffice ' + digest], stdin=stream, check=True, timeout=1800)


if __name__ == '__main__':
    os.umask(0o077)
    try:
        main(sys.argv[1] if len(sys.argv) == 2 else '')
    except Exception:
        print('Livraison automatique interrompue. Aucun secret affiché.', file=sys.stderr)
        sys.exit(1)
