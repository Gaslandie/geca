import type { NextConfig } from "next";

const githubPages = process.env.GECA_GITHUB_PAGES === "true";
const basePath = githubPages ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "/geca") : "";
if (basePath !== "" && !/^\/[a-zA-Z0-9_-]+$/.test(basePath)) {
  throw new Error("NEXT_PUBLIC_BASE_PATH doit être vide ou un chemin comme /geca.");
}

const config: NextConfig = {
  ...(githubPages ? { output: "export", trailingSlash: true } : {}),
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  poweredByHeader: false,
  // Aucun hôte distant autorisé pour les images. Photos GECA locales seulement.
  images: { remotePatterns: [], dangerouslyAllowLocalIP: false, unoptimized: githubPages },
  // Pages ne permet pas de définir ces en-têtes HTTP. Le serveur local les conserve.
  ...(!githubPages ? { async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  } } : {}),
};
export default config;
