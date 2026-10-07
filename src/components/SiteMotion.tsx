"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Règle commune, y compris pour les futurs corps de carte et blocs data-reveal.
// Le HTML reste visible : ces effets n'ajoutent aucune condition d'accès.
const targets = [
  "[data-reveal]:not([data-reveal='off'])", ".hero-brand", ".hero-description", ".hero-introduction", ".hero-actions", ".card-content",
  "h1", "h2", ".section-heading .eyebrow", ".section-heading .section-description",
  ".section-heading > .button", ".stat", ".domain",
  ".project-card", ".portfolio-project", ".news-card", ".team-member",
  ".partner-list li", ".cta-grid > div", ".contact-copy",
  ".contact-form", ".contact-details-grid > div",
  ".about-since", ".about-conviction", ".about-purpose-card",
  ".about-steps li", ".about-domain-grid li",
  ".intervention-detail", ".construction-body",
  ".partnership-strength-card",
  ".mission-value-card",
  ".mission-figure", ".mission-prose", ".about-prose",
  ".photo-placeholder:not(.impact-photo, .contact-photo)",
  ".impact-achievements > li", ".portfolio-experience-list > li",
  ".project-toolbar", ".portfolio-notice", ".portfolio-count",
  ".mission-actions", ".partnership-actions", ".portfolio-closing-actions",
  ".about-closing-actions",
].join(",");
const selector = `main :is(${targets}), .site-footer .footer-grid > *, .site-footer .footer-bottom`;
// Trois accents d'une même famille : titres, cartes/photos, textes/actions.
const cardSelector = ".stat, .domain, .project-card, .portfolio-project, .news-card, .team-member, .partner-list li, .photo-placeholder, .mission-figure, .about-purpose-card, .mission-value-card, .partnership-strength-card";
const headingSelector = "h1, h2";
const easing = "cubic-bezier(.2,.65,.3,1)";
function motionFor(target: Element) {
  if (target.matches(headingSelector)) return {
    frames: [{ transform: "translateY(24px) scale(.96)" }, { transform: "translateY(0) scale(1)" }],
    duration: 720,
  };
  if (target.matches(cardSelector)) return {
    frames: [{ transform: "translateY(24px) scale(.985)" }, { transform: "translateY(0) scale(1)" }],
    duration: 600,
  };
  return {
    frames: [{ transform: "translateY(18px)" }, { transform: "translateY(0)" }],
    duration: 560,
  };
}

export function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver !== "function" || !Element.prototype.animate) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & {
      connection?: EventTarget & { saveData?: boolean };
    }).connection;
    const finished = new WeakSet<Element>();
    const observed = new Set<Element>();
    const running = new Map<Element, Animation>();
    let counterObserver: IntersectionObserver | null = null;
    let counterFrame = 0;
    const counted = new WeakSet<Element>();
    let counters: { element: HTMLElement; value: number; text: string }[] = [];
    const finishCounters = () => {
      cancelAnimationFrame(counterFrame);
      counterFrame = 0;
      counters.forEach(({ element, text }) => { element.textContent = text; });
      counters = [];
    };
    const countTogether = (group: Element) => {
      if (counted.has(group)) return;
      counted.add(group);
      counters = [...group.querySelectorAll<HTMLElement>("[data-count]")].map((element) => ({
        element, value: Number(element.dataset.count), text: element.textContent ?? "",
      })).filter(({ value }) => Number.isSafeInteger(value) && value >= 0);
      const formatter = new Intl.NumberFormat("fr-FR");
      const started = performance.now();
      counters.forEach(({ element }) => { element.textContent = "0"; });
      const tick = (now: number) => {
        const progress = Math.min(1, (now - started) / 1800);
        const fraction = 1 - Math.pow(1 - progress, 3);
        counters.forEach(({ element, value }) => {
          element.textContent = formatter.format(Math.floor(value * fraction)).replace(/\u202f/g, " ");
        });
        if (progress < 1) counterFrame = requestAnimationFrame(tick);
        else finishCounters();
      };
      counterFrame = requestAnimationFrame(tick);
    };
    let observer: IntersectionObserver | null = null;
    let mutations: MutationObserver | null = null;

    const stop = () => {
      counterObserver?.disconnect();
      counterObserver = null;
      finishCounters();
      observer?.disconnect();
      observer = null;
      mutations?.disconnect();
      mutations = null;
      running.forEach((animation) => animation.cancel());
      running.clear();
      observed.clear();
    };
    const start = () => {
      stop();
      if (preference.matches || connection?.saveData) return;
      observer = new IntersectionObserver((entries) => {
        // Coordonner seulement les éléments visibles ensemble dans une section.
        // Le décalage reste borné, même pour une longue grille de cartes.
        const groups = new Map<Element, number>();
        const visible = entries.filter((entry) => entry.isIntersecting)
          .sort((a, b) => Number(b.target.matches(headingSelector)) - Number(a.target.matches(headingSelector)) ||
            (a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        for (const entry of visible) {
          if (!entry.isIntersecting || !entry.target.isConnected || finished.has(entry.target)) continue;
          const target = entry.target;
          finished.add(target);
          observer?.unobserve(target);
          observed.delete(target);
          if (target.contains(document.activeElement)) continue;
          const group = target.closest("section, .footer-grid") ?? target.parentElement!;
          const index = groups.get(group) ?? 0;
          groups.set(group, index + 1);
          const { frames, duration } = motionFor(target);
          const delay = target.matches(headingSelector) ? 0 : Math.min(index, 4) * 70;
          const animation = target.animate(frames, { duration, easing, delay, fill: "backwards" });
          running.set(target, animation);
          animation.onfinish = () => running.delete(target);
        }
      }, { rootMargin: "0px 0px -24px 0px", threshold: 0 });
      const observeTargets = () => {
        const candidates = new Set([...document.querySelectorAll(selector)].filter((target) =>
          !target.closest('[data-reveal="off"]'),
        ));
        const eligible = new Set([...candidates].filter((target) => {
          // Une carte (photo et texte) se déplace ensemble, sans double mouvement.
          for (let parent = target.parentElement; parent; parent = parent.parentElement) {
            if (candidates.has(parent)) return false;
          }
          return true;
        }));
        for (const target of observed) {
          if (!eligible.has(target)) {
            observer?.unobserve(target);
            observed.delete(target);
          }
        }
        for (const [target, animation] of running) {
          if (!eligible.has(target)) {
            animation.cancel();
            running.delete(target);
          }
        }
        for (const target of eligible) {
          if (!finished.has(target) && !observed.has(target)) {
            observer?.observe(target);
            observed.add(target);
          }
        }
      };
      observeTargets();
      counterObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) if (entry.isIntersecting) {
          countTogether(entry.target);
          counterObserver?.unobserve(entry.target);
        }
      }, { threshold: 0 });
      document.querySelectorAll(".impact .stats-grid").forEach((group) => {
        if (!counted.has(group)) counterObserver?.observe(group);
      });
      const main = document.querySelector("main");
      if (main && typeof MutationObserver === "function") {
        mutations = new MutationObserver((records) => {
          if (records.every((record) => record.target instanceof Element && record.target.matches(".stat-count"))) return;
          observeTargets();
        });
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

    const handleVisibility = () => { if (document.hidden) finishCounters(); };
    start();
    document.addEventListener("visibilitychange", handleVisibility);
    preference.addEventListener("change", start);
    connection?.addEventListener?.("change", start);
    document.addEventListener("focusin", handleFocus);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
      preference.removeEventListener("change", start);
      connection?.removeEventListener?.("change", start);
      document.removeEventListener("focusin", handleFocus);
    };
  }, [pathname]);

  return null;
}
