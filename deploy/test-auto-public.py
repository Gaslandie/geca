"""Essais isolés : aucun accès Bluehost, aucun secret réel, aucune base."""
import hashlib
import importlib.util
import io
import os
from pathlib import Path
import tempfile
import subprocess
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
                     '../outside.html', '/fr/index.html', 'geca-backoffice/file.html',
                     'images/brand/inconnu.jpg', 'inconnu.png',
                     'videos/inconnu.mp4', 'videos/geca-projets-20261015-5.mp4',
                     'videos/geca-projets-20261015-1.php', 'videos/geca-presentation-20261015.php',
                     'videos/../geca-presentation-20261015.mp4']:
            with self.subTest(path=path), self.assertRaises(RuntimeError):
                self.receive(self.archive({path: b'interdit'}))
            self.unchanged()

    def test_exact_share_image_and_favicon_allowed(self):
        self.receive(self.archive({'icon.png': b'favicon public',
                                   'images/brand/geca-share-20261010.jpg': b'image publique'}))
        self.assertEqual((self.root / 'icon.png').read_bytes(), b'favicon public')
        self.assertEqual((self.root / 'images/brand/geca-share-20261010.jpg').read_bytes(), b'image publique')
        self.assertEqual((self.home / 'geca-backoffice' / '.env').read_bytes(), b'SECRET=fixture')

    def test_exact_presentation_video_allowed(self):
        files = {'videos/geca-presentation-20261015.mp4': b'video publique',
                 'videos/geca-presentation-20261015.webp': b'affiche publique'}
        self.receive(self.archive(files))
        for name, body in files.items():
            self.assertEqual((self.root / name).read_bytes(), body)
        self.assertEqual((self.home / 'geca-backoffice' / '.env').read_bytes(), b'SECRET=fixture')

    def test_exact_project_videos_allowed(self):
        files = {f'videos/geca-projets-20261015-{i}.{ext}': b'media public'
                 for i in range(1, 5) for ext in ('mp4', 'webp')}
        self.receive(self.archive(files))
        for name, body in files.items():
            self.assertEqual((self.root / name).read_bytes(), body)
        self.assertEqual((self.home / 'geca-backoffice' / '.env').read_bytes(), b'SECRET=fixture')

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


spec = importlib.util.spec_from_file_location('upgrade', HERE / 'upgrade-public-delivery.py')
upgrade = importlib.util.module_from_spec(spec)
spec.loader.exec_module(upgrade)


class UpgradeTest(unittest.TestCase):
    def setUp(self):
        self.work = tempfile.TemporaryDirectory()
        self.addCleanup(self.work.cleanup)
        self.home = Path(self.work.name)
        self.tools = self.home / 'geca-deploy'
        self.tools.mkdir(mode=0o700)
        self.root = self.home / 'public_html' / 'website_43934bdf'
        self.root.mkdir(parents=True, mode=0o750)
        self.root.chmod(0o750)
        self.payload = {}
        self.before = {}
        for name in upgrade.NEW:
            source = 'public.htaccess' if name == '.htaccess' else name
            old = subprocess.check_output(['git', 'show', f'fe85aa1:deploy/{source}'], cwd=HERE.parent)
            if name == '.htaccess':
                old = old.replace(b'RewriteRule ^$ /fr/ [R=302,L]', b'RewriteRule ^$ /fr/ [R=301,L]')
            self.assertEqual(upgrade.digest(old), upgrade.OLD[name])
            path = (self.root if name == '.htaccess' else self.tools) / name
            path.write_bytes(old)
            path.chmod(0o644 if name == '.htaccess' else 0o600)
            self.before[name] = old
            self.payload[name] = (HERE / source).read_bytes()
        self.patches = [patch.object(upgrade, 'HOME', self.home),
                        patch.object(upgrade, 'ROOT', self.root),
                        patch.object(upgrade, 'TOOLS', self.tools),
                        patch('getpass.getuser', return_value='fnksrwmy')]
        for context in self.patches:
            context.start()
            self.addCleanup(context.stop)

    def contents(self):
        return {name: ((self.root if name == '.htaccess' else self.tools) / name).read_bytes()
                for name in upgrade.NEW}

    def test_upgrade_and_idempotence(self):
        upgrade.upgrade(self.payload)
        self.assertEqual(self.contents(), self.payload)
        backup = list(self.home.glob('geca-outils-sauvegarde-*'))
        self.assertEqual(len(backup), 1)
        self.assertEqual(backup[0].stat().st_mode & 0o777, 0o700)
        for name in self.before:
            self.assertEqual((backup[0] / name).read_bytes(), self.before[name])
            self.assertEqual((backup[0] / name).stat().st_mode & 0o777, 0o600)
        upgrade.upgrade(self.payload)
        self.assertEqual(len(list(self.home.glob('geca-outils-sauvegarde-*'))), 1)

    def test_wrong_account_refused(self):
        with patch('getpass.getuser', return_value='autre'), self.assertRaises(RuntimeError):
            upgrade.upgrade(self.payload)
        self.assertEqual(self.contents(), self.before)

    def test_complete_previous_version_allowed(self):
        for name in upgrade.PREVIOUS:
            source = 'public.htaccess' if name == '.htaccess' else name
            body = subprocess.check_output([
                'git', 'show', f'417afbbd4405d90b9da3e6cc2d530e8f91f61657:deploy/{source}'
            ], cwd=HERE.parent)
            self.assertEqual(upgrade.digest(body), upgrade.PREVIOUS[name])
            ((self.root if name == '.htaccess' else self.tools) / name).write_bytes(body)
        upgrade.upgrade(self.payload)
        self.assertEqual(self.contents(), self.payload)

    def test_complete_home_video_version_allowed(self):
        for name in upgrade.PREVIOUS_HOME_VIDEO:
            source = 'public.htaccess' if name == '.htaccess' else name
            body = subprocess.check_output([
                'git', 'show', f'd8a576d5ae3ca858b564c482daa989d770b3564d:deploy/{source}'
            ], cwd=HERE.parent)
            self.assertEqual(upgrade.digest(body), upgrade.PREVIOUS_HOME_VIDEO[name])
            ((self.root if name == '.htaccess' else self.tools) / name).write_bytes(body)
        upgrade.upgrade(self.payload)
        self.assertEqual(self.contents(), self.payload)

    def test_modified_source_refused(self):
        self.payload['receive-public.py'] += b'\n# modification'
        with self.assertRaises(RuntimeError):
            upgrade.upgrade(self.payload)
        self.assertEqual(self.contents(), self.before)

    def test_unknown_apache_refused(self):
        (self.root / '.htaccess').write_bytes(b'Configuration inconnue')
        before = self.contents()
        with self.assertRaises(RuntimeError):
            upgrade.upgrade(self.payload)
        self.assertEqual(self.contents(), before)

    def test_partially_updated_tools_refused(self):
        (self.tools / 'receive-public.py').write_bytes(self.payload['receive-public.py'])
        before = self.contents()
        with self.assertRaises(RuntimeError):
            upgrade.upgrade(self.payload)
        self.assertEqual(self.contents(), before)

    def test_wrong_permissions_refused(self):
        (self.tools / 'receive-public.py').chmod(0o644)
        with self.assertRaises(RuntimeError):
            upgrade.upgrade(self.payload)
        self.assertEqual(self.contents(), self.before)

    def test_symlink_refused(self):
        apache = self.root / '.htaccess'
        apache.unlink()
        other = self.home / 'autre'
        other.write_bytes(self.before['.htaccess'])
        apache.symlink_to(other)
        with self.assertRaises(RuntimeError):
            upgrade.upgrade(self.payload)
        self.assertEqual(other.read_bytes(), self.before['.htaccess'])

    def test_copy_failure_restores_three_files(self):
        replace = upgrade.replace
        def fail(path, body, mode):
            if path.name == '.htaccess' and body == self.payload['.htaccess']:
                raise RuntimeError('Erreur simulée')
            replace(path, body, mode)
        with patch.object(upgrade, 'replace', side_effect=fail), self.assertRaises(RuntimeError):
            upgrade.upgrade(self.payload)
        self.assertEqual(self.contents(), self.before)


if __name__ == '__main__':
    unittest.main()
