import Link from "next/link";
import { clientPhotoSources, href, identity, interfaceText, pageIntroductions, publicInformation, routes, temporaryPhotoCredits, type Locale } from "@/content/site";
import { Container, PageIntroduction } from "./ui";

export function SiteInformation({ locale, path, title }: { locale: Locale; path: "mentions-legales" | "confidentialite" | "plan-du-site"; title: string }) {
  const text = publicInformation[locale];
  return <main id="main-content" tabIndex={-1}>
    <section className="page-hero"><Container>
      <nav className="contact-breadcrumb" aria-label={locale === "fr" ? "Fil d’Ariane" : "Breadcrumb"}>
        <Link href={href(locale)}>{interfaceText[locale].home}</Link><span aria-hidden="true">/</span><span aria-current="page">{title}</span>
      </nav>
      <div className="section-heading"><div><h1>{title}</h1></div></div>
      <PageIntroduction>{path === "confidentialite" ? text.privacy : pageIntroductions[locale][path]}</PageIntroduction>
    </Container></section>
    <section className="section"><Container><div className="site-info">
      {path === "plan-du-site" ? <article className="card-content">
        <h2>{text.sitemap}</h2><ul>
          <li><Link href={href(locale)}>{interfaceText[locale].home}</Link></li>
          {routes.map(route => <li key={route.path}><Link href={href(locale, route.path)}>{route[locale]}</Link></li>)}
        </ul>
      </article> : <article className="card-content">
        <h2>{text.publisher}</h2><p>{identity.name}</p><address>{identity.address[locale]}</address>
        <p><a href={`mailto:${identity.email}`}>{identity.email}</a></p><p><a href={identity.phoneHref}>{identity.phone}</a></p>
      </article>}
      {path === "mentions-legales" && <>
        <article className="card-content"><h2>{text.hosting}</h2><p>Bluehost</p></article>
        <article id="credits-photo" className="card-content">
          <h2>{text.credits}</h2><h3>{text.documentPhotos}</h3><p>{text.clientPhotos}</p>
          <ul>{Object.entries(clientPhotoSources).map(([key, photo]) => <li key={key}>{photo[locale]} — {photo.source}, {photo.reference}.</li>)}</ul>
          <h3>{text.internetPhotos}</h3><p>{text.temporaryPhotos}</p>
          <ul>{temporaryPhotoCredits.map(photo => <li key={photo.author}>{photo.author} — <a href={photo.source} rel="noreferrer">{text.original}</a>, <a href={"license" in photo ? photo.license.href : "https://unsplash.com/license"} rel="noreferrer">{"license" in photo ? photo.license.title : text.license}</a>.</li>)}</ul>
          <p>{text.logos}</p>
        </article>
      </>}
    </div></Container></section>
  </main>;
}
