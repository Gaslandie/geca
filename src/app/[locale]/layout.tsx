import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteMotion } from "@/components/SiteMotion";
import { homeMetadata, identity, interfaceText, isLocale, locales } from "@/content/site";
import "../globals.css";
import { assetPath } from "@/lib/assets";
import { getSearchDocuments } from "@/content/search";
import { publicOrigin, publicRelease } from "@/lib/deployment";

export const dynamicParams = false;

const sans = localFont({
  src: "../fonts/DMSans.ttf",
  variable: "--font-sans",
  display: "swap",
  weight: "100 900",
});
const display = localFont({
  src: "../fonts/DMSerifDisplay.ttf",
  variable: "--font-display",
  display: "swap",
  weight: "400",
});
const hero = localFont({
  src: "../fonts/UbuntuSans.ttf",
  variable: "--font-hero",
  display: "swap",
  weight: "100 800",
  preload: false,
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return {
    title: {
      default: homeMetadata[locale].title,
      template: "%s | Global EcoAction",
    },
    description: homeMetadata[locale].description,
    applicationName: identity.name,
    robots: { index: publicRelease, follow: publicRelease },
    ...(publicRelease ? { metadataBase: new URL(publicOrigin), alternates: { canonical: `${publicOrigin}/${locale}/`, languages: { fr: `${publicOrigin}/fr/`, en: `${publicOrigin}/en/` } } } : {}),
    referrer: "strict-origin-when-cross-origin",
    icons: { icon: { url: assetPath("/icon.svg?v=geca-client-20261010"), type: "image/svg+xml", sizes: "any" } },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} className={`${sans.variable} ${display.variable} ${hero.variable}`}>
      {(process.env.GECA_GITHUB_PAGES === "true" || publicRelease) && (
        <head>
          <meta httpEquiv="Content-Security-Policy" content="object-src 'none'; base-uri 'self'; form-action 'none'" />
        </head>
      )}
      <body>
        <a className="skip-link" href="#main-content">
          {interfaceText[locale].skip}
        </a>
        <Header locale={locale} searchDocuments={getSearchDocuments(locale)} />
        {children}
        <Footer locale={locale} />
        <SiteMotion />
      </body>
    </html>
  );
}
