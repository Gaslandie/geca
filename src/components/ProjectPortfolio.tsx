import Link from "next/link";
import { getPortfolioProjects, href, interfaceText, pageIntroductions, portfolioContent, territorialExperience, type Locale } from "@/content/site";
import { Button, Container, PageIntroduction, PhotoPlaceholder, SectionHeading } from "./ui";

export function ProjectPortfolio({ locale }: { locale: Locale }) {
  const text = portfolioContent[locale];
  const projects = getPortfolioProjects(locale);
  const experience = territorialExperience[locale];

  return (
    <main id="main-content" className="portfolio-page" tabIndex={-1}>
      <section className="portfolio-intro page-hero" aria-labelledby="portfolio-title">
        <Container>
          <nav className="contact-breadcrumb" aria-label={text.breadcrumb}>
            <Link href={href(locale)}>{interfaceText[locale].home}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{text.title}</span>
          </nav>
          <div className="portfolio-intro-heading section-heading">
            <div>
              <p className="eyebrow">{text.label}</p>
              <h1 id="portfolio-title">{text.title}</h1>
              <p className="section-description">{text.introduction}</p>
            </div>
          </div>
          <PageIntroduction>{pageIntroductions[locale].projets}</PageIntroduction>
        </Container>
      </section>

      <section id="liste-projets" className="section portfolio-catalog" aria-label={text.catalogLabel} tabIndex={-1}>
        <Container>
          <SectionHeading label={text.catalogLabel} title={text.catalogTitle} />
          <p className="portfolio-notice">{text.notice}</p>
          <p className="portfolio-count">{projects.length} {text.count}</p>
          <div className="portfolio-list">
            {projects.map((project, index) => <article id={`projet-${project.slug}`} tabIndex={-1} className={`portfolio-project${index % 2 ? " portfolio-project--reverse" : ""}`} key={project.slug} aria-labelledby={`title-${project.slug}`}>
              <PhotoPlaceholder className="portfolio-photo" label={text.photo} photo={project.photo} priority={index === 0} sizes="(max-width: 767px) 100vw, (min-width: 1600px) 595px, 42vw" />
              <div className="portfolio-project-body card-content">
                {project.status && <span className={`portfolio-status portfolio-status--${project.status}`}><span aria-hidden="true" />{text.statuses[project.status]}</span>}
                <h3 id={`title-${project.slug}`}>{project.title}</h3>
                <p className="portfolio-objective-label">{text.objective}</p>
                <p className="portfolio-description">{project.description}</p>
                <dl className="portfolio-facts">
                  <div><dt>{text.region}</dt><dd>{project.zone}</dd></div>
                  <div><dt>{text.period}</dt><dd>{project.period}</dd></div>
                  <div className="portfolio-partner"><dt>{text.partner}</dt><dd>{project.partner}</dd></div>
                </dl>
              </div>
            </article>)}
          </div>
        </Container>
      </section>

      <section id="experience-kounounkan-moussayah" className="section portfolio-experience" aria-label={experience.title} tabIndex={-1}>
        <Container>
          <SectionHeading label={experience.label} title={experience.title} description={experience.introduction} />
          <ul className="portfolio-experience-list">
            {experience.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}
          </ul>
        </Container>
      </section>

      <section className="cta-section portfolio-closing" aria-label={text.closingLabel}>
        <Container>
          <SectionHeading label={text.closingLabel} title={text.closingTitle} description={text.closingDescription} />
          <div className="portfolio-closing-actions">
            <Button href={href(locale, "contact")} tone="inverse">{text.contact}</Button>
            <Button href={href(locale, "a-propos")} variant="text" tone="inverse">{text.about}</Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
