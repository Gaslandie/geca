export type SearchDocument = { title: string; href: string; category: string; text: string };
export const SEARCH_LIMIT = 8;
export const SEARCH_MAX_LENGTH = 120;

export function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/(\d)[\s.,]+(?=\d)/g, "$1").replace(/[^a-z0-9]+/g, " ").trim();
}

const stopWords = new Set("le la les de des du un une et en au aux pour avec dans l d a the and of in to for with".split(" "));
const synonyms = [
  ["don", "dons", "donner", "soutenir", "donate", "donation"],
  ["arbre", "arbres", "reboisement", "plantation", "reforestation", "tree", "trees"],
  ["contact", "telephone", "email", "joindre", "contacter"],
];

// Une seule insertion, suppression ou substitution ; borné aux mots de la saisie.
function nearWord(a: string, b: string) {
  if (a.length < 5 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length <= b.length) j++;
    if (a.length >= b.length) i++;
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

export function prepareSearch(documents: readonly SearchDocument[]) {
  return documents.map((document) => ({
    ...document,
    titleWords: normalizeSearch(document.title).split(" "),
    words: [...new Set(normalizeSearch(`${document.title} ${document.category} ${document.text}`).split(" "))],
  }));
}

export function searchDocuments(documents: ReturnType<typeof prepareSearch>, query: string) {
  const normalized = normalizeSearch(query.slice(0, SEARCH_MAX_LENGTH));
  const tokens = normalized.split(" ").filter((word) => word && !stopWords.has(word)).slice(0, 12);
  if (!tokens.length) return [];
  return documents.map((document) => {
    let score = 0;
    for (const token of tokens) {
      if (document.titleWords.includes(token)) score += 12;
      else if (document.titleWords.some((word) => word.startsWith(token))) score += 9;
      else if (document.words.includes(token)) score += 6;
      else if (document.words.some((word) => word.startsWith(token))) score += 4;
      else if (synonyms.some((group) => group.includes(token) && group.some((word) => document.words.includes(word)))) score += 2;
      else if (document.words.some((word) => nearWord(token, word))) score += 1;
      else return { document, score: 0 };
    }
    return { document, score };
  }).filter((result) => result.score > 0).sort((a, b) => b.score - a.score);
}

/** Pages réellement indexées : mots reconnus, puis points de départ publics. */
export function suggestSearchDocuments(documents: ReturnType<typeof prepareSearch>, query: string, fallback: readonly SearchDocument[]) {
  const tokens = [...new Set(normalizeSearch(query.slice(0, SEARCH_MAX_LENGTH)).split(" ")
    .filter((word) => word.length > 2 && !stopWords.has(word)))].slice(0, 12);
  const scores = new Map<string, { document: SearchDocument; score: number }>();
  for (const token of tokens) {
    for (const result of searchDocuments(documents, token)) {
      const previous = scores.get(result.document.href);
      scores.set(result.document.href, { document: previous?.document ?? result.document, score: (previous?.score ?? 0) + result.score });
    }
  }
  const related = [...scores.values()].sort((a, b) => b.score - a.score).map((result) => result.document);
  return (related.length ? related : fallback).slice(0, 4);
}

export function searchExcerpt(text: string, query: string) {
  const token = normalizeSearch(query).split(" ").find((word) => word.length > 2 && !stopWords.has(word));
  const position = token ? normalizeSearch(text).indexOf(token) : -1;
  const start = position > 80 ? text.lastIndexOf(" ", position - 45) + 1 : 0;
  const excerpt = text.slice(start, start + 190).replace(/\s+/g, " ");
  return `${start ? "…" : ""}${excerpt}${start + 190 < text.length ? "…" : ""}`;
}
