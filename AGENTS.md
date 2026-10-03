<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Consignes permanentes de Gassama

La sécurité s’applique à la conception, au code, aux tests, à la revue et à la livraison. Examiner les risques du périmètre et conserver les protections existantes. Contrôler côté serveur les droits et le propriétaire réel des données. Ne jamais se fier à un bouton masqué, à un rôle ou à un identifiant fourni par le navigateur. Valider les entrées et fichiers ; protéger les sessions, données privées et secrets. Examiner les abus, dépendances et sauvegardes quand le changement les concerne.

Vérifier les cas autorisés ET refusés, notamment l’accès direct, le changement de compte et les droits révoqués lorsqu’ils existent. Ne jamais affaiblir une protection pour faire passer un test. Un risque confirmé bloque l’action qui expose les données jusqu’à correction ; les travaux indépendants peuvent continuer. Rapporter les vérifications réelles, les limites et les risques restants, sans promettre une sécurité absolue.

Avant toute conception, réalisation ou adaptation, comparer les références reconnues du domaine. Noter les sources, la date, les observations réelles et ce qui est adapté à GECA. Vérifier qu’un benchmark récent reste pertinent avant de le réutiliser. Signaler les accès impossibles sans inventer de résultats. Ne pas copier aveuglément ; respecter le périmètre autorisé. La comparaison du 3 octobre 2026 est dans `docs/BENCHMARK.md`.

Expliquer à Gassama en français simple, avec des phrases courtes, des exemples concrets et sans ton infantilisant, comme à quelqu’un de 10 ans. Dire d’abord ce qui change, pourquoi et ce qu’il peut essayer. Expliquer les mots techniques indispensables et préciser où agir. Cette règle vaut pendant le travail, dans le rapport final et dans les questions.

Toute consigne ou tout prompt préparé pour un autre chat ou agent IA doit reprendre explicitement les exigences de sécurité, de benchmarking et d’explication simple ci-dessus, même si les fichiers du projet lui sont transmis.

# Périmètre actuel

Maquette locale uniquement : Next.js, App Router, TypeScript, React et Tailwind CSS. Contenus dans `src/content/site.ts`. Gassama a autorisé le 3 octobre 2026 des photos temporaires d’Internet, avec une étiquette visible « Image temporaire ». Conserver leurs sources et licences, et les remplacer ensuite par les photos GECA authentiques. Pas de visuels générés ni de faux logos partenaires. Aucun Payload CMS, MongoDB, Docker, VPS, suivi d’audience, paiement ou système réel d’envoi d’e-mails à cette étape. Ne faire aucun commit ni push sans instruction explicite.

Avant un changement, vérifier les fichiers présents et l’état Git. Ne pas supprimer de fichier utile. Vérifier TypeScript, lint, compilation, routes et interfaces aux tailles adaptées. Les tests doivent conserver les contrôles d’accès et l’accessibilité.

Après chaque modification du site, actualiser aussi le serveur local utilisé par Gassama, puis vérifier que `http://127.0.0.1:3000/fr` affiche la version courante et charge ses styles. En mode compilé (`npm run start`), reconstruire et redémarrer le serveur GECA après les vérifications. En mode développement (`npm run dev`), vérifier la prise en compte automatique des changements. Ne pas considérer un serveur de test sur un autre port comme la mise à jour du serveur consulté par Gassama. Conserver l'écoute sur `127.0.0.1` et ne pas arrêter un processus sans avoir confirmé qu'il appartient au projet. Préférence confirmée le 3 octobre 2026.
