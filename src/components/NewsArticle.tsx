import Link from "next/link";
import { getNewsEntries, href, interfaceText, newsArticlePath, newsContent, type Locale, type NewsEntry } from "@/content/site";
import { Button, Container, PageIntroduction, PhotoPlaceholder } from "./ui";

export function NewsArticle({ locale, entry }: { locale: Locale; entry: NewsEntry }) {
  const text = newsContent[locale];
  const entries = getNewsEntries(locale);
  const index = entries.findIndex((item) => item.id === entry.id);
  const previous = entries[index - 1];
  const next = entries[index + 1];

  return (
    <main id="main-content" className="news-article-page" tabIndex={-1}>
      <article>
        <section className="section page-hero" aria-labelledby="article-title">
          <Container>
            <nav className="contact-breadcrumb" aria-label={text.breadcrumb}>
              <Link href={href(locale)}>{interfaceText[locale].home}</Link>
              <span aria-hidden="true">/</span>
              <Link href={href(locale, "actualites")}>{text.title}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{entry.title}</span>
            </nav>
            <header className="section-heading">
              <div>
                <p className="eyebrow">{entry.category}</p>
                <h1 id="article-title">{entry.title}</h1>
                <p className="news-article-period" data-reveal>{entry.dateTime ? text.date : text.period} : {entry.dateTime
                  ? <time dateTime={entry.dateTime}>{entry.period}</time>
                  : entry.period}</p>
              </div>
            </header>
            <PageIntroduction>{entry.description.split("\n\n")[0]}</PageIntroduction>
          </Container>
        </section>
        <section className="section">
          <Container>
            {entry.photo && <PhotoPlaceholder locale={locale} className="news-article-photo" photo={entry.photo} label={entry.title} sizes="(min-width: 1280px) 1144px, 100vw" />}
            <div className="news-article-body" data-reveal>
              {entry.description.split("\n\n").slice(1).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {(entry.zone || entry.partner) && <dl className="news-article-facts">
                {entry.zone && <div><dt>{text.zone}</dt><dd>{entry.zone}</dd></div>}
                {entry.partner && <div><dt>{text.partner}</dt><dd>{entry.partner}</dd></div>}
              </dl>}
              <div className="news-article-actions">
                <Button href={href(locale, entry.path)} variant="secondary">{entry.partner ? text.projectLink : text.aboutLink}</Button>
                <Button href={`${href(locale, "actualites")}#${entry.id}`} variant="text">{text.backToNews}</Button>
              </div>
            </div>
          </Container>
        </section>
      </article>
      <section className="section section--tinted">
        <Container>
          <nav className="news-article-navigation" aria-label={text.articleNavigation}>
            {previous && <Link className="news-article-neighbor card-content" href={href(locale, newsArticlePath(previous.id))}>
              <span className="eyebrow">{text.previous}</span><span className="news-neighbor-title">{previous.title}</span>
            </Link>}
            {next && <Link className="news-article-neighbor card-content" href={href(locale, newsArticlePath(next.id))}>
              <span className="eyebrow">{text.next}</span><span className="news-neighbor-title">{next.title}</span>
            </Link>}
          </nav>
        </Container>
      </section>
    </main>
  );
}
