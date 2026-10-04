import Link from "next/link";
import { href, interfaceText, partnershipContent, type Locale } from "@/content/site";
import { Button, Container, SectionHeading } from "./ui";

export function Partnership({ locale }: { locale: Locale }) {
  const text = partnershipContent[locale];
  return (
    <main id="main-content" className="partnership-page" tabIndex={-1}>
      <section className="partnership-intro" aria-labelledby="partnership-title">
        <Container>
          <nav className="contact-breadcrumb" aria-label={locale === "fr" ? "Fil d’Ariane" : "Breadcrumb"}>
            <Link href={href(locale)}>{interfaceText[locale].home}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{text.title}</span>
          </nav>
          <div className="partnership-intro-heading section-heading">
            <div>
              <p className="eyebrow">{text.label}</p>
              <h1 id="partnership-title">{text.title}</h1>
            </div>
          </div>
        </Container>
      </section>
      <section className="section" aria-label={text.strengthsTitle}>
        <Container>
          <SectionHeading label={text.label} title={text.strengthsTitle} />
          <ul className="partnership-strengths" role="list">
            {text.strengths.map((strength) => <li className="partnership-strength-card card-content" key={strength}><p>{strength}</p></li>)}
          </ul>
        </Container>
      </section>
      <section className="cta-section partnership-positioning" aria-labelledby="positioning-title">
        <Container>
          <div className="section-heading">
            <div>
              <h2 id="positioning-title">{text.positioningTitle}</h2>
              <p className="section-description">{text.positioning}</p>
            </div>
          </div>
          <div className="partnership-actions">
            <Button href={href(locale, "contact")} variant="light">{text.contact}</Button>
            <Button href={href(locale, "projets")} variant="text">{text.projects}</Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
