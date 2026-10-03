import Image from "next/image";
import Link from "next/link";
import { homeContent as content, href, identity } from "@/content/site";
import {
  Button,
  Container,
  Icon,
  PhotoPlaceholder,
  SectionHeading,
  StatCard,
} from "./ui";
import { Projects } from "./Projects";
import { HeroVideo } from "./HeroVideo";

export function Home() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="hero" aria-labelledby="hero-title">
        <HeroVideo {...content.hero.video} />
        <noscript>
          <style>{".hero-video-toggle { display: none; }"}</style>
        </noscript>
        <Container className="hero-grid">
          <div className="hero-content">
            <p className="eyebrow">{content.hero.label}</p>
            <h1 id="hero-title">
              {content.hero.title}
              {" "}
              <br />
              {content.hero.titleSecondLine}
            </h1>
            <p className="hero-description">{content.hero.description}</p>
            <div className="hero-actions">
              <Button href={href("fr", "projets")}>
                {content.hero.primary}
              </Button>
              <Button href={href("fr", "devenir-partenaire")} variant="secondary">
                {content.hero.secondary}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="about section" aria-labelledby="about-title">
        <Container className="about-grid">
          <div>
            <p className="eyebrow">{content.about.label}</p>
            <h2 id="about-title">{content.about.title}</h2>
            <p className="body-copy">{content.about.description}</p>
            <Button href={href("fr", "a-propos")} variant="text">
              {content.about.cta}
            </Button>
          </div>
          <div className="about-aside">
            <p className="eyebrow">{content.about.sideLabel}</p>
            <p className="about-statement">{content.about.sideText}</p>
            <div className="about-since">
              <span>{identity.since}</span>
              <p>{content.about.since}</p>
            </div>
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
              <article className="domain" key={item.title}>
                <PhotoPlaceholder
                  label={item.title}
                  photo={item.photo}
                  className="domain-photo"
                  sizes="(max-width: 767px) 100vw, (max-width: 1335px) 50vw, 620px"
                />
                <div className="domain-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <Link
                    href={href("fr", "a-propos/domaines-intervention")}
                    className="domain-link"
                    aria-label={`${content.domains.cta} : ${item.title}`}
                  >
                    {content.domains.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="impact" aria-labelledby="impact-title">
        <div className="impact-banner">
          <PhotoPlaceholder
            label={content.impact.label}
            photo={content.impact.photo}
            className="impact-photo"
            sizes="100vw"
          />
          <Container className="impact-heading">
            <div>
              <p className="eyebrow">{content.impact.label}</p>
              <h2 id="impact-title">
                <span>{content.impact.title}</span>{" "}
                <span>{content.impact.titleSecondLine}</span>
              </h2>
            </div>
            <p className="impact-description">{content.impact.description}</p>
          </Container>
        </div>
        <Container className="impact-results">
          <div className="stats-grid">
            {content.impact.stats.map((stat) => (
              <StatCard key={stat.value} {...stat} />
            ))}
          </div>
          <p className="impact-note">{content.impact.note}</p>
        </Container>
      </section>

      <section className="projects section" aria-label={content.projects.label}>
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

      <section className="team section" aria-label={content.team.label}>
        <Container>
          <SectionHeading
            label={content.team.label}
            title={content.team.title}
            description={content.team.description}
          >
            <Button href={href("fr", "equipe")} variant="text">
              {content.team.cta}
            </Button>
          </SectionHeading>
          <div className="team-grid">
            {content.team.members.map((member) => (
              <div className="team-member" key={member.id}>
                <PhotoPlaceholder
                  label={content.team.photoLabel}
                  photo={member.photo}
                  className="team-photo"
                />
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="news section" aria-label={content.news.label}>
        <Container>
          <SectionHeading label={content.news.label} title={content.news.title}>
            <Button href={href("fr", "actualites")} variant="text">
              {content.news.cta}
            </Button>
          </SectionHeading>
          <div className="news-grid">
            {content.news.items.map((item) => (
              <article key={item.title} className="news-card">
                <p className="eyebrow">{item.category}</p>
                <h3>
                  <Link href={href("fr", item.path)}>
                    {item.title}
                    <Icon name="arrow" />
                  </Link>
                </h3>
                <p>{item.description}</p>
                <span className="draft-label">
                  {content.news.placeholderLabel}
                </span>
              </article>
            ))}
            <aside className="event-card">
              <p className="eyebrow">{content.news.event.label}</p>
              <p className="event-date">{content.news.event.date}</p>
              <h3>{content.news.event.title}</h3>
              <Button href={href("fr", "evenements")} variant="text">
                {content.news.event.cta}
              </Button>
            </aside>
          </div>
        </Container>
      </section>

      <section className="partners section" aria-labelledby="partners-title">
        <Container>
          <div className="partners-heading">
            <p className="eyebrow">{content.partners.label}</p>
            <h2 id="partners-title">{content.partners.title}</h2>
            <p>{content.partners.description}</p>
          </div>
          <ul className="partner-list">
            {content.partners.items.map((partner) => (
              <li key={partner.name}>
                <Image
                  src={partner.logo.src}
                  alt={partner.logo.alt}
                  width={partner.logo.width}
                  height={partner.logo.height}
                  sizes="(min-width: 1200px) 240px, (min-width: 670px) 280px, 240px"
                  className="partner-logo"
                />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="cta-section" aria-label={content.cta.label}>
        <Container className="cta-grid">
          <div className="partner-cta">
            <p className="eyebrow">{content.cta.label}</p>
            <h2>{content.cta.partnerTitle}</h2>
            <p>{content.cta.partnerText}</p>
            <Button href={href("fr", "devenir-partenaire")} variant="light">
              {content.cta.partnerButton}
            </Button>
          </div>
          <div className="support-cta">
            <h3>{content.cta.supportTitle}</h3>
            <p>{content.cta.supportText}</p>
            <Button href={href("fr", "nous-soutenir")} variant="text">
              {content.cta.supportButton}
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
