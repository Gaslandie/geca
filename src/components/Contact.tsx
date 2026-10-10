import Link from "next/link";
import { contactContent, contactPhotos, href, identity, interfaceText, pageIntroductions, supportActions, type Locale } from "@/content/site";
import { ContactForm } from "./ContactForm";
import { ContactMap } from "./ContactMap";
import { Button, Container, PageIntroduction, PhotoPlaceholder, SectionHeading } from "./ui";
import { publicRelease } from "@/lib/deployment";

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
      <section className="contact-split" aria-label={publicRelease ? text.details : text.form.title}>
        <div className="contact-introduction">
          <PhotoPlaceholder locale={locale} label={text.landscape} photo={contactPhotos.landscape[locale]} className="contact-landscape" priority />
        </div>
        {publicRelease ? <div className="contact-form-panel card-content contact-public-actions">
          <h2>{text.details}</h2>
          <div className="button-group">
            <Button href={supportActions.whatsappHref} prefetch={false} referrerPolicy="no-referrer" rel="noopener noreferrer">{supportActions[locale].whatsapp}</Button>
            <Button href={identity.phoneHref} variant="secondary" prefetch={false}>{supportActions[locale].call}</Button>
            <Button href={`mailto:${identity.email}`} variant="text" prefetch={false}>{text.write}</Button>
          </div>
        </div> : <ContactForm locale={locale} />}
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
        <PhotoPlaceholder locale={locale} label={text.forest} photo={contactPhotos.forest[locale]} className="contact-forest" sizes="100vw" />
      </section>
    </main>
  );
}
