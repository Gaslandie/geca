"""Essais isolés : aucun accès Bluehost, aucun secret réel, aucune base."""
import hashlib
import importlib.util
import io
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import zipfile

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('receiver', HERE / 'receive-public.py')
receiver = importlib.util.module_from_spec(spec)
spec.loader.exec_module(receiver)


class PublicationTest(unittest.TestCase):
    def setUp(self):
        self.work = tempfile.TemporaryDirectory()
        self.addCleanup(self.work.cleanup)
        self.home = Path(self.work.name)
        self.tools = self.home / 'geca-deploy'
        self.tools.mkdir(mode=0o700)
        self.root = self.home / 'public_html' / 'website_43934bdf'
        self.root.mkdir(parents=True, mode=0o750)
        self.root.chmod(0o750)
        (self.root / '.htaccess').write_bytes(b'Protections existantes\n')
        (self.root / 'index.html').write_bytes(b'Ancienne version')
        (self.home / 'geca-backoffice').mkdir(mode=0o700)
        (self.home / 'geca-backoffice' / '.env').write_bytes(b'SECRET=fixture')
        self.before = self.inventory(self.root)
        (self.tools / 'receive-public.py').write_bytes((HERE / 'receive-public.py').read_bytes())
        updater = (HERE / 'update-public.py').read_text().replace(
            "Path('/home2/fnksrwmy/public_html/website_43934bdf')", repr(self.root).replace('PosixPath', 'Path')
        ).replace("Path('/home2/fnksrwmy')", repr(self.home).replace('PosixPath', 'Path'))
        self.updater = updater
        self.save_updater(updater)
        (self.tools / 'receive-public.py').chmod(0o600)

    def save_updater(self, source):
        (self.tools / 'update-public.py').write_text(source)
        (self.tools / 'update-public.py').chmod(0o600)

    def inventory(self, root):
        return {str(p.relative_to(root)): p.read_bytes() for p in root.rglob('*') if p.is_file()}

    def archive(self, extra=None, apache=b'Protections existantes\n'):
        result = io.BytesIO()
        files = {'.htaccess': apache, 'fr/index.html': b'FR nouveau',
                 'en/index.html': b'EN nouveau', 'icon.svg': b'<svg/>',
                 '_next/static/chunks/app/[locale]/[...slug]/page-test.js': b'JS public',
                 'fr/__next.$d$locale.$c$slug.__PAGE__.txt': b'RSC public'}
        files.update(extra or {})
        with zipfile.ZipFile(result, 'w') as zipped:
            for name, body in files.items():
                zipped.writestr(name, body)
        return result.getvalue()

    def receive(self, body, command=None):
        command = command or 'deploy-public ' + hashlib.sha256(body).hexdigest()
        with patch.object(receiver, 'HOME', self.home), patch.object(receiver, 'TOOLS', self.tools), \
             patch('getpass.getuser', return_value='fnksrwmy'), \
             patch.dict(os.environ, {'SSH_ORIGINAL_COMMAND': command}), \
             patch.object(receiver.sys, 'stdin', type('Input', (), {'buffer': io.BytesIO(body)})()):
            receiver.main()

    def unchanged(self):
        self.assertEqual(self.inventory(self.root), self.before)
        self.assertEqual((self.home / 'geca-backoffice' / '.env').read_bytes(), b'SECRET=fixture')

    def test_success_and_private_backup(self):
        self.receive(self.archive())
        self.assertEqual((self.root / 'fr/index.html').read_bytes(), b'FR nouveau')
        backups = list(self.home.glob('geca-mise-a-jour-*/sauvegarde-verifiee'))
        self.assertEqual(len(backups), 1)
        self.assertEqual(self.inventory(backups[0]), self.before)
        self.assertEqual(backups[0].parent.stat().st_mode & 0o777, 0o700)
        self.assertEqual((self.home / 'geca-backoffice' / '.env').read_bytes(), b'SECRET=fixture')

    def test_commands_refused(self):
        for command in ['sh', 'scp -t /tmp', 'deploy-public ' + '0' * 64 + '; id', '']:
            with self.subTest(command=command), self.assertRaises(RuntimeError):
                self.receive(self.archive(), command=command if command else ' ')
            self.unchanged()

    def test_digest_refused(self):
        with self.assertRaises(RuntimeError):
            self.receive(self.archive(), 'deploy-public ' + '0' * 64)
        self.unchanged()

    def test_private_and_executable_paths_refused(self):
        for path in ['fr/shell.php', 'fr/.env', 'fr/../index.html',
                     '../outside.html', '/fr/index.html', 'geca-backoffice/file.html']:
            with self.subTest(path=path), self.assertRaises(RuntimeError):
                self.receive(self.archive({path: b'interdit'}))
            self.unchanged()

    def test_apache_changes_refused(self):
        with self.assertRaises(RuntimeError):
            self.receive(self.archive(apache=b'Protections supprimees'))
        self.unchanged()

    def test_private_tool_symlink_refused(self):
        (self.tools / 'update-public.py').unlink()
        (self.tools / 'update-public.py').symlink_to(HERE / 'update-public.py')
        with self.assertRaises(RuntimeError):
            self.receive(self.archive())
        self.unchanged()

    def test_failure_restores_files(self):
        self.save_updater(self.updater.replace(
            "os.replace(stage / '.htaccess', ROOT / '.htaccess')", "raise RuntimeError('Erreur simulee')"))
        with self.assertRaises(RuntimeError):
            self.receive(self.archive())
        self.unchanged()

    def test_lock_refuses_parallel_publication(self):
        import fcntl
        with (self.tools / 'publication.lock').open('wb') as lock:
            (self.tools / 'publication.lock').chmod(0o600)
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            with self.assertRaises(BlockingIOError):
                self.receive(self.archive())
        self.unchanged()


if __name__ == '__main__':
    unittest.main()
