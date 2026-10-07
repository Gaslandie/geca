import type { ReactNode } from "react";
import { href, identity, interfaceText, type Locale } from "@/content/site";
import { Button, Container, PageIntroduction } from "./ui";

export function UnderConstruction({
  locale,
  title,
  introduction,
  children,
}: {
  locale: Locale;
  title: string;
  introduction?: string;
  children?: ReactNode;
}) {
  const text = interfaceText[locale].construction;
  return (
    <main id="main-content" tabIndex={-1} className={`construction${introduction ? " has-page-hero" : ""}`}>
      <Container>
        <p className="construction-breadcrumb">
          {interfaceText[locale].home}
          <span aria-hidden="true">/</span>
          {title}
        </p>
        <div className="construction-body">
          <p className="eyebrow">
            {text.label} · {title}
          </p>
          <h1>{introduction ? title : text.title}</h1>
          {introduction && <><p className="section-description">{text.title}</p><PageIntroduction>{introduction}</PageIntroduction></>}
          <p>{text.description}</p>
          <div className="construction-actions">
            <Button href={href("fr")}>{text.back}</Button>
            <Button href={`mailto:${identity.email}`} variant="text">
              {text.contact}
            </Button>
          </div>
        </div>
        {children}
      </Container>
    </main>
  );
}
