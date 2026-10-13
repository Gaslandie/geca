"""Fixtures isolées de l'installation des rapports. Aucun Bluehost, MySQL ou SMTP réel."""
import copy
import contextlib
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import pwd
import shutil
import subprocess
import tempfile
import tarfile
import unittest
import zipfile
from unittest.mock import patch

REPO = Path(__file__).resolve().parents[1]
PHP = str(REPO / 'backoffice/.local-tools/php')
spec = importlib.util.spec_from_file_location('reports_install', REPO / 'deploy/geca-install-roles.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def old_manifest():
    data = (REPO / 'backoffice/artifacts/geca-roles-old-manifest.json').read_bytes()
    assert hashlib.sha256(data).hexdigest() == module.OLD
    return json.loads(data)


class GuardTests(unittest.TestCase):
    def test_delta_is_exact_and_preserves_dependencies_old_migrations_and_registry(self):
        old = old_manifest()
        with tarfile.open(REPO / 'backoffice/artifacts/geca-roles-code.tar.gz') as archive:
            new = json.load(archive.extractfile('MANIFEST.json'))
        module.validate_delta(old, new)
        for name in ['composer.lock', 'database/reference/image-variants.json', 'database/migrations/0001_01_01_000000_create_users_table.php']:
            wrong = copy.deepcopy(new)
            wrong[name] = '0' * 64
            with self.assertRaises(RuntimeError):
                module.validate_delta(old, wrong)
        wrong = copy.deepcopy(new)
        wrong['app/unexpected.php'] = '0' * 64
        with self.assertRaises(RuntimeError):
            module.validate_delta(old, wrong)

    def test_bad_archive_and_symlink_are_refused(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / 'geca-roles-code.tar.gz').write_bytes(b'wrong')
            (root / 'geca-roles-code.tar.gz').chmod(0o600)
            with self.assertRaises(RuntimeError):
                module.stage_archive(root)
            outside = root / 'outside'
            outside.write_text('TEST')
            tree = root / 'tree'
            tree.mkdir()
            (tree / 'link').symlink_to(outside)
            with self.assertRaises(RuntimeError):
                module.safe_tree(tree)

    def test_atomic_write_and_rollback_remove_only_new_files(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            existing = root / 'existing'
            existing.write_text('before')
            existing.chmod(0o600)
            new = root / 'new'
            before = {existing: (b'before', 0o600), new: None}
            module.write(existing, b'after')
            module.write(new, b'new')
            module.restore_code(before, [existing, new])
            self.assertEqual(existing.read_bytes(), b'before')
            self.assertFalse(new.exists())
            link = root / 'link'
            link.symlink_to(existing)
            with self.assertRaises(RuntimeError):
                module.write(link, b'forbidden')
            self.assertEqual(existing.read_bytes(), b'before')


class DownloadTests(unittest.TestCase):
    def check_download(self, case):
        with tempfile.TemporaryDirectory(prefix='geca-download-') as temporary:
            base = Path(temporary)
            shell = (REPO / 'backoffice/artifacts/commande-comptes-roles-cpanel.sh').read_text()
            code = shell.split("python3 - <<'PYCODE'\n",1)[1].rsplit('\nPYCODE\n',1)[0]
            code = code.replace('/home2/fnksrwmy',str(base)).replace("pw_name=='fnksrwmy'", "pw_name=="+repr(pwd.getpwuid(os.getuid()).pw_name))
            body=(REPO/'backoffice/artifacts/geca-roles-bluehost-20261013.zip').read_bytes()
            if case=='hash': body+=b'changed'
            if case=='unknown':
                old=hashlib.sha256(body).hexdigest(); buffer=io.BytesIO()
                with zipfile.ZipFile(buffer,'w') as zipped:
                    zipped.writestr('unexpected.php',b'TEST')
                body=buffer.getvalue();code=code.replace(old,hashlib.sha256(body).hexdigest())
            invoked=[]
            import urllib.request
            def call(args,**kwargs): invoked.append(args); return subprocess.CompletedProcess(args,0)
            with patch.object(urllib.request,'urlopen',return_value=io.BytesIO(body)), patch.object(subprocess,'run',side_effect=call), contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()), self.assertRaises(SystemExit) as outcome:
                exec(compile(code,'<download fixture>','exec'),{})
            self.assertEqual(outcome.exception.code,0 if case=='valid' else 1)
            self.assertEqual(len(invoked),1 if case=='valid' else 0)
            if case=='valid':
                work=Path(invoked[0][2]);self.assertEqual(work.stat().st_mode&0o777,0o700)
                self.assertTrue(all(p.stat().st_mode&0o777==0o600 for p in work.iterdir()))
    def test_download_and_private_extract(self): self.check_download('valid')
    def test_altered_download_stops_before_installer(self): self.check_download('hash')
    def test_unknown_names_stop_before_installer(self): self.check_download('unknown')


class FlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        os.umask(0o077)
        cls.temporary = tempfile.TemporaryDirectory(prefix='geca-reports-deploy-')
        cls.home = Path(cls.temporary.name)
        cls.root = cls.home / 'geca-backoffice'
        cls.public = cls.home / 'public_html/geca-admin'
        cls.work = cls.home / 'geca-roles-fixture'
        for path in [cls.root, cls.public, cls.work]:
            path.mkdir(mode=0o700, parents=True)
        manifest = old_manifest()
        for name in manifest:
            with tarfile.open(REPO / 'backoffice/artifacts/geca-rapports-dates-code.tar.gz') as installed:
                content = installed.extractfile(name).read()
            if name == 'resources/views/reports/index.blade.php':
                content = subprocess.check_output(['git','show','f5a5b9d:backoffice/'+name],cwd=REPO)
            path = cls.root / name
            path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
            path.write_bytes(content)
            path.chmod(0o600)
        (cls.root / 'MANIFEST.json').write_text(json.dumps(manifest, indent=2) + '\n')
        (cls.root / 'MANIFEST.json').chmod(0o600)
        shutil.copytree(REPO / 'backoffice/vendor', cls.root / 'vendor')
        for path in ['bootstrap/cache', 'storage/app/private', 'storage/framework/views', 'storage/framework/sessions', 'storage/framework/cache/data', 'storage/logs']:
            (cls.root / path).mkdir(mode=0o700, parents=True, exist_ok=True)
        shutil.copytree(cls.root / 'public', cls.public, dirs_exist_ok=True)
        for name in module.ASSETS:
            (cls.public / name).chmod(0o644)
        for name in ['index.php', '.htaccess']:
            (cls.public / name).write_text('TEST HTTP entry, not a real server')
            (cls.public / name).chmod(0o644)
        db = cls.root / 'database/test.sqlite'
        db.touch(mode=0o600)
        import base64
        settings = {'APP_ENV': 'production', 'APP_DEBUG': 'false', 'APP_URL': 'https://admin.globalecoaction.org',
                    'APP_KEY': 'base64:' + base64.b64encode(os.urandom(32)).decode(), 'DB_CONNECTION': 'sqlite',
                    'DB_DATABASE': str(db), 'SESSION_DRIVER': 'database', 'SESSION_SECURE_COOKIE': 'true',
                    'SESSION_HTTP_ONLY': 'true', 'SESSION_DOMAIN': 'null', 'SESSION_SAME_SITE': 'lax', 'CACHE_STORE': 'database',
                    'MAIL_MAILER': 'array', 'GECA_NEWSLETTER_MODE': 'preview', 'GECA_LOGIN_VERIFICATION': 'email',
                    'GECA_LOGIN_MAIL_FROM': 'contact@globalecoaction.org', 'GECA_LOGIN_MAIL_HOST': 'globalecoaction.org',
                    'GECA_LOGIN_MAIL_PORT': '465', 'GECA_LOGIN_MAIL_SCHEME': 'smtps', 'GECA_LOGIN_MAIL_USERNAME': 'TEST',
                    'GECA_LOGIN_MAIL_PASSWORD': 'TEST ONLY', 'GECA_PUBLIC_PATH': str(cls.public),
                    'GECA_MEDIA_UPLOADS_ENABLED': 'true', 'GECA_REFERENCE_PUBLIC_PATH': str(cls.home / 'public-site')}
        (cls.root / '.env').write_text('\n'.join(k + '="' + v + '"' for k, v in settings.items()) + '\n')
        (cls.root / '.env').chmod(0o600)
        (cls.root / 'storage/app/private/reports').mkdir(mode=0o700)
        (cls.home / 'public-site').mkdir()
        cls.tools = cls.home / 'geca-deploy-backoffice'
        cls.tools.mkdir(mode=0o700)
        for name in module.TOOL_OLD:
            content = subprocess.check_output(['git','show','f5a5b9d:deploy/'+name],cwd=REPO)
            (cls.tools / name).write_bytes(content); (cls.tools / name).chmod(0o600)
        cls.env_before = (cls.root / '.env').read_bytes()
        result = subprocess.run([PHP, 'artisan', 'migrate', '--force', '--database=sqlite'], cwd=cls.root, capture_output=True)
        if result.returncode:
            raise RuntimeError(result.stdout.decode() + result.stderr.decode())
        bootstrap = "require 'vendor/autoload.php'; $app=require 'bootstrap/app.php'; $app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap(); "
        seed = "$u=new App\\Models\\User; $u->name='TEST compte jetable'; $u->email='fixture@example.test'; $u->password='TEST mot de passe jetable uniquement'; $u->is_admin=true; $u->is_active=true; $u->session_version=1; $u->save(); $e=new App\\Models\\ContentEntry; $e->kind='news'; $e->source_key='TEST'; $e->source_payload=['fr'=>['title'=>'TEST technique, aucun fait GECA','description'=>'TEST']]; $e->revision=0; $e->save();"
        subprocess.run([PHP, '-r', bootstrap + seed], cwd=cls.root, capture_output=True, check=True)
        cls.dump = cls.home / 'fake-mysqldump'
        cls.dump.write_text('Fixture only')
        cls.dump.chmod(0o700)
        shutil.copy2(REPO / 'backoffice/artifacts/geca-roles-code.tar.gz', cls.work)
        check = (REPO / 'deploy/geca-check-roles.php').read_text()
        check = check.replace("$roleColumn['type'] === 'varchar(16)'", "$roleColumn['type'] === 'varchar'")
        check = check.replace("str_contains($key, 'Create')", "$key === 'sql'")
        import re
        needle = re.search(r"preg_replace\(('.*?'), '', \$value", check).group(1)
        check = check.replace(needle, "'/, \"role\" varchar/'")
        # Adaptations explicites réservées au test : SQLite, chemins et schéma simulé.
        check = check.replace("config('database.default') === 'mysql'", "config('database.default') === 'sqlite'")
        check = check.replace("config('database.connections.mysql.database') === 'fnksrwmy_geca'", "config('database.connections.sqlite.database') === '" + str(db) + "'")
        check = check.replace("config('database.connections.mysql.username') === 'fnksrwmy_geca_app'", 'true')
        check = check.replace("in_array(config('database.connections.mysql.host'), ['localhost', '127.0.0.1'], true)", 'true')
        check = check.replace("(int) config('database.connections.mysql.port') === 3306", 'true')
        check = check.replace("DB::connection('mysql')", "DB::connection('sqlite')")
        check = check.replace("$db->selectOne('SELECT DATABASE() AS db')->db === 'fnksrwmy_geca'", "config('database.connections.sqlite.database') === '" + str(db) + "'")
        check = check.replace("$db->select('SELECT TABLE_NAME AS name, ENGINE AS engine FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()')", "$db->select(\"SELECT name, 'InnoDB' AS engine FROM sqlite_master WHERE type='table' AND name!='sqlite_sequence'\")")
        check = check.replace("$db->select('SHOW CREATE TABLE `'.$table->name.'`')", "$db->select(\"SELECT sql FROM sqlite_master WHERE name='\".$table->name.\"'\")")
        check = check.replace('/home2/fnksrwmy/public_html/geca-admin', str(cls.public))
        check = check.replace('/home2/fnksrwmy/public_html/website_43934bdf', str(cls.home / 'public-site'))
        check = check.replace('/home2/fnksrwmy', str(cls.home))
        check = check.replace('fwrite(STDERR, "Contrôle des rapports interrompu.', 'fwrite(STDERR, "Fixture assertion : ".($error->getTrace()[0]["line"] ?? $error->getLine())."\\n"); fwrite(STDERR, "Contrôle des rapports interrompu.')
        (cls.work / 'geca-check-roles.php').write_text(check)
        (cls.work / 'geca-check-roles.php').chmod(0o600)
        # Le flux d'export est substitué : aucun mysqldump ou MySQL réel n'est prétendu testé.
        (cls.work / 'geca-backup-backoffice.php').write_text("<?php $work=$argv[2]; file_put_contents($work.'/base.sql','TEST export SQL substitue, aucun MySQL'); chmod($work.'/base.sql',0600); file_put_contents($work.'/SHA256-BASE.txt',hash_file('sha256',$work.'/base.sql').'  base.sql'); chmod($work.'/SHA256-BASE.txt',0600);")
        (cls.work / 'geca-backup-backoffice.php').chmod(0o600)
        for name, source in [('check-backoffice.php','check-backoffice-roles.php'),('receive-backoffice.py','receive-backoffice.py')]:
            shutil.copy2(REPO / 'deploy' / source, cls.work / name); (cls.work / name).chmod(0o600)
        cls.baseline = None

    def setUp(self):
        self.current_work = self.work
        for name in module.TOOL_OLD:
            content = subprocess.check_output(['git','show','f5a5b9d:deploy/'+name],cwd=REPO)
            (self.tools / name).write_bytes(content); (self.tools / name).chmod(0o600)
        if self.baseline is not None:
            # Restitution de la seule fixture jetable, jamais d'une base de travail.
            assert self.root.parent == self.home and self.home.name.startswith('geca-reports-deploy-')
            shutil.rmtree(self.root)
            shutil.rmtree(self.public)
            subprocess.run(['tar', '--same-permissions', '--no-same-owner', '-xzf', str(self.baseline), '-C', str(self.home)], check=True)
            subprocess.run([PHP, 'artisan', 'up'], cwd=self.root, capture_output=True, check=True)
            self.current_work = self.home / ('geca-roles-' + self._testMethodName)
            self.current_work.mkdir(mode=0o700)
            for name in ['geca-roles-code.tar.gz', 'geca-check-roles.php', 'geca-backup-backoffice.php', 'check-backoffice.php', 'receive-backoffice.py']:
                shutil.copy2(self.work / name, self.current_work / name)

    @classmethod
    def tearDownClass(cls):
        cls.temporary.cleanup()

    @contextlib.contextmanager
    def flow(self, fault=None):
        original_run = subprocess.run
        def run(args, **kwargs):
            if fault == 'backup' and len(args) > 1 and str(args[1]).endswith('geca-backup-backoffice.php'):
                raise subprocess.CalledProcessError(1, args)
            if fault == 'migration' and len(args) > 2 and args[1:3] == ['artisan', 'migrate']:
                raise subprocess.CalledProcessError(1, args)
            if fault in ['migrated', 'http'] and len(args) > 2 and str(args[1]).endswith('geca-check-roles.php') and args[2] == fault:
                raise subprocess.CalledProcessError(1, args)
            if len(args) > 1 and args[0] == PHP and args[1] == 'artisan' and 'migrate' in args:
                args = ['--database=sqlite' if value == '--database=mysql' else value for value in args]
            return original_run(args, **kwargs)
        real_which = shutil.which
        with patch.multiple(module, HOME=self.home, ROOT=self.root, PUBLIC=self.public,
                            ACCOUNT=pwd.getpwuid(os.getuid()).pw_name, MYSQLDUMP=str(self.dump), TOOLS=self.tools), \
             patch.object(module.shutil, 'which', side_effect=lambda name: PHP if name == 'php' else real_which(name)), \
             patch.object(module.subprocess, 'run', side_effect=run):
            yield

    def test_01_full_flow_preserves_configuration_data_and_refuses_replay(self):
        with self.flow():
            try:
                module.install(self.work)
            except Exception as error:
                raise RuntimeError((self.work / 'diagnostic-prive.txt').read_text()) from error
            self.assertEqual((self.root / '.env').read_bytes(), self.env_before)
            self.assertFalse((self.root / 'storage/framework/down').exists())
            self.assertEqual((self.root / 'storage/app/private/reports').stat().st_mode & 0o777, 0o700)
            module.manifest(self.root, module.NEW, 114)
            self.assertTrue((self.work / 'base.sql').exists())
            self.assertTrue((self.work / 'restauration-fichiers-test/geca-backoffice/.env').exists())
            with self.assertRaises(RuntimeError):
                module.install(self.work)
            self.assertFalse((self.root / 'storage/framework/down').exists())
            type(self).baseline = self.work / 'fichiers-avant.tar.gz'
            import sqlite3
            connection = sqlite3.connect(self.root / 'database/test.sqlite')
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM migrations').fetchone()[0], 12)
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM activity_reports').fetchone()[0], 0)
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM activity_report_revisions').fetchone()[0], 0)
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM users').fetchone()[0], 1)
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM content_entries').fetchone()[0], 1)
            connection.close()

    def check_failure(self, expected_manifest, migration_count):
        module.manifest(self.root, expected_manifest, 107 if expected_manifest == module.OLD else 114)
        self.assertEqual((self.root / '.env').read_bytes(), self.env_before)
        self.assertTrue((self.root / 'storage/framework/down').exists())
        import sqlite3
        connection = sqlite3.connect(self.root / 'database/test.sqlite')
        self.assertEqual(connection.execute('SELECT COUNT(*) FROM migrations').fetchone()[0], migration_count)
        self.assertEqual(connection.execute('SELECT COUNT(*) FROM users').fetchone()[0], 1)
        self.assertEqual(connection.execute('SELECT COUNT(*) FROM content_entries').fetchone()[0], 1)
        connection.close()

    def test_02_failed_backup_stops_before_any_copy_or_migration(self):
        with self.flow('backup'), self.assertRaises(subprocess.CalledProcessError):
            module.install(self.current_work)
        self.check_failure(module.OLD, 11)

    def test_03_failed_copy_restores_old_code_and_keeps_maintenance(self):
        original = module.write
        count = 0
        def failing(path, data, mode=0o600):
            nonlocal count
            if path.parent != self.current_work and path in [self.root / name for name in module.ADDED | module.CHANGED]:
                count += 1
                if count == 2:
                    raise RuntimeError('TEST erreur de copie')
            return original(path, data, mode)
        with self.flow(), patch.object(module, 'write', side_effect=failing), self.assertRaises(RuntimeError):
            module.install(self.current_work)
        self.check_failure(module.OLD, 11)
        for name in module.ADDED:
            self.assertFalse((self.root / name).exists())

    def test_04_failed_migration_never_rolls_back_or_reopens(self):
        with self.flow('migration'), self.assertRaises(subprocess.CalledProcessError):
            module.install(self.current_work)
        self.check_failure(module.NEW, 11)

    def test_05_failed_post_migration_check_keeps_new_tables_and_maintenance(self):
        with self.flow('migrated'), self.assertRaises(subprocess.CalledProcessError):
            module.install(self.current_work)
        self.check_failure(module.NEW, 12)

    def test_06_failed_http_check_closes_the_backoffice_again(self):
        with self.flow('http'), self.assertRaises(subprocess.CalledProcessError):
            module.install(self.current_work)
        self.check_failure(module.NEW, 12)


if __name__ == '__main__':
    unittest.main()
