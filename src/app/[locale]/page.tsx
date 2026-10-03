import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Home } from "@/components/Home";
import { UnderConstruction } from "@/components/UnderConstruction";
import { isLocale } from "@/content/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en"
    ? {
        title: "English content in preparation",
        description:
          "Global EcoAction — a Guinean NGO working for ecosystems and communities. English content is being prepared.",
      }
    : { title: { absolute: "Global EcoAction — Agir ensemble en Guinée" } };
}
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale === "fr" ? (
    <Home />
  ) : (
    <UnderConstruction locale={locale} title="English homepage" />
  );
}
