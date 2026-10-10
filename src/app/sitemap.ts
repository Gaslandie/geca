import type { MetadataRoute } from "next";
import { locales, routes, href } from "@/content/site";
import { publicOrigin, publicRelease } from "@/lib/deployment";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!publicRelease) return [];
  return locales.flatMap(locale => ["", ...routes.map(route => route.path)].filter(path => path !== "recherche").map(path => ({
    url: `${publicOrigin}${href(locale, path)}/`,
    alternates: { languages: { fr: `${publicOrigin}${href("fr", path)}/`, en: `${publicOrigin}${href("en", path)}/` } },
  })));
}
