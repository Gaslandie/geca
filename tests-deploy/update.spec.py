"""Fixtures isolées : aucune modification du site Bluehost."""
import getpass
import hashlib
import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import zipfile

spec = importlib.util.spec_from_file_location('geca_update', 'deploy/update-public.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class UpdateTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.home = Path(self.temp.name)
        self.root = self.home / 'site'
        self.root.mkdir(mode=0o750)
        for name, body in {'.htaccess': 'protection avant', 'index.html': 'avant',
                           '.well-known/token': 'certificat', 'cgi-bin/test': 'conservé'}.items():
            path = self.root / name
            path.parent.mkdir(exist_ok=True)
            path.write_text(body)
        self.archive = self.home / 'site.zip'
        self.entries = {'.htaccess': 'protection après', 'index.html': 'après',
                        'fr/index.html': 'fr', 'en/index.html': 'en', 'icon.svg': '<svg/>'}
        self.zip()
        self.settings = patch.multiple(module, ROOT=self.root, HOME=self.home, ACCOUNT=getpass.getuser())
        self.settings.start()
        self.before = module.inventory(self.root)

    def tearDown(self):
        self.settings.stop()
        self.temp.cleanup()

    def zip(self):
        with zipfile.ZipFile(self.archive, 'w') as zipped:
            for name, body in self.entries.items():
                zipped.writestr(name, body)
        self.digest = hashlib.sha256(self.archive.read_bytes()).hexdigest()

    def refused(self):
        with self.assertRaises(RuntimeError):
            module.update(self.archive, self.digest)
        self.assertEqual(module.inventory(self.root), self.before)

    def test_success_backup_and_preserved_directories(self):
        module.update(self.archive, self.digest)
        self.assertEqual((self.root / 'index.html').read_text(), 'après')
        self.assertEqual((self.root / '.well-known/token').read_text(), 'certificat')
        self.assertEqual(self.root.stat().st_mode & 0o777, 0o750)
        backup = next(self.home.glob('geca-mise-a-jour-*/sauvegarde-verifiee'))
        self.assertEqual(module.inventory(backup), self.before)
        self.assertEqual(backup.parent.stat().st_mode & 0o777, 0o700)
        self.assertEqual((self.root / 'fr/index.html').stat().st_mode & 0o777, 0o644)

    def test_wrong_hash(self):
        self.digest = '0' * 64
        self.refused()

    def test_unknown_existing_file(self):
        (self.root / 'autre-site.php').write_text('préservé')
        self.before = module.inventory(self.root)
        self.refused()

    def test_traversal_archive(self):
        self.entries['fr/../../escape'] = 'refusé'
        self.zip()
        self.refused()

    def test_existing_symlink(self):
        (self.root / 'images').symlink_to(self.home)
        with self.assertRaises(RuntimeError):
            module.update(self.archive, self.digest)
        self.assertTrue((self.root / 'images').is_symlink())
        self.assertEqual((self.root / 'index.html').read_text(), 'avant')

    def test_error_restores_old_site(self):
        replace = module.os.replace
        def fail_once(source, destination):
            if Path(source).parent.name == 'nouveau':
                raise OSError('Échec simulé avant remplacement Apache')
            return replace(source, destination)
        with patch.object(module.os, 'replace', side_effect=fail_once):
            with self.assertRaises(OSError):
                module.update(self.archive, self.digest)
        self.assertEqual(module.inventory(self.root), self.before)


if __name__ == '__main__':
    unittest.main()
