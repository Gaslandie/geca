"""Activation cPanel du transport de publication, sans changement des clés ni de la base."""
import fcntl
import getpass
import hashlib
import os
from pathlib import Path
import re
import stat
import sys
import tempfile
import urllib.request

OLD = "6e272b20ebba9cdf6207e1ebd193212a5c33781efa64702a4376180de0bd92d2"
NEW = "20da082a09737cac4362165b3364e92f0742efbc6a77300adeb52b1c73525603"


def check(path, directory=False):
    info=path.lstat()
    assert path.resolve()==path and info.st_uid==os.getuid() and not info.st_mode & 0o022
    assert stat.S_ISDIR(info.st_mode) if directory else stat.S_ISREG(info.st_mode)


def replace(path, data):
    fd,name=tempfile.mkstemp(prefix='.publication-',dir=path.parent)
    try:
        with os.fdopen(fd,'wb') as stream:
            stream.write(data);stream.flush();os.fsync(stream.fileno())
        os.chmod(name,0o600);os.replace(name,path)
    finally:
        if os.path.exists(name):os.unlink(name)


def main(commit):
    assert getpass.getuser()=='fnksrwmy' and re.fullmatch(r'[a-f0-9]{40}',commit)
    home=Path('/home2/fnksrwmy');tools=home/'geca-deploy-backoffice';root=home/'geca-backoffice'
    for directory in [home,tools,root,root/'storage/app/private']:check(directory,True)
    assert (root/'app/Services/PublicPublication.php').is_file(), 'Déployer le code du back-office avant activation'
    assert not (root/'storage/framework/down').exists(), 'Maintenance en cours'
    target=tools/'receive-backoffice.py';check(target)
    descriptor=os.open(tools/'reception.lock',os.O_CREAT|os.O_RDWR|os.O_NOFOLLOW,0o600)
    with os.fdopen(descriptor,'wb') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
        current=target.read_bytes();digest=hashlib.sha256(current).hexdigest()
        assert digest in [OLD,NEW], 'Version du récepteur inconnue'
        with urllib.request.urlopen('https://raw.githubusercontent.com/Gaslandie/geca/'+commit+'/deploy/receive-backoffice.py',timeout=30) as response:data=response.read(100000)
        assert hashlib.sha256(data).hexdigest()==NEW
        compile(data,str(target),'exec')
        if digest!=NEW:
            backup=Path(tempfile.mkdtemp(prefix='geca-publication-enable-',dir=home));os.chmod(backup,0o700)
            replace(backup/'receive-backoffice.py',current)
            assert (backup/'receive-backoffice.py').read_bytes()==current
            replace(target,data)
            assert hashlib.sha256(target.read_bytes()).hexdigest()==NEW
            print('Récepteur installé. Sauvegarde privée :',backup)
        folder=root/'storage/app/private/publication';folder.mkdir(mode=0o700,exist_ok=True);check(folder,True)
        enabled=folder/'enabled'
        if enabled.exists():check(enabled)
        replace(enabled,b'Publication des seuls contenus publics autorisee.\n')
        print('Liaison activée. Comptes, rapports, base et clés inchangés.')


if __name__=='__main__':
    os.umask(0o077)
    main(sys.argv[1])
