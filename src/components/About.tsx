import Link from "next/link";
import { aboutContent, href, identity, interfaceText, pageIntroductions, type Locale } from "@/content/site";
import { Button, Container, PageIntroduction, PhotoPlaceholder, SectionHeading } from "./ui";

export function About({ locale }: { locale: Locale }) {
  const text = aboutContent[locale];
  return (
    <main id="main-content" tabIndex={-1} className="about-page">
      <section className="about-intro page-hero" aria-labelledby="about-page-title">
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
            </div>
          </div>
          <PageIntroduction>{pageIntroductions[locale]["a-propos"]}</PageIntroduction>
          <div className="page-hero-actions"><Button href="#notre-histoire" variant="text">{text.explore}</Button></div>
        </Container>
        <div className="about-intro-band">
          <PhotoPlaceholder label={text.photoLabel} photo={text.photo} className="about-landscape" priority sizes="(max-width: 767px) 100vw, (min-width: 1600px) 922px, 62vw" />
          <div className="about-since card-content">
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
            <aside className="about-conviction card-content" aria-label={text.history.convictionLabel}>
              <p className="eyebrow">{text.history.convictionLabel}</p>
              <p>{text.history.conviction}</p>
            </aside>
          </div>
          <div className="about-purpose-grid about-identity-details">
            {text.history.details.map((detail) => (
              <article className="about-conviction card-content" key={detail.title}>
                <h3 className="eyebrow">{detail.title}</h3>
                <p>{detail.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="section section--tinted" aria-label={text.purpose.label}>
        <Container>
          <SectionHeading label={text.purpose.label} title={text.purpose.title} description={text.purpose.description} />
          <div className="about-purpose-grid">
            <article className="about-purpose-card card-content">
              <p className="eyebrow">{text.purpose.missionLabel}</p>
              <h3>{text.purpose.missionTitle}</h3>
              <p>{text.purpose.mission}</p>
            </article>
            <article className="about-purpose-card about-purpose-card--vision card-content">
              <p className="eyebrow">{text.purpose.visionLabel}</p>
              <h3>{text.purpose.visionTitle}</h3>
              <p>{text.purpose.vision}</p>
            </article>
          </div>
          <div className="mission-actions">
            <Button href={href(locale, "a-propos/mission-vision-valeurs")} variant="text">
              {locale === "fr" ? "Mission, vision et valeurs" : "Mission, vision and values"}
            </Button>
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
                <li className="card-content" key={item.title}>
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
              <li className="card-content" key={item.title}>
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
            <Button href={href(locale, "contact")} tone="inverse">{text.closing.contact}</Button>
            <Button href={href(locale)} variant="text" tone="inverse">{text.closing.home}</Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
