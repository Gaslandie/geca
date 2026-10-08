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

Précision prioritaire du 4 octobre 2026 : lire `docs/TEXTES-AUTHENTIQUES-CLIENT.md` avant toute rédaction ou modification de contenu. Ce fichier conserve les textes authentiques transmis par le client via Gassama ; ils priment sur les formulations de la maquette. Les reprendre en priorité, avec seulement des corrections d’orthographe, de petites reformulations ou des développements fidèles sans fait nouveau. Ne modifier le fond du texte source que sur demande du client relayée par Gassama. Ajouter chaque nouveau texte et sa date à cette référence, puis actualiser les rubriques concernées et les traductions dans `src/content/site.ts`. Documenter les révisions du client. Les nouveaux textes authentiques étendent le contenu autorisé au-delà de l’accueil initial. Les références de benchmarking n’apportent jamais de faits GECA. Transmettre aussi cette règle à tout autre agent, avec les exigences permanentes de sécurité, benchmarking et français simple.

Gassama exige de ne pas inventer de texte factuel ou d’information sur GECA. Les pages développent uniquement les informations déjà présentes sur la page d’accueil et dans ses données partagées. Toute reformulation doit conserver le sens et ne pas ajouter de promesse, priorité, action, résultat, chiffre, date, partenaire ou programme non fourni. Si une information manque, la laisser à confirmer ; ne pas la compléter par supposition. Les références de benchmarking servent à l’organisation et au design, jamais à créer des faits GECA. Cette règle s’applique aussi aux traductions et aux consignes préparées pour un autre agent.

Projets & programmes doit rester une seule page `/fr/projets` et `/en/projets`, sans sous-page par statut ni fiche de projet. Les liens de l’accueil peuvent viser des ancres sur cette page.

## Barre mobile et effets — demande du 3 octobre 2026

La demande actuelle remplace les dispositions précédentes : une seule ligne sur mobile avec logo, « Faire un don » complet, recherche puis hamburger ; l’unique FR/EN est dans le menu sur tous les écrans. Garder page courante, clavier, Échap, noms accessibles, panneau superposé et défilement interne. À 200 %, permettre au texte du don de se répartir à l’intérieur du bouton sans débordement. Boutons partagés harmonisés ; don animé immédiatement par trois pulsations de 1,5 seconde, puis arrêt. Toutes les cartes ont une apparition ponctuelle et des transitions de relief. Respecter mouvements réduits, contenu visible sans effets, économie de données pour les apparitions et annulation au focus. Pas de nouvelle donnée GECA ni de service réel. Gassama autorise explicitement le commit et le push de l’ensemble pour publier cet aperçu GitHub Pages.

## Hero — demande du 4 octobre 2026

La photo fournie par Gassama (`Screenshot From 2026-10-04 19-28-41.png`) remplace la photo temporaire du hero. Copie source dans `assets/source-images/images/hero/plantation.png`, variantes publiques locales dans le registre fermé. Avant 768 px : titre, repère et mission sur une seule photo assombrie, textes blancs et repère jaune clair, aucun chargement vidéo ou affiche. Le titre et les textes sont centrés ; la flèche et les deux boutons restent dans le bloc vert séparé sous la photo. À partir de 768 px : nouvelle photo à droite, vidéo et commande accessible conservées. Le grand titre utilise Ubuntu Sans locale, poids 600 et taille commune ; les autres titres gardent leurs polices. Le don conserve trois pulsations de 1,5 seconde, désormais avec un halo plus visible, puis arrêt. Respecter mouvement réduit et arrêt au focus/survol. Source originale et licence de la capture non fournies, à confirmer ; aucune attribution GECA inventée.

## Paragraphes justifiés — demande du 4 octobre 2026

Justifier uniquement les deux paragraphes du hero (« Restaurer les écosystèmes · Renforcer les communautés » et la mission commençant par « En Guinée »), ainsi que la présentation « Notre organisation ». Garder la dernière ligne à gauche et la coupure automatique des mots selon la langue. Cette précision remplace le centrage de ces seuls paragraphes ; les titres, repères, contenus et autres descriptions restent inchangés.

## Identité et implantation — précisions du 4 octobre 2026

Les faits fournis par Gassama dans le chat complètent désormais la source de contenu : création le 14 décembre 2016 ; adoption du nom Global EcoAction (GECA) par RENASCEDD le 26 août 2026, sans changement de mission, d’objectifs ni de continuité opérationnelle. Siège à Kissosso, commune de Matoto, Conakry, République de Guinée (remplace Sangoyah Marché). Intervention dans plusieurs régions naturelles et préfectures, sans liste fournie. Équipe administrative et de terrain compétente en sociologie, ingénierie environnementale et agroforesterie, complétée au besoin par des consultants spécialisés. Réutiliser les données communes de `src/content/site.ts`, y compris pour les traductions. Ne pas inventer d’effectif, de nom ou de lieu supplémentaire.

## Résultats et illustrations — 4 octobre 2026

Les résultats authentiques sont archivés dans `docs/TEXTES-AUTHENTIQUES-CLIENT.md` : 35 000 arbres plantés en 2019 (correction confirmée ensuite par Gassama), 365 000 en 2020, 150 000 en 2021, 84 collectivités accompagnées ; trois réalisations associées dont 40 hectares restaurés en 2021-2022 et accompagnement de collectivités de Kindia et Boké. Reprendre les libellés et détails fournis, sans total extrapolé ni effectif d’emplois inventé. Ces textes remplacent les repères provisoires de la section Impact. Gassama autorise l’utilisation et la réutilisation des images disponibles jusqu’à une demande de remplacement. Conserver sources, licences et étiquettes temporaires existantes ; ne pas attribuer une image réutilisée à une réalisation précise.

## Références récentes — 4 octobre 2026

Les sept références du client et leurs quatre colonnes sont archivées dans `docs/TEXTES-AUTHENTIQUES-CLIENT.md`. Après clarification, Gassama confirme 35 000 arbres en 2019, 550 000 au total et le titre « Reboisement communautaire de 550 000 arbres ». Cette correction remplace le 35 100 initial dans les données actuelles et le titre initial de 150 000 ; les versions reçues restent archivées. Reprendre les objets complets et traductions fidèles. Les trois nouvelles références n’ont pas de statut fourni : ne pas les classer en cours ou réalisées à partir des dates. Conserver la page unique Projets & programmes et les ancres, sans fiches ou sous-pages nouvelles. 11th HOUR PROJECT est nommé comme partenaire/bailleur de la référence CODEC, sans inventer de logo.

## Centrage et espaces communs — règle prioritaire du 4 octobre 2026

Tous les titres et sous-titres des sections et des cartes sont centrés, sur l’accueil et toutes les pages présentes et futures, FR/EN compris. Cette demande remplace les anciennes exceptions d’alignement à gauche, notamment Impact et le titre du hero sur ordinateur. Les en-têtes de section utilisent `SectionHeading` sur toute la largeur disponible avant les colonnes. Les titres internes de carte restent centrés dans leur carte. Le court sous-titre du hero est désormais centré ; son long paragraphe de mission et la présentation de l’organisation gardent la justification demandée.

Utiliser `.card-content` sur le corps textuel de chaque carte (sur la carte elle-même si elle n’a pas d’image), jamais deux fois sur le même corps. Padding commun `--card-padding` (20–32 px), espace des grilles `--card-gap` (20–32 px), séparation entre sections `--section-gap` (24–48 px), marge entre en-tête et contenu `--heading-gap` (28 px). Les sections ordinaires et bandeaux suivent `--section-padding` (52–80 px). Les valeurs s’adaptent à la largeur, pas au survol. Aucune carte ne change padding, marge, bordure en épaisseur ou dimensions au survol/focus. Préserver les transitions d’ombre/couleur, noms accessibles, clavier et préférences de mouvement. Les légendes de photos et commandes gardent leur rôle propre. Voir les règles communes à la fin de `globals.css` et `docs/TYPOGRAPHIE.md` ; vérifier alignement, padding et stabilité au survol lors des futures évolutions. Aucun changement factuel de contenu autorisé par cette tâche.

## Rubrique Équipe retirée — 4 octobre 2026

Gassama demande de retirer « Les femmes et les hommes de GECA » : le client ne dispose pas des photos et informations des membres et ne confirme pas le maintien de la rubrique. Retirer le bloc et les liens Équipe ; ne pas les réintroduire sans nouvelle demande. Les capacités administratives et de terrain fournies par le client restent sur À propos et dans la référence authentique.

## Mission, vision et valeurs validées — 4 octobre 2026

Gassama valide la synthèse proposée à partir des textes client et demande la page dédiée, son développement fidèle et des photos africaines en ligne. Les formulations et développements sont archivés dans `docs/TEXTES-AUTHENTIQUES-CLIENT.md`, avec leur origine éditoriale et la validation de Gassama distinctes des textes initiaux du client. Utiliser `missionVisionContent` pour la page FR/EN et les résumés À propos. Photos africaines temporaires de Commons : conserver crédits visibles, liens sources/licences CC BY-SA et distinction avec les activités GECA ; voir `docs/IMAGES-TEMPORAIRES.md`.

## Défilement uniforme — règle prioritaire du 4 octobre 2026

Toutes les pages présentes et futures FR/EN utilisent `SiteMotion` du layout partagé : apparition unique de 12 px vers 0, durée 480 ms, courbe `cubic-bezier(.2,.65,.3,1)`. Cette règle remplace le zoom particulier du hero. En-têtes, cartes, photos autonomes, textes, réalisations et pied de page suivent le même mouvement. `.section-heading`, `.card-content` et les photos partagées sont reconnus ; ajouter `data-reveal` aux nouveaux blocs de texte autonomes. Ne pas cumuler l’animation d’un parent et de ses enfants ; `data-reveal="off"` exclut un bloc du ciblage. Conserver les fonds photographiques fixes.

Ne pas cacher le contenu en CSS ni réduire son contraste. Respecter mouvement réduit, économie de données, absence de JavaScript/API et annulation au focus. Nettoyer les observateurs et animations aux changements de page ou retraits de cartes. Pas de bibliothèque supplémentaire ni d’écouteur permanent sur `scroll`. Les transitions de survol et les trois pulsations du don conservent leurs réglages distincts, car elles répondent à d’autres interactions.

## Photos et paragraphes des valeurs — 4 octobre 2026

Gassama demande de retirer les légendes sous les deux photos Mission/Vision. Les crédits sont désormais regroupés dans les mentions légales, ancre `credits-photo`, avec lien dédié dans le pied de page FR/EN ; garder auteurs, sources, licences et transformations accessibles à cet endroit. Les paragraphes explicatifs des cinq valeurs (`.mission-value-detail`) sont justifiés, dernière ligne alignée au début ; leurs titres et sous-titres restent centrés. Ne pas modifier les textes.

## Page Domaines — 4 octobre 2026

Remplacer le sommaire des huit domaines par une introduction justifiée avec la même barre dégradée que la présentation de l’accueil. Garder les huit sections illustrées et leurs ancres ; retirer les liens « Revenir aux domaines ». Chaque description garde la phrase authentique, complétée par le développement éditorial demandé et archivé dans `docs/TEXTES-AUTHENTIQUES-CLIENT.md`. L’accueil et À propos gardent leurs descriptions courtes. Appliquer aussi à la version EN, sans ajout factuel.

## Rubrique Ressources suspendue — 4 octobre 2026

Le client, via Gassama, ne souhaite pas la rubrique pour le moment. Retirer le groupe Ressources du menu, les pages Publications & documents (`ressources`), Réseaux (`reseaux`) et Partenaires (`partenaires`), qui étaient ses sous-entrées, ainsi que leurs liens du pied de page, en FR/EN. Ces routes sortent du registre fermé et répondent 404 ; ne pas les réintroduire sans nouvelle demande. Les données authentiques sur les partenaires et leurs logos de l’accueil sont conservés, de même que Devenir partenaire et Nous soutenir.

## Photo du hero sur grand écran — 4 octobre 2026

Dans le hero à deux colonnes (dès 768 px), la photo supérieure doit avoir le même bord gauche et la même largeur que le panneau flèche/actions inférieur : 35 % à droite, 65 % à gauche. Cette demande remplace l’ancienne photo à 20 %. Conserver la composition mobile et le chargement adapté de l’image (`sizes`).

## Référence personnelle des bonnes pratiques — 4 octobre 2026

Gassama demande le fichier `/home/mohamed-gassama/Desktop/BONNES-PRATIQUES-SITES-WEB.md`, à transmettre au début des futurs projets. Il contient les pratiques validées et peut évoluer avec un agent. Proposer chaque nouvelle pratique à Gassama avant de l’y ajouter ; attendre son accord explicite. Un accord pour l’appliquer à GECA n’autorise pas automatiquement son inscription dans cette référence. La première pratique autorisée concerne l’uniformité des cartes, titres/sous-titres centrés, paragraphes longs de quatre à cinq lignes sur mobile justifiés et règles communes déjà convenues. Distinguer préférences de présentation et recommandations générales d’accessibilité. Ne jamais modifier ce fichier à l’insu de Gassama.

## Recherche superposée — 4 octobre 2026

La loupe ouvre un panneau modal au-dessus de la page, avec arrière-plan flouté et résultats au fil de la saisie. Indexer seulement les contenus publics et les routes actives, depuis les données partagées. Ne pas envoyer, journaliser ou conserver les recherches. Conserver fermeture, focus, clavier, noms accessibles, langues et adaptation mobile. Pas de moteur externe, d’IA distante ou de dépendance supplémentaire pour cette maquette statique. Après proposition séparée, Gassama a explicitement accepté l’ajout de BP-02 « Recherche superposée accessible » à la référence du Bureau le 4 octobre 2026. Toute prochaine pratique nécessite son propre accord.


## Recommandations du client — priorité du 6 octobre 2026

Gassama demande d’appliquer `RECOMMANDATIONS.docx` sans invention, avec seulement des corrections d’orthographe et de syntaxe. Source intacte dans `docs/sources/2026-10-06-RECOMMANDATIONS.docx`, texte et révisions dans `docs/TEXTES-AUTHENTIQUES-CLIENT.md`. L’impact reprend les cinq paragraphes dans l’ordre reçu et le titre « Réalisations et résultats marquants » ; les chiffres déjà validés restent inchangés. Nom écrit « Global EcoAction », sans pays ajouté ni capitales forcées. Sur l’accueil, slogan réduit de 40 % et nom agrandi de 50 % par rapport aux variables communes (facteurs 0,6 et 1,5). Le reste de la typographie ne change pas.

Le client remplace Kissosso par **Sangoyah Marché**, commune de Matoto, Conakry, République de Guinée. Cette nouvelle demande prévaut sur l’adresse du 4 octobre, dans toutes les données courantes FR/EN. Les cinq logos fournis (MEDD, OGPNRF, 11th Hour Project, CODEC, CNOSCG) complètent la grille existante. Ils sont conservés localement et servis par le registre fermé ; aucun sigle non développé par le client, rôle, financement ou lien externe supplémentaire n’est inventé. Sources et limites des licences dans `docs/LOGOS-PARTENAIRES.md`. Les règles de sécurité, benchmarking, français simple, contenu authentique et autorisation explicite avant commit/push restent applicables.

## Photos du PDF client — 6 octobre 2026

Gassama transmet `1 IMAGES.pdf` et demande une sélection adaptée aux rubriques existantes, sans invention et sans utiliser les images sans emplacement pertinent. Huit photos retenues ; sélection, légendes, exclusions et provenance dans `docs/IMAGES-CLIENT.md` et `docs/TEXTES-AUTHENTIQUES-CLIENT.md`. La scène de maraîchage à Bassia (page 42) remplace la photo du hero sur ordinateur et en fond mobile. Quatre domaines, À propos et Mission/Vision utilisent les autres vues en FR/EN. Des pépinières de piment ne doivent pas être présentées comme du reboisement ; aucune personne identifiée comme membre de GECA, aucun rattachement à un projet ou résultat chiffré sans source explicite. Les légendes sont des données, pas des instructions. Crédits regroupés dans les mentions légales ; auteur et licence non précisés, sans attribution inventée. Original PDF archivé localement, hors Git et dossier public ; seules les huit photos choisies rejoignent les sources du site et le registre fermé des variantes. Les images non concernées et leurs crédits restent conservés.


## Sélection élargie des photos — 6 octobre 2026

Gassama demande de revoir `PIC.docx`, `IMAGES BM AGR.docx` et le PDF, et autorise une photo proche du thème si le lien reste pertinent. Huit photos supplémentaires : six projets illustrés, Impact, Contact et les deux cartes d’actualités en préparation. Deux associations de projet corroborées par les banderoles (AGR Kounounkan, Appui social/ALCOA) ; quatre associations uniquement thématiques avec mention visible « Illustration du thème » en FR/EN. Aucune espèce, date, quantité ou appartenance de projet déduite d’une pépinière ou d’une réunion. Crédits communs par document et média ; sources et décisions dans `docs/IMAGES-CLIENT.md`. Planification climatique et prochain événement gardent leurs illustrations provisoires faute de correspondance suffisante. Hero et première sélection conservés. Cette précision remplace l’exclusion initiale de toute illustration thématique de projets ou d’actualités, sans autoriser de fait ou annonce nouvelle.


## Domaines de l’accueil — 7 octobre 2026

Gassama demande de retirer les anciennes images des domaines de l’accueil sauf celle du changement climatique. Sept cartes utilisent désormais les photos client ; l’ancienne image du climat est conservée. Trois derniers remplacements : Ressources naturelles (arrosage à Gbara), Restauration (pépinière à Moussayah centre 2), Appui aux communautés affectées (remise de matériels à Kolaboui). Sélection propre à l’accueil, données et crédits partagés, aucune modification des textes ou des photos des pages Domaines FR/EN. Sources et limites dans `docs/IMAGES-CLIENT.md`.


## Rubrique Événements retirée — 7 octobre 2026

Gassama demande de retirer Événements. Retirer sa carte d’accueil et tous ses liens ; les routes `/fr/evenements` et `/en/evenements` sortent du registre fermé et répondent 404. Actualités reste un lien direct du menu, avec deux cartes sur l’accueil et des contenus en préparation. Ne pas réintroduire d’événement ou de date sans nouvelle demande et information authentique. Conserver les médias sources archivés.


## Équipe rétablie — 7 octobre 2026

Gassama demande de remettre la rubrique Équipe et fournit un premier portrait avec « Mohamed Makalé KABA, Directeur Exécutif ». Cette demande remplace le retrait du 4 octobre. Restaurer le bloc d’accueil et la page `/fr/equipe` / `/en/equipe`, avec liens dans À propos et le pied de page. Utiliser uniquement les portraits, noms et postes transmis, centralisés dans `src/content/site.ts` et archivés dans `docs/TEXTES-AUTHENTIQUES-CLIENT.md`. Ne pas inventer de biographie ou de membre. Photos locales optimisées, sans métadonnées privées dans les variantes publiques ; provenance et limites des droits documentées. Ajouter les prochains membres au fil des envois.


## Hero en carrousel — 7 octobre 2026

Nouvelle demande prioritaire : retirer vidéo et grande flèche, garder textes et deux actions, centrer le contenu lisible sur un plein fond photographique mobile/ordinateur. Trois vues client jusque-là inutilisées (PDF pages 39, 51, 34) changent toutes les cinq secondes en boucle avec fondu, sans commande de pause demandé expressément. Global et Action jaunes, Eco vert adapté au fond sombre. Premier fond fixe si mouvement réduit, économie de données ou absence de JavaScript ; minuteur nettoyé et suspendu dans les onglets cachés. La limite d’accessibilité de l’absence de pause est documentée dans le benchmark. Cette consigne remplace les compositions vidéo et 65/35 antérieures. Aucun texte factuel changé, crédits et registre fermé conservés.


## Hero sans carte et navigation fixe — 7 octobre 2026

Retirer le fond et l’élévation du bloc des textes du hero ; conserver un voile sombre sur les images et les textes existants. Barre persistante en haut sur toutes les pages, avec espace de défilement selon sa hauteur pour les ancres et le focus. Liens directs sur grand écran dès 1280 px ; hamburger sous ce seuil et lorsque le texte agrandi ne tient plus. FR/EN unique dans la navigation, sous-menu À propos au clavier et Échap conservés. Cette demande remplace le hamburger permanent et la carte du hero. Aucun contenu factuel changé ni commit/push autorisé.


## Nom du hero agrandi — 7 octobre 2026

Garder Global/Action jaunes et Eco vert. Nom renforcé : jaune doré --gold, vert existant, facteur 1,8 de --text-label et poids 800. Cette précision remplace le facteur 1,5 du seul nom dans le hero ; les autres règles typographiques restent applicables.


## Cinq fonds du hero — 7 octobre 2026

Le carrousel du hero contient désormais cinq photos client distinctes : les trois fonds précédents et deux vues jusque-là inutilisées, PDF pages 47 et 59. Garder cadence de cinq secondes, textes, absence de pause demandée, fallback fixe et crédits. Cette demande remplace le nombre de trois fonds.

## Animations coordonnées — demande du 7 octobre 2026

Gassama demande davantage de mouvement avec uniformité et un effet propre aux titres. Cette demande remplace le mouvement unique de 12 px / 480 ms : appliquer la famille partagée de `SiteMotion` documentée dans `docs/TYPOGRAPHIE.md`, titres 720 ms, cartes/photos 600 ms, textes/actions 560 ms et petits décalages bornés. Conserver les protections d'accessibilité, l'apparition ponctuelle, l'absence de mouvements imbriqués et les préférences de mouvement/données. Les cartes se déplacent en entier ; les titres autonomes ont leur effet distinct. Aucun changement factuel ni typographique final.

## Actualités documentées — demande du 7 octobre 2026

Gassama demande les actualités passées jusqu'à aujourd'hui, sans invention. Les pages Actualités FR/EN et les deux cartes d'accueil présentent désormais les repères d'identité et les sept références client, en archives. Réutiliser `getNewsEntries` et les projets communs ; distinguer les dates de repère des périodes de projet, sans fabriquer de publication ou annoncer une nouvelle action. Archives non exhaustives. De nouveaux articles demandent de nouveaux faits authentiques, archivés dans la référence client. Préserver les crédits et étiquettes des photos, les registres fermés, la recherche locale et les mouvements communs.

## Logo GECA transparent — 7 octobre 2026

Gassama demande une version transparente du logo. `BrandLogo` utilise le dérivé local `global-ecoaction-logo-transparent.png`, préparé par suppression du fond avec imagegen et servi en variantes WebP alpha via le registre fermé. Original intact, même cadre et dimensions, pas de nouvelle identité ou recoloration. Pas de fond blanc CSS dans la navigation ; support clair conservé au pied de page pour le slogan noir sur vert sombre. Provenance et limites dans `docs/LOGO-GECA.md`. Ne pas modifier les partenaires par cette demande.

## Hero : alignement à gauche — 7 octobre 2026

Gassama demande les textes du hero « à gauche ». Nom, slogan, sous-titre et mission partagent désormais le même bord gauche sur mobile et ordinateur. Cette exception prime sur le centrage des titres et la justification sur deux bords de la mission. Boutons et autres sections suivent leurs règles existantes. Ne pas changer les textes ni les médias.

## Boutons uniformisés — 7 octobre 2026

Gassama valide trois niveaux communs : principal plein, secondaire avec contour et lien discret souligné. Réutiliser `Button` (`primary`, `secondary`, `text`) et `.button` pour les boutons natifs du formulaire ; `tone="inverse"` sur fond sombre. Doré réservé au don. Variables communes : hauteur minimale 48 px, arrondi 8 px, padding 12/22 px, espace des groupes 16 px. Commandes à icônes compactes de 44 px minimum ; don de la barre compact pour tenir sur mobile et à 200 %. Aucun changement de dimensions au survol ou au focus. Conserver liens/destinations, noms accessibles, clavier, mouvements réduits, trois pulsations du don et formulaire sans envoi. Voir `docs/TYPOGRAPHIE.md` et `docs/BENCHMARK.md`. Cette demande remplace les anciennes formes particulières des boutons ; elle n’autorise ni ajout à la référence du Bureau, ni commit/push.

## Actualités horizontales sur ordinateur — 7 octobre 2026

Gassama demande une actualité par ligne sur la page Actualités FR/EN : dès 1024 px, photo à gauche (38 %) et texte à droite (62 %), puis actualité suivante. Image au-dessus du texte sur mobile/tablette. Pas de hauteur fixe ni de texte coupé ; entrées sans photo sur toute la largeur. Conserver contenus, médias, crédits, boutons, titres centrés et animations partagées. Les cartes d’accueil restent inchangées. Voir `docs/TYPOGRAPHIE.md` et `docs/BENCHMARK.md`.

## Back-office Laravel et hébergement Bluehost — 7 octobre 2026

Gassama choisit Laravel en PHP avec MySQL, à la place de la proposition WordPress. Hébergement visé : abonnement Bluehost existant ; domaine `globalecoaction.org` conservé chez OVH. Cette demande autorise la préparation du back-office et remplace la restriction de maquette seule pour ce périmètre. Compatibilité du compte Bluehost encore à vérifier : PHP/extension, MySQL maintenu, accès de déploiement et racine limitée à `public`. Voir `docs/BACKOFFICE.md`. Le site Next.js et les données authentiques sont conservés ; leur liaison et la republication restent à développer, sans prétendre qu’une installation de Laravel les actualise automatiquement. Aucun DNS, service mail, compte réel, paiement ou envoi d’e-mails modifié par cette seule décision. Conserver les contrôles serveur, protections des fichiers/sessions, tests autorisés/refusés, benchmarking et français simple. Aucun commit/push sans demande explicite.


## Domaines de l’accueil en cercles — 7 octobre 2026

Gassama demande d’adapter à l’accueil les deux captures de cercles photographiques et contour au survol. Les huit domaines gardent leurs titres, descriptions, photos et destinations ; titre blanc centré sur photo assombrie, description et lien discret sous le cercle, contour vert au survol et au clavier. Quatre colonnes dès 1280 px, deux dès 700 px, une en dessous. Le texte à 200 % peut augmenter la hauteur de la forme pour rester entier. Cette présentation remplace l’alternance photo/texte des seuls domaines de l’accueil FR ; ne pas modifier les pages Domaines ni inventer un accueil EN, encore en préparation. Garder composants, variables typographiques, padding/espaces, apparition commune, sources/crédits et restrictions de mouvement. Aucun changement du back-office, aucun commit/push autorisé.

## Actualités en cartes et pages détaillées — 7 octobre 2026

Gassama demande une liste de cartes avec photo supérieure et extrait, puis une page dédiée par actualité. Cette demande remplace les actualités horizontales et la limitation antérieure à une liste seule. Les neuf archives communes ont des routes fermées `/fr/actualites/[id]` et `/en/actualites/[id]`. Conserver texte intégral, périodes distinctes des dates de repère, crédits, labels thématiques, retour et précédent/suivant. Aucun fait ajouté. Projets reste une page unique avec ancres. Les liens d’accueil et de recherche visent les articles.

## Bandeau partenaires sous le hero — 7 octobre 2026

Gassama demande un bandeau lent avec les noms des partenaires, sans logos, à la fin du hero. Réutiliser les douze noms de `homeContent.partners.items`. Conserver la section des logos à sa place. `PartnerTicker` : boucle lente, pause clavier/bouton, survol/focus, suspension hors écran/onglet caché ; liste fixe avec préférences de mouvement/données ou sans JavaScript. Aucun fait ajouté.

## Impact de l’accueil : référence Mehad — 7 octobre 2026

Gassama demande le récit à gauche et quatre cartes chiffrées décalées à droite sur fond clair. Remplace le fond photo et les cartes empilées de l’impact. Conserver cinq paragraphes client et quatre chiffres exacts, sans ajout. En-tête centré dans la colonne de texte ; cartes vertes, sans pictogrammes, décalage grand écran seulement. Texte puis cartes sur mobile/tablette ; conserver padding, animations, clavier, contrastes et mouvement réduit. Sources de l’ancienne photo conservées.


## CRITICAL RULE — SCAFFOLDING POLICY

Consigne permanente de Gassama — 7 octobre 2026. Cette règle prime sur les anciennes consignes imposant des fichiers, plans, audits ou documents de suivi non indispensables à la tâche demandée. Elle ne réduit aucune exigence de sécurité.

You must only create scaffolding (extra files, folders, plans, audits, verification scripts, certification machinery, evidence gathering, process documentation, or any supporting structure) when it is strictly and immediately necessary to complete the requested task.

Default behavior:

- Prefer the simplest, most direct solution.
- Do the actual work first.
- Avoid creating any extra structure, process, or files unless the task cannot be completed without them.
- If you are about to create scaffolding, stop and ask yourself: “Is this absolutely required right now to finish the user’s request?” If the answer is no, do not create it.
- Never expand scope into process, architecture, audits, or “best practices” unless explicitly asked.

When scaffolding is truly required:

- Keep it minimal.
- Explain briefly why it is necessary.
- Remove or clean it up if it is no longer needed.

Violating this rule (creating unnecessary scaffolding) is considered a failure to follow instructions.

## Logos partenaires en carrousel — 7 octobre 2026

Gassama demande la disposition de sa capture Mehad, avec avance automatique et flèches manuelles pour la section des partenaires du bas. Conserver les douze logos, noms, textes authentiques et sources. `PartnerCarousel` affiche 5/3/1 logos selon la largeur, sans cartes ni feuillage, avec pause, flèches, clavier et défilement tactile. Avance toutes les six secondes ; interruption après commande manuelle, survol/focus, hors écran et onglet caché. Pas d’automatique avec mouvement réduit/économie de données, grille complète sans JavaScript. Bandeau des noms sous le hero inchangé. Aucun nouvel organisme, fait, service ou dépendance.


## Suggestions du client — 8 octobre 2026

Gassama demande d’appliquer les cinq suggestions client archivées dans docs/TEXTES-AUTHENTIQUES-CLIENT.md : doubler exactement le nom Global EcoAction du hero (facteur 3,6 de --text-label), Eco en vert foncé, supprimer l’attente entre les transitions du carrousel des logos du bas, éclaircir les photos par un voile moins opaque et retirer le support blanc CSS du logo transparent du pied de page. Conserver les textes, photos, noms accessibles, commandes clavier et préférences de mouvement/données. Cette demande remplace les anciennes couleurs/taille du nom et le support clair du logo du pied de page. Aucun commit, push ou déploiement autorisé par cette demande.


## Eco sans effet — 8 octobre 2026

Gassama demande de garder Eco uniquement en vert foncé (--green-dark), sans contour clair, halo ou ombre. Cette correction remplace l’effet ajouté aux suggestions du client. Ne pas le réintroduire sans demande.


## Champ et activation newsletter — 8 octobre 2026

Gassama demande de retirer le grand effet de focus du champ e-mail ; garder seulement une bordure fine sombre, sans ombre, dimensions inchangées et repère clavier visible. Il autorise la réalisation d’une newsletter réelle ; le prestataire et le compte restent à préciser avant connexion. Ne pas afficher de fausse confirmation, exposer de clé privée ni publier d’adresse d’abonné. Cette demande remplace la restriction d’aperçu sans envoi pour ce seul périmètre une fois le service choisi et configuré.


## Newsletter interne — 8 octobre 2026

Gassama choisit une gestion interne dans Laravel et préfère d’abord l’interne lorsque c’est pertinent et de bonne qualité. Le module local gère demandes d’inscription, confirmation d’adresse, abonnés privés, campagnes texte, simulations, désinscription et suppression d’adresse. Aucune donnée factuelle GECA inventée. Mode preview par défaut ; aucune connexion SMTP distante ou publication autorisée par cette demande. Le formulaire Next peut transmettre par POST vers une page GECA sans écriture ; la véritable inscription exige consentement et CSRF. Pour Pages, seule NEXT_PUBLIC_NEWSLETTER_PUBLIC_URL peut activer le formulaire : ne jamais publier l’URL locale. Conserver limites d’abus, chiffrement, secrets privés, propriété des campagnes côté serveur, droits recontrôlés et sessions publiques/administration distinctes. Consignes d’usage et limites dans docs/BACKOFFICE.md et backoffice/README.md. Aucun ajout à la référence personnelle du Bureau.

## Accueil anglais — 8 octobre 2026

Gassama demande l’accueil EN complet à partir du FR actuel. Utiliser Home/Projects communs et `getHomeContent(locale)` dans `src/content/site.ts`, les traductions existantes des projets/domaines et les mêmes médias. Traductions fidèles, chiffres et noms client conservés ; ne pas inventer de fait. Menus, métadonnées, recherche, suggestions, commandes et libellés accessibles suivent FR/EN. Le slogan intégré au logo reste inchangé. Cette demande remplace l’accueil anglais en préparation ; les autres rubriques en préparation gardent leur état. Newsletter Laravel locale conservée, sans envoi réel ou configuration distante. Aucun commit, push ou déploiement autorisé par cette demande.


## Adresse retenue partout — priorité du 8 octobre 2026

Gassama retient « Kissosso, commune de Matoto, Conakry, République de Guinée ». Cette demande remplace l’adresse Sangoyah Marché du 6 octobre pour toutes les données courantes FR/EN. Réutiliser `identity.address` ; traduction EN fidèle. Anciennes adresses conservées uniquement dans l’historique des textes reçus. Carte du quartier Kissosso sans inventer l’emplacement précis du bureau. Aucun autre fait, commit, push ou déploiement autorisé par cette correction.
