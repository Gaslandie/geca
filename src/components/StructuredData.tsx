import { aboutContent, getNewsEntry, identity, interfaceText, interventionContent, missionVisionContent, newsContent, partnershipContent, portfolioContent, routes, teamContent, type Locale } from "@/content/site";
import { publicOrigin, publicRelease } from "@/lib/deployment";
import { serializeJsonLd } from "@/lib/json-ld";

const pageUrl = (locale: Locale, path = "") => `${publicOrigin}/${locale}/${path ? `${path}/` : ""}`;

export function StructuredData({ locale, path = "" }: { locale: Locale; path?: string }) {
  if (!publicRelease || path === "recherche") return null;
  if (!path) {
    const organizationId = `${publicOrigin}/#organization`;
    const data = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": organizationId,
          name: identity.name,
          alternateName: identity.shortName,
          url: `${publicOrigin}/`,
          logo: `${publicOrigin}/images/brand/geca-share-20261010.jpg`,
          email: identity.email,
          telephone: identity.phoneHref.replace("tel:", ""),
          address: {
            "@type": "PostalAddress",
            streetAddress: identity.postalAddress.streetAddress[locale],
            addressLocality: identity.postalAddress.addressLocality,
            addressCountry: identity.postalAddress.addressCountry,
          },
          foundingDate: getNewsEntry(locale, "creation-organisation")?.dateTime,
        },
        {
          "@type": "WebSite",
          "@id": `${publicOrigin}/#website`,
          name: identity.name,
          alternateName: identity.shortName,
          url: `${publicOrigin}/`,
          inLanguage: ["fr", "en"],
          publisher: { "@id": organizationId },
        },
      ],
    };
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
  }
  const route = routes.find((item) => item.path === path);
  if (!route) return null;
  const names: Record<string, string> = {
    "a-propos": aboutContent[locale].pageName,
    "a-propos/domaines-intervention": interventionContent[locale].title,
    "a-propos/mission-vision-valeurs": missionVisionContent[locale].title,
    equipe: teamContent[locale].pageTitle,
    projets: portfolioContent[locale].title,
    "devenir-partenaire": partnershipContent[locale].title,
  };
  const items: { name: string; item: string }[] = [{ name: interfaceText[locale].home, item: pageUrl(locale) }];
  if (path.startsWith("a-propos/") || path === "equipe") {
    items.push({
      name: path === "a-propos/domaines-intervention" ? interventionContent[locale].about : locale === "fr" ? "À propos" : "About",
      item: pageUrl(locale, "a-propos"),
    });
  } else if (path.startsWith("actualites/")) {
    items.push({ name: newsContent[locale].title, item: pageUrl(locale, "actualites") });
  }
  items.push({ name: names[path] ?? route[locale], item: pageUrl(locale, path) });
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${pageUrl(locale, path)}#breadcrumb`,
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
