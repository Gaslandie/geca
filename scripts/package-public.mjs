import { readFile, realpath, readdir, lstat } from "node:fs/promises";
import { join, sep } from "node:path";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";

const root = await realpath("release");
const selected = JSON.parse(await readFile("release/latest.json", "utf8"));
const directory = await realpath(selected.directory);
const files = await realpath(selected.files);
if (!directory.startsWith(`${root}${sep}`) || files !== join(directory, "files")) throw new Error("Dossier public invalide.");
const manifestBody = await readFile(join(directory, "manifest.json"));
const validation = JSON.parse(await readFile(join(directory, "validation.json"), "utf8"));
if (validation.manifestHash !== createHash("sha256").update(manifestBody).digest("hex")) throw new Error("Reprendre les tests de cette livraison.");
const manifest = JSON.parse(manifestBody);
const expected = new Set(manifest.files.map(entry => entry.path));
async function inspect(folder, prefix = "") {
  const found = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Error("Lien symbolique refusé.");
    if (entry.isDirectory()) found.push(...await inspect(join(folder, entry.name), path));
    else if (entry.isFile()) found.push(path);
    else throw new Error("Type de fichier refusé.");
  }
  return found;
}
const actual = await inspect(files);
if (actual.length !== expected.size || actual.some(path => !expected.has(path))) throw new Error("Fichiers ajoutés ou manquants : reprendre la compilation.");
for (const entry of manifest.files) {
  if (entry.path.startsWith("/") || entry.path.split("/").some(part => part === "..")) throw new Error("Chemin refusé.");
  const path = join(files, entry.path);
  if ((await lstat(path)).isSymbolicLink()) throw new Error("Lien symbolique refusé.");
  const body = await readFile(path);
  if (body.length !== entry.bytes || createHash("sha256").update(body).digest("hex") !== entry.sha256) throw new Error(`Fichier modifié depuis la compilation : ${entry.path}`);
}
const archive = join(directory, "geca-site-public.zip");
const python = `import json, pathlib, sys, zipfile, hashlib
root, target, manifest_path = map(pathlib.Path, sys.argv[1:])
entries = json.loads(manifest_path.read_text())["files"]
with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for entry in entries: z.write(root / entry["path"], entry["path"])
with zipfile.ZipFile(target) as z:
    if z.testzip() is not None: raise RuntimeError("Archive corrompue")
    for entry in entries:
        if hashlib.sha256(z.read(entry["path"])).hexdigest() != entry["sha256"]: raise RuntimeError("Archive différente du manifeste")
print("Archive vérifiée :", target)
print("SHA256 :", hashlib.sha256(target.read_bytes()).hexdigest())
`;
await new Promise((done, fail) => {
  const child = spawn("python3", ["-c", python, files, archive, join(directory, "manifest.json")], { stdio: "inherit" });
  child.once("error", fail);
  child.once("close", code => code === 0 ? done() : fail(new Error(`Création de l’archive : code ${code}`)));
});
