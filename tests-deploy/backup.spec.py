"""Essais isolés : aucune exécution contre le compte Bluehost ou ses données."""
import getpass
import hashlib
import os
from pathlib import Path
import stat
import subprocess
import tempfile
import unittest


class BackupTest(unittest.TestCase):
    def setUp(self):
        self.workspace = tempfile.TemporaryDirectory(prefix="geca-backup-check-")
        self.parent = Path(self.workspace.name)
        self.source = self.parent / "public_html" / "site-geca"
        self.source.mkdir(parents=True)
        token = self.source / ".well-known" / "acme-challenge" / "test-token"
        token.parent.mkdir(parents=True)
        token.write_bytes(b"JETON_DE_TEST_SANS_SECRET\x00\xff")
        (self.source / "cgi-bin").mkdir()
        (self.source / "avec espaces.txt").write_text("Fichier de test uniquement.\n")
        script = Path("deploy/backup-public.sh").read_text()
        script = script.replace("/home2/fnksrwmy/public_html/website_43934bdf", str(self.source))
        script = script.replace("/home2/fnksrwmy", str(self.parent))
        script = script.replace("'fnksrwmy'", repr(getpass.getuser()))
        self.script = self.parent / "test-backup.sh"
        self.script.write_text(script)

    def tearDown(self):
        self.workspace.cleanup()

    def run_backup(self):
        return subprocess.run(["bash", str(self.script)], text=True, capture_output=True)

    def backups(self):
        return list(self.parent.glob("geca-sauvegarde-*"))

    def test_backup_and_restoration_keep_the_source_and_remain_private(self):
        before = {str(p.relative_to(self.source)): hashlib.sha256(p.read_bytes()).hexdigest()
                  for p in self.source.rglob("*") if p.is_file()}
        source_mode = stat.S_IMODE(self.source.stat().st_mode)
        for _ in range(2):
            result = self.run_backup()
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("restauration testée", result.stdout)
        self.assertEqual(len(self.backups()), 2)
        self.assertEqual(source_mode, stat.S_IMODE(self.source.stat().st_mode))
        for directory in self.backups():
            self.assertEqual(stat.S_IMODE(directory.stat().st_mode), 0o700)
            for name in ["site-avant-publication.tar.gz", "SHA256SUMS.txt"]:
                self.assertEqual(stat.S_IMODE((directory / name).stat().st_mode), 0o600)
            self.assertEqual((directory / "comparaison-source.txt").read_text(), "")
            self.assertEqual((directory / "comparaison-restauration.txt").read_text(), "")
            restored = directory / "restauration-test"
            self.assertEqual(stat.S_IMODE(restored.stat().st_mode), 0o700)
            self.assertEqual(before, {str(p.relative_to(restored)): hashlib.sha256(p.read_bytes()).hexdigest()
                                      for p in restored.rglob("*") if p.is_file()})
        self.assertEqual(before, {str(p.relative_to(self.source)): hashlib.sha256(p.read_bytes()).hexdigest()
                                  for p in self.source.rglob("*") if p.is_file()})

    def test_wrong_account_is_refused_before_writing(self):
        self.script.write_text(self.script.read_text().replace(repr(getpass.getuser()), "'compte-non-autorise'"))
        self.assertNotEqual(self.run_backup().returncode, 0)
        self.assertEqual(self.backups(), [])

    def test_source_alias_is_refused(self):
        alias = self.source.parent / "alias-geca"
        alias.symlink_to(self.source, target_is_directory=True)
        self.script.write_text(self.script.read_text().replace(str(self.source), str(alias)))
        self.assertNotEqual(self.run_backup().returncode, 0)
        self.assertEqual(self.backups(), [])

    def test_link_inside_source_is_refused_without_following_it(self):
        (self.source / "autre-dossier").symlink_to(self.parent, target_is_directory=True)
        self.assertNotEqual(self.run_backup().returncode, 0)
        self.assertEqual(self.backups(), [])

    def test_special_file_is_refused(self):
        os.mkfifo(self.source / "tube")
        self.assertNotEqual(self.run_backup().returncode, 0)
        self.assertEqual(self.backups(), [])


if __name__ == "__main__":
    unittest.main()
