import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { readFile, realpath, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";

// Aperçu local de l'export, sans service d'envoi ni accès aux fichiers du projet.
const publicPreview = process.env.GECA_PUBLIC_PREVIEW === "true";
let directory = "out";
if (publicPreview) {
  const release = JSON.parse(await readFile("release/latest.json", "utf8"));
  const releasesRoot = await realpath(resolve("release"));
  const selected = await realpath(release.files);
  if (!selected.startsWith(`${releasesRoot}${sep}`) || !selected.endsWith(`${sep}files`)) throw new Error("Dossier de livraison invalide.");
  directory = selected;
}
const root = await realpath(resolve(directory));
const basePath = publicPreview ? "" : process.env.NEXT_PUBLIC_BASE_PATH ?? "/geca";
const port = Number(process.env.GECA_PREVIEW_PORT ?? (publicPreview ? 3110 : 3100));
const mime = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json",
  ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml",
  ".jpg": "image/jpeg", ".png": "image/png", ".mp4": "video/mp4",
  ".woff2": "font/woff2", ".ttf": "font/ttf", ".ico": "image/x-icon",
  ".webp": "image/webp", ".xml": "application/xml; charset=utf-8",
};

createServer(async (request, response) => {
  if (publicPreview) {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    response.setHeader("Content-Security-Policy", "object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'");
  }
  try {
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    if (basePath && pathname === basePath) {
      response.writeHead(301, { Location: `${basePath}/` }).end();
      return;
    }
    if (!pathname.startsWith(`${basePath}/`) || pathname.includes("\0") || pathname.split("/").some(part => part.startsWith("."))) throw new Error("Adresse inconnue");
    let file = resolve(root, `.${pathname.slice(basePath.length)}`);
    if (file !== root && !file.startsWith(`${root}${sep}`)) throw new Error("Accès refusé");
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith("/")) {
        response.writeHead(301, { Location: `${pathname}/` }).end();
        return;
      }
      file = resolve(file, "index.html");
    }
    file = await realpath(file);
    if (!file.startsWith(`${root}${sep}`)) throw new Error("Accès refusé");
    if (extname(file) === ".mp4") {
      const { size } = await stat(file);
      let start = 0;
      let end = size - 1;
      const range = request.method === "GET" ? request.headers.range : undefined;
      if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        let valid = Boolean(match && (match[1] || match[2]));
        if (valid) {
          if (!match[1]) {
            const suffix = Number(match[2]);
            valid = Number.isSafeInteger(suffix) && suffix > 0;
            start = Math.max(0, size - suffix);
          } else {
            start = Number(match[1]);
            const last = match[2] ? Number(match[2]) : size - 1;
            valid = Number.isSafeInteger(start) && Number.isSafeInteger(last);
            end = Math.min(last, size - 1);
          }
          valid = valid && start >= 0 && start < size && end >= start;
        }
        if (!valid) {
          response.writeHead(416, { "Content-Range": `bytes */${size}`, "Accept-Ranges": "bytes" }).end();
          return;
        }
      }
      response.writeHead(range ? 206 : 200, {
        "Content-Type": "video/mp4", "Accept-Ranges": "bytes", "Content-Length": end - start + 1,
        ...(range ? { "Content-Range": `bytes ${start}-${end}/${size}` } : {}),
      });
      if (request.method === "HEAD") response.end();
      else {
        const stream = createReadStream(file, { start, end });
        stream.on("error", () => response.destroy());
        response.on("close", () => stream.destroy());
        stream.pipe(response);
      }
      return;
    }
    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": mime[extname(file)] ?? "application/octet-stream" });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    response.end(request.method === "HEAD" ? undefined : await readFile(resolve(root, "404.html")));
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Aperçu ${publicPreview ? "de publication" : "Pages"} : http://127.0.0.1:${port}${basePath}/fr/`);
});
