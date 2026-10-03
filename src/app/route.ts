import { assetPath } from "@/lib/assets";

export const dynamic = "force-static";

export function GET() {
  if (process.env.GECA_GITHUB_PAGES !== "true") {
    return new Response(null, { status: 307, headers: { Location: "/fr" } });
  }
  // Pages ne dispose pas de redirection serveur. Le lien fonctionne aussi sans JS.
  const home = assetPath("/fr/");
  return new Response(
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url=${home}"><title>Global EcoAction</title></head><body><a href="${home}">Global EcoAction</a></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
