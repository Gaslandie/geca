import Link from "next/link";
import { aboutContent, href, identity, interfaceText, type Locale } from "@/content/site";
import { Button, Container, PhotoPlaceholder, SectionHeading } from "./ui";

export function About({ locale }: { locale: Locale }) {
  const text = aboutContent[locale];
  return (
    <main id="main-content" tabIndex={-1} className="about-page">
      <section className="about-intro" aria-labelledby="about-page-title">
        <Container>
          <nav className="contact-breadcrumb" aria-label={text.breadcrumb}>
            <Link href={href(locale)}>{interfaceText[locale].home}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{text.pageName}</span>
          </nav>
          <div className="about-intro-heading section-heading">
            <div>
              <p className="eyebrow">{text.label}</p>
              <h1 id="about-page-title">{text.title}</h1>
              <p className="section-description">{text.introduction}</p>
            </div>
            <Button href="#notre-histoire" variant="text">{text.explore}</Button>
          </div>
        </Container>
        <div className="about-intro-band">
          <PhotoPlaceholder label={text.photoLabel} photo={text.photo} className="about-landscape" priority sizes="(max-width: 767px) 100vw, (min-width: 1600px) 922px, 62vw" />
          <div className="about-since">
            <p className="eyebrow">{text.sinceLabel}</p>
            <p className="about-year">{identity.since}</p>
            <p>{text.sinceDescription}</p>
            <span className="about-location">{text.location}</span>
          </div>
        </div>
      </section>

      <section id="notre-histoire" className="section about-history" aria-label={text.history.label}>
        <Container>
          <SectionHeading label={text.history.label} title={text.history.title} />
          <div className="about-history-grid">
            <div className="about-prose">
              {text.history.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <aside className="about-conviction" aria-label={text.history.convictionLabel}>
              <p className="eyebrow">{text.history.convictionLabel}</p>
              <p>{text.history.conviction}</p>
            </aside>
          </div>
        </Container>
      </section>

      <section className="section section--tinted" aria-label={text.purpose.label}>
        <Container>
          <SectionHeading label={text.purpose.label} title={text.purpose.title} description={text.purpose.description} />
          <div className="about-purpose-grid">
            <article className="about-purpose-card">
              <p className="eyebrow">{text.purpose.missionLabel}</p>
              <h3>{text.purpose.missionTitle}</h3>
              <p>{text.purpose.mission}</p>
            </article>
            <article className="about-purpose-card about-purpose-card--vision">
              <p className="eyebrow">{text.purpose.visionLabel}</p>
              <h3>{text.purpose.visionTitle}</h3>
              <p>{text.purpose.vision}</p>
            </article>
          </div>
        </Container>
      </section>

      <section className="section about-method" aria-label={text.approach.label}>
        <Container>
          <SectionHeading label={text.approach.label} title={text.approach.title} description={text.approach.description} />
          <div className="about-method-grid">
            <PhotoPlaceholder label={text.approach.photoLabel} photo={text.approach.photo} className="about-method-photo" />
            <ol className="about-steps">
              {text.approach.items.map((item, index) => (
                <li key={item.title}>
                  <span className="about-step-number" aria-hidden="true">0{index + 1}</span>
                  <div><h3>{item.title}</h3><p>{item.description}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className="section section--tinted" aria-label={text.domains.label}>
        <Container>
          <SectionHeading label={text.domains.label} title={text.domains.title} description={text.domains.description} />
          <ul className="about-domain-grid">
            {text.domains.items.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="cta-section about-closing" aria-label={text.closing.label}>
        <Container>
          <SectionHeading label={text.closing.label} title={text.closing.title} description={text.closing.description} />
          <div className="about-closing-actions">
            <Button href={href(locale, "contact")} variant="light">{text.closing.contact}</Button>
            <Button href={href(locale)} variant="text">{text.closing.home}</Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
