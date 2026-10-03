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
              <span className="hero-title-band">{content.hero.title}</span>{" "}
              <span className="hero-title-band">{content.hero.titleSecondLine}</span>
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
        <Container>
          <div className="section-heading">
            <div>
              <p className="eyebrow">{content.about.label}</p>
              <h2 id="about-title">{content.about.title}</h2>
              <p className="section-description">{content.about.description}</p>
            </div>
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
          <Container className="impact-heading section-heading">
            <div>
              <p className="eyebrow">{content.impact.label}</p>
              <h2 id="impact-title">
                <span>{content.impact.title}</span>{" "}
                <span>{content.impact.titleSecondLine}</span>
              </h2>
              <p className="impact-description section-description">{content.impact.description}</p>
            </div>
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

      <section className="news section" aria-labelledby="news-title">
        <Container>
          <div className="news-heading section-heading">
            <div>
              <p className="eyebrow">{content.news.label}</p>
              <h2 id="news-title">{content.news.title}</h2>
              <p className="section-description">{content.news.description}</p>
            </div>
            <Link href={href("fr", "actualites")} className="news-all-link">
              {content.news.cta}
              <span className="news-arrow"><Icon name="arrow" /></span>
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
                    sizes="(max-width: 599px) 100vw, (max-width: 1023px) 50vw, (max-width: 1535px) 33vw, 470px"
                  />
                  <p className="news-badge"><Icon name={item.icon} />{item.category}</p>
                </div>
                <div className="news-card-content">
                  <h3><Link href={href("fr", item.path)}>{item.title}</Link></h3>
                  <p>{item.description}</p>
                  <div className="news-card-footer">
                    <span className="draft-label">
                      <Icon name="document" />{content.news.placeholderLabel}
                    </span>
                    <Link
                      href={href("fr", item.path)}
                      className="news-arrow"
                      aria-label={`Découvrir les actualités : ${item.title}`}
                    >
                      <Icon name="arrow" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
            <aside className="event-card" aria-labelledby="event-title">
              <PhotoPlaceholder
                label={content.news.event.label}
                photo={content.news.event.photo}
                className="event-photo"
                sizes="(max-width: 1023px) 100vw, (max-width: 1535px) 33vw, 470px"
              />
              <div className="event-content">
                <p className="news-badge event-badge"><Icon name="calendar" />{content.news.event.label}</p>
                <p className="event-date"><Icon name="calendar" />{content.news.event.date}</p>
                <h3 id="event-title">{content.news.event.title}</h3>
                <p className="event-description">{content.news.event.description}</p>
                <Button href={href("fr", "evenements")}>{content.news.event.cta}</Button>
                <p className="event-motto">{content.news.event.motto}</p>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className="partners section" aria-labelledby="partners-title">
        <div className="partners-foliage" aria-hidden="true"><span /><span /><span /></div>
        <Container>
          <div className="partners-heading section-heading">
            <div>
              <p className="eyebrow">{content.partners.label}</p>
              <h2 id="partners-title">{content.partners.title}</h2>
              <p className="section-description">{content.partners.description}</p>
            </div>
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
