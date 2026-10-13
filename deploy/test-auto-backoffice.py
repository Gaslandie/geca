"""Essais isolés de la réception et des différences ; aucun secret ni serveur réel."""
import contextlib
import copy
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import stat
import tempfile
import unittest
from unittest.mock import patch
import zipfile

HERE = Path(__file__).resolve().parent


def load(name):
    spec = importlib.util.spec_from_file_location(name, HERE / (name + '.py'))
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module


updater = load('update-backoffice')
receiver = load('receive-backoffice')
builder = load('package-backoffice-auto')
installer = load('install-backoffice-connection')
sender = load('send-backoffice')


class Guards(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(); self.addCleanup(temporary.cleanup)
        self.home = Path(temporary.name)
        self.root = self.home / 'geca-backoffice'; self.root.mkdir(mode=0o700)
        self.stage = self.home / 'geca-auto-backoffice-test'; self.stage.mkdir(mode=0o700)
        self.old = {'app/Models/Test.php': hashlib.sha256(b'old').hexdigest(), 'composer.lock': hashlib.sha256(b'locked').hexdigest()}
        for name, data in [('app/Models/Test.php', b'old'), ('composer.lock', b'locked')]:
            path = self.root / name; path.parent.mkdir(parents=True, exist_ok=True); path.write_bytes(data); path.chmod(0o600)
        self.raw = (json.dumps(self.old, indent=2) + '\n').encode()
        (self.root / 'MANIFEST.json').write_bytes(self.raw); (self.root / 'MANIFEST.json').chmod(0o600)
        self.new = dict(self.old); self.new['app/Models/Test.php'] = hashlib.sha256(b'new').hexdigest()
        self.record = {'base': hashlib.sha256(self.raw).hexdigest(), 'manifest': self.new}

    def archive(self, record=None, extra=None):
        files = {'release.json': json.dumps(record or self.record).encode(), 'app/Models/Test.php': b'new'}
        files.update(extra or {})
        path = self.stage / 'livraison.zip'
        with zipfile.ZipFile(path, 'w') as archive:
            for name, data in files.items():
                entry = zipfile.ZipInfo(name); entry.external_attr = (stat.S_IFREG | 0o600) << 16
                archive.writestr(entry, data)
        path.chmod(0o600)

    def receive_stage(self):
        with patch.object(updater, 'ROOT', self.root):
            return updater.stage_archive(self.stage)

    def test_valid_delta_copy_and_restore(self):
        self.archive()
        stage, new = self.receive_stage()
        with patch.object(updater, 'ROOT', self.root):
            before, touched = updater.copy_changes(stage, self.old, new)
            self.assertEqual((self.root / 'app/Models/Test.php').read_bytes(), b'new')
            updater.restore_code(before, touched)
        self.assertEqual((self.root / 'MANIFEST.json').read_bytes(), self.raw)
        self.assertEqual((self.root / 'composer.lock').read_bytes(), b'locked')

    def test_protected_paths_and_traversal_refused(self):
        for name in ['.env', '../outside.php', '/app/a.php', 'app/../a.php', 'vendor/a.php', 'database/migrations/a.php', 'config/session.php', 'public/index.php', 'deploy/script.py', 'resources/views/a.txt']:
            self.assertFalse(updater.allowed(name), name)
            new = dict(self.old); new[name] = '0' * 64
            with self.assertRaises(RuntimeError): updater.validate_delta(self.old, new)

    def test_dependency_change_and_removal_refused(self):
        for candidate in [{}, {**self.new, 'composer.lock': '0' * 64}]:
            with self.assertRaises(RuntimeError): updater.validate_delta(self.old, candidate)

    def test_wrong_base_refused_before_copy(self):
        self.archive({**self.record, 'base': '0' * 64})
        with self.assertRaises(RuntimeError): self.receive_stage()
        self.assertEqual((self.root / 'MANIFEST.json').read_bytes(), self.raw)

    def test_file_digest_refused(self):
        record = copy.deepcopy(self.record); record['manifest']['app/Models/Test.php'] = '0' * 64
        self.archive(record)
        with self.assertRaises(RuntimeError): self.receive_stage()

    def test_addition_accepted_and_rollback_removes_file(self):
        record = copy.deepcopy(self.record); record['manifest']['app/Models/New.php'] = hashlib.sha256(b'added').hexdigest()
        self.archive(record, {'app/Models/New.php': b'added'})
        stage, new = self.receive_stage()
        with patch.object(updater, 'ROOT', self.root):
            before, touched = updater.copy_changes(stage, self.old, new)
            updater.restore_code(before, touched)
        self.assertFalse((self.root / 'app/Models/New.php').exists())

    def test_extra_file_duplicate_symlink_and_bomb_refused(self):
        for kind in ['extra', 'duplicate', 'symlink', 'large']:
            with self.subTest(kind=kind):
                self.archive(extra={'app/Unknown.php': b'x'} if kind == 'extra' else None)
                if kind != 'extra':
                    with zipfile.ZipFile(self.stage / 'livraison.zip', 'a') as archive:
                        entry = zipfile.ZipInfo('app/Models/Test.php' if kind == 'duplicate' else 'app/Other.php')
                        entry.external_attr = ((stat.S_IFLNK if kind == 'symlink' else stat.S_IFREG) | 0o600) << 16
                        archive.writestr(entry, b'x' * 10_000_001 if kind == 'large' else b'x', compress_type=zipfile.ZIP_DEFLATED)
                with self.assertRaises(RuntimeError): self.receive_stage()
                import shutil
                shutil.rmtree(self.stage / 'code-verifie')

    def test_builder_refuses_protected_change(self):
        baseline = self.home / 'baseline.json'; baseline.write_bytes(self.raw)
        (self.root / 'resources/views').mkdir(parents=True)
        (self.root / 'app/Models/Test.php').write_bytes(b'new')
        self.assertEqual(builder.build(baseline, self.root, self.home / 'code.zip'), ['app/Models/Test.php'])
        (self.root / 'composer.lock').write_bytes(b'changed')
        with self.assertRaises(RuntimeError): builder.build(baseline, self.root, self.home / 'code2.zip')

    def test_builder_stops_on_new_migration_or_config_even_without_app_change(self):
        baseline = self.home / 'baseline.json'; baseline.write_bytes(self.raw)
        for name in ['database/migrations/new.php', 'config/new.php', 'bootstrap/new.php']:
            path = self.root / name; path.parent.mkdir(parents=True, exist_ok=True); path.write_bytes(b'protected')
            with self.subTest(name=name), self.assertRaises(RuntimeError):
                builder.build(baseline, self.root, self.home / 'forbidden.zip')
            self.assertFalse((self.home / 'forbidden.zip').exists())
            path.unlink()

    def test_builder_no_change_does_not_create_archive(self):
        baseline = self.home / 'baseline.json'; baseline.write_bytes(self.raw)
        (self.root / 'resources/views').mkdir(parents=True)
        self.assertEqual(builder.build(baseline, self.root, self.home / 'noop.zip'), [])
        self.assertFalse((self.home / 'noop.zip').exists())


class Reception(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(); self.addCleanup(temporary.cleanup)
        self.home = Path(temporary.name); self.tools = self.home / 'geca-deploy-backoffice'; self.tools.mkdir(mode=0o700)
        for name in ['receive-backoffice.py', 'update-backoffice.py', 'check-backoffice.php', 'backup-backoffice.php']:
            path = self.tools / name; path.write_bytes(b'fixture'); path.chmod(0o600)

    def receive(self, command, body=b'test'):
        with patch.multiple(receiver, HOME=self.home, TOOLS=self.tools), patch('getpass.getuser', return_value='fnksrwmy'), patch.dict(os.environ, {'SSH_ORIGINAL_COMMAND': command}), patch.object(receiver.sys, 'stdin', type('Input', (), {'buffer': io.BytesIO(body)})()), patch.object(receiver.subprocess, 'run') as run:
            receiver.main()
            return run

    def test_connection_without_mutation(self):
        self.assertFalse(self.receive('check-backoffice-connection').called)
        self.assertEqual(list(self.home.glob('geca-auto-backoffice-*')), [])

    def test_shell_sftp_injection_wrong_digest_refused(self):
        for command in ['sh', 'sftp', 'deploy-public ' + '0' * 64, 'deploy-backoffice ' + '0' * 64 + ';id', 'deploy-backoffice ' + '0' * 64]:
            with self.subTest(command=command), self.assertRaises(RuntimeError): self.receive(command)

    def test_valid_reception_only_calls_installed_tool(self):
        run = self.receive('deploy-backoffice ' + hashlib.sha256(b'test').hexdigest())
        self.assertEqual(run.call_args.args[0][1], str(self.tools / 'update-backoffice.py'))
        work = Path(run.call_args.args[0][2]); self.assertEqual(work.stat().st_mode & 0o777, 0o700)
        self.assertTrue(all(p.stat().st_mode & 0o777 == 0o600 for p in work.iterdir()))

    def test_tool_symlink_refused(self):
        path = self.tools / 'update-backoffice.py'; path.unlink(); path.symlink_to(self.tools / 'check-backoffice.php')
        with self.assertRaises(RuntimeError): self.receive('check-backoffice-connection')

    def test_concurrent_reception_refused(self):
        import fcntl
        path = self.tools / 'reception.lock'; path.touch(mode=0o600)
        with path.open('wb') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            with self.assertRaises(BlockingIOError): self.receive('deploy-backoffice ' + hashlib.sha256(b'test').hexdigest())


class Setup(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(); self.addCleanup(temporary.cleanup)
        self.home = Path(temporary.name)
        for name in ['.ssh', 'geca-backoffice']: (self.home / name).mkdir(mode=0o700)
        self.previous = b'restrict,command="ancienne-commande" ssh-ed25519 ANCIENNECLE\n'
        (self.home / '.ssh/authorized_keys').write_bytes(self.previous)
        (self.home / '.ssh/authorized_keys').chmod(0o600)
        for name in ['MANIFEST.json', '.env']:
            (self.home / 'geca-backoffice' / name).write_bytes(b'TEST private unchanged')
            (self.home / 'geca-backoffice' / name).chmod(0o600)
        self.payload = {name: b'test tool' for name in installer.NAMES}
        self.public = 'ssh-ed25519 ' + 'A' * 68 + ' geca-backoffice-20261013'

    def install(self):
        with patch.object(installer, 'HOME', self.home), patch('getpass.getuser', return_value='fnksrwmy'):
            installer.install(self.payload, self.public)

    def test_install_backup_and_replay_preserve_other_keys_and_env(self):
        self.install(); first = (self.home / '.ssh/authorized_keys').read_bytes(); self.install()
        self.assertEqual((self.home / '.ssh/authorized_keys').read_bytes(), first)
        self.assertTrue(first.startswith(self.previous)); self.assertIn(b'restrict,command=', first)
        self.assertEqual((self.home / 'geca-backoffice/.env').read_bytes(), b'TEST private unchanged')
        backups = list(self.home.glob('geca-auto-connexion-*/authorized_keys-avant'))
        self.assertEqual(len(backups), 2); self.assertEqual(backups[0].stat().st_mode & 0o777, 0o600)

    def test_other_account_refused(self):
        with patch.object(installer, 'HOME', self.home), patch('getpass.getuser', return_value='other'), self.assertRaises(RuntimeError):
            installer.install(self.payload, self.public)
        self.assertEqual((self.home / '.ssh/authorized_keys').read_bytes(), self.previous)

    def test_unrestricted_duplicate_key_refused(self):
        path = self.home / '.ssh/authorized_keys'; path.write_text(self.public + '\n')
        with self.assertRaises(RuntimeError): self.install()
        self.assertEqual(path.read_text(), self.public + '\n')

    def test_authorized_keys_symlink_refused(self):
        path = self.home / '.ssh/authorized_keys'; path.rename(path.with_name('original')); path.symlink_to(path.with_name('original'))
        with self.assertRaises(RuntimeError): self.install()

    def test_existing_modified_tool_refused(self):
        self.install()
        path = self.home / 'geca-deploy-backoffice/update-backoffice.py'; path.write_bytes(b'changed')
        before = (self.home / '.ssh/authorized_keys').read_bytes()
        with self.assertRaises(RuntimeError): self.install()
        self.assertEqual((self.home / '.ssh/authorized_keys').read_bytes(), before)

    def test_no_private_key_or_environment_in_workflow(self):
        workflow = (HERE.parent / '.github/workflows/bluehost-backoffice.yml').read_text()
        self.assertIn("github.ref == 'refs/heads/main'", workflow)
        self.assertIn('cancel-in-progress: false', workflow)
        self.assertIn('needs: test', workflow)
        self.assertIn('environment: bluehost-production', workflow)
        self.assertNotIn('pull_request_target', workflow)
        self.assertNotIn('StrictHostKeyChecking=no', (HERE / 'send-backoffice.py').read_text())

    def test_sender_refuses_invalid_host_and_missing_settings(self):
        for host in ['', 'server;id', '-oProxyCommand=sh']:
            with patch.dict(os.environ, {'BLUEHOST_SSH_HOST': host}, clear=True), self.assertRaises(RuntimeError): sender.main('connection')


if __name__ == '__main__':
    os.umask(0o077)
    unittest.main()
