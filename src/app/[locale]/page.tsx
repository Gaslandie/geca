import type { Metadata } from "next";
import { StructuredData } from "@/components/StructuredData";
import { sharingMetadata } from "@/lib/sharing";
import { notFound } from "next/navigation";
import { Home } from "@/components/Home";
import { homeMetadata, isLocale } from "@/content/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return { title: { absolute: homeMetadata[locale].title }, description: homeMetadata[locale].description,
    ...sharingMetadata(locale, "", homeMetadata[locale].title, homeMetadata[locale].description),
  };
}
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <><StructuredData locale={locale} /><Home locale={locale} /></>;
}
