"""GitHub : transmettre la seule archive validée, avec identité SSH épinglée."""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import zipfile


def main():
    host = os.environ.get('BLUEHOST_SSH_HOST', '')
    port = os.environ.get('BLUEHOST_SSH_PORT', '22')
    key = os.environ.get('BLUEHOST_SSH_KEY', '')
    hosts = os.environ.get('BLUEHOST_KNOWN_HOSTS', '')
    if not re.fullmatch(r'[a-zA-Z0-9][a-zA-Z0-9.-]{0,252}', host):
        raise RuntimeError('Hôte SSH non configuré.')
    if not port.isdecimal() or not 1 <= int(port) <= 65535 or not key or not hosts:
        raise RuntimeError('Connexion SSH incomplète.')
    root = Path('release').resolve()
    selected = json.loads((root / 'latest.json').read_text())
    directory = Path(selected['directory']).resolve()
    if directory.parent != root:
        raise RuntimeError('Livraison hors dossier autorisé.')
    manifest = (directory / 'manifest.json').read_bytes()
    validation = json.loads((directory / 'validation.json').read_text())
    if validation['manifestHash'] != hashlib.sha256(manifest).hexdigest():
        raise RuntimeError('Livraison non testée.')
    archive = directory / 'geca-site-public.zip'
    if archive.is_symlink() or not archive.is_file() or archive.stat().st_size >= 200_000_000:
        raise RuntimeError('Archive incorrecte.')
    entries = json.loads(manifest)['files']
    with zipfile.ZipFile(archive) as zipped:
        names = zipped.namelist()
        if len(names) != len(entries) or set(names) != {entry['path'] for entry in entries}:
            raise RuntimeError('Archive différente de la livraison testée.')
        for entry in entries:
            body = zipped.read(entry['path'])
            if len(body) != entry['bytes'] or hashlib.sha256(body).hexdigest() != entry['sha256']:
                raise RuntimeError('Archive modifiée depuis les tests.')
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    with tempfile.TemporaryDirectory(prefix='geca-ssh-') as private:
        identity = Path(private) / 'identity'
        known = Path(private) / 'known_hosts'
        identity.write_text(key + '\n')
        known.write_text(hosts + '\n')
        identity.chmod(0o600)
        known.chmod(0o600)
        command = ['ssh', '-F', '/dev/null', '-T', '-p', port,
                   '-i', str(identity), '-o', 'IdentitiesOnly=yes',
                   '-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes',
                   '-o', f'UserKnownHostsFile={known}',
                   '-o', 'GlobalKnownHostsFile=/dev/null',
                   '-o', 'ConnectTimeout=20', '-o', 'ServerAliveInterval=15',
                   '-o', 'ServerAliveCountMax=3', f'fnksrwmy@{host}',
                   f'deploy-public {digest}']
        with archive.open('rb') as stream:
            subprocess.run(command, stdin=stream, check=True, timeout=900)
    print('Publication Bluehost terminée ; sauvegarde conservée sur le serveur.')


if __name__ == '__main__':
    os.umask(0o077)
    main()
