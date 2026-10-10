"""Fixtures privées de livraison ; aucune connexion MySQL/SMTP/Bluehost réelle."""
from pathlib import Path
import subprocess,tempfile,tarfile,os,base64,shutil
repo=Path.cwd();php=str(repo/'backoffice/.local-tools/php')
with tempfile.TemporaryDirectory(prefix='geca-deploy-php-') as temporary:
 base=Path(temporary);app=base/'app';app.mkdir();work=base/'work';work.mkdir(mode=0o700)
 admin=base/'admin';admin.mkdir();site=base/'site';site.mkdir()
 with tarfile.open(repo/'backoffice/artifacts/geca-backoffice-code.tar.gz') as tar:
  for member in tar.getmembers():
   path=app/member.name;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(tar.extractfile(member).read())
 shutil.copytree(app/'public',admin,dirs_exist_ok=True)
 (app/'vendor').symlink_to(repo/'backoffice/vendor',target_is_directory=True)
 for name in ['bootstrap/cache','storage/framework/views','storage/framework/sessions','storage/framework/cache/data','storage/logs']:(app/name).mkdir(parents=True,exist_ok=True)
 db=app/'database/test.sqlite';db.touch()
 values={'APP_NAME':'GECA','APP_ENV':'production','APP_DEBUG':'false','APP_URL':'https://admin.globalecoaction.org','APP_KEY':'base64:'+base64.b64encode(os.urandom(32)).decode(),'DB_CONNECTION':'sqlite','DB_DATABASE':str(db),'SESSION_DRIVER':'database','SESSION_SECURE_COOKIE':'true','SESSION_HTTP_ONLY':'true','SESSION_SAME_SITE':'lax','SESSION_DOMAIN':'null','CACHE_STORE':'database','MAIL_MAILER':'array','GECA_NEWSLETTER_MODE':'preview','GECA_LOGIN_VERIFICATION':'email','GECA_LOGIN_MAIL_FROM':'contact@globalecoaction.org','GECA_LOGIN_MAIL_HOST':'globalecoaction.org','GECA_LOGIN_MAIL_PORT':'465','GECA_LOGIN_MAIL_SCHEME':'smtps','GECA_LOGIN_MAIL_USERNAME':'contact@globalecoaction.org','GECA_LOGIN_MAIL_PASSWORD':'fake-only','GECA_PUBLIC_PATH':str(admin),'GECA_MEDIA_UPLOADS_ENABLED':'true','GECA_REFERENCE_PUBLIC_PATH':str(site)}
 (app/'.env').write_text('\n'.join(k+'='+v for k,v in values.items())+'\n');(app/'.env').chmod(0o600)
 def run(args,success=True):
  p=subprocess.run([php,*args],cwd=app,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
  if (p.returncode==0)!=success:raise RuntimeError(p.stdout.decode())
  return p.stdout.decode()
 run(['artisan','migrate','--force'])
 source=(repo/'deploy/geca-check-backoffice.php').read_text().replace("config('database.default') !== 'mysql'", "config('database.default') !== 'sqlite'").replace("config('database.connections.mysql.database') !== 'fnksrwmy_geca'", "config('database.connections.sqlite.database') !== '"+str(db)+"'").replace("DB::connection('mysql')","DB::connection('sqlite')")
 source=source.replace("if ($db->selectOne('SELECT DATABASE() AS db')->db !== 'fnksrwmy_geca') throw new RuntimeException();", "if (config('database.connections.sqlite.database') !== '"+str(db)+"') throw new RuntimeException();")
 source=source.replace("$db->select('SELECT TABLE_NAME AS name, ENGINE AS engine FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()')", "$db->select(\"SELECT name, 'InnoDB' AS engine FROM sqlite_master WHERE type = 'table' AND name != 'sqlite_sequence'\")")
 source=source.replace('/home2/fnksrwmy/public_html/geca-admin',str(admin)).replace('/home2/fnksrwmy/public_html/website_43934bdf',str(site)).replace('/home2/fnksrwmy',str(base))
 check=base/'check.php';check.write_text(source)
 run([str(check),'before',str(work)])
 (work/'maintenance.blade.php').write_text('<!doctype html><html lang=fr><title>Test maintenance</title><p>Maintenance de test</p></html>')
 run(['-r',"require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap(); Illuminate\\Support\\Facades\\View::addNamespace('geca-deploy',$argv[1]); exit(Illuminate\\Support\\Facades\\Artisan::call('down',['--render'=>'geca-deploy::maintenance']));",str(work)])
 run([str(check),'snapshot',str(work)])
 run([str(check),'after',str(work)])
 run(['artisan','up'])
 result=run([str(check),'http',str(work)])
 assert result.count('conforme')==12,result
 values['APP_DEBUG']='true';(app/'.env').write_text('\n'.join(k+'='+v for k,v in values.items())+'\n')
 run([str(check),'before',str(work)],success=False)
 print('Contrôles Laravel : 12 routes/statuts/en-têtes/CSRF sur SQLite de test, production sans accès local, photo réencodée, debug refusé. Aucun MySQL ou SMTP réel testé.')
with tempfile.TemporaryDirectory(prefix='geca-config-fixtures-') as temporary:
 base=Path(temporary);(base/'public_html/website_43934bdf').mkdir(parents=True);app=base/'app';app.mkdir();(app/'vendor').symlink_to(repo/'backoffice/vendor',target_is_directory=True)
 source=(repo/'deploy/geca-configure-photos.php').read_text().replace('/home2/fnksrwmy',str(base));script=base/'configure.php';script.write_text(source)
 for case in ['false','missing','true','duplicate','unexpected-path','bad-mode']:
  work=base/case;work.mkdir(mode=0o700)
  data='APP_KEY="fake $ literal, not a real key"\nDB_PASSWORD="fake only"\n'
  if case!='missing':data+='GECA_MEDIA_UPLOADS_ENABLED='+('true' if case=='true' else 'false')+'\n'
  if case=='duplicate':data+='GECA_MEDIA_UPLOADS_ENABLED=false\n'
  if case=='unexpected-path':data+='GECA_REFERENCE_PUBLIC_PATH=/etc\n'
  env=app/'.env';env.write_text(data);env.chmod(0o644 if case=='bad-mode' else 0o600)
  p=subprocess.run([php,str(script),str(work)],cwd=app,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
  assert (p.returncode==0)==(case in ['false','missing','true']),p.stdout
  if p.returncode:assert env.read_text()==data
  else:
   assert (work/'env-avant-photos').read_text()==data
   assert 'DB_PASSWORD="fake only"' in env.read_text()
   assert env.stat().st_mode & 0o777==0o600
 print('6 fixtures de configuration : deux seuls réglages, secrets factices conservés, doublons/dossier inattendu/mode public refusés.')
