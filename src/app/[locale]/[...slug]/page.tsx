import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UnderConstruction } from "@/components/UnderConstruction";
import { isLocale, locales, routes } from "@/content/site";

type Props = { params: Promise<{ locale: string; slug: string[] }> };

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
      locale === "fr"
        ? `${route.fr} — Cette rubrique du site de Global EcoAction est en préparation.`
        : `${route.en} — This section of the Global EcoAction website is being prepared.`,
  };
}

export default async function SectionPage({ params }: Props) {
  const { locale, route } = await resolveRoute(params);
  return <UnderConstruction locale={locale} title={route[locale]} />;
}
