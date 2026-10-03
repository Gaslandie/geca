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

export function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  return (
    <HeaderNavigation key={pathname} locale={locale} pathname={pathname} />
  );
}

function HeaderNavigation({
  locale,
  pathname,
}: {
  locale: Locale;
  pathname: string;
}) {
  const text = interfaceText[locale];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const groupRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const translatedPath = pathname.replace(
    /^\/(fr|en)(?=\/|$)/,
    locale === "fr" ? "/en" : "/fr",
  );

  useEffect(() => {
    function handleOutside(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpenGroup(null);
        setMobileOpen(false);
      }
    }
    function handleResize() {
      if (window.matchMedia("(min-width: 1200px)").matches)
        setMobileOpen(false);
      setOpenGroup(null);
    }
    document.addEventListener("pointerdown", handleOutside);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function close() {
    setMobileOpen(false);
    setOpenGroup(null);
  }

  return (
    <header
      ref={headerRef}
      className="site-header"
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        if (openGroup) {
          groupRefs.current[openGroup]?.focus();
          setOpenGroup(null);
        } else if (mobileOpen) {
          menuRef.current?.focus();
          setMobileOpen(false);
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
        <nav
          id="main-navigation"
          aria-label={text.mainNav}
          className={`main-nav ${mobileOpen ? "is-open" : ""}`}
        >
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
                        <Icon name="chevron" />
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
                                <Icon name="arrow" />
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
          <div className="mobile-utilities">
            <div className="language-switch" aria-label={text.language}>
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
            <Link
              href={href(locale, "recherche")}
              className="mobile-search"
              onClick={close}
            >
              <Icon name="search" />
              {text.search}
            </Link>
          </div>
        </nav>
        <div className="header-actions">
          <div
            className="language-switch desktop-utility"
            aria-label={text.language}
          >
            <Link
              href={locale === "fr" ? pathname : translatedPath}
              lang="fr"
              hrefLang="fr"
              aria-current={locale === "fr" ? "page" : undefined}
            >
              FR
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href={locale === "en" ? pathname : translatedPath}
              lang="en"
              hrefLang="en"
              aria-current={locale === "en" ? "page" : undefined}
            >
              EN
            </Link>
          </div>
          <Link
            className="search-link desktop-utility"
            href={href(locale, "recherche")}
            aria-label={text.search}
          >
            <Icon name="search" />
          </Link>
          <Link
            className="donate-link"
            href={href(locale, "nous-soutenir")}
            onClick={close}
          >
            {text.donate}
            <Icon name="arrow" />
          </Link>
          <button
            ref={menuRef}
            className="menu-toggle"
            aria-expanded={mobileOpen}
            aria-controls="main-navigation"
            aria-label={mobileOpen ? text.close : text.menu}
            onClick={() => {
              setMobileOpen(!mobileOpen);
              setOpenGroup(null);
            }}
          >
            <Icon name={mobileOpen ? "close" : "menu"} />
          </button>
        </div>
      </Container>
    </header>
  );
}
