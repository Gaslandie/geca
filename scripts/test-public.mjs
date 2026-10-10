import { readFile, writeFile, realpath, rm } from "node:fs/promises";
import { resolve, sep, join } from "node:path";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";

const releaseRoot = await realpath("release");
const selected = JSON.parse(await readFile("release/latest.json", "utf8"));
const directory = await realpath(selected.directory);
if (!directory.startsWith(`${releaseRoot}${sep}`)) throw new Error("Livraison invalide.");
const digest = () => readFile(join(directory, "manifest.json")).then(body => createHash("sha256").update(body).digest("hex"));
const manifestHash = await digest();
await rm(join(directory, "validation.json"), { force: true });
await new Promise((done, fail) => {
  const child = spawn(process.execPath, [resolve("node_modules/@playwright/test/cli.js"), "test", "--config", "playwright.public.config.ts"], { stdio: "inherit" });
  child.once("error", fail);
  child.once("close", code => code === 0 ? done() : fail(new Error(`Tests publics : code ${code}`)));
});
const current = JSON.parse(await readFile("release/latest.json", "utf8"));
if (await realpath(current.directory) !== directory || await digest() !== manifestHash) throw new Error("La livraison a changé pendant les tests.");
await writeFile(join(directory, "validation.json"), JSON.stringify({ passedAt: new Date().toISOString(), manifestHash, suite: "playwright.public.config.ts", note: "Essais locaux, directives Apache et Bluehost à vérifier séparément." }, null, 2) + "\n");
console.log("Essais publics réussis pour cette livraison.");
