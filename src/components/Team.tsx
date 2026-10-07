import Image from "next/image";
import Link from "next/link";
import { href, interfaceText, pageIntroductions, teamContent, teamMembers, type Locale } from "@/content/site";
import { assetPath } from "@/lib/assets";
import { Button, Container, PageIntroduction, SectionHeading } from "./ui";

function TeamGrid({ locale }: { locale: Locale }) {
  return (
    <div className="team-grid">
      {teamMembers.map((member) => (
        <article className="team-member" id={member.id} key={member.id} data-reveal>
          <Image
            src={assetPath(member.photo.src)}
            alt={member.name}
            width={member.photo.width}
            height={member.photo.height}
            sizes="220px"
            className="team-portrait"
          />
          <div className="card-content">
            <h3>{member.name}</h3>
            <p className="card-subtitle">{member.role[locale]}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function TeamSection({ locale }: { locale: Locale }) {
  const text = teamContent[locale];
  return (
    <section id="equipe" className="team section" aria-label={text.label}>
      <Container>
        <SectionHeading label={text.label} title={text.title}>
          <Button href={href(locale, "equipe")} variant="text">{text.all}</Button>
        </SectionHeading>
        <TeamGrid locale={locale} />
      </Container>
    </section>
  );
}

export function TeamPage({ locale }: { locale: Locale }) {
  const text = teamContent[locale];
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="mission-intro page-hero" aria-labelledby="team-page-title">
        <Container>
          <nav className="contact-breadcrumb" aria-label={locale === "fr" ? "Fil d’Ariane" : "Breadcrumb"}>
            <Link href={href(locale)}>{interfaceText[locale].home}</Link>
            <span aria-hidden="true">/</span>
            <Link href={href(locale, "a-propos")}>{locale === "fr" ? "À propos" : "About"}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{text.pageTitle}</span>
          </nav>
          <div className="mission-intro-heading section-heading">
            <div><p className="eyebrow">Global EcoAction</p><h1 id="team-page-title">{text.pageTitle}</h1></div>
          </div>
          <PageIntroduction>{pageIntroductions[locale].equipe}</PageIntroduction>
        </Container>
      </section>
      <section className="section" aria-label={text.title}>
        <Container>
          <SectionHeading label={text.label} title={text.title} />
          <TeamGrid locale={locale} />
        </Container>
      </section>
    </main>
  );
}
