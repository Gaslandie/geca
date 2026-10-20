"""GitHub uniquement : transport SSH fermé des publications, sans secret dans les logs."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile


def remote(action, record=None, payload=None):
    host = os.environ['BLUEHOST_SSH_HOST']
    port = os.environ.get('BLUEHOST_SSH_PORT', '22')
    assert re.fullmatch(r'[a-zA-Z0-9.-]{1,252}', host) and port.isdecimal()
    command = 'publication-fetch'
    if action == 'reference':
        command = 'publication-reference'
    elif action != 'fetch':
        assert action in ['authorize', 'complete', 'fail']
        assert re.fullmatch(r'[a-f0-9-]{36}', record['id']) and re.fullmatch(r'[a-f0-9]{64}', record['hash'])
        command = 'publication-' + action + ' ' + record['id'] + ' ' + record['hash']
    with tempfile.TemporaryDirectory(prefix='geca-publication-ssh-') as folder:
        identity, known = Path(folder)/'identity', Path(folder)/'known_hosts'
        identity.write_text(os.environ['BLUEHOST_BACKOFFICE_SSH_KEY']+'\n');identity.chmod(0o600)
        known.write_text(os.environ['BLUEHOST_KNOWN_HOSTS']+'\n');known.chmod(0o600)
        result = subprocess.run(['ssh','-F','/dev/null','-T','-p',port,'-i',str(identity),'-o','IdentitiesOnly=yes','-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','UserKnownHostsFile='+str(known),'-o','GlobalKnownHostsFile=/dev/null','-o','ConnectTimeout=20', 'fnksrwmy@'+host,command],input=payload,capture_output=True,check=True,timeout=120)
        assert len(result.stdout)<=80*1024*1024
        return json.loads(result.stdout)


def main(action):
    target = Path('release/publication-input.json')
    if action == 'fetch':
        record = remote('fetch')
        assert isinstance(record, dict) and 'snapshot' in record and 'id' in record and type(record['pending']) is bool
        target.parent.mkdir(exist_ok=True)
        target.write_text(json.dumps(record,ensure_ascii=False));target.chmod(0o600)
        if os.environ.get('GITHUB_OUTPUT'):
            with open(os.environ['GITHUB_OUTPUT'],'a') as output:
                output.write('build='+str(record['pending'] or os.environ.get('GITHUB_EVENT_NAME')!='schedule').lower()+'\n')
        print('Copie de publication reçue ; aucun contenu privé affiché.')
        return
    if action == 'reference':
        selected = json.loads(Path('release/latest.json').read_text())
        folder = Path(selected['directory']).resolve()
        assert folder.parent == Path('release').resolve()
        payload = (folder / 'reference.json').read_bytes()
        assert len(payload) <= 5 * 1024 * 1024
        remote('reference',payload=payload)
        print('Références publiques manquantes ajoutées ; fiches existantes conservées.')
        return
    record = json.loads(target.read_text())
    if record['id'] is None:
        return
    if action == 'complete':
        # Confirmation HTTPS réelle après livraison, pas seulement après compilation.
        assert re.fullmatch(r'[a-f0-9-]{36}', record['id'])
        response = subprocess.run(
            ['curl', '--fail', '--silent', '--show-error', '--proto', '=https',
             '--max-time', '30', '--max-filesize', '5000000',
             'https://globalecoaction.org/fr/?publication='+record['id']],
            capture_output=True, check=True, timeout=35)
        assert len(response.stdout) <= 5_000_000
        html = response.stdout.decode()
        assert re.search(r'<meta name="geca-publication" content="'+re.escape(record['id'])+'"',html), 'Version publique non confirmée'
    remote(action,record)
    print('État de publication confirmé : '+action)


if __name__ == '__main__':
    os.umask(0o077)
    try:
        main(sys.argv[1])
    except Exception:
        print('Transport de publication interrompu. Vérifier le back-office.',file=sys.stderr)
        sys.exit(1)
