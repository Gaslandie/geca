import Link from "next/link";
import { getNewsEntries, href, interfaceText, newsArticlePath, newsContent, pageIntroductions, type Locale } from "@/content/site";
import { BrandLogo } from "./BrandLogo";
import { Container, PageIntroduction, PhotoPlaceholder, SectionHeading } from "./ui";

export function News({ locale }: { locale: Locale }) {
  const text = newsContent[locale];
  const entries = getNewsEntries(locale);
  return (
    <main id="main-content" className="news-page" tabIndex={-1}>
      <section className="section page-hero" aria-labelledby="news-page-title">
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
          <PageIntroduction>{pageIntroductions[locale].actualites}</PageIntroduction>
        </Container>
      </section>
      <section className="section section--tinted" aria-label={text.archiveTitle}>
        <Container>
          <SectionHeading label={text.archiveLabel} title={text.archiveTitle} />
          <div className="news-archive-grid">
            {entries.map((entry) => (
              <article className="news-card" id={entry.id} key={entry.id} aria-labelledby={`news-${entry.id}`} tabIndex={-1}>
                {entry.photo
                  ? <PhotoPlaceholder locale={locale} className="news-photo" photo={entry.photo} label={entry.category} sizes="(max-width: 699px) 100vw, (max-width: 1279px) 50vw, 25vw" />
                  : <div className="news-milestone-visual"><BrandLogo locale={locale} /></div>}
                <div className="news-card-content card-content">
                  <p className="news-archive-period">
                    {entry.dateTime ? text.date : text.period} : {entry.dateTime
                      ? <time dateTime={entry.dateTime}>{entry.period}</time>
                      : <span>{entry.period}</span>}
                  </p>
                  <p className="news-category">{entry.category}</p>
                  <h3 id={`news-${entry.id}`}><Link href={href(locale, newsArticlePath(entry.id))}>{entry.title}</Link></h3>
                  <p className="news-archive-description">{entry.description.split("\n\n")[0]}</p>
                  <div className="news-card-footer">
                    <Link className="button button-text news-card-link" href={href(locale, newsArticlePath(entry.id))} aria-label={`${text.readArticle} : ${entry.title}`}>{text.readArticle}</Link>
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
