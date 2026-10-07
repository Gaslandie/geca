import Link from "next/link";
import { contactContent, contactPhotos, href, identity, interfaceText, pageIntroductions, type Locale } from "@/content/site";
import { ContactForm } from "./ContactForm";
import { ContactMap } from "./ContactMap";
import { Container, PageIntroduction, PhotoPlaceholder, SectionHeading } from "./ui";

export function Contact({ locale }: { locale: Locale }) {
  const text = contactContent[locale];
  return (
    <main id="main-content" tabIndex={-1} className="contact-page">
      <section className="page-hero" aria-labelledby="contact-title">
        <Container>
            <nav className="contact-breadcrumb" aria-label={text.breadcrumb}>
              <Link href={href(locale)}>{interfaceText[locale].home}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Contact</span>
            </nav>
          <div className="section-heading"><div>
            <p className="eyebrow">{text.label}</p>
            <h1 id="contact-title">{text.title}</h1>
          </div></div>
          <PageIntroduction>{pageIntroductions[locale].contact}</PageIntroduction>
        </Container>
      </section>
      <section className="contact-split" aria-label={text.form.title}>
        <div className="contact-introduction">
          <div className="contact-copy">
            <a className="contact-email" href={`mailto:${identity.email}`}>
              {identity.email}
            </a>
          </div>
          <PhotoPlaceholder label={text.landscape} photo={contactPhotos.landscape[locale]} className="contact-landscape" priority />
        </div>
        <ContactForm locale={locale} />
      </section>

      <section className="contact-details" aria-label={text.details}>
        <Container className="contact-details-grid">
          <div className="card-content">
            <p className="contact-detail-label">{text.visit}</p>
            <address>{identity.address[locale]}</address>
          </div>
          <div className="card-content">
            <p className="contact-detail-label">{text.call}</p>
            <a href={identity.phoneHref}>{identity.phone}</a>
          </div>
          <div className="card-content">
            <p className="contact-detail-label">{text.write}</p>
            <a href={`mailto:${identity.email}`}>{identity.email}</a>
          </div>
        </Container>
      </section>

      <ContactMap locale={locale} />

      <section className="contact-closing" aria-label={text.closingTitle}>
        <div className="section">
          <Container>
            <SectionHeading label={text.closingLabel} title={text.closingTitle} description={text.closingDescription} />
          </Container>
        </div>
        <PhotoPlaceholder label={text.forest} photo={contactPhotos.forest[locale]} className="contact-forest" sizes="100vw" />
      </section>
    </main>
  );
}
