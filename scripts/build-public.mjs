import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, symlink, writeFile, rename } from "node:fs/promises";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";

const project = resolve(import.meta.dirname, "..");
const work = await mkdtemp(join(tmpdir(), "geca-public-build-"));
const releaseRoot = join(project, "release");
await mkdir(releaseRoot, { recursive: true });
// Un dossier neuf à chaque build : aucune ancienne livraison écrasée.
const release = await mkdtemp(join(releaseRoot, "geca-public-"));
const files = join(release, "files");
const run = (command, args, options) => new Promise((done, fail) => {
  const child = spawn(command, args, { stdio: "inherit", ...options });
  child.once("error", fail);
  child.once("close", code => code === 0 ? done() : fail(new Error(`${command} : code ${code}`)));
});
async function walk(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Lien symbolique refusé : ${relative}`);
    if (entry.isDirectory()) paths.push(...await walk(join(directory, entry.name), relative));
    else if (entry.isFile()) paths.push(relative);
    else throw new Error(`Type de fichier refusé : ${relative}`);
  }
  return paths.sort();
}
try {
  // Copie fermée : pas de .env, back-office, comptes, sauvegardes ou documents client.
  for (const entry of ["src", "package.json", "package-lock.json", "next.config.ts", "tsconfig.json", "postcss.config.mjs"]) {
    await cp(join(project, entry), join(work, entry), { recursive: true });
  }
  await symlink(join(project, "node_modules"), join(work, "node_modules"), "dir");
  await mkdir(join(work, "public", "images", "optimized"), { recursive: true });
  await cp(join(project, "public", "icon.svg"), join(work, "public", "icon.svg"));
  const clientLogo = "images/brand/global-ecoaction-logo-client-transparent-20261010.webp";
  await mkdir(join(work, "public", "images", "brand"), { recursive: true });
  await cp(join(project, "public", clientLogo), join(work, "public", clientLogo));
  const variants = JSON.parse(await readFile(join(project, "src", "content", "image-variants.json"), "utf8"));
  const permitted = new Set(Object.values(variants).flatMap(items => items.map(item => item.src)));
  for (const src of permitted) {
    if (!/^\/images\/optimized\/[a-zA-Z0-9_.-]+\.webp$/.test(src)) throw new Error("Média hors registre autorisé.");
    await cp(join(project, "public", src.slice(1)), join(work, "public", src.slice(1)));
  }
  await run(process.execPath, [join(project, "node_modules", "next", "dist", "bin", "next"), "build", "--webpack"], {
    cwd: work,
    env: { ...process.env, GECA_PUBLIC_RELEASE: "true", GECA_GITHUB_PAGES: "false", NEXT_PUBLIC_BASE_PATH: "", NEXT_TELEMETRY_DISABLED: "1" },
  });
  await cp(join(work, "out"), files, { recursive: true });
  await rename(join(files, "index"), join(files, "index.html"));
  await cp(join(project, "deploy", "public.htaccess"), join(files, ".htaccess"));
  const manifest = [];
  for (const path of await walk(files)) {
    if (path !== ".htaccess" && path !== "images/brand/global-ecoaction-logo-client-transparent-20261010.webp" && (path.split("/").some(part => part.startsWith(".")) || !/^(?:_next\/static\/|images\/optimized\/|(?:fr|en|404|_not-found)\/|(?:index|404|_not-found)\.(?:html|txt)$|(?:robots\.txt|sitemap\.xml|icon\.svg)$)/.test(path) || !/\.(?:html|txt|xml|js|css|svg|webp|ttf|woff2?|ico|json)$/.test(path))) {
      throw new Error(`Fichier hors périmètre public : ${path}`);
    }
    if (/\.(?:php|phar|sqlite|sql|log|bak|zip|gz|map)$/.test(path)) throw new Error(`Fichier privé/interdit : ${path}`);
    const body = await readFile(join(files, path));
    if (/\.(?:html|js|txt|xml)$/.test(path) && /(?:https?:\/\/)?(?:127\.0\.0\.1|localhost):(?:3000|8000)|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY|APP_KEY=|DB_PASSWORD=/.test(body.toString("utf8"))) {
      throw new Error(`Adresse locale ou secret détecté : ${path}`);
    }
    manifest.push({ path, bytes: (await stat(join(files, path))).size, sha256: createHash("sha256").update(body).digest("hex") });
  }
  await writeFile(join(release, "manifest.json"), JSON.stringify({ createdAt: new Date().toISOString(), origin: "https://globalecoaction.org", files: manifest }, null, 2) + "\n");
  await writeFile(join(releaseRoot, "latest.json"), JSON.stringify({ directory: release, files }, null, 2) + "\n");
  console.log(`Version publique préparée : ${files}`);
  console.log("Tester cette version avant de créer l’archive de livraison.");
} catch (error) {
  // Seul le dossier neuf créé par cet appel est retiré en cas d’échec.
  await rm(release, { recursive: true, force: true });
  throw error;
} finally {
  await rm(work, { recursive: true, force: true });
}
