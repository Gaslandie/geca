import type { Metadata } from "next";
import type { Locale } from "@/content/site";
import { publicOrigin, publicRelease } from "./deployment";

// Seulement la version publique : aucun lien local ni URL provenant d’une requête.
export function sharingMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  if (!publicRelease) return {};
  const image = {
    url: `${publicOrigin}/images/brand/geca-share-20261010.jpg`,
    width: 1600,
    height: 666,
    type: "image/jpeg",
    alt: "Global EcoAction",
  };
  return {
    openGraph: {
      title,
      description,
      url: `${publicOrigin}/${locale}/${path ? `${path}/` : ""}`,
      siteName: "Global EcoAction",
      type: path.startsWith("actualites/") ? "article" : "website",
      locale: locale === "fr" ? "fr_GN" : "en_GB",
      alternateLocale: locale === "fr" ? "en_GB" : "fr_GN",
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
