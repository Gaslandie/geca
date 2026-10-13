import { PageHero } from "./PageHero";
import type { ReactNode } from "react";
import { href, identity, interfaceText, type Locale } from "@/content/site";
import { Button, Container, PageIntroduction } from "./ui";

export function UnderConstruction({
  locale,
  title,
  path,
  introduction,
  children,
  actions,
}: {
  locale: Locale;
  title: string;
  path: string;
  introduction?: string;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  const text = interfaceText[locale].construction;
  return (
    <main id="main-content" tabIndex={-1} className={`construction${introduction ? " has-page-hero" : ""}`}>
      <PageHero locale={locale} title={title} id="information-title" theme={path === "nous-soutenir" ? "support" : "information"} breadcrumbs={<p className="construction-breadcrumb">{interfaceText[locale].home}<span aria-hidden="true">/</span>{title}</p>}>
        {introduction && <PageIntroduction>{introduction}</PageIntroduction>}
      </PageHero>
      <Container>
        <div className="construction-body">
          <div className="construction-actions">
            {actions ?? <>
              <Button href={href(locale)}>{text.back}</Button>
              <Button href={`mailto:${identity.email}`} variant="text">
                {text.contact}
              </Button>
            </>}
          </div>
        </div>
        {children}
      </Container>
    </main>
  );
}
