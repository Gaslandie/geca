import Link from "next/link";
import {
  footerLinks,
  href,
  identity,
  interfaceText,
  routes,
  type Locale,
} from "@/content/site";
import { Container } from "./ui";
import { BrandLogo } from "./BrandLogo";

export function Footer({ locale }: { locale: Locale }) {
  const text = interfaceText[locale];
  function links(paths: string[]) {
    return paths.map((path) => (
      <li key={path}>
        <Link href={href(locale, path)}>
          {routes.find((route) => route.path === path)![locale]}
        </Link>
      </li>
    ));
  }
  return (
    <footer className="site-footer">
      <Container>
        <div className="footer-grid">
          <div className="footer-brand">
            <Link
              href={href(locale)}
              className="brand"
              aria-label={`${identity.name} — ${text.home}`}
            >
              <BrandLogo />
            </Link>
            <p>{text.footerDescription}</p>
            <p className="social-placeholder">{text.socials}</p>
          </div>
          <div>
            <h2>{text.navigation}</h2>
            <ul>{links(footerLinks.discover)}</ul>
          </div>
          <div>
            <h2>{text.resources}</h2>
            <ul>{links(footerLinks.resources)}</ul>
          </div>
          <div className="footer-contact">
            <h2>{text.contact}</h2>
            <address>
              <p>{identity.address[locale]}</p>
              <a href={identity.phoneHref}>{identity.phone}</a>
              <a href={`mailto:${identity.email}`}>{identity.email}</a>
            </address>
            <Link
              className="footer-contact-link"
              href={href(locale, "contact")}
            >
              {text.contact}
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} {identity.name} ({identity.shortName}).{" "}
            {text.rights}
          </p>
          <ul>
            {links(footerLinks.legal)}
            <li><Link href={`${href(locale, "mentions-legales")}#credits-photo`}>{locale === "fr" ? "Crédits photo" : "Photo credits"}</Link></li>
          </ul>
          <p className="footer-credit">{text.footerCredit}</p>
        </div>
      </Container>
    </footer>
  );
}
