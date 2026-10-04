import Link from "next/link";
import { getInterventionAreas, href, interfaceText, interventionContent, type Locale } from "@/content/site";
import { Button, Container, PhotoPlaceholder, SectionHeading } from "./ui";

export function InterventionAreas({ locale }: { locale: Locale }) {
  const text = interventionContent[locale];
  const areas = getInterventionAreas(locale);

  return (
    <main id="main-content" tabIndex={-1} className="intervention-page">
      <section className="intervention-intro" aria-labelledby="intervention-title">
        <Container>
          <nav className="contact-breadcrumb" aria-label={text.breadcrumb}>
            <Link href={href(locale)}>{interfaceText[locale].home}</Link>
            <span aria-hidden="true">/</span>
            <Link href={href(locale, "a-propos")}>{text.about}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{text.title}</span>
          </nav>
          <div className="intervention-intro-heading section-heading">
            <div>
              <p className="eyebrow">{text.label}</p>
              <h1 id="intervention-title">{text.title}</h1>
              <p className="section-description">{text.introduction}</p>
            </div>
          </div>
          <div id="domaines" className="intervention-overview" data-reveal>
            <p>{text.overview}</p>
          </div>
        </Container>
      </section>

      {areas.map((area, index) => (
        <section key={area.id} id={area.id} tabIndex={-1} className={`section intervention-area${index % 2 ? " section--tinted intervention-area--reverse" : ""}`} aria-label={area.title}>
          <Container>
            <SectionHeading label={text.label} title={area.title} />
            <div className={`intervention-detail${area.photo ? "" : " intervention-detail--text"}`}>
              {area.photo && <PhotoPlaceholder label={area.title} photo={area.photo} className="intervention-photo" sizes="(max-width: 767px) 100vw, (min-width: 1480px) 660px, 46vw" />}
              <div className="intervention-copy card-content">
                <p>{area.description} {area.detail}</p>
              </div>
            </div>
          </Container>
        </section>
      ))}

      <section className="cta-section intervention-closing" aria-label={text.closing.label}>
        <Container>
          <SectionHeading label={text.closing.label} title={text.closing.title} description={text.closing.description} />
          <div className="intervention-closing-actions">
            <Button href={href(locale, "projets")} variant="light">{text.closing.projects}</Button>
            <Button href={href(locale, "contact")} variant="text">{text.closing.contact}</Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
