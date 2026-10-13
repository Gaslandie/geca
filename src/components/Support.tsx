import { ResultsFigures } from "./ResultsFigures";
import Link from "next/link";
import { clientPhotoSources, getHomeContent, href, identity, interfaceText, pageIntroductions, supportActions, type Locale } from "@/content/site";
import { PageHero } from "./PageHero";
import { Button, Container, PageIntroduction, PhotoPlaceholder, SectionHeading } from "./ui";

export function Support({ locale, title }: { locale: Locale; title: string }) {
  const content = getHomeContent(locale);
  const text = locale === "fr" ? {
    discover: "Mieux connaître notre action", label: "Découvrir GECA", read: "En savoir plus",
    results: "Des réalisations concrètes", resultsLabel: "Nos résultats", projects: "Découvrir nos projets",
  } : {
    discover: "Learn more about our work", label: "Discover GECA", read: "Learn more",
    results: "Achievements in practice", resultsLabel: "Our results", projects: "Explore our projects",
  };
  const cards = [
    { title: content.about.title, description: content.about.description, path: "a-propos", photo: "gbara-visite" },
    { title: content.domains.title, description: content.domains.description, path: "a-propos/domaines-intervention", photo: "bassia-maraichage" },
    { title: content.projects.label, description: content.projects.description, path: "projets", photo: "moussayah-ombrieres" },
  ] as const;
  return <main id="main-content" className="support-page" tabIndex={-1}>
    <PageHero locale={locale} title={title} id="support-title" theme="support" breadcrumbs={
      <nav className="contact-breadcrumb" aria-label={locale === "fr" ? "Fil d’Ariane" : "Breadcrumb"}>
        <Link href={href(locale)}>{interfaceText[locale].home}</Link><span aria-hidden="true">/</span><span aria-current="page">{title}</span>
      </nav>
    }>
      <PageIntroduction>{pageIntroductions[locale]["nous-soutenir"]}</PageIntroduction>
    </PageHero>
    <div className="support-donation-actions"><Container>
      <div className="button-group">
        <Button href={supportActions.whatsappHref} prefetch={false} referrerPolicy="no-referrer" rel="noopener noreferrer">{supportActions[locale].whatsapp}</Button>
        <Button href={identity.phoneHref} variant="secondary" prefetch={false}>{supportActions[locale].call}</Button>
      </div>
    </Container></div>
    <section className="section support-discover" aria-label={text.discover}>
      <Container>
        <SectionHeading label={text.label} title={text.discover} />
        <div className="support-cards">
          {cards.map(card => {
            const photo = clientPhotoSources[card.photo];
            return <article className="support-card" key={card.path} data-reveal>
              <PhotoPlaceholder locale={locale} photo={{ src: photo.src, alt: photo[locale] }} label={card.title} className="support-card-photo" sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 460px" />
              <div className="card-content">
                <h3>{card.title}</h3><p>{card.description}</p>
                <Button href={href(locale, card.path)} variant="text" aria-label={`${text.read} : ${card.title}`}>{text.read}</Button>
              </div>
            </article>;
          })}
        </div>
      </Container>
    </section>
    <section className="section support-results" aria-label={text.results}>
      <Container>
        <div className="support-results-panel">
          <SectionHeading label={text.resultsLabel} title={text.results} />
          <ResultsFigures stats={content.impact.stats} />
          <div className="support-results-action"><Button href={href(locale, "projets")} variant="text">{text.projects}</Button></div>
        </div>
      </Container>
    </section>
  </main>;
}
