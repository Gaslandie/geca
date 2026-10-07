import Link from "next/link";
import { getNewsEntries, href, interfaceText, newsContent, type Locale } from "@/content/site";
import { Container, PhotoPlaceholder, SectionHeading } from "./ui";

export function News({ locale }: { locale: Locale }) {
  const text = newsContent[locale];
  const entries = getNewsEntries(locale);
  return (
    <main id="main-content" className="news-page" tabIndex={-1}>
      <section className="section" aria-labelledby="news-page-title">
        <Container>
          <nav className="contact-breadcrumb" aria-label={text.breadcrumb}>
            <Link href={href(locale)}>{interfaceText[locale].home}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{text.title}</span>
          </nav>
          <div className="section-heading">
            <div>
              <p className="eyebrow">{text.label}</p>
              <h1 id="news-page-title">{text.title}</h1>
              <p className="section-description">{text.introduction}</p>
            </div>
          </div>
        </Container>
      </section>
      <section className="section section--tinted" aria-label={text.archiveTitle}>
        <Container>
          <SectionHeading label={text.archiveLabel} title={text.archiveTitle} />
          <p className="news-archive-notice" data-reveal>{text.notice}</p>
          <div className="news-archive-grid">
            {entries.map((entry) => (
              <article className="news-card" id={entry.id} key={entry.id} aria-labelledby={`news-${entry.id}`} tabIndex={-1}>
                {entry.photo && <PhotoPlaceholder className="news-photo" photo={entry.photo} label={entry.category} sizes="(max-width: 767px) 100vw, 50vw" />}
                <div className="news-card-content card-content">
                  <p className="eyebrow">{entry.category}</p>
                  <h3 id={`news-${entry.id}`}>{entry.title}</h3>
                  <p className="news-archive-period">
                    {entry.dateTime ? text.date : text.period} : {entry.dateTime
                      ? <time dateTime={entry.dateTime}>{entry.period}</time>
                      : <span>{entry.period}</span>}
                  </p>
                  {entry.description.split("\n\n").map((paragraph) => <p className="news-archive-description" key={paragraph}>{paragraph}</p>)}
                  {entry.partner && <p>{text.partner} : <strong>{entry.partner}</strong></p>}
                  <div className="news-card-footer">
                    <Link className="news-card-link" href={href(locale, entry.path)}>{entry.partner ? text.projectLink : text.aboutLink}</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
