import type { NextConfig } from "next";

const githubPages = process.env.GECA_GITHUB_PAGES === "true";
const publicRelease = process.env.GECA_PUBLIC_RELEASE === "true";
if (githubPages && publicRelease) throw new Error("Choisir un seul mode de publication.");
const staticExport = githubPages || publicRelease;
const basePath = githubPages ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "/geca") : "";
if (basePath !== "" && !/^\/[a-zA-Z0-9_-]+$/.test(basePath)) {
  throw new Error("NEXT_PUBLIC_BASE_PATH doit être vide ou un chemin comme /geca.");
}

const config: NextConfig = {
  ...(staticExport ? { output: "export", trailingSlash: true } : {}),
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath, GECA_PUBLIC_RELEASE: publicRelease ? "true" : "false" },
  poweredByHeader: false,
  // Mêmes petits fichiers locaux sur Pages et en local, sans traitement à la demande.
  images: {
    remotePatterns: [], dangerouslyAllowLocalIP: false,
    loader: "custom", loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [320, 480, 640, 960, 1280, 1600], imageSizes: [192],
  },
  // Pages ne permet pas de définir ces en-têtes HTTP. Le serveur local les conserve.
  ...(!staticExport ? { async headers() {
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
