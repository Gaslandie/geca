"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Le HTML reste visible : ces effets n'ajoutent aucune condition d'accès.
const targets = [
  ".section-heading", ".impact-heading", ".stat", ".domain",
  ".project-card", ".portfolio-project", ".team-member", ".news-card", ".event-card",
  ".partner-list li", ".cta-grid > div", ".contact-copy",
  ".contact-form", ".contact-details-grid > div",
  ".about-since", ".about-conviction", ".about-purpose-card",
  ".about-steps li", ".about-domain-grid li",
  ".intervention-nav li", ".intervention-detail", ".construction-body",
].join(",");

export function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver !== "function" || !Element.prototype.animate) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & {
      connection?: EventTarget & { saveData?: boolean };
    }).connection;
    const finished = new WeakSet<Element>();
    const running = new Map<Element, Animation>();
    let observer: IntersectionObserver | null = null;
    let mutations: MutationObserver | null = null;

    const stop = () => {
      observer?.disconnect();
      observer = null;
      mutations?.disconnect();
      mutations = null;
      running.forEach((animation) => animation.cancel());
      running.clear();
    };
    const start = () => {
      stop();
      if (preference.matches || connection?.saveData) return;
      const hero = document.querySelector("main .hero-grid");
      if (hero && !finished.has(hero)) {
        finished.add(hero);
        const bounds = hero.getBoundingClientRect();
        if (bounds.top < innerHeight && bounds.bottom > 0 && !hero.contains(document.activeElement)) {
          const animation = hero.animate([
            { transform: "scale(1.045)" },
            { transform: "scale(1)" },
          ], { duration: 1100, easing: "cubic-bezier(.2,.65,.3,1)" });
          running.set(hero, animation);
          animation.onfinish = () => running.delete(hero);
        }
      }
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || finished.has(entry.target)) continue;
          const target = entry.target;
          finished.add(target);
          observer?.unobserve(target);
          if (target.contains(document.activeElement)) continue;
          const animation = target.animate([
            { transform: "translateY(12px)" },
            { transform: "translateY(0)" },
          ], { duration: 480, easing: "cubic-bezier(.2,.65,.3,1)" });
          running.set(target, animation);
          animation.onfinish = () => running.delete(target);
        }
      }, { rootMargin: "0px 0px -24px 0px", threshold: 0 });
      const observeTargets = () => {
        document.querySelectorAll(`main :is(${targets})`).forEach((target) => {
          if (!finished.has(target)) observer?.observe(target);
        });
      };
      observeTargets();
      const main = document.querySelector("main");
      if (main && typeof MutationObserver === "function") {
        mutations = new MutationObserver(observeTargets);
        mutations.observe(main, { childList: true, subtree: true });
      }
    };
    const handleFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Node)) return;
      for (const [target, animation] of running) {
        if (target.contains(event.target)) {
          animation.cancel();
          running.delete(target);
        }
      }
    };

    start();
    preference.addEventListener("change", start);
    connection?.addEventListener?.("change", start);
    document.addEventListener("focusin", handleFocus);
    return () => {
      stop();
      preference.removeEventListener("change", start);
      connection?.removeEventListener?.("change", start);
      document.removeEventListener("focusin", handleFocus);
    };
  }, [pathname]);

  return null;
}
