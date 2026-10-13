import { PageHero } from "./PageHero";
import Link from "next/link";
import { contactContent, contactPhotos, href, identity, interfaceText, pageIntroductions, supportActions, type Locale } from "@/content/site";
import { ContactForm } from "./ContactForm";
import { ContactMap } from "./ContactMap";
import { Container, PageIntroduction, PhotoPlaceholder, SectionHeading } from "./ui";

export function Contact({ locale }: { locale: Locale }) {
  const text = contactContent[locale];
  return (
    <main id="main-content" tabIndex={-1} className="contact-page">
      <PageHero locale={locale} title={text.title} id="contact-title" theme="contact" breadcrumbs={<nav className="contact-breadcrumb" aria-label={text.breadcrumb}>
              <Link href={href(locale)}>{interfaceText[locale].home}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Contact</span>
            </nav>}>

          <div className="section-heading"><div>


          </div></div>
          <PageIntroduction>{pageIntroductions[locale].contact}</PageIntroduction>

      </PageHero>

      <section className="contact-split contact-mail-section" aria-label={text.form.title}>
        <div className="contact-mail-details">
          <h2>{locale === "fr" ? "Nous contacter" : "Contact us"}</h2>
          <p>{text.description}</p>
          <a href={`mailto:${identity.email}`}>{identity.email}</a>
          <a href={supportActions.whatsappHref} rel="noopener noreferrer" referrerPolicy="no-referrer">{identity.phone} · WhatsApp</a>
          <address>{identity.address[locale]}</address>
        </div>
        <ContactForm locale={locale} />
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
