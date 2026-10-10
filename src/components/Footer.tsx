import Link from "next/link";
import Image from "next/image";
import {
  footerLinks,
  homeContent,
  href,
  identity,
  interfaceText,
  newsletterContent,
  routes,
  type Locale,
} from "@/content/site";
import { Container } from "./ui";
import { BrandLogo } from "./BrandLogo";
import { assetPath } from "@/lib/assets";
import { publicRelease } from "@/lib/deployment";

export function Footer({ locale }: { locale: Locale }) {
  const text = interfaceText[locale];
  const newsletter = newsletterContent[locale];
  const configuredBase = publicRelease ? undefined : process.env.GECA_GITHUB_PAGES === "true" ? process.env.NEXT_PUBLIC_NEWSLETTER_PUBLIC_URL : process.env.NEXT_PUBLIC_NEWSLETTER_URL;
  let newsletterAction: string | undefined;
  if (configuredBase) {
    const base = new URL(configuredBase);
    if ((process.env.GECA_GITHUB_PAGES === "true" && /^(localhost|127\.|\[::1\])/.test(base.hostname)) || base.username || base.password || base.search || base.hash || !/^\/[a-zA-Z0-9/_-]*$/.test(base.pathname) ||
      (base.protocol !== "https:" && !(base.protocol === "http:" && base.hostname === "127.0.0.1" && process.env.GECA_GITHUB_PAGES !== "true"))) {
      throw new Error("Adresse du formulaire newsletter invalide.");
    }
    newsletterAction = `${base.href.replace(/\/$/, "")}/newsletter/${locale}/commencer`;
  }
  function links(paths: string[]) {
    return paths.map((path) => (
      <li key={path}>
        <Link href={href(locale, path)}>
          {routes.find((route) => route.path === path)![locale]}
        </Link>
      </li>
    ));
  }
  const contactDetails = (
    <div className="footer-contact">
      <h2>{text.contact}</h2>
      <address>
        <p>{identity.address[locale]}</p>
        <a href={identity.phoneHref}>{identity.phone}</a>
        <a href={`mailto:${identity.email}`}>{identity.email}</a>
      </address>
      <Link className="footer-contact-link" href={href(locale, "contact")}>
        {text.contact}
      </Link>
    </div>
  );
  return (
    <footer className={`site-footer${publicRelease ? " footer-public" : ""}`}>
      <Image
        className="footer-background"
        src={assetPath(homeContent.hero.photo.src)}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
      />
      <Container>
        <div className="footer-grid">
          <div className="footer-brand">
            <Link
              href={href(locale)}
              className="brand"
              aria-label={`${identity.name} — ${text.home}`}
            >
              <BrandLogo locale={locale} darkBackground />
            </Link>
            <p>{text.footerDescription}</p>
            {!publicRelease && contactDetails}
          </div>
          <div>
            <h2>{text.navigation}</h2>
            <ul>{links(footerLinks.discover)}</ul>
          </div>
          <div>
            <h2>{text.resources}</h2>
            <ul>{links(footerLinks.resources)}</ul>
          </div>
          {publicRelease && contactDetails}
          {!publicRelease && <section className="footer-newsletter" aria-labelledby="newsletter-title">
            <h2 id="newsletter-title">{newsletter.title}</h2>
            <p className="newsletter-description">{newsletter.description}</p>
            <form className="newsletter-controls" action={newsletterAction} method="post">
              <label className="sr-only" htmlFor="newsletter-email">{newsletter.email}</label>
              <input id="newsletter-email" name="email" type="email" required disabled={!newsletterAction} maxLength={254} autoComplete="email" placeholder="E-mail" />
              <button type={newsletterAction ? "submit" : "button"} disabled={!newsletterAction} className="newsletter-submit" title={newsletter.subscribe}>
                <span className="sr-only">{newsletter.subscribe}</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="M6 18 18 6M6 6h12v12" />
                </svg>
              </button>
            </form>
            {!newsletterAction && <p className="newsletter-availability" role="status">{newsletter.unavailable}</p>}
          </section>}
        </div>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} {identity.name} ({identity.shortName}).{" "}
            {text.rights}
          </p>
          <ul>
            {links(footerLinks.legal)}
            {publicRelease && <li><Link href={href(locale, "mentions-legales#credits-photo")}>{locale === "fr" ? "Crédits photo" : "Photo credits"}</Link></li>}
          </ul>
          <p className="footer-credit">{text.footerCredit}</p>
        </div>
      </Container>
    </footer>
  );
}
