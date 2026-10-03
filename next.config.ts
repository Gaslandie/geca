import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  // Aucun hôte distant autorisé pour les images. Photos GECA locales seulement.
  images: { remotePatterns: [], dangerouslyAllowLocalIP: false },
  async headers() {
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
  },
};
export default config;
