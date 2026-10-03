/** Les fichiers publics doivent aussi fonctionner sous /geca sur GitHub Pages. */
export function assetPath(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
