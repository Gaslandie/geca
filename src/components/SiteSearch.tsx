"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { href, type Locale } from "@/content/site";
import { prepareSearch, searchDocuments, suggestSearchDocuments, searchExcerpt, SEARCH_LIMIT, SEARCH_MAX_LENGTH, type SearchDocument } from "@/lib/search";
import { Icon } from "./ui";

export function SiteSearch({ locale, documents, onOpen }: { locale: Locale; documents: SearchDocument[]; onOpen: () => void }) {
  const fr = locale === "fr";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [composing, setComposing] = useState(false);
  const [settledQuery, setSettledQuery] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const index = useMemo(() => prepareSearch(documents), [documents]);
  const matches = useMemo(() => searchDocuments(index, settledQuery), [index, settledQuery]);
  const hasQuery = Boolean(settledQuery.trim());
  const pending = query !== settledQuery || composing;
  const suggested = ["projets", "a-propos/domaines-intervention", "a-propos/mission-vision-valeurs", "contact"];
  const startingPages = suggested.flatMap((path) => documents.filter((document) => document.href === href(locale, path)).slice(0, 1));
  const noMatches = hasQuery && !matches.length;
  const results = noMatches ? suggestSearchDocuments(index, settledQuery, startingPages)
    : hasQuery ? matches.slice(0, SEARCH_LIMIT).map((result) => result.document) : startingPages;

  useEffect(() => {
    if (composing) return;
    const timer = setTimeout(() => setSettledQuery(query), 120);
    return () => clearTimeout(timer);
  }, [query, composing]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  function close() {
    dialogRef.current?.close();
  }

  function keepFocusInDialog(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const controls = event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled), a[href]");
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  function moveResults(event: KeyboardEvent, current = -1) {
    if (event.nativeEvent.isComposing || pending) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      resultRefs.current[Math.min(current + 1, results.length - 1)]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (current <= 0) inputRef.current?.focus();
      else resultRefs.current[current - 1]?.focus();
    } else if (event.key === "Enter" && current === -1 && hasQuery && matches.length) {
      event.preventDefault();
      resultRefs.current[0]?.click();
    }
  }

  const status = pending ? (fr ? "Recherche…" : "Searching…") : !hasQuery
    ? (fr ? "Quelques pages à découvrir" : "Pages to explore")
    : !matches.length ? (fr ? "Aucun résultat pour cette recherche. Essayez un autre mot ou explorez les suggestions ci-dessous." : "No results for this search. Try another word or explore the suggestions below.")
    : (fr ? `${matches.length} résultat${matches.length > 1 ? "s" : ""}${matches.length > SEARCH_LIMIT ? ` — les ${SEARCH_LIMIT} plus pertinents` : ""}` : `${matches.length} result${matches.length > 1 ? "s" : ""}${matches.length > SEARCH_LIMIT ? ` — top ${SEARCH_LIMIT} shown` : ""}`);

  return (
    <>
      <button ref={triggerRef} type="button" className="search-link" aria-label={fr ? "Rechercher" : "Search"} aria-haspopup="dialog" aria-expanded={open} aria-controls="site-search-dialog" onClick={() => {
        onOpen();
        setOpen(true);
        dialogRef.current?.showModal();
        inputRef.current?.focus();
      }}><Icon name="search" /></button>
      <noscript><style>{".search-link { display: none; }"}</style></noscript>
      <dialog ref={dialogRef} id="site-search-dialog" className="search-dialog" aria-labelledby="site-search-title" onKeyDown={keepFocusInDialog} onClose={() => {
        setOpen(false); setQuery(""); setSettledQuery(""); setComposing(false);
        triggerRef.current?.focus({ preventScroll: true });
      }} onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
      }}>
        <div className="search-dialog-heading">
          <h2 id="site-search-title">{fr ? "Que recherchez-vous ?" : "What are you looking for?"}</h2>
          <button type="button" className="search-close" aria-label={fr ? "Fermer la recherche" : "Close search"} onClick={close}><Icon name="close" /></button>
        </div>
        <div role="search">
          <label htmlFor="site-search-input">{fr ? "Rechercher sur le site" : "Search the website"}</label>
          <div className="search-input-row">
            <Icon name="search" />
            <input ref={inputRef} id="site-search-input" type="search" value={query} maxLength={SEARCH_MAX_LENGTH} autoComplete="off" spellCheck={false} placeholder={fr ? "Un projet, un domaine, un lieu…" : "A project, a topic, a place…"} aria-describedby="site-search-help" aria-controls="site-search-results" onChange={(event) => setQuery(event.target.value)} onCompositionStart={() => setComposing(true)} onCompositionEnd={(event) => { setComposing(false); setQuery(event.currentTarget.value); }} onKeyDown={(event) => moveResults(event)} />
            {query && <button type="button" className="search-clear" aria-label={fr ? "Effacer la recherche" : "Clear search"} onClick={() => { setQuery(""); setSettledQuery(""); inputRef.current?.focus(); }}><Icon name="close" /></button>}
          </div>
        </div>
        <p id="site-search-help" className="search-help">{fr ? "Les résultats s’affinent pendant votre saisie. Flèches pour parcourir, Entrée pour ouvrir, Échap pour fermer." : "Results update as you type. Use arrow keys to browse, Enter to open and Escape to close."}</p>
        <p className="search-status" role="status" aria-live="polite" aria-atomic="true">{status}</p>
        {!pending && noMatches && <h3 className="search-suggestions-title">{fr ? "Ces pages peuvent vous aider" : "These pages may help"}</h3>}
        <ul id="site-search-results" className="search-results" aria-label={fr ? "Suggestions de recherche" : "Search suggestions"}>
          {!pending && results.map((result, position) => (
            <li key={`${result.href}-${result.title}`}>
              <Link ref={(element) => { resultRefs.current[position] = element; }} href={result.href} prefetch={false} onClick={close} onKeyDown={(event) => moveResults(event, position)}>
                <span className="search-result-category">{result.category}</span>
                <span className="search-result-title">{result.title}</span>
                {result.text !== result.title && <span className="search-result-excerpt">{searchExcerpt(result.text, settledQuery)}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
