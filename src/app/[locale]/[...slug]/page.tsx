import { Support } from "@/components/Support";
import type { Metadata } from "next";
import { StructuredData } from "@/components/StructuredData";
import { sharingMetadata } from "@/lib/sharing";
import { notFound } from "next/navigation";
import { UnderConstruction } from "@/components/UnderConstruction";
import { Contact } from "@/components/Contact";
import { About } from "@/components/About";
import { InterventionAreas } from "@/components/InterventionAreas";
import { ProjectPortfolio } from "@/components/ProjectPortfolio";
import { Partnership } from "@/components/Partnership";
import { MissionVisionValues } from "@/components/MissionVisionValues";
import { News } from "@/components/News";
import { NewsArticle } from "@/components/NewsArticle";
import { TeamPage } from "@/components/Team";
import { SiteInformation } from "@/components/SiteInformation";
import { publicOrigin, publicRelease } from "@/lib/deployment";
import { getNewsEntry, newsContent, seoSummaries, aboutContent, contactContent, interventionContent, isLocale, locales, missionVisionContent, pageIntroductions, partnershipContent, portfolioContent, routes } from "@/content/site";

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
  const entry = route.path.startsWith("actualites/") ? getNewsEntry(locale, route.path.slice("actualites/".length)) : undefined;
  const metadata: Metadata = {
    title: seoSummaries[locale][route.path]?.title ?? route[locale],
    robots: { index: publicRelease && route.path !== "recherche", follow: publicRelease },
    ...(publicRelease ? { alternates: { canonical: `${publicOrigin}/${locale}/${route.path}/`, languages: { fr: `${publicOrigin}/fr/${route.path}/`, en: `${publicOrigin}/en/${route.path}/` } } } : {}),
    description: seoSummaries[locale][route.path]?.description ?? (entry ? entry.description.split("\n\n")[0] : route.path === "actualites"
        ? newsContent[locale].introduction
        : route.path === "contact"
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
        : pageIntroductions[locale][route.path as keyof typeof pageIntroductions.fr] ?? `${route[locale]} — Global EcoAction`),
  };
  return { ...metadata, ...sharingMetadata(locale, route.path, `${seoSummaries[locale][route.path]?.title ?? route[locale]} | Global EcoAction`, metadata.description ?? "") };
}

function SectionContent({ locale, route }: Awaited<ReturnType<typeof resolveRoute>>) {
  if (publicRelease && (route.path === "mentions-legales" || route.path === "confidentialite" || route.path === "plan-du-site")) return <SiteInformation locale={locale} path={route.path} title={route[locale]} />;
  if (route.path === "nous-soutenir") return <Support locale={locale} title={route[locale]} />;
  if (route.path === "actualites") return <News locale={locale} />;
  if (route.path.startsWith("actualites/")) {
    const entry = getNewsEntry(locale, route.path.slice("actualites/".length));
    if (!entry) notFound();
    return <NewsArticle locale={locale} entry={entry} />;
  }
  if (route.path === "equipe") return <TeamPage locale={locale} />;
  if (route.path === "contact") return <Contact locale={locale} />;
  if (route.path === "a-propos") return <About locale={locale} />;
  if (route.path === "a-propos/domaines-intervention") return <InterventionAreas locale={locale} />;
  if (route.path === "a-propos/mission-vision-valeurs") return <MissionVisionValues locale={locale} />;
  if (route.path === "projets") return <ProjectPortfolio locale={locale} />;
  if (route.path === "devenir-partenaire") return <Partnership locale={locale} />;
  const introduction = pageIntroductions[locale][route.path as keyof typeof pageIntroductions.fr];
  return <UnderConstruction path={route.path} locale={locale} title={route[locale]} introduction={introduction} />;
}

export default async function SectionPage({ params }: Props) {
  const { locale, route } = await resolveRoute(params);
  return <><StructuredData locale={locale} path={route.path} /><SectionContent locale={locale} route={route} /></>;
}
