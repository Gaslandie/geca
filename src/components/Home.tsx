import Link from "next/link";
import { homeContent as content, href } from "@/content/site";
import {
  Button,
  Container,
  PhotoPlaceholder,
  SectionHeading,
  StatCard,
} from "./ui";
import { Projects } from "./Projects";
import { TeamSection } from "./Team";
import { PartnerCarousel } from "./PartnerCarousel";
import { PartnerTicker } from "./PartnerTicker";
import { HeroSlideshow } from "./HeroSlideshow";

export function Home() {
  return (
    <main id="main-content" tabIndex={-1} className="home-page">
      <section className="hero" aria-labelledby="hero-title">
        <HeroSlideshow photos={content.hero.slides} />
        <div className="hero-grid">
          <div className="hero-content">
            <p className="eyebrow hero-brand">
              {content.hero.label.split(/(Global|Eco|Action)/).map((part, index) =>
                /^(Global|Eco|Action)$/.test(part)
                  ? <span key={index} className={part === "Eco" ? "hero-brand-green" : "hero-brand-gold"}>{part}</span>
                  : part,
              )}
            </p>
            <h1 id="hero-title">
              <span className="hero-title-line">{content.hero.title}</span>{" "}
              <span className="hero-title-line">{content.hero.titleSecondLine}</span>
            </h1>
            <div className="hero-copy">
              <p className="hero-description">{content.hero.description}</p>
              <p className="hero-introduction">{content.hero.introduction}</p>
            </div>
            <div className="hero-actions">
              <div className="hero-action-links">
                <Button href={href("fr", "projets")} tone="inverse">{content.hero.primary}</Button>
                <Button href={href("fr", "devenir-partenaire")} variant="secondary" tone="inverse">{content.hero.secondary}</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PartnerTicker names={content.partners.items.map((partner) => partner.name)} label={content.partners.label} />

      <section className="about section" aria-labelledby="about-title">
        <Container className="about-content">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{content.about.label}</p>
              <h2 id="about-title">{content.about.title}</h2>
              <p className="section-description">
                {content.about.description.split(/(Global EcoAction \(GECA\)|RENASCEDD)/).map((part, index) =>
                  index % 2 === 1 ? <strong key={index}>{part}</strong> : part,
                )}
              </p>
            </div>
            <Button href={href("fr", "a-propos")} variant="text">
              {content.about.cta}
            </Button>
          </div>
        </Container>
      </section>

      <section className="domains section" aria-label={content.domains.label}>
        <Container>
          <SectionHeading
            label={content.domains.label}
            title={content.domains.title}
            description={content.domains.description}
          />
          <div className="domains-grid">
            {content.domains.items.map((item) => (
              <article className={`domain${item.photo ? "" : " domain--text"}`} key={item.id}>
                <Link
                  href={`${href("fr", "a-propos/domaines-intervention")}#${item.id}`}
                  className="domain-link"
                  aria-labelledby={`domain-title-${item.id}`}
                >
                  <div className="domain-circle">
                    {item.photo && <PhotoPlaceholder
                      label={item.title}
                      photo={item.photo}
                      className="domain-photo"
                      sizes="(max-width: 699px) 360px, (max-width: 1279px) 50vw, 25vw"
                    />}
                    <h3 id={`domain-title-${item.id}`}>{item.title}</h3>
                  </div>
                  <div className="domain-content card-content">
                    <p>{item.description}</p>
                    <span className="button button-text">{content.domains.cta}</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="impact" aria-labelledby="impact-title">
        <Container>
          <div className="impact-layout">
            <div className="impact-copy">
              <div className="impact-heading section-heading">
                <div>
                  <p className="eyebrow">{content.impact.label}</p>
                  <h2 id="impact-title">
                    <span>{content.impact.title}</span>{" "}
                    <span>{content.impact.titleSecondLine}</span>
                  </h2>
                </div>
              </div>
              <ul className="impact-achievements">
                {content.impact.achievements.map((achievement) => (
                  <li key={achievement}>{achievement}</li>
                ))}
              </ul>
            </div>
            <div className="impact-results">
              <div className="stats-grid">
                {content.impact.stats.map((stat) => (
                  <StatCard key={stat.value} {...stat} />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="projects section section--tinted" aria-label={content.projects.label}>
        <Container>
          <SectionHeading
            label={content.projects.label}
            title={content.projects.title}
            description={content.projects.description}
          >
            <Button href={href("fr", "projets")} variant="text">
              {content.projects.all}
            </Button>
          </SectionHeading>
          <Projects />
        </Container>
      </section>

      <TeamSection locale="fr" />

      <section className="news section section--tinted" aria-labelledby="news-title">
        <Container>
          <div className="news-heading section-heading">
            <div>
              <p className="eyebrow">{content.news.label}</p>
              <h2 id="news-title">{content.news.title}</h2>
              <p className="section-description">{content.news.description}</p>
            </div>
            <Link href={href("fr", "actualites")} className="button button-text news-all-link">
              {content.news.cta}
            </Link>
          </div>
          <div className="news-grid">
            {content.news.items.map((item) => (
              <article key={item.title} className="news-card">
                <div className="news-visual">
                  <PhotoPlaceholder
                    label={item.category}
                    photo={item.photo}
                    className="news-photo"
                    sizes="(max-width: 599px) 100vw, (max-width: 1535px) 50vw, 720px"
                  />
                  <p className="news-badge">{item.category}</p>
                </div>
                <div className="news-card-content card-content">
                  <h3><Link href={href("fr", item.path)}>{item.title}</Link></h3>
                  <p>{item.description}</p>
                  <div className="news-card-footer">
                    <span className="draft-label">
                      {item.period}
                    </span>
                    <Link
                      href={href("fr", item.path)}
                      className="button button-text news-card-link"
                      aria-label={`Découvrir les actualités : ${item.title}`}
                    >
                      Découvrir
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="partners section" aria-labelledby="partners-title">
        <Container>
          <div className="partners-heading section-heading">
            <div>
              <p className="eyebrow">{content.partners.label}</p>
              <h2 id="partners-title">{content.partners.title}</h2>
              <p className="section-description">{content.partners.description}</p>
            </div>
          </div>
          <PartnerCarousel items={content.partners.items} />
        </Container>
      </section>

      <section className="cta-section" aria-label={content.cta.label}>
        <Container className="cta-grid">
          <div className="partner-cta card-content">
            <p className="eyebrow">{content.cta.label}</p>
            <h2>{content.cta.partnerTitle}</h2>
            <p>{content.cta.partnerText}</p>
            <Button href={href("fr", "devenir-partenaire")} tone="inverse">
              {content.cta.partnerButton}
            </Button>
          </div>
          <div className="support-cta card-content">
            <h3>{content.cta.supportTitle}</h3>
            <p>{content.cta.supportText}</p>
            <Button href={href("fr", "nous-soutenir")} variant="text" tone="inverse">
              {content.cta.supportButton}
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
