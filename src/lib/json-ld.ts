// Empêche une valeur textuelle de fermer la balise script JSON-LD.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
