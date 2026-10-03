# Livraison locale — 3 octobre 2026

## Centrage des sections et partenaires — avant commit et push

Le 3 octobre 2026, Gassama demande des titres et sous-titres centrés partout, une section partenaires comme la référence, puis un commit et un push. Les sept en-têtes principaux de l’accueil partagent maintenant `.section-heading` : repère, trait doré, titre et description centrés sur la largeur de la section ; liens d’ensemble en dessous. La présentation et l’impact utilisent aussi cette règle. Les deux blocs d’appel à l’action sont centrés chacun dans leur colonne. Les cartes et le pied de page conservent leur disposition de contenu. La règle des prochaines pages est actualisée dans `docs/TYPOGRAPHIE.md`.

La capture partenaires originale est examinée à nouveau avant adaptation. Fond clair, feuilles décoratives discrètes en CSS, arc doré et cinq cartes égales ; une colonne sur téléphone, trois sur tablette puis cinq sur ordinateur. Les cinq fichiers officiels locaux et leurs proportions sont conservés : aucun logo redessiné ni découpé depuis la référence. La comparaison est dans `docs/BENCHMARK.md`.

Vérifications réelles sur le serveur courant du port 3000 : TypeScript, lint et compilation réussis ; **18 tests navigateur passent**. Ils contrôlent aussi le centrage des titres, repères et descriptions des sept en-têtes à huit largeurs, ainsi que les dimensions égales des cinq cartes partenaires. Les routes FR/EN, accès directs autorisés et refusés, images distantes interdites, protections HTTP, menus, filtres, clavier, règles automatiques d’accessibilité et comportements vidéo restent vérifiés. Aucun contrôle assoupli. Texte agrandi à 200 % à 320 et 1440 px : contenus et navigation restent dans le cadre.

Contrôle complémentaire à douze largeurs de 320 à 1942 px : aucun débordement horizontal, polices locales chargées et styles HTTP 200. Cinq logos partenaires décodés à 375, 768, 1024, 1440 et 1942 px. Captures de la présentation, de l’impact, des actualités et des partenaires examinées, dont partenaires sur téléphone et ordinateur. Le lien « Aller au contenu » peut rester visible dans les captures après navigation clavier ; son comportement au focus est conservé. Le serveur compilé GECA a été identifié par son dossier et son processus puis redémarré avec cette version ; écoute sur `127.0.0.1` uniquement.

Avant enregistrement, les modifications de cette passe et des précédentes sont relues, l’état Git est vérifié et le dépôt distant `origin` est récupéré : aucun écart entre `main` et `origin/main` avant le nouveau commit. Recherche ciblée de signatures usuelles de clés privées et jetons dans les sources, documents, tests et médias : aucun résultat ; cette recherche n’est pas une preuve exhaustive d’absence de secret. Les fichiers `.env*`, caches et résultats générés restent ignorés. Commit et push explicitement autorisés vers `https://github.com/Gaslandie/geca.git` ; ils n’autorisent pas un déploiement du site.

Limites : Chrome Linux avec tailles simulées, sans appareils physiques ni revue complète par lecteur d’écran. Maquette sans compte, session ou droit révocable : changement de compte et révocation sans objet. Aucun service, donnée privée, collecte, dépendance ou protection modifié ; aucun nouvel audit de dépendances, alertes précédentes conservées dans leur périmètre. Les photos temporaires et les données d’impact restent à remplacer ou à valider avant publication.

## Typographie commune et navigation agrandie

À la demande de Gassama, l’accueil et le layout des pages FR/EN utilisent maintenant **DM Sans** et **DM Serif Display**, alternatives gratuites choisies après inspection réelle de Panthera et accord explicite pour une police proche sans achat. Les licences SIL OFL accompagnent les fichiers locaux. Les titres de section partagent une taille de 30 à 45 px, le même poids et la même hauteur de ligne. Textes, cartes, repères et boutons suivent aussi une règle commune. La navigation principale passe à 18 px, avec des sous-menus à 16 px. Le grand titre conserve les bandes dorées ; sa police suit la nouvelle présentation. Les adaptations précédentes restent présentes. Comparaison dans `docs/BENCHMARK.md`, consignes pour les prochaines pages dans `docs/TYPOGRAPHIE.md` et `AGENTS.md`.

Vérifications finales réellement effectuées : `npm run typecheck`, `npm run lint`, `npm run build` et **18 tests navigateur** réussis sur le serveur courant `http://127.0.0.1:3000`. La suite vérifie les 48 routes FR/EN, les accès autorisés et refusés, les protections HTTP, les restrictions d’images distantes, les liens, menus, filtres, clavier, règles automatiques d’accessibilité et tous les comportements vidéo. Elle vérifie aussi l’uniformité des h2 principaux et la navigation d’au moins 18 px aux huit tailles habituelles. Aucun contrôle de sécurité ou d’accessibilité assoupli.

Contrôles complémentaires à 320, 375, 599, 600, 768, 1024, 1199, 1200, 1399, 1400, 1440 et 1942 px : aucun débordement horizontal ; titres de section uniformes ; deux polices locales chargées ; feuilles de styles HTTP 200. Les pages `/fr/a-propos` et `/en/projets/kounounkan` utilisent la police commune de titre. Captures du premier écran, de la navigation, de la présentation, des domaines, de l’impact et des actualités examinées sur les tailles adaptées.

Texte porté à 200 % : les débordements des sections repérés lors de la passe précédente sont corrigés. À 320 px, les contenus, le menu téléphone et son sous-menu ouvert restent dans le cadre. À 1440 px, un premier contrôle révélait un dépassement de la navigation ; le retour des liens sur plusieurs lignes corrige ce cas. Les contrôles et le test dédié réussissent ensuite aux deux tailles. Capture du premier écran agrandi à 320 px examinée. Ce contrôle de taille racine CSS ne représente pas toutes les formes de zoom des navigateurs.

La compilation initiale a été bloquée par l’ouverture d’un port dans le bac à sable ; un échec restait mémorisé dans le cache Turbopack. Le cache généré a été déplacé dans `/tmp/geca-turbopack-before-typography-20261003`, puis la compilation autorisée a réussi. Aucun fichier source supprimé. Le serveur compilé du port 3000 a été identifié par son dossier et son processus, puis redémarré avec la compilation finale. La page et ses styles courants sont vérifiés ; écoute confirmée sur `127.0.0.1` uniquement. Aucun commit, push ni déploiement.

Sécurité et limites : aucune dépendance, donnée privée, saisie, connexion ou collecte ajoutée. Les polices ne provoquent aucune requête vers Google Fonts ou Panthera. Essais dans Chrome Linux avec tailles simulées, sans appareils physiques ni revue complète par lecteur d’écran. Aucun compte ni droit révocable dans la maquette : changement de compte et révocation sans objet. Aucun nouvel audit de dépendances pour ce changement de présentation ; les alertes précédemment documentées restent applicables. Les polices sont proches de la référence, sans prétendre être les fichiers commerciaux exacts. Les rubriques encore en préparation reçoivent déjà la présentation commune, mais leur contenu reste à réaliser.

## Grand titre « Agir pour un avenir durable » — bandes dorées

Le 3 octobre 2026, le titre du premier écran reçoit deux bandes dorées centrées, ajustées au texte, avec de grandes lettres vert foncé épaisses, selon la capture de Gassama. Le contenu, les liens, la vidéo locale, sa commande de lecture/pause et tous ses comportements de secours restent présents. Les modifications de la section Actualités du tour précédent sont conservées. Sources et comparaison préalable dans `docs/BENCHMARK.md`.

Vérifications réelles : TypeScript, lint et compilation réussis ; **17 tests navigateur réussis** sur le serveur courant `http://127.0.0.1:3000`, avec huit largeurs de 320 à 1440 px, routes FR/EN, accès directs autorisés et refusés, restrictions des images distantes, protections HTTP, liens, clavier, accessibilité automatique et vidéo (pause, mouvements réduits, économie de données, échec et absence de JavaScript). Aucun contrôle assoupli ni protection modifiée.

Contrôle complémentaire du titre à 320, 375, 599, 600, 670, 767, 768, 970, 1015, 1024 et 1440 px : deux bandes jointives, centrées, aucun texte tronqué ni débordement, feuilles de styles HTTP 200. Contraste mesuré entre `#003f1b` et `#ebad0e` : **6,09:1**. Captures du premier écran à 375, 1015 et 1440 px examinées. À 320 px avec taille racine de texte portée à 200 %, le titre se répartit sur davantage de lignes sans sortir du cadre ; les deux liens et la commande vidéo restent lisibles et séparés. Capture de ce cas examinée.

Limite repérée par ce contrôle supplémentaire : l’ensemble de la page présente des débordements à 320 px lorsque la taille racine de texte est doublée. Ils sont localisés dans les sections Qui sommes-nous, Domaines, Impact et certains liens de section ; aucun élément du premier écran ne dépasse. Ces sections ne sont pas modifiées dans cette adaptation du titre. Ce contrôle CSS du texte agrandi ne représente pas toutes les formes de zoom des navigateurs. Autres limites : Chrome Linux avec tailles simulées, sans appareils physiques ni revue complète par lecteur d’écran ; aucun compte ou droit révocable à tester dans cette maquette. Aucun audit de dépendances rejoué pour ce changement de présentation sans nouvelle dépendance.

Le serveur compilé GECA du port 3000 a été identifié par son dossier et son processus, puis redémarré après compilation. La page courante et ses styles sont vérifiés ; écoute confirmée uniquement sur `127.0.0.1`. Aucun commit, push ni déploiement dans ce tour.

## Actualités et événements — adaptation à la capture

Le 3 octobre 2026, la section « La vie de GECA » reprend les deux cartes photographiques, les catégories vertes, les flèches rondes et la carte événement sur fond végétal clair de la capture fournie. Titre et lien d’ensemble sur la même ligne sur ordinateur ; contenus empilés sur téléphone et événement pleine largeur sous les deux actualités sur tablette. Les textes existants et « Contenu en préparation » sont conservés. Deux photos locales sont réutilisées ; une photo gratuite de feuille est ajoutée, avec provenance dans `docs/IMAGES-TEMPORAIRES.md`. Chaque photo porte « Image temporaire ». La comparaison préalable est dans `docs/BENCHMARK.md`.

Vérifications réellement effectuées : TypeScript, lint et compilation réussis. Les **17 tests navigateur existants passent** sur le serveur courant `http://127.0.0.1:3000` : 48 routes FR/EN, liens internes, clavier, accessibilité automatique, images, vidéo, huit largeurs de 320 à 1440 px. Le contrôle existant des illustrations est actualisé de 9 à 12 pour inclure les trois nouvelles cartes, sans réduire ses exigences. Captures de la section à 375, 768 et 1440 px examinées.

Contrôle complémentaire de la section à 320, 375, 599, 600, 768, 1023, 1024, 1440 et 1942 px : une, deux puis trois colonnes selon la largeur ; trois photos décodées et trois étiquettes ; aucun débordement horizontal ni étiquette de catégorie tronquée ; flèches et bouton d’au moins 44 px de haut ; feuilles de styles répondant 200. Capture à 1942 px examinée. Les liens Actualités au clavier et Événements au clic aboutissent aux bonnes pages à 320 et 1440 px. Un premier script lisait l’adresse avant la fin de la navigation ; le contrôle final attend son achèvement et réussit.

Sécurité : routes inconnues, fichiers privés, services exclus et images distantes restent refusés ; protections HTTP présentes. Aucun service, compte, saisie, donnée privée, dépendance ou protection modifié. Le serveur compilé GECA du port 3000 a été identifié par son dossier et son processus, puis redémarré avec ce build. Écoute confirmée sur `127.0.0.1` uniquement. Git était propre avant modification. Aucun commit, push ni déploiement dans cette adaptation.

Limites : photos d’illustration, sans action ou membre GECA attribué ; pages Actualités et Événements encore en préparation. Essais dans Chrome Linux avec tailles simulées, sans appareils physiques ni revue complète par lecteur d’écran. Aucun compte ni droit révocable dans la maquette : changement de compte et révocation sans objet. Aucun nouvel audit de dépendances, car aucune dépendance n’est changée ; les alertes précédemment documentées restent à traiter dans leur périmètre.

## Relecture avant le premier commit — 3 octobre 2026

Demande explicite de Gassama : relire, committer et pousser. Aucun dépôt Git utilisable au départ, même dans l’environnement autorisé. Un dépôt neuf a été initialisé sur `main`, sans remplacement d’un historique existant. La destination du push n’est pas fournie ; elle a été demandée à Gassama.

Relecture des routes, composants, contenus, styles, configuration, tests et provenances des médias. La comparaison documentée du même jour dans `docs/BENCHMARK.md` reste pertinente ; aucune nouvelle conception ni nouvelle consultation des références n’est revendiquée. Le README est corrigé pour décrire les lignes alternées des domaines et les sept photographies temporaires. Le site affiche actuellement neuf sections ; les bilans plus bas conservent les observations de leurs versions précédentes, notamment l’ancienne section d’approche. Aucun changement de présentation ni protection affaiblie dans cette passe.

Contrôles réellement rejoués : TypeScript, lint et compilation réussis ; **17 tests navigateur réussis** sur la version compilée courante à `http://127.0.0.1:3000`. Les 48 routes FR / EN, les liens, les menus, les filtres, le clavier, les images, les comportements du lecteur vidéo et huit largeurs de 320 à 1440 px passent. Les accès directs inconnus, fichiers privés et services exclus restent refusés ; les images distantes sont refusées et les en-têtes protecteurs sont présents. Contrôle supplémentaire à 375, 768 et 1440 px : cinq logos décodés, textes alternatifs présents, affichage avec proportions conservées, aucun débordement horizontal et feuille de styles courante répondant 200. Capture partenaires à 1440 px examinée.

Le serveur GECA du port 3000 a été identifié par son dossier et son processus, puis redémarré après compilation. Il écoute sur `127.0.0.1` uniquement. Aucun secret ni fichier d’environnement n’a été repéré dans les sources à enregistrer ; les fichiers générés et `.env*` sont ignorés par Git.

Audits des dépendances rejoués en ligne : aucune vulnérabilité signalée avec `npm audit --omit=dev`. L’audit complet conserve les cinq entrées élevées liées à `braces` dans la chaîne des outils de lint déjà documentée ci-dessous. Cette chaîne n’est pas servie aux visiteurs et ne reçoit pas de motif fourni par le navigateur ; aucune rétrogradation automatique des outils n’est appliquée.

Limites : tests dans Chrome Linux avec tailles simulées, sans appareils physiques ni revue complète par lecteur d’écran. Aucun compte ni session dans la maquette ; changement de compte et droits révoqués sans objet ici. Les contenus, preuves d’impact et droits de publication des médias restent à valider avant une mise en ligne. Un commit et un push Git ne constituent pas un déploiement du site.

Les sections suivantes sont les bilans des passes précédentes.

## Dernière adaptation : Qui sommes-nous ?

Le 3 octobre 2026, la présentation immédiatement après la vidéo reçoit le titre « Qui sommes-nous ? ». Son paragraphe commence exactement par « Global EcoAction (GECA), anciennement RENASCEDD » et présente brièvement son identité et sa mission. Le lien devient « À propos de GECA » et garde la destination `/fr/a-propos`. La signature et la date de création restent présentes. Seuls les textes de cette section et la documentation sont modifiés. Références comparées avant adaptation : `docs/BENCHMARK.md`.

Vérifications réelles : `npm run lint`, `npm run typecheck` et `npm run build` réussissent. Les **17 tests navigateur passent**, avec huit largeurs de 320 à 1440 px, 48 routes FR / EN, liens, menus, filtres, accessibilité automatique et comportements du lecteur vidéo. Un contrôle supplémentaire à 375, 768 et 1440 px confirme la position immédiatement après la vidéo, le titre, la mention exacte, l'absence de débordement horizontal et le clic vers À propos avec réponse 200. Les trois captures `test-results/about-375.png`, `test-results/about-768.png` et `test-results/about-1440.png` ont été examinées. La page À propos reste la rubrique en préparation prévue dans cette maquette.

Sécurité : les tests d'accès directs refusés aux routes inconnues, fichiers privés et services exclus passent ; en-têtes protecteurs et refus des images distantes conservés. Aucun compte, session, formulaire, collecte, service externe ni dépendance ajouté. Changement de compte et droits révoqués sans objet dans cette maquette sans connexion. Aucun nouvel audit des dépendances ; les limites documentées plus bas restent applicables.

Essais dans Chrome Linux avec tailles simulées, sans téléphone ni tablette physiques. Les contrôles automatiques d'accessibilité ne constituent pas une revue complète. Version locale mise à jour sur **http://127.0.0.1:3000/fr**, serveur redémarré avec la nouvelle compilation et limité à cette machine. Git reste inutilisable (`fatal: not a git repository`), vérifié avant modification. Aucun commit, push ni déploiement.

## Adaptation précédente : photos dans les domaines

Le 3 octobre 2026, à la demande de Gassama, les six domaines d'intervention affichent chacun une photo avant leur titre. Les pictogrammes, flèches et numéros 01 à 06 sont retirés uniquement de cette section. Titres, descriptions et destination du lien sont conservés. Une colonne sur téléphone, deux sur tablette et trois sur écran large ; photos au format 16:10, servies localement avec `next/image` et chargement différé.

Trois photos déjà présentes sont réutilisées et trois JPEG gratuits Unsplash sont ajoutés. Les pages sources et la licence ont été consultées ; les téléchargements ont été limités en poids et leur signature, format, dimensions et décodage contrôlés avec Pillow. Les six images ont été examinées. Toutes portent « Image temporaire » et un texte alternatif qui ne les attribue pas à GECA. Sources, auteurs, dimensions et limites : `docs/IMAGES-TEMPORAIRES.md`. Comparaison avant adaptation : `docs/BENCHMARK.md`.

Vérifications réelles après modification : lint, TypeScript et compilation réussis. Les **17 tests navigateur passent** à 320, 375, 670, 767, 768, 970, 1024 et 1440 px pour les parcours d'écran. À chaque taille, le chargement réel et l'étiquette des huit illustrations visibles sont contrôlés : six domaines et deux projets. Aucun débordement horizontal ni violation des règles automatiques d'accessibilité testées. Les 48 routes FR / EN, les liens, menus, filtres, clavier et tous les tests du lecteur vidéo continuent de passer. Les captures de la section à 375, 768 et 1440 px ont été examinées ; un relevé navigateur supplémentaire confirme six photos chargées et aucun SVG dans les domaines.

Sécurité : routes inconnues, fichiers privés et services exclus toujours refusés ; images distantes toujours refusées et en-têtes protecteurs conservés. Aucun nouveau service, compte, formulaire, secret, suivi ni dépendance ajouté. Les images récupérées sont des fichiers JPEG locaux, pas du contenu HTML ou du code exécuté dans le site. Changement de compte et droits révoqués ne s'appliquent pas à cette maquette sans connexion. Les alertes de développement documentées plus bas restent applicables ; aucun nouvel audit de dépendances n'a été effectué.

Limites : essais Chrome Linux sur tailles simulées, sans appareils physiques. Les contrôles automatiques ne remplacent pas une revue d'accessibilité complète. Les photographies illustrent des thèmes ; elles ne prouvent ni action GECA ni localisation guinéenne et devront être remplacées par les vrais visuels GECA.

Version disponible sur **http://127.0.0.1:3000/fr**. Captures : `test-results/domains-375.png`, `test-results/domains-768.png`, `test-results/domains-1440.png`. Le serveur reste limité à cette machine. Git a été vérifié avant modification et reste non exploitable (`fatal: not a git repository`). Aucun fichier utile supprimé, aucun commit, push ni déploiement.

## Adaptation précédente : vidéo et message court

Le 3 octobre 2026, la vidéo fournie par Gassama remplace l'image et la carte du premier écran. Le contenu devient « GLOBAL ECOACTION · GUINÉE », « AGIR POUR / UN AVENIR DURABLE », « Restaurer les écosystèmes · Renforcer les communautés », puis deux boutons centrés. Sur téléphone, ces boutons s'empilent. La carte blanche, son chevauchement et le repère Conakry du premier écran sont retirés. Aucun autre contenu de section n'est remplacé. Le fichier source de Downloads reste intact ; sa copie publique est identique par SHA-256. Voir `docs/VIDEO-HERO.md` et `docs/BENCHMARK.md`.

Vérifications finales réellement effectuées : `npm run lint`, `npm run typecheck` et `npm run build` réussissent. Les **17 tests navigateur passent**. Les huit tailles contrôlées sont 320, 375, 670, 767, 768, 970, 1024 et 1440 px. Les huit captures du premier écran ont été examinées. Texte centré sur le visuel, boutons d'au moins 44 px de hauteur et pause cliquable vérifiés à chaque taille. Aucun débordement horizontal, aucune erreur JavaScript observée dans les parcours de tailles et aucune violation des règles automatiques d'accessibilité testées. Menus, filtres, clavier, langue anglaise, mouvements réduits, deux photos temporaires de projets visibles et liens internes passent. Les 48 routes FR / EN restent accessibles.

Le lecteur a été vérifié en lecture réelle dans Chrome : fichier décodé, temps de lecture qui avance, sans son, propriétés boucle et lecture dans la page actives ; pause au clavier, arrêt conservé quand le focus passe au lien, reprise par clic et arrêt lors d'une demande de mouvements réduits. Une requête partielle du MP4 reçoit 206 et `video/mp4`, avec une signature `ftyp`. Tests de secours réussis : média bloqué, lecture automatique refusée, économie de données sans téléchargement du MP4 au départ puis lecture explicitement demandée, et JavaScript désactivé avec image de secours réellement chargée et liens présents. La commande de lecture inactive est cachée sans JavaScript.

Sécurité : les routes inconnues, fichiers privés et services exclus restent refusés ; images distantes refusées, en-têtes protecteurs présents. Seule la vidéo demandée et l'image extraite sont copiées dans le dossier public ; aucun accès au dossier Downloads n'est ajouté au site. Aucun compte, session, téléversement, formulaire, secret, traqueur, service externe ou nouvelle dépendance. Les contrôles de changement de compte et de droits révoqués ne s'appliquent pas à cette maquette sans connexion. Aucun nouvel audit de dépendances effectué ; l'alerte de développement documentée plus bas reste applicable.

Limites : Chrome Linux avec tailles simulées, sans essai sur téléphone ou tablette physiques ni Safari. L'accessibilité automatique n'est pas une revue manuelle complète. Le fichier original de 13 Mo est utilisé localement ; il n'a pas été recompressé. Sa licence d'origine n'a pas été fournie, et le visuel ne prouve aucune localisation en Guinée. La maquette n'est pas publiée. Les refus de lecture sont simulés dans les tests ; les politiques propres à chaque navigateur réel peuvent varier.

Version finale disponible sur **http://127.0.0.1:3000/fr**, serveur limité à cette machine. L'état Git reste non exploitable (`fatal: not a git repository`). Aucun commit, push ou déploiement.

## Adaptation précédente : tablette et téléphone

Le 3 octobre 2026, le premier écran a été ajusté aux deux nouvelles captures de Gassama. Sous 768 px, la photo est au format 16:9 et le bloc blanc vient entièrement dessous, sur toute la largeur, sans chevauchement ni ombre. À partir de 768 px, la carte reste à droite sur la photo. Sa largeur sur tablette laisse une partie de l'image visible à gauche. Les textes client, le logo, les couleurs, les liens et l'étiquette « Image temporaire » sont conservés. Sources et limites : `docs/BENCHMARK.md`.

Vérifications réelles : lint et TypeScript réussis ; compilation finale réussie. Les douze tests navigateur passent. Les huit largeurs vérifiées sont 320, 375, 670, 767, 768, 970, 1024 et 1440 px. Les contrôles mesurent la position réelle du bloc sous la photo ou à droite, sa largeur sur téléphone et le chevauchement sur tablette. Aucun débordement horizontal ni violation des règles automatiques d'accessibilité testées. Les huit captures du premier écran ont été examinées. Les menus, filtres, liens internes, clavier, langues, images chargées et mouvements réduits passent aussi. Les tests couvrent les 48 routes FR / EN.

Sécurité : les accès directs aux routes inconnues, fichiers privés et services exclus restent refusés ; les images distantes sont refusées et les en-têtes protecteurs sont présents. Aucun service, dépendance, compte, session, collecte ou envoi ajouté. Changement de compte et révocation de droits ne s'appliquent pas à cette maquette sans connexion. Les alertes et limites documentées plus bas restent applicables ; aucun nouvel audit des dépendances n'a été effectué pour cette modification de CSS.

Limites : essais dans Chrome Linux avec tailles simulées, sans téléphone ni tablette physiques. Les contrôles automatiques d'accessibilité ne remplacent pas une revue manuelle complète. Le serveur local a été redémarré avec la compilation finale pour éviter de réutiliser une ancienne page dont le fichier de style n'existait plus. La limite de largeur appliquée par Tailwind à 640 px a aussi été neutralisée uniquement pour le bloc du premier écran sous 768 px ; les tests à 670 et 767 px confirment la pleine largeur.

La version finale est disponible sur **http://127.0.0.1:3000/fr**, serveur limité à cette machine. Captures : `test-results/hero-375.png` pour le téléphone et `test-results/hero-970.png` pour la tablette. L'état Git initial reste non exploitable : `fatal: not a git repository`. Aucun commit, push ou déploiement.

## Adaptation précédente : hero demandé

Le premier écran reprend la disposition de la capture fournie : photo pleine largeur, carte blanche à droite et débordement de 64 px sous la photo sur les grands écrans. Sur téléphone, la photo précède la carte avec un chevauchement de 48 px. Les textes exacts du client, les couleurs GECA, les deux liens et l'étiquette « Image temporaire » sont conservés. La comparaison et ses limites sont consignées dans `docs/BENCHMARK.md`.

Vérifications du 3 octobre 2026 après cette adaptation : `npm run lint`, `npm run typecheck` et `npm run build` réussissent. Les neuf tests navigateur passent, y compris les 48 routes FR / EN, les liens de l'accueil, les images chargées, les menus, les filtres, le clavier, les mouvements réduits et les contrôles automatiques d'accessibilité à 320, 375, 768, 1024 et 1440 px. Les cinq captures du premier écran ont été examinées. Aucun débordement horizontal détecté. Il s'agit de tailles simulées dans Chrome Linux, sans nouveau test sur téléphone réel.

Sécurité : les accès directs aux routes inconnues, fichiers privés et services exclus restent refusés ; les images distantes restent refusées et les en-têtes protecteurs restent présents. Aucun service, dépendance, compte, collecte de données ou envoi ajouté. Les comptes et droits révoqués ne s'appliquent pas à cette maquette sans connexion. Les limites et l'alerte de développement documentées plus bas restent valables.

L'état Git a été vérifié avant modification : le dossier n'est pas un dépôt Git utilisable (`fatal: not a git repository`). Aucun commit, push ou déploiement. L'essai initial des tests a été bloqué par les sockets interdits dans le bac à sable ; les mêmes tests ont ensuite réussi avec l'autorisation de démarrer le serveur local.

## Adaptation précédente : logo reçu

Le logo transmis par Gassama est intégré à l'en-tête et au pied de page. La palette utilise son vert et son jaune doré, avec des variantes sombres pour les textes. TypeScript, lint et compilation réussissent ; les neuf tests navigateur passent sur la dernière version. Un contrôle supplémentaire confirme le chargement des logos et un en-tête sur une ligne à onze largeurs, de 320 à 1440 px. Les contrôles d'accès refusés et d'accessibilité restent actifs. Source, couleurs, observations et limites : `docs/IDENTITE-VISUELLE.md`.

## Résultat

Les onze sections de l’accueil sont présentes, dans l’ordre demandé. Les six domaines d’intervention utilisent une grille sobre. Les quatre projets sont répartis entre deux filtres, avec deux projets visibles à la fois. L’approche utilise une liste de quatre principes. Les photos, l’équipe et les actualités restent des contenus de maquette, clairement remplaçables.

La navigation mène à 48 pages FR / EN au total : deux accueils et 23 rubriques par langue, dont les quatre pages projet. Toutes les rubriques, y compris la recherche et le soutien, affichent le composant partagé en préparation. Le site anglais affiche cet écran et une navigation traduite. La racine `/` redirige vers `/fr`.

URL laissée ouverte : **http://127.0.0.1:3000/fr**, serveur `npm run start` limité à `127.0.0.1`. Le mode développement a aussi été démarré et vérifié sur le port 3001, puis arrêté.

## Vérifications réellement effectuées

| Vérification                                    | Résultat                                                                                                                            |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| TypeScript — `npm run typecheck`                | Réussi                                                                                                                              |
| Lint — `npm run lint`                           | Réussi, aucune erreur ni avertissement                                                                                              |
| Compilation — `npm run build`                   | Réussie avec Next.js 16.3.8 et Turbopack                                                                                            |
| Tests navigateur — `npm run test:e2e`           | 9 tests réussis sur la dernière passe                                                                                               |
| 48 pages FR / EN                                | Réponses HTTP 200, langue correcte, titre présent et écran d’attente sur les rubriques                                              |
| Tous les liens internes présents dans l’accueil | Réponses HTTP 200                                                                                                                   |
| Menus                                           | Ouverture des quatre groupes, fermeture par Échap avec retour du focus, navigation vers une rubrique et fermeture du menu mobile    |
| Filtre projets                                  | Passage En cours / Réalisés, deux projets affichés et retour au filtre initial                                                      |
| Largeurs 320, 375, 768, 1024 et 1440 px         | Aucun débordement horizontal dans l’accueil, les menus ouverts et les rubriques contrôlées                                          |
| Clavier                                         | Lien d’accès au contenu fonctionnel, focus rendu au bouton du menu, liens de changement de langue                                   |
| Mouvements réduits                              | Préférence simulée ; durée de transition du bouton contrôlée à zéro                                                                 |
| Accessibilité automatique                       | Aucune violation détectée par axe pour les règles WCAG A / AA et 2.1 AA sur l’accueil aux cinq tailles et sur une rubrique anglaise |
| JavaScript navigateur                           | Aucune erreur `pageerror` pendant les parcours aux cinq tailles                                                                     |
| Requêtes du navigateur                          | Aucune requête extérieure pendant ces parcours ; images et polices locales                                                          |
| Inspection visuelle                             | Captures du premier écran examinées aux cinq tailles ; vue de l’accueil complet examinée à 1440 px                                  |
| Démarrage développement                         | `/fr` répond HTTP 200 sur le port local 3001                                                                                        |
| Installation reproductible                      | `npm ci --ignore-scripts --offline` réussi dans une copie temporaire du manifeste et du verrouillage, depuis le cache npm           |

Les premiers tests avaient détecté deux débordements liés aux proportions des emplacements photo et un problème de focus du lien d’accès au contenu. Le code a été corrigé puis les neuf tests ont été rejoués avec succès. Les règles de contrôle n’ont pas été désactivées.

Les captures finales se trouvent dans `test-results/home-320.png` à `home-1440.png` et `hero-320.png` à `hero-1440.png`. Le rapport détaillé se trouve dans `playwright-report/index.html`. Ces fichiers générés sont ignorés par Git.

## Sécurité : cas autorisés et refusés

- Les pages publiques prévues répondent correctement en accès direct.
- Les rubriques inconnues, les projets inconnus et la langue non prévue `/es` répondent 404.
- Les chemins `/api/contact`, `/api/payments`, `/.env` et `/src/content/site.ts` répondent 404.
- Une tentative d’optimisation d’image provenant d’un domaine distant non autorisé répond 400.
- Les en-têtes `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` et `X-Robots-Tag: noindex, nofollow` ont été contrôlés. L’en-tête `X-Powered-By` n’est pas envoyé.
- Aucun compte, session, fichier privé ou rôle n’existe dans cette étape. Changement de compte, propriétaire des données et révocation des droits sont donc hors périmètre de ces tests. Ils devront être contrôlés côté serveur lorsque ces fonctions seront ajoutées.

### Dépendances et limites restantes

`npm audit --omit=dev`, exécuté en ligne, ne signale **aucune vulnérabilité dans les dépendances utilisées par le site** à cette date. Ce résultat ne constitue pas une garantie de sécurité absolue.

L’audit complet, exécuté en ligne, signale **5 entrées de sévérité élevée**, issues de la même chaîne des outils de lint : `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces`. [L’avis GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) indique que des motifs d’accolades très imbriqués peuvent provoquer un débordement de pile. Aucune version corrigée de `braces` n’est publiée au 3 octobre 2026.

Cette chaîne est en dépendance de développement. Elle n’est pas appelée par les visiteurs, et le lint ne reçoit aucun motif fourni par le navigateur. L’alerte reste à surveiller et à corriger dès qu’une version compatible sera disponible. La proposition automatique de rétrograder `eslint-config-next` à la version 14 n’a pas été appliquée : elle ne convient pas à cette base Next.js 16.

ESLint 10 est utilisé avec l’adaptateur officiel `@eslint/compat` afin de conserver toutes les règles des plugins Next.js / React. L’installation signale des avertissements de compatibilité déclarée de certains plugins encore limités à ESLint 9 ; les contrôles réels et la réinstallation depuis le verrouillage réussissent. Le script d’installation optionnel `unrs-resolver` a été bloqué par npm dans cet environnement ; aucune permission de script supplémentaire n’a été accordée, et le lint fonctionne.

Les tests ont été exécutés dans Chrome sur Linux, avec des tailles simulées. Aucun test sur un appareil iOS / Android réel, Safari, Firefox ou lecteur d’écran n’a été effectué. L’audit automatique ne remplace pas une évaluation humaine complète de l’accessibilité. Les comptes, sauvegardes et dépendances du futur CMS devront être étudiés lorsqu’ils entreront dans le périmètre.

## Commandes principales utilisées

Inspection :

```bash
ls -la
find . -maxdepth 5 -type f -print
git status --short --branch
node --version
npm --version
```

Versions et installation :

```bash
npm view next version
npm view react version
npm view tailwindcss version
npm view eslint version
npm view braces version
npm view eslint-config-next@16.3.8 peerDependencies --json
npm install --cache /tmp/geca-npm-cache --fetch-retries=1 --fetch-timeout=30000
npm install --save-dev --save-exact eslint@10.12.0 --cache /tmp/geca-npm-cache
npm install --save-dev --save-exact @eslint/compat --cache /tmp/geca-npm-cache
```

Les polices locales ont été copiées depuis `/usr/share/fonts/truetype/ubuntu/` et `/usr/share/fonts/truetype/noto/`, avec leurs licences depuis `/usr/share/doc/`. La première version ne contenait aucune photo téléchargée. La demande suivante de Gassama autorise des photos temporaires d’Internet ; leur adaptation et les vérifications sont documentées dans `docs/IMAGES-TEMPORAIRES.md`.

Nettoyage, contrôles et démarrage :

```bash
npm exec --yes --cache /tmp/geca-npm-cache --package=prettier -- prettier --write src tests next.config.ts playwright.config.ts eslint.config.mjs postcss.config.mjs tsconfig.json package.json README.md docs/BENCHMARK.md
npm run lint
npm run typecheck
npm run build
npm run test:e2e
npm audit --omit=dev --json --cache /tmp/geca-npm-cache
npm audit --json --cache /tmp/geca-npm-cache
npm run dev -- --port 3001
curl -sS -o /tmp/geca-dev-fr.html -w '%{http_code}\n' http://127.0.0.1:3001/fr
npm run start
curl -sS -o /tmp/geca-final-fr.html -w '%{http_code}\n' http://127.0.0.1:3000/fr
```

Des captures et des mesures de débordement ont aussi été prises avec Playwright. Le premier essai de compilation dans le bac à sable a été bloqué par l’interdiction d’ouvrir le port interne de Turbopack. La compilation locale a ensuite été autorisée et réussie. Les ports du serveur du site restent limités à `127.0.0.1`.

## Fichiers livrés

Le dossier initial ne contenait aucun fichier de site. Les fichiers ci-dessous ont donc été créés ; aucun ancien fichier utile n’a été supprimé.

```text
.gitignore
AGENTS.md
CLAUDE.md
README.md
package.json
package-lock.json
tsconfig.json
next-env.d.ts
next.config.ts
postcss.config.mjs
eslint.config.mjs
playwright.config.ts
docs/BENCHMARK.md
docs/VERIFICATIONS.md
public/icon.svg
src/content/site.ts
src/app/route.ts
src/app/globals.css
src/app/[locale]/layout.tsx
src/app/[locale]/page.tsx
src/app/[locale]/[...slug]/page.tsx
src/app/fonts/UbuntuSans.ttf
src/app/fonts/Ubuntu-LICENSE.txt
src/app/fonts/NotoSerif.ttf
src/app/fonts/Noto-LICENSE.txt
src/components/ui.tsx
src/components/Header.tsx
src/components/Footer.tsx
src/components/Home.tsx
src/components/Projects.tsx
src/components/UnderConstruction.tsx
tests/site.spec.ts
```

`AGENTS.md` et `CLAUDE.md` ont été générés par le premier démarrage de Next.js, puis enrichis avec les exigences permanentes de Gassama : sécurité, benchmarking et explications simples. Le répertoire `.git` reste vide et protégé en lecture seule ; l’initialisation Git n’a pas été possible. Aucun commit ni push.

## Notre impact — présentation demandée le 3 octobre 2026

Section modifiée : photo locale de collines boisées sous un voile vert, titre sur deux lignes, description à droite sur ordinateur, chiffres sur fond clair avec trois pictogrammes dorés. Empilement sur téléphone ; trois colonnes à partir de 768 px. Source et licence de la photo dans `docs/IMAGES-TEMPORAIRES.md`, comparaison dans `docs/BENCHMARK.md`.

TypeScript, lint et build réussis. Les 17 tests existants passent sur un serveur neuf `127.0.0.1:3100`. La copie temporaire dans `/tmp/geca-impact-check` adapte uniquement les chemins et le port ; les assertions de sécurité sont conservées. Les tests vérifient les routes autorisées et refusées, les en-têtes protecteurs, le refus des images distantes, les liens, le clavier, la vidéo, l'accessibilité et l'absence de débordement à 320, 375, 670, 767, 768, 970, 1024 et 1440 px. Le contrôle des photos attend maintenant neuf illustrations, chacune chargée et étiquetée. Captures `test-results/impact-375.png`, `impact-768.png` et `impact-1440.png` examinées. Une petite partie du lien « Aller au contenu », encore au focus pendant le test clavier, apparaît au bord de la capture téléphone ; elle n'appartient pas à la section.

Le premier lancement dans le bac à sable a refusé l'ouverture du port local (`EPERM`). Après autorisation, le passage sur le port 3000 a échoué au chargement des styles ; le serveur neuf sur 3100 a permis les vérifications complètes. Aucun contrôle n'a été affaibli. Aucun compte ni stockage privé n'a été ajouté ; changement de compte et droits révoqués restent hors de cette maquette. Les chiffres doivent être justifiés avant publication et la photo temporaire remplacée. L'état Git reste illisible car `.git` n'est pas reconnu comme dépôt. Aucun commit, push ou déploiement.

## TODO avant la suite

Le logo et ses couleurs ont été intégrés le 3 octobre 2026 ; voir `docs/IDENTITE-VISUELLE.md`. Recevoir et valider : éventuelle charte graphique chiffrée, photographies GECA autorisées, identité de l’équipe, preuves d’impact, zones et statuts actuels des projets, contenus éditoriaux, logos partenaires autorisés et liens sociaux. Traduire l’anglais et rédiger les textes légaux. Confirmer le chiffre des arbres avant tout affichage. Valider la maquette avec le client avant d’ajouter les services exclus de cette étape.
