import { readFile, writeFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import { createHash } from 'node:crypto';
const source = await readFile(new URL('../../src/content/site.ts', import.meta.url), 'utf8');
const code = stripTypeScriptTypes(source, { mode: 'strip' });
const site = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const entries = [];
for (const fr of site.getPortfolioProjects('fr')) {
  const en = site.getPortfolioProjects('en').find(p => p.slug === fr.slug);
  const fields = ['title', 'description', 'zone', 'period', 'partner'];
  const pick = p => Object.fromEntries(fields.map(k => [k, p[k]]));
  entries.push({ kind: 'projects', key: fr.slug, payload: { fr: pick(fr), en: pick(en), status: fr.status, photo: { fr: fr.photo ?? null, en: en.photo ?? null } } });
}
for (const fr of site.getNewsEntries('fr')) {
  const en = site.getNewsEntries('en').find(p => p.id === fr.id);
  const pick = p => ({title:p.title, description:p.description, period:p.period});
  entries.push({ kind: 'news', key: fr.id, payload: { fr: pick(fr), en: pick(en), dateTime:fr.dateTime ?? null, path:fr.path, photo:{fr:fr.photo ?? null,en:en.photo ?? null}, ...(fr.id.startsWith('projet-') ? { linked_project: fr.id.slice(7) } : {}) } });
}
for (const member of site.teamMembers) {
  entries.push({kind:'team', key:member.id, payload:{fr:{name:member.name,role:member.role.fr},en:{name:member.name,role:member.role.en},photo:member.photo}});
}
const output = { source: 'src/content/site.ts', sha256: createHash('sha256').update(source).digest('hex'), reference: 'docs/TEXTES-AUTHENTIQUES-CLIENT.md', entries };
await writeFile(new URL('../database/reference/site.json', import.meta.url), JSON.stringify(output, null, 2)+'\n');
console.log(`${entries.length} références exportées depuis les données existantes.`);
