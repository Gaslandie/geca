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

## Typographie et prochaines pages

Gassama précise le 3 octobre 2026 : retirer surtout les pictogrammes encombrants des cartes. Conserver les icônes utiles aux commandes : hamburger/croix, loupe, chevrons des sous-menus et pause/lecture vidéo. Conserver leurs noms accessibles, états et contrôles au clavier. La grande flèche dorée du hero vers les deux liens est demandée. Cette précision remplace la consigne antérieure de retrait total. Photos et logos conservés.

Gassama demande une même logique typographique sur l’accueil et les futures pages, inspirée de Panthera. Suivre `docs/TYPOGRAPHIE.md` et les variables communes de `src/app/globals.css`. Réutiliser le layout et les composants partagés ; garder des h2 de section uniformes et une navigation lisible. Centrer les en-têtes principaux de section, leurs repères et descriptions sur toute la largeur ; placer les liens d’ensemble en dessous. Ne pas ajouter de police ou de taille propre à une section sans raison liée à son rôle. Circular Std et Exemplar Pro ne sont pas fournies sous licence pour GECA : les alternatives libres documentées sont chargées localement. Ne pas récupérer les fichiers commerciaux de Panthera. Les consignes de sécurité, benchmarking et explication simple restent obligatoires.

Maquette locale uniquement : Next.js, App Router, TypeScript, React et Tailwind CSS. Contenus dans `src/content/site.ts`. Gassama a autorisé le 3 octobre 2026 des photos temporaires d’Internet, avec une étiquette visible « Image temporaire ». Conserver leurs sources et licences, et les remplacer ensuite par les photos GECA authentiques. Pas de visuels générés ni de faux logos partenaires. Aucun Payload CMS, MongoDB, Docker, VPS, suivi d’audience, paiement ou système réel d’envoi d’e-mails à cette étape. Ne faire aucun commit ni push sans instruction explicite.

Avant un changement, vérifier les fichiers présents et l’état Git. Ne pas supprimer de fichier utile. Vérifier TypeScript, lint, compilation, routes et interfaces aux tailles adaptées. Les tests doivent conserver les contrôles d’accès et l’accessibilité.

Après chaque modification du site, actualiser aussi le serveur local utilisé par Gassama, puis vérifier que `http://127.0.0.1:3000/fr` affiche la version courante et charge ses styles. En mode compilé (`npm run start`), reconstruire et redémarrer le serveur GECA après les vérifications. En mode développement (`npm run dev`), vérifier la prise en compte automatique des changements. Ne pas considérer un serveur de test sur un autre port comme la mise à jour du serveur consulté par Gassama. Conserver l'écoute sur `127.0.0.1` et ne pas arrêter un processus sans avoir confirmé qu'il appartient au projet. Préférence confirmée le 3 octobre 2026.

## Aperçu GitHub Pages — demandé le 3 octobre 2026

Gassama demande maintenant un lien GitHub Pages pour montrer la maquette au client. Cette demande étend le périmètre local à un aperçu statique public. Garder le serveur local sur `127.0.0.1:3000`, les contenus existants, les sources d'images et le formulaire sans envoi. Workflow dans `.github/workflows/pages.yml` ; export public dans `out`. Après une compilation Pages, reconstruire le mode local puis redémarrer le serveur de Gassama. Les limites des en-têtes HTTP sur Pages sont documentées dans `docs/BENCHMARK.md`. Ne pas ajouter de compte, de données privées ou de service réel. La règle de confirmation explicite avant commit et push reste applicable.

## Contenu sans invention — confirmé le 3 octobre 2026

Gassama exige de ne pas inventer de texte factuel ou d’information sur GECA. Les pages développent uniquement les informations déjà présentes sur la page d’accueil et dans ses données partagées. Toute reformulation doit conserver le sens et ne pas ajouter de promesse, priorité, action, résultat, chiffre, date, partenaire ou programme non fourni. Si une information manque, la laisser à confirmer ; ne pas la compléter par supposition. Les références de benchmarking servent à l’organisation et au design, jamais à créer des faits GECA. Cette règle s’applique aussi aux traductions et aux consignes préparées pour un autre agent.

Projets & programmes doit rester une seule page `/fr/projets` et `/en/projets`, sans sous-page par statut ni fiche de projet. Les liens de l’accueil peuvent viser des ancres sur cette page.

## Barre mobile et effets — demande du 3 octobre 2026

La demande actuelle remplace les dispositions précédentes : une seule ligne sur mobile avec logo, « Faire un don » complet, recherche puis hamburger ; l’unique FR/EN est dans le menu sur tous les écrans. Garder page courante, clavier, Échap, noms accessibles, panneau superposé et défilement interne. À 200 %, permettre au texte du don de se répartir à l’intérieur du bouton sans débordement. Boutons partagés harmonisés ; don animé immédiatement par trois pulsations de 1,5 seconde, puis arrêt. Toutes les cartes ont une apparition ponctuelle et des transitions de relief. Respecter mouvements réduits, contenu visible sans effets, économie de données pour les apparitions et annulation au focus. Pas de nouvelle donnée GECA ni de service réel. Gassama autorise explicitement le commit et le push de l’ensemble pour publier cet aperçu GitHub Pages.
