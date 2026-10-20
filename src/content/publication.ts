import data from "./publication.json";
import type { Locale, LocalPhoto, NewsEntry, Project } from "./site";

type PublishedPhoto = { sha256: string; width: number; height: number; alt: Record<Locale, string> };
type Patch = { kind: "projects" | "news" | "team"; key: string; deleted: boolean; new?: boolean; texts?: Partial<Record<Locale, Record<string, string>>>; photo?: PublishedPhoto };
// Le fichier est contrôlé par publication-input.mjs avant toute compilation.
const changes = data.entries as unknown as Patch[];
export const publicationId: string | null = data.id;
const photo = (item: Patch, locale: Locale): LocalPhoto | undefined => item.photo ? {
  src: `/images/optimized/publication-${item.photo.sha256}.webp`, alt: item.photo.alt[locale],
  contextLabel: locale === "fr" ? "Illustration du thème" : "Thematic illustration",
} : undefined;
// L'anglais non fourni utilise le texte français, sans traduction inventée.
const texts = (item: Patch, locale: Locale) => Object.fromEntries(Object.entries(item.texts?.[locale] ?? {}).map(([key, value]) => [key, value || (locale === "en" ? item.texts?.fr?.[key] ?? "" : "")]));

export function publishedProjects(base: readonly Project[], locale: Locale): Project[] {
  const result = [...base];
  for (const item of changes.filter(item => item.kind === "projects")) {
    const index = result.findIndex(entry => entry.slug === item.key);
    if (item.deleted) { if (index >= 0) result.splice(index, 1); continue; }
    if (index < 0 && !item.new) throw new Error("Référence projet absente du site.");
    const previous: Project = result[index] ?? { slug: item.key, title: "", description: "", zone: "", period: "", partner: "", status: null };
    const entry = { ...previous, ...(item.new && locale === "en" ? item.texts?.fr : {}), ...texts(item, locale), ...(item.photo ? { photo: photo(item, locale) } : {}) };
    if (index >= 0) result[index] = entry; else result.push(entry);
  }
  return result;
}

export type TeamMember = { id: string; name: string; role: Record<Locale, string>; photo?: { src: string; width: number; height: number } };
export function publishedTeam(base: readonly TeamMember[]): TeamMember[] {
  const result = [...base];
  for (const item of changes.filter(item => item.kind === "team")) {
    const index = result.findIndex(entry => entry.id === item.key);
    if (item.deleted) { if (index >= 0) result.splice(index, 1); continue; }
    if (index < 0 && !item.new) throw new Error("Référence équipe absente du site.");
    const previous = result[index];
    const fr = texts(item, "fr"), en = texts(item, "en");
    const entry: TeamMember = { id: item.key, name: fr.name ?? previous?.name ?? "", role: { fr: fr.role ?? previous?.role.fr ?? "", en: en.role ?? previous?.role.en ?? fr.role ?? "" }, photo: item.photo ? { src: photo(item, "fr")!.src, width: item.photo.width, height: item.photo.height } : previous?.photo };
    if (index >= 0) result[index] = entry; else result.push(entry);
  }
  return result;
}

export function publishedNews(base: readonly NewsEntry[], locale: Locale): NewsEntry[] {
  const result = [...base];
  for (const item of changes.filter(item => item.kind === "news")) {
    const index = result.findIndex(entry => entry.id === item.key);
    if (item.deleted) { if (index >= 0) result.splice(index, 1); continue; }
    // Une actualité liée à un projet retiré reste absente.
    if (index < 0 && item.key.startsWith("projet-")) continue;
    if (index < 0 && !item.new) throw new Error("Référence actualité absente du site.");
    const previous: NewsEntry = result[index] ?? { id: item.key, title: "", description: "", period: "", category: locale === "fr" ? "Actualité" : "News", path: `actualites/${item.key}` };
    const entry = { ...previous, ...(item.new && locale === "en" ? item.texts?.fr : {}), ...texts(item, locale), ...(item.photo ? { photo: photo(item, locale) } : {}) };
    if (item.texts?.[locale]?.period !== undefined) delete entry.dateTime;
    if (index >= 0) result[index] = entry; else result.unshift(entry);
  }
  return result;
}
