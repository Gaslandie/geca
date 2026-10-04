import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/assets";
import { homeContent as content, href } from "@/content/site";
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
    <main id="main-content" tabIndex={-1} className="home-page">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-grid">
          <div className="hero-message">
            <div className="hero-content">
              <p className="eyebrow">{content.hero.label}</p>
              <h1 id="hero-title">
                <span className="hero-title-line">{content.hero.title}</span>{" "}
                <span className="hero-title-line">{content.hero.titleSecondLine}</span>
              </h1>
            </div>
            <PhotoPlaceholder
              label={content.hero.label}
              photo={content.hero.photo}
              className="hero-photo"
              sizes="(max-width: 767px) 100vw, 35vw"
              priority
            />
            <div className="hero-caption">
              <HeroVideo {...content.hero.video} />
              <noscript>
                <style>{".hero-video-toggle { display: none; }"}</style>
              </noscript>
              <div className="hero-copy">
                <p className="hero-description">{content.hero.description}</p>
                <p className="hero-introduction">{content.hero.introduction}</p>
              </div>
            </div>
          </div>
          <div className="hero-actions">
            <Icon name="arrow-down-right" className="hero-action-arrow" />
            <div className="hero-action-links">
              <Button href={href("fr", "projets")}>
                {content.hero.primary}
              </Button>
              <Button href={href("fr", "devenir-partenaire")} variant="secondary">
                {content.hero.secondary}
              </Button>
            </div>
          </div>
        </div>
      </section>

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

      <section className="domains section section--tinted" aria-label={content.domains.label}>
        <Container>
          <SectionHeading
            label={content.domains.label}
            title={content.domains.title}
            description={content.domains.description}
          />
          <div className="domains-grid">
            {content.domains.items.map((item) => (
              <article className={`domain${item.photo ? "" : " domain--text"}`} key={item.id}>
                {item.photo && <PhotoPlaceholder
                  label={item.title}
                  photo={item.photo}
                  className="domain-photo"
                  sizes="(max-width: 767px) 100vw, (max-width: 1335px) 50vw, 620px"
                />}
                <div className="domain-content card-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <Link
                    href={`${href("fr", "a-propos/domaines-intervention")}#${item.id}`}
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
        <PhotoPlaceholder
          label={content.impact.label}
          photo={content.impact.photo}
          className="impact-photo"
          sizes="100vw"
        />
        <Container>
          <div className="impact-heading section-heading">
            <div>
              <p className="eyebrow">{content.impact.label}</p>
              <h2 id="impact-title">
                <span>{content.impact.title}</span>{" "}
                <span>{content.impact.titleSecondLine}</span>
              </h2>
            </div>
          </div>
          <div className="impact-layout">
            <div className="impact-copy">
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

      <section className="news section section--tinted" aria-labelledby="news-title">
        <Container>
          <div className="news-heading section-heading">
            <div>
              <p className="eyebrow">{content.news.label}</p>
              <h2 id="news-title">{content.news.title}</h2>
              <p className="section-description">{content.news.description}</p>
            </div>
            <Link href={href("fr", "actualites")} className="news-all-link">
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
                    sizes="(max-width: 599px) 100vw, (max-width: 1023px) 50vw, (max-width: 1535px) 33vw, 470px"
                  />
                  <p className="news-badge">{item.category}</p>
                </div>
                <div className="news-card-content card-content">
                  <h3><Link href={href("fr", item.path)}>{item.title}</Link></h3>
                  <p>{item.description}</p>
                  <div className="news-card-footer">
                    <span className="draft-label">
                      {content.news.placeholderLabel}
                    </span>
                    <Link
                      href={href("fr", item.path)}
                      className="news-card-link"
                      aria-label={`Découvrir les actualités : ${item.title}`}
                    >
                      Découvrir
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
              <div className="event-content card-content">
                <p className="news-badge event-badge">{content.news.event.label}</p>
                <p className="event-date">{content.news.event.date}</p>
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
              <li className="card-content" key={partner.name}>
                <Image
                  src={assetPath(partner.logo.src)}
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
          <div className="partner-cta card-content">
            <p className="eyebrow">{content.cta.label}</p>
            <h2>{content.cta.partnerTitle}</h2>
            <p>{content.cta.partnerText}</p>
            <Button href={href("fr", "devenir-partenaire")} variant="light">
              {content.cta.partnerButton}
            </Button>
          </div>
          <div className="support-cta card-content">
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
