import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";

// Aperçu local de l'export, sans service d'envoi ni accès aux fichiers du projet.
const root = await realpath(resolve("out"));
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/geca";
const port = Number(process.env.GECA_PREVIEW_PORT ?? 3100);
const mime = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json",
  ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml",
  ".jpg": "image/jpeg", ".png": "image/png", ".mp4": "video/mp4",
  ".woff2": "font/woff2", ".ttf": "font/ttf", ".ico": "image/x-icon",
};

createServer(async (request, response) => {
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
    if (!pathname.startsWith(`${basePath}/`) || pathname.includes("\0")) throw new Error("Adresse inconnue");
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
    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": mime[extname(file)] ?? "application/octet-stream" });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    response.end(request.method === "HEAD" ? undefined : await readFile(resolve(root, "404.html")));
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Aperçu Pages : http://127.0.0.1:${port}${basePath}/fr/`);
});
