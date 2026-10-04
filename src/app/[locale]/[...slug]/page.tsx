import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UnderConstruction } from "@/components/UnderConstruction";
import { Contact } from "@/components/Contact";
import { About } from "@/components/About";
import { InterventionAreas } from "@/components/InterventionAreas";
import { ProjectPortfolio } from "@/components/ProjectPortfolio";
import { Partnership } from "@/components/Partnership";
import { MissionVisionValues } from "@/components/MissionVisionValues";
import { PhotoCredits } from "@/components/PhotoCredits";
import { aboutContent, contactContent, interventionContent, isLocale, locales, missionVisionContent, partnershipContent, portfolioContent, routes } from "@/content/site";

type Props = { params: Promise<{ locale: string; slug: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    routes.map((route) => ({ locale, slug: route.path.split("/") })),
  );
}

async function resolveRoute(params: Props["params"]) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const route = routes.find((route) => route.path === slug.join("/"));
  if (!route) notFound();
  return { locale, route };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, route } = await resolveRoute(params);
  return {
    title: route[locale],
    description:
      route.path === "contact"
        ? contactContent[locale].metadata
        : route.path === "a-propos"
        ? aboutContent[locale].metadata
        : route.path === "a-propos/domaines-intervention"
        ? interventionContent[locale].metadata
        : route.path === "a-propos/mission-vision-valeurs"
        ? missionVisionContent[locale].mission.summary
        : route.path === "projets"
        ? portfolioContent[locale].metadata
        : route.path === "devenir-partenaire"
        ? partnershipContent[locale].positioning
        : locale === "fr"
        ? `${route.fr} — Cette rubrique du site de Global EcoAction est en préparation.`
        : `${route.en} — This section of the Global EcoAction website is being prepared.`,
  };
}

export default async function SectionPage({ params }: Props) {
  const { locale, route } = await resolveRoute(params);
  if (route.path === "contact") return <Contact locale={locale} />;
  if (route.path === "a-propos") return <About locale={locale} />;
  if (route.path === "a-propos/domaines-intervention") return <InterventionAreas locale={locale} />;
  if (route.path === "a-propos/mission-vision-valeurs") return <MissionVisionValues locale={locale} />;
  if (route.path === "projets") return <ProjectPortfolio locale={locale} />;
  if (route.path === "devenir-partenaire") return <Partnership locale={locale} />;
  if (route.path === "mentions-legales") return <UnderConstruction locale={locale} title={route[locale]}><PhotoCredits locale={locale} /></UnderConstruction>;
  return <UnderConstruction locale={locale} title={route[locale]} />;
}
