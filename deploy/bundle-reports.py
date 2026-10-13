"""Fichier à déposer dans le dossier privé cPanel. Aucun transfert automatique."""
from pathlib import Path
import hashlib
import json
import stat
import zipfile

root = Path(__file__).resolve().parents[1]
folder = root / 'backoffice/artifacts'
output = folder / 'geca-rapports-bluehost-20261013.zip'
files = {
    'geca-rapports-code.tar.gz': folder / 'geca-rapports-code.tar.gz',
    'geca-install-reports.py': root / 'deploy/geca-install-reports.py',
    'geca-check-reports.php': root / 'deploy/geca-check-reports.php',
    'geca-backup-backoffice.php': root / 'deploy/geca-backup-backoffice.php',
}
assert hashlib.sha256(files['geca-rapports-code.tar.gz'].read_bytes()).hexdigest() == 'b9960547d2e03c6aefbdb70844051b369e6af0f4020eac9c28c73043541abba7'
with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
    for name, path in files.items():
        info = zipfile.ZipInfo(name, date_time=(2026, 10, 13, 0, 0, 0))
        info.create_system = 3
        info.external_attr = (stat.S_IFREG | 0o600) << 16
        info.compress_type = zipfile.ZIP_DEFLATED
        archive.writestr(info, path.read_bytes())
output.chmod(0o600)
digest = hashlib.sha256(output.read_bytes()).hexdigest()
(folder / 'geca-rapports-livraison.json').write_text(json.dumps({'file': output.name, 'sha256': digest, 'files': {name: hashlib.sha256(path.read_bytes()).hexdigest() for name, path in files.items()}}, indent=2)+'\n')
(folder / 'geca-rapports-livraison.json').chmod(0o600)
command = '''python3 - <<'PY'
import hashlib, os, pwd, stat, subprocess, sys, tempfile, zipfile
from pathlib import Path

def verifier(ok, message):
    if not ok:
        raise SystemExit(message)

base = Path('/home2/fnksrwmy')
fichier = base / 'geca-rapports-bluehost-20261013.zip'
verifier(pwd.getpwuid(os.getuid()).pw_name == 'fnksrwmy', 'Mauvais compte cPanel.')
verifier(base.resolve() == base and base.stat().st_uid == os.getuid() and base.stat().st_mode & 0o022 == 0, 'Dossier privé incorrect.')
verifier(fichier.is_file() and fichier.resolve() == fichier and fichier.stat().st_uid == os.getuid(), 'Fichier absent ou lien refusé.')
verifier(fichier.stat().st_size <= 2 * 1024 * 1024, 'Fichier trop grand.')
verifier(hashlib.sha256(fichier.read_bytes()).hexdigest() == 'ZIP_SHA256', 'Le fichier est différent. Arrêt sans installation.')
os.umask(0o077)
fichier.chmod(0o600)
with zipfile.ZipFile(fichier) as archive:
    membres = archive.infolist()
    noms = {'geca-rapports-code.tar.gz', 'geca-install-reports.py', 'geca-check-reports.php', 'geca-backup-backoffice.php'}
    verifier(len(membres) == 4 and {m.filename for m in membres} == noms and sum(m.file_size for m in membres) < 2 * 1024 * 1024, 'Contenu inattendu.')
    verifier(all(stat.S_ISREG(m.external_attr >> 16) for m in membres), 'Type de fichier refusé.')
    travail = Path(tempfile.mkdtemp(prefix='geca-rapports-', dir=str(base)))
    travail.chmod(0o700)
    for membre in membres:
        destination = travail / membre.filename
        with destination.open('xb') as sortie:
            sortie.write(archive.read(membre))
        destination.chmod(0o600)
print('Dossier privé de livraison : ' + str(travail), flush=True)
resultat = subprocess.run([sys.executable, str(travail / 'geca-install-reports.py'), str(travail)])
raise SystemExit(resultat.returncode)
PY
'''.replace('ZIP_SHA256', digest)
(folder / 'commande-rapports-cpanel.sh').write_text(command)
(folder / 'commande-rapports-cpanel.sh').chmod(0o600)
print('Paquet :', output)
print('SHA256 :', digest)
print('Commande :', folder / 'commande-rapports-cpanel.sh')
