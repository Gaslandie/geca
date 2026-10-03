import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { identity, interfaceText, isLocale, locales } from "@/content/site";
import "../globals.css";

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

export const metadata: Metadata = {
  title: {
    default: "Global EcoAction — Agir ensemble en Guinée",
    template: "%s | Global EcoAction",
  },
  description:
    "GECA, ONG guinéenne créée en 2016, agit pour la restauration des écosystèmes, la résilience climatique et le développement communautaire.",
  applicationName: identity.name,
  robots: { index: false, follow: false }, // Maquette locale, pas le site final.
  icons: { icon: "/icon.svg" },
};

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
    <html lang={locale} className={`${sans.variable} ${display.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">
          {interfaceText[locale].skip}
        </a>
        <Header locale={locale} />
        {children}
        <Footer locale={locale} />
      </body>
    </html>
  );
}
