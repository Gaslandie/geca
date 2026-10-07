import Link from "next/link";
import { href, interfaceText, missionVisionContent, pageIntroductions, type Locale } from "@/content/site";
import { Button, Container, PageIntroduction, PhotoPlaceholder, SectionHeading } from "./ui";

export function MissionVisionValues({ locale }: { locale: Locale }) {
  const text = missionVisionContent[locale];
  return (
    <main id="main-content" className="mission-page" tabIndex={-1}>
      <section className="mission-intro page-hero" aria-labelledby="mission-page-title">
        <Container>
          <nav className="contact-breadcrumb" aria-label={locale === "fr" ? "Fil d’Ariane" : "Breadcrumb"}>
            <Link href={href(locale)}>{interfaceText[locale].home}</Link>
            <span aria-hidden="true">/</span>
            <Link href={href(locale, "a-propos")}>{locale === "fr" ? "À propos" : "About"}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{text.title}</span>
          </nav>
          <div className="mission-intro-heading section-heading">
            <div>
              <p className="eyebrow">{text.label}</p>
              <h1 id="mission-page-title">{text.title}</h1>
              <p className="section-description">{text.introduction}</p>
            </div>
          </div>
          <PageIntroduction>{pageIntroductions[locale]["a-propos/mission-vision-valeurs"]}</PageIntroduction>
        </Container>
      </section>

      {(["mission", "vision"] as const).map((key) => {
        const section = text[key];
        return (
          <section id={`notre-${key}`} className={`section mission-section mission-section--${key}`} key={key} aria-label={section.title}>
            <Container>
              <SectionHeading label={section.label} title={section.title} description={section.summary} />
              <div className="mission-detail">
                <figure className="mission-figure">
                  <PhotoPlaceholder label={section.photo.caption} photo={section.photo} className="mission-photo" sizes="(max-width: 767px) 100vw, (min-width: 1600px) 700px, 50vw" />
                </figure>
                <div className="mission-prose">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </div>
            </Container>
          </section>
        );
      })}

      <section id="nos-valeurs" className="section section--tinted" aria-label={text.valuesLabel}>
        <Container>
          <SectionHeading label={text.valuesLabel} title={text.valuesTitle} />
          <ul className="mission-values" role="list">
            {text.values.map((value) => (
              <li className="mission-value-card card-content" key={value.title}>
                <h3>{value.title}</h3>
                <p className="card-subtitle">{value.summary}</p>
                <p className="mission-value-detail">{value.detail}</p>
              </li>
            ))}
          </ul>
          <div className="mission-actions">
            <Button href={href(locale, "projets")}>{text.projects}</Button>
            <Button href={href(locale, "devenir-partenaire")} variant="text">{text.partner}</Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
