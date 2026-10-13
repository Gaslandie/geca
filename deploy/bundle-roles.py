"""Livrable privé de code et commande cPanel sans téléchargement manuel de ZIP."""
from pathlib import Path
import hashlib,json,stat,zipfile
ROOT=Path(__file__).resolve().parents[1]; ART=ROOT/'backoffice/artifacts'
files={
 'geca-roles-code.tar.gz':(ART/'geca-roles-code.tar.gz').read_bytes(),
 'geca-install-roles.py':(ROOT/'deploy/geca-install-roles.py').read_bytes(),
 'geca-check-roles.php':(ROOT/'deploy/geca-check-roles.php').read_bytes(),
 'geca-backup-backoffice.php':(ROOT/'deploy/geca-backup-backoffice.php').read_bytes(),
 'check-backoffice.php':(ROOT/'deploy/check-backoffice-roles.php').read_bytes(),
 'receive-backoffice.py':(ROOT/'deploy/receive-backoffice.py').read_bytes(),
}
archive=ART/'geca-roles-bluehost-20261013.zip'
with zipfile.ZipFile(archive,'w') as output:
 for name,data in files.items():
  item=zipfile.ZipInfo(name);item.external_attr=(stat.S_IFREG|0o600)<<16;output.writestr(item,data,compress_type=zipfile.ZIP_DEFLATED)
archive.chmod(0o600); digest=hashlib.sha256(archive.read_bytes()).hexdigest()
record={'file':archive.name,'sha256':digest,'files':{name:hashlib.sha256(data).hexdigest() for name,data in files.items()}}
(ART/'geca-roles-livraison.json').write_text(json.dumps(record,indent=2)+'\n');(ART/'geca-roles-livraison.json').chmod(0o600)
command="""python3 - <<'PYCODE'
import hashlib,os,pathlib,pwd,stat,subprocess,sys,tempfile,urllib.request,zipfile
try:
    os.umask(0o077)
    home=pathlib.Path('/home2/fnksrwmy')
    assert pwd.getpwuid(os.getuid()).pw_name=='fnksrwmy'
    assert home.is_dir() and home.resolve()==home and home.stat().st_uid==os.getuid()
    work=pathlib.Path(tempfile.mkdtemp(prefix='geca-roles-',dir=home))
    archive=work/'livraison.zip'
    request=urllib.request.Request(URL,headers={'User-Agent':'GECA-livraison'})
    digest=hashlib.sha256();total=0
    with urllib.request.urlopen(request,timeout=60) as response, archive.open('xb') as target:
        while True:
            chunk=response.read(65536)
            if not chunk: break
            total+=len(chunk);assert total<1000000
            digest.update(chunk);target.write(chunk)
    assert total>0 and digest.hexdigest()==DIGEST
    expected=FILES
    with zipfile.ZipFile(archive) as zipped:
        entries=zipped.infolist()
        assert len(entries)==len(expected) and set(zipped.namelist())==set(expected)
        assert sum(item.file_size for item in entries)<10000000
        for item in entries:
            assert stat.S_ISREG(item.external_attr>>16) and not item.flag_bits&1
            data=zipped.read(item.filename);assert hashlib.sha256(data).hexdigest()==expected[item.filename]
            with (work/item.filename).open('xb') as target:target.write(data)
    print('Livraison téléchargée et vérifiée dans le dossier privé :',work,flush=True)
    result=subprocess.run([sys.executable,str(work/'geca-install-roles.py'),str(work)],check=False)
    raise SystemExit(result.returncode)
except Exception:
    print('Préparation interrompue. Aucun secret affiché. Transmettre ce message avant toute relance.',file=sys.stderr)
    raise SystemExit(1)
PYCODE
"""
command=command.replace('URL',repr('https://github.com/Gaslandie/geca/releases/download/backoffice-roles-2026-10-13/'+archive.name)).replace('DIGEST',repr(record['sha256'])).replace('FILES',repr(record['files']))
(ART/'commande-comptes-roles-cpanel.sh').write_text(command);(ART/'commande-comptes-roles-cpanel.sh').chmod(0o600)
print('ZIP et commande préparés :',digest)
