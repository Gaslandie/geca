import type { MetadataRoute } from "next";
import { publicOrigin, publicRelease } from "@/lib/deployment";

export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return publicRelease
    ? { rules: { userAgent: "*", allow: "/", disallow: ["/administration", "/connexion", "/newsletter", "/api/"] }, sitemap: `${publicOrigin}/sitemap.xml` }
    : { rules: { userAgent: "*", disallow: "/" } };
}
