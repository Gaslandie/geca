"""Installer la clé publique dédiée sans remplacer les clés ou le site existants."""
import getpass, hashlib, os, re, shutil, stat, sys, tempfile
from pathlib import Path
home = Path('/home2/fnksrwmy')
work = Path(sys.argv[1])
ssh = home / '.ssh'
tools = home / 'geca-deploy'
public = sys.argv[2]
line = 'restrict,command="/bin/python3 /home2/fnksrwmy/geca-deploy/receive-public.py" ' + public

def check(ok):
    if not ok:
        raise SystemExit('Installation interrompue : chemin, fichier ou droit inattendu.')

def directory(path):
    check(path.is_dir() and path.resolve() == path and path.stat().st_uid == os.getuid())

def regular(path):
    check(path.is_file() and not path.is_symlink() and path.stat().st_uid == os.getuid()
          and stat.S_ISREG(path.stat().st_mode))

check(getpass.getuser() == 'fnksrwmy')
check(re.fullmatch(r'ssh-ed25519 [A-Za-z0-9+/]{68} [a-zA-Z0-9-]+', public) is not None)
directory(home)
directory(work)
check(stat.S_IMODE(work.stat().st_mode) == 0o700)
check(work.parent == home and work.name.startswith('geca-connexion-'))
for name, digest in [('receive-public.py', '0217a96cdfb62f167ed9aa69d11168ab7d31d5d89322cf80d83a1564cb776be0'),
                     ('update-public.py', 'f60efe37f55ba6a399eda013f7d4d31fae89c24d3385bf2a8b6103a98d146096')]:
    regular(work / name)
    check(hashlib.sha256((work / name).read_bytes()).hexdigest() == digest)
if ssh.exists() or ssh.is_symlink():
    directory(ssh)
    check(ssh.stat().st_mode & 0o022 == 0)
if tools.exists() or tools.is_symlink():
    directory(tools)
    check(stat.S_IMODE(tools.stat().st_mode) == 0o700)
    for name in ['receive-public.py', 'update-public.py']:
        regular(tools / name)
        check((tools / name).read_bytes() == (work / name).read_bytes())
authorized = ssh / 'authorized_keys'
previous = b''
if authorized.exists() or authorized.is_symlink():
    regular(authorized)
    check(authorized.stat().st_mode & 0o022 == 0)
    previous = authorized.read_bytes()
    check(len(previous) < 1000000)
    if public.split()[1].encode() in previous:
        check(line.encode() in previous.splitlines())
if not tools.exists():
    tools.mkdir(mode=0o700)
    for name in ['receive-public.py', 'update-public.py']:
        shutil.copyfile(work / name, tools / name)
        (tools / name).chmod(0o600)
ssh.mkdir(mode=0o700, exist_ok=True)
ssh.chmod(0o700)
backup = work / 'authorized_keys-avant'
backup.write_bytes(previous)
backup.chmod(0o600)
if line.encode() not in previous.splitlines():
    content = previous + (b'\n' if previous and not previous.endswith(b'\n') else b'') + line.encode() + b'\n'
    fd, temporary = tempfile.mkstemp(prefix='.geca-cle-', dir=ssh)
    with os.fdopen(fd, 'wb') as target:
        target.write(content)
        target.flush()
        os.fsync(target.fileno())
    os.chmod(temporary, 0o600)
    os.replace(temporary, authorized)
check(line.encode() in authorized.read_bytes().splitlines())
print('Clé GitHub limitée à la vitrine installée. Anciennes clés conservées.')
print('Site, back-office et base inchangés. Sauvegarde des clés :', backup)
