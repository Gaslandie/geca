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
spec = importlib.util.spec_from_file_location('reports_install', REPO / 'deploy/geca-install-reports.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def old_manifest():
    paths = ['artisan', 'composer.json', 'composer.lock', '.env.example', 'bootstrap/app.php', 'bootstrap/providers.php']
    folders = ['app', 'config', 'routes', 'resources/views', 'lang', 'database/migrations', 'database/reference']
    assets = ['public/' + name for name in module.ASSETS]
    tracked = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', 'd1ad00a', 'backoffice'], cwd=REPO, text=True).splitlines()
    selected = sorted(path for path in tracked if path[len('backoffice/'):] in paths + assets
                      or any(path.startswith('backoffice/' + folder + '/') for folder in folders))
    result = {path[len('backoffice/'):]: hashlib.sha256(subprocess.check_output(['git', 'show', 'd1ad00a:' + path], cwd=REPO)).hexdigest() for path in selected}
    result['database/reference/image-variants.json'] = hashlib.sha256(subprocess.check_output(['git', 'show', 'd1ad00a:src/content/image-variants.json'], cwd=REPO)).hexdigest()
    assert hashlib.sha256((json.dumps(result, indent=2) + '\n').encode()).hexdigest() == module.OLD
    return result


class GuardTests(unittest.TestCase):
    def test_delta_is_exact_and_preserves_dependencies_old_migrations_and_registry(self):
        old = old_manifest()
        with tarfile.open(REPO / 'backoffice/artifacts/geca-rapports-code.tar.gz') as archive:
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
            (root / 'geca-rapports-code.tar.gz').write_bytes(b'wrong')
            (root / 'geca-rapports-code.tar.gz').chmod(0o600)
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


class BootstrapTests(unittest.TestCase):
    def test_signed_bundle_is_extracted_in_private_folder_and_only_installer_is_called(self):
        self.check_command('valid')

    def test_wrong_checksum_is_refused_before_extracting(self):
        self.check_command('checksum')

    def test_linked_upload_is_refused(self):
        self.check_command('link')

    def test_unknown_file_inside_even_a_fixture_signed_zip_is_refused(self):
        self.check_command('unknown')

    def check_command(self, case):
        with tempfile.TemporaryDirectory(prefix='geca-boot-') as temporary:
            base = Path(temporary)
            source = REPO / 'backoffice/artifacts/geca-rapports-bluehost-20261013.zip'
            target = base / source.name
            shutil.copy2(source, target)
            shell = (REPO / 'backoffice/artifacts/commande-rapports-cpanel.sh').read_text()
            code = shell.split("python3 - <<'PY'\n", 1)[1].rsplit('\nPY\n', 1)[0]
            code = code.replace('/home2/fnksrwmy', str(base))
            code = code.replace("pw_name == 'fnksrwmy'", "pw_name == " + repr(pwd.getpwuid(os.getuid()).pw_name))
            if case == 'checksum':
                target.write_bytes(target.read_bytes() + b'changed')
            elif case == 'link':
                other = base / 'other.zip'
                target.rename(other)
                target.symlink_to(other)
            elif case == 'unknown':
                expected = hashlib.sha256(target.read_bytes()).hexdigest()
                with zipfile.ZipFile(target, 'w') as archive:
                    for name in ['geca-rapports-code.tar.gz', 'geca-install-reports.py', 'geca-check-reports.php', 'unexpected.php']:
                        info = zipfile.ZipInfo(name)
                        info.external_attr = (0o100000 | 0o600) << 16
                        archive.writestr(info, b'TEST')
                # Signature substituée pour exercer aussi la liste fermée de contenus.
                code = code.replace(expected, hashlib.sha256(target.read_bytes()).hexdigest())
            invoked = []
            def run(args, **kwargs):
                invoked.append(args)
                return subprocess.CompletedProcess(args, 0)
            with patch.object(subprocess, 'run', side_effect=run), contextlib.redirect_stdout(io.StringIO()), self.assertRaises(SystemExit) as outcome:
                exec(compile(code, '<bootstrap fixture>', 'exec'), {})
            if case == 'valid':
                self.assertEqual(outcome.exception.code, 0)
                self.assertEqual(len(invoked), 1)
                work = Path(invoked[0][2])
                self.assertEqual(work.parent, base)
                self.assertEqual(work.stat().st_mode & 0o777, 0o700)
                self.assertEqual(set(p.name for p in work.iterdir()), {'geca-rapports-code.tar.gz', 'geca-install-reports.py', 'geca-check-reports.php', 'geca-backup-backoffice.php'})
                self.assertTrue(all(p.stat().st_mode & 0o777 == 0o600 for p in work.iterdir()))
            else:
                self.assertEqual(invoked, [])
                self.assertEqual(list(base.glob('geca-rapports-*')), [target])


class FlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        os.umask(0o077)
        cls.temporary = tempfile.TemporaryDirectory(prefix='geca-reports-deploy-')
        cls.home = Path(cls.temporary.name)
        cls.root = cls.home / 'geca-backoffice'
        cls.public = cls.home / 'public_html/geca-admin'
        cls.work = cls.home / 'geca-rapports-fixture'
        for path in [cls.root, cls.public, cls.work]:
            path.mkdir(mode=0o700, parents=True)
        manifest = old_manifest()
        for name in manifest:
            source = 'src/content/image-variants.json' if name == 'database/reference/image-variants.json' else 'backoffice/' + name
            content = subprocess.check_output(['git', 'show', 'd1ad00a:' + source], cwd=REPO)
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
        (cls.home / 'public-site').mkdir()
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
        shutil.copy2(REPO / 'backoffice/artifacts/geca-rapports-code.tar.gz', cls.work)
        check = (REPO / 'deploy/geca-check-reports.php').read_text()
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
        (cls.work / 'geca-check-reports.php').write_text(check)
        (cls.work / 'geca-check-reports.php').chmod(0o600)
        # Le flux d'export est substitué : aucun mysqldump ou MySQL réel n'est prétendu testé.
        (cls.work / 'geca-backup-backoffice.php').write_text("<?php $work=$argv[2]; file_put_contents($work.'/base.sql','TEST export SQL substitue, aucun MySQL'); chmod($work.'/base.sql',0600); file_put_contents($work.'/SHA256-BASE.txt',hash_file('sha256',$work.'/base.sql').'  base.sql'); chmod($work.'/SHA256-BASE.txt',0600);")
        (cls.work / 'geca-backup-backoffice.php').chmod(0o600)
        cls.baseline = None

    def setUp(self):
        self.current_work = self.work
        if self.baseline is not None:
            # Restitution de la seule fixture jetable, jamais d'une base de travail.
            assert self.root.parent == self.home and self.home.name.startswith('geca-reports-deploy-')
            shutil.rmtree(self.root)
            shutil.rmtree(self.public)
            subprocess.run(['tar', '--same-permissions', '--no-same-owner', '-xzf', str(self.baseline), '-C', str(self.home)], check=True)
            subprocess.run([PHP, 'artisan', 'up'], cwd=self.root, capture_output=True, check=True)
            self.current_work = self.home / ('geca-rapports-' + self._testMethodName)
            self.current_work.mkdir(mode=0o700)
            for name in ['geca-rapports-code.tar.gz', 'geca-check-reports.php', 'geca-backup-backoffice.php']:
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
            if fault in ['migrated', 'http'] and len(args) > 2 and str(args[1]).endswith('geca-check-reports.php') and args[2] == fault:
                raise subprocess.CalledProcessError(1, args)
            if len(args) > 1 and args[0] == PHP and args[1] == 'artisan' and 'migrate' in args:
                args = ['--database=sqlite' if value == '--database=mysql' else value for value in args]
            return original_run(args, **kwargs)
        real_which = shutil.which
        with patch.multiple(module, HOME=self.home, ROOT=self.root, PUBLIC=self.public,
                            ACCOUNT=pwd.getpwuid(os.getuid()).pw_name, MYSQLDUMP=str(self.dump)), \
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
            module.manifest(self.root, module.NEW, 107)
            self.assertTrue((self.work / 'base.sql').exists())
            self.assertTrue((self.work / 'restauration-fichiers-test/geca-backoffice/.env').exists())
            with self.assertRaises(RuntimeError):
                module.install(self.work)
            self.assertFalse((self.root / 'storage/framework/down').exists())
            type(self).baseline = self.work / 'fichiers-avant.tar.gz'
            import sqlite3
            connection = sqlite3.connect(self.root / 'database/test.sqlite')
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM migrations').fetchone()[0], 11)
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM activity_reports').fetchone()[0], 0)
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM activity_report_revisions').fetchone()[0], 0)
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM users').fetchone()[0], 1)
            self.assertEqual(connection.execute('SELECT COUNT(*) FROM content_entries').fetchone()[0], 1)
            connection.close()

    def check_failure(self, expected_manifest, migration_count):
        module.manifest(self.root, expected_manifest, 102 if expected_manifest == module.OLD else 107)
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
        self.check_failure(module.OLD, 10)

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
        self.check_failure(module.OLD, 10)
        for name in module.ADDED:
            self.assertFalse((self.root / name).exists())

    def test_04_failed_migration_never_rolls_back_or_reopens(self):
        with self.flow('migration'), self.assertRaises(subprocess.CalledProcessError):
            module.install(self.current_work)
        self.check_failure(module.NEW, 10)

    def test_05_failed_post_migration_check_keeps_new_tables_and_maintenance(self):
        with self.flow('migrated'), self.assertRaises(subprocess.CalledProcessError):
            module.install(self.current_work)
        self.check_failure(module.NEW, 11)

    def test_06_failed_http_check_closes_the_backoffice_again(self):
        with self.flow('http'), self.assertRaises(subprocess.CalledProcessError):
            module.install(self.current_work)
        self.check_failure(module.NEW, 11)


if __name__ == '__main__':
    unittest.main()
