"""Livraison ciblée des trois rôles depuis la dernière source installée."""
from pathlib import Path
import gzip,hashlib,io,json,subprocess,tarfile
ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'backoffice/artifacts'
archive=ART/'geca-rapports-dates-code.tar.gz'
assert hashlib.sha256(archive.read_bytes()).hexdigest()=='5be5ebf6a1a879c16ee5c68b48dae504d47005401ccad6035e6507f0f10aaf14'
with tarfile.open(archive) as saved:
 files={member.name:saved.extractfile(member).read() for member in saved.getmembers()}
files.pop('MANIFEST.json')
files['resources/views/reports/index.blade.php']=subprocess.check_output(['git','show','f5a5b9d:backoffice/resources/views/reports/index.blade.php'],cwd=ROOT)
old={name:hashlib.sha256(data).hexdigest() for name,data in files.items()}
old_raw=(json.dumps(old,indent=2)+'\n').encode()
(ART/'geca-roles-old-manifest.json').write_bytes(old_raw)
protected=[name for name in old if not name.startswith(('app/','resources/views/')) and name!='routes/web.php']
for name in protected:
 if name=='database/reference/image-variants.json': continue
 assert hashlib.sha256((ROOT/'backoffice'/name).read_bytes()).hexdigest()==old[name],name
for folder,pattern in [('app','*.php'),('resources/views','*.blade.php')]:
 for path in (ROOT/'backoffice'/folder).rglob(pattern):
  assert not path.is_symlink() and path.resolve()==path
  files[path.relative_to(ROOT/'backoffice').as_posix()]=path.read_bytes()
for name in ['routes/web.php','database/migrations/2026_10_13_000002_add_backoffice_roles.php']:
 files[name]=(ROOT/'backoffice'/name).read_bytes()
new={name:hashlib.sha256(data).hexdigest() for name,data in files.items()}
new_raw=(json.dumps(new,indent=2)+'\n').encode();files['MANIFEST.json']=new_raw
buffer=io.BytesIO()
with tarfile.open(fileobj=buffer,mode='w') as output:
 for name,data in files.items():
  member=tarfile.TarInfo(name);member.mode=0o600;member.size=len(data);output.addfile(member,io.BytesIO(data))
data=gzip.compress(buffer.getvalue(),mtime=0)
(ART/'geca-roles-code.tar.gz').write_bytes(data)
record={'old':hashlib.sha256(old_raw).hexdigest(),'new':hashlib.sha256(new_raw).hexdigest(),'archive':hashlib.sha256(data).hexdigest(),
 'count':len(new),'added':sorted(set(new)-set(old)),'changed':sorted(name for name in old if old[name]!=new[name])}
(ART/'geca-roles-code.json').write_text(json.dumps(record,indent=2)+'\n')
for path in [ART/'geca-roles-code.tar.gz',ART/'geca-roles-code.json',ART/'geca-roles-old-manifest.json']: path.chmod(0o600)
print(json.dumps(record,indent=2))
