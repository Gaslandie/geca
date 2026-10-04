"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  href,
  identity,
  interfaceText,
  navigation,
  routes,
  type Locale,
} from "@/content/site";
import { Container, Icon } from "./ui";
import { BrandLogo } from "./BrandLogo";
import { SiteSearch } from "./SiteSearch";
import type { SearchDocument } from "@/lib/search";

export function Header({ locale, searchDocuments }: { locale: Locale; searchDocuments: SearchDocument[] }) {
  // Pages utilise des URL terminées par / ; garder la sélection du menu exacte.
  const pathname = usePathname().replace(/\/$/, "") || "/";
  return (
    <HeaderNavigation key={pathname} locale={locale} pathname={pathname} searchDocuments={searchDocuments} />
  );
}

function HeaderNavigation({
  locale,
  pathname,
  searchDocuments,
}: {
  locale: Locale;
  pathname: string;
  searchDocuments: SearchDocument[];
}) {
  const text = interfaceText[locale];
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const groupRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const translatedPath = pathname.replace(
    /^\/(fr|en)(?=\/|$)/,
    locale === "fr" ? "/en" : "/fr",
  );

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const inner = header.querySelector<HTMLElement>(".header-inner");
    const updateMeasurements = () => {
      header.style.setProperty("--header-height", `${header.offsetHeight}px`);
      if (inner) {
        const gutter = inner.getBoundingClientRect().left - header.getBoundingClientRect().left;
        header.style.setProperty("--navigation-gutter", `${gutter}px`);
      }
    };
    updateMeasurements();
    const observer = new ResizeObserver(updateMeasurements);
    observer.observe(header);
    if (inner) observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleOutside(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpenGroup(null);
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleOutside);
    return () => {
      document.removeEventListener("pointerdown", handleOutside);
    };
  }, []);

  function close() {
    setMenuOpen(false);
    setOpenGroup(null);
  }

  return (
    <header
      ref={headerRef}
      className="site-header"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        if (openGroup) {
          groupRefs.current[openGroup]?.focus();
          setOpenGroup(null);
        } else if (menuOpen) {
          menuRef.current?.focus();
          setMenuOpen(false);
        }
      }}
    >
      <Container className="header-inner">
        <Link
          href={href(locale)}
          className="brand"
          aria-label={`${identity.name} — ${text.home}`}
          onClick={close}
        >
          <BrandLogo preload />
        </Link>

        <div className="header-actions">
          <Link
            className="donate-link"
            href={href(locale, "nous-soutenir")}
            onClick={close}
          >
            {text.donate}
          </Link>
          <SiteSearch locale={locale} documents={searchDocuments} onOpen={close} />
        </div>
        <button
          ref={menuRef}
          className="menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          aria-label={menuOpen ? text.close : text.menu}
          onClick={() => {
            setMenuOpen(!menuOpen);
            setOpenGroup(null);
          }}
        >
          <Icon name={menuOpen ? "close" : "menu"} />
        </button>
        <nav
          id="main-navigation"
          aria-label={text.mainNav}
          className={`main-nav ${menuOpen ? "is-open" : ""}`}
        >
          <div className="language-switch" role="group" aria-label={text.language}>
            <Link
              href={locale === "fr" ? pathname : translatedPath}
              lang="fr"
              hrefLang="fr"
              aria-current={locale === "fr" ? "page" : undefined}
              onClick={close}
            >
              FR
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href={locale === "en" ? pathname : translatedPath}
              lang="en"
              hrefLang="en"
              aria-current={locale === "en" ? "page" : undefined}
              onClick={close}
            >
              EN
            </Link>
          </div>
          <ul>
            {navigation.map((item) => {
              const isActive = item.path
                ? pathname === href(locale, item.path) ||
                  pathname.startsWith(`${href(locale, item.path)}/`) ||
                  item.children?.some((path) => pathname === href(locale, path))
                : pathname === href(locale);
              return (
                <li
                  className={`nav-item ${isActive ? "active" : ""}`}
                  key={item.path}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget))
                      setOpenGroup((current) =>
                        current === item.path ? null : current,
                      );
                  }}
                >
                  {item.children ? (
                    <>
                      <button
                        ref={(element) => {
                          groupRefs.current[item.path] = element;
                        }}
                        className="nav-trigger"
                        aria-expanded={openGroup === item.path}
                        aria-controls={`nav-${item.path}`}
                        onClick={() =>
                          setOpenGroup(
                            openGroup === item.path ? null : item.path,
                          )
                        }
                      >
                        {item[locale]}
                        <Icon name="chevron" className="nav-chevron" />
                      </button>
                      <ul
                        id={`nav-${item.path}`}
                        className="nav-dropdown"
                        hidden={openGroup !== item.path}
                      >
                        {item.children.map((path) => {
                          const route = routes.find(
                            (route) => route.path === path,
                          )!;
                          return (
                            <li key={path}>
                              <Link
                                href={href(locale, path)}
                                onClick={close}
                                aria-current={
                                  pathname === href(locale, path)
                                    ? "page"
                                    : undefined
                                }
                              >
                                {route[locale]}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  ) : (
                    <Link
                      href={href(locale, item.path)}
                      onClick={close}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item[locale]}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
