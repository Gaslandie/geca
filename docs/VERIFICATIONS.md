# Vérifications GECA — 3 octobre 2026

## Médias allégés — 3 octobre 2026

- Benchmark avant adaptation documenté dans `BENCHMARK.md` ; poids et méthode dans `PERFORMANCE-MEDIAS.md`.
- Lint, TypeScript, compilation Pages et compilation locale finale : réussis. Export de 39 pages Next (36 routes FR/EN, entrée et pages techniques).
- Suite locale complète : 69 contrôles réussis ; un contrôle attendait encore une erreur 400 pour l’ancienne API d’image. La nouvelle configuration supprime cette API, qui répond 404. Le test conserve le refus et vérifie désormais quatre sources : externe, adresse locale privée, fichier privé et ancien JPEG public.
- Après ajout des tailles mobiles 320/480 et reconstruction finale : 9 contrôles locaux ciblés réussis, dont ce contrôle d’accès, trois tailles d’écran, vidéo/pause, échec vidéo, lecture automatique refusée, économie de données et image sans JavaScript.
- Export final : 7 contrôles réussis. Toutes les routes FR/EN et leurs ressources, clavier/langue, photos/vidéo à 375 et 1 440 px, accessibilité, contact sans JavaScript, refus des fichiers privés/envois, absence d’appels externes, choix de taille et même variante forêt réutilisée entre accueil et Contact. Chaque version de 640 px pèse moins de 120 Ko ; vidéo sous 1,5 Mo.
- 122 variantes WebP décodées : pas d’EXIF/XMP/IPTC. Les 21 originaux image et la vidéo originale sont conservés octet pour octet (comparaison SHA-256 avec HEAD), hors de `public` et de `out`.
- Vues examinées : premier écran mobile/ordinateur, À propos ordinateur et Contact mobile. Photos, logos, mentions temporaires et disposition restent lisibles. Tests de disposition, zoom 200 %, clavier et axe conservés.
- Serveur compilé final redémarré uniquement après confirmation de son appartenance à GECA, limité à `127.0.0.1:3000`. `/fr` répond 200, utilise les variantes et charge ses styles ; en-têtes protecteurs conservés.
- Audit des dépendances d’exécution : aucune alerte. Cinq entrées préexistantes de l’audit complet concernent `braces` dans les outils ESLint, sans code ajouté à l’export ; limite restante détaillée dans `PERFORMANCE-MEDIAS.md`.
- Mesure de poids sur Chrome (densité 1, après défilement, vidéo exclue mais affiche incluse) : accueil mobile 274 888 octets contre 5 086 517 pour les mêmes originaux, réduction de 94,6 %. Ordinateur : 470 212 octets, réduction de 90,8 %. Pas de délai sur un réseau réel promis.


## Barre mobile, boutons, cartes et publication autorisée — 3 octobre 2026

Demande actuelle : une seule rangée mobile (logo, « Faire un don » complet, loupe, hamburger), FR/EN dans le menu ; boutons harmonisés ; pulsation immédiate du don ; animations et transitions sur toutes les cartes ; commit et push de l’ensemble pour GitHub Pages. Les pages déjà préparées, les images et leurs sources sont conservées. Aucun contenu factuel GECA ajouté.

Réalisation : barre mobile en trois colonnes dont le groupe don/recherche ; sélecteur de langue unique dans le menu sur tous les écrans, conservant la page courante. Boutons avec contours, coins de 8 px et retour au survol/appui ; bouton contact compact et centré conservé. Don animé par un halo doré pendant trois cycles de 1,5 seconde, puis arrêt, texte et dimensions fixes. Apparition existante étendue à chaque carte : accueil, À propos, Projets, Domaines et coordonnées Contact. Ombres et transitions au survol/focus interne ; observation des cartes ajoutées dynamiquement. Aucun faux lien ou curseur de clic sur les cartes d’information. Réduction des mouvements, contenu visible sans effets, annulation des apparitions au focus et économie de données conservés.

Benchmark vérifié avant les changements, dans `docs/BENCHMARK.md` : Panthera, GOV.UK, W3C et MDN. Guides CSS et export statique livrés avec Next 16.3.8 lus avant réalisation.

Lint, TypeScript, compilation Pages et compilation locale : réussis (39 sorties). **5 tests Pages réussis**, notamment routes FR/EN, ressources, langues dans le menu, contact, inconnues/fichiers privés/envoi refusés et lecture sans JavaScript. Le premier passage Pages avait un sélecteur ambigu : FR et la rubrique Projets ont maintenant la même destination dans le menu. Le contrôle cible explicitement le lien de rubrique, sans retirer la vérification de page active.

**70 scénarios locaux vérifiés** : 68 réussis au passage complet, puis les deux échecs repris avec succès. Les deux cas ont aussi réussi trois fois chacun lors d’une reprise ciblée. Le test Contact attend maintenant que le champ soit activé avant le focus ; les champs restent désactivés tant que JavaScript n’est pas prêt. L’échec ponctuel du contrôle d’arrêt du zoom au focus n’a pas été reproduit dans les quatre reprises ; son assertion et le code d’arrêt sont conservés. Résultats initiaux consignés pour ne pas présenter un premier passage intégralement vert. Les cinq nouveaux tests de cartes vérifient chaque carte présente, apparition unique, survol, arrêt et rechargement avec mouvements réduits. Don : durée et nombre de pulsations, arrêt après 4,5 s, focus et destination sans paiement vérifiés. Menu et affichage : 320 à 1920 px selon la page, paysage, texte à 200 %, sans débordement ; clavier, langues, fermeture et page immobile conservés. Aucune violation axe détectée dans les contrôles exécutés ; pas d’audit exhaustif par lecteur d’écran ou appareil physique.

Captures examinées : accueil mobile 375 px, barre 320 px normale et texte à 200 %. Texte complet du don visible, ordre demandé respecté, une seule rangée ; à 200 %, les mots du don s’empilent dans son bouton. Contrôle final du serveur **127.0.0.1:3000/fr** : page et styles HTTP 200, nouveau style `donate-pulse` chargé, `X-Frame-Options: DENY`. Serveur précédent confirmé comme GECA par PID et dossier avant arrêt ; version locale reconstruite après export Pages, serveur final laissé ouvert.

Sécurité : accès autorisés et refusés, validation Contact, absence de transmission/stockage, restrictions de médias distants et protections locales contrôlés. Aucun compte, session, secret, donnée privée, dépendance ou service ajouté ; changement de compte et révocation non applicables. Recherche de motifs de clés privées/jetons sans résultat dans les fichiers du projet examinés ; cela ne constitue pas un audit exhaustif de secrets. Fichiers ignorés et liste du commit contrôlés : aucun `.env`, `node_modules`, `.next`, `out`, rapport ou capture inclus. Audit production en ligne : **0 vulnérabilité signalée**. Audit complet : **5 entrées élevées déjà connues** dans la même chaîne de lint liée à `braces`, non distribuée aux visiteurs ; aucune rétrogradation des outils appliquée. Next journalise `NoFallbackError` lors de certains refus de routes, mais les tests vérifient bien les réponses 404 ; aucun accès supplémentaire ouvert.

GitHub : dépôt public `Gaslandie/geca`, branche distante vérifiée identique au HEAD avant préparation ; Pages passé par API de `legacy` à **workflow**, puis réglage relu. Workflow limité à l’export `out`, droits de déploiement limités et Actions verrouillées conservés. La publication demandée sera déclenchée par le push de ce commit ; son résultat distant doit être vérifié avant d’annoncer le lien disponible. Les limites d’en-têtes HTTP propres à GitHub Pages restent documentées dans `docs/BENCHMARK.md`. La recherche, le don et certaines rubriques restent des écrans de préparation ; aucun paiement ni envoi réel.

## Bouton de contact réduit et centré — 3 octobre 2026

Demande explicite : réduire au minimum le bouton « Prévisualiser mon message » et le centrer. Modification limitée à `.contact-submit` : largeur du texte avec 16 px de marge intérieure, hauteur minimale 44 px, marges automatiques et texte centré. Police, libellé, validation, clavier, états désactivés, aperçu sans envoi ni stockage conservés. Références GOV.UK et W3C revérifiées avant adaptation, observations et choix GECA dans `docs/BENCHMARK.md` ; guide CSS local Next lu.

Lint, TypeScript, compilation (39 sorties) et `git diff --check` réussis. Serveur compilé GECA identifié par sa commande et son dossier avant arrêt, puis redémarré sur `127.0.0.1:3000`. Accueil `/fr` et CSS HTTP 200. **11 tests existants réussis** : contact FR/EN, saisies acceptées/refusées, absence d'envoi/stockage, clavier, sans JavaScript, accessibilité, cinq tailles d'écran, routes connues/inconnues, fichiers privés et protections HTTP.

**16 mesures complémentaires réussies** : FR/EN, largeurs 320/375/768/1440 px, texte normal et 200 %. Bouton exactement centré dans le formulaire, hauteur ≥ 44 px, aucun débordement. En taille normale : FR 240 × 44 px, EN 192 × 44 px. À 200 %, retour à la ligne et hauteur adaptée pour conserver tout le texte. Capture du bouton final examinée : `/tmp/geca-contact-bouton-centre.png`. Sécurité : CSS uniquement, aucune collecte, dépendance, permission ou protection modifiée. Aucun commit ni push ; publication GitHub toujours en attente de la confirmation déjà demandée.

## Préparation GitHub Pages — 3 octobre 2026

Demande : partager l'avancement avec le client sur GitHub Pages. État distant contrôlé par API : dépôt public `Gaslandie/geca`, branche `main`, Pages en mode `legacy` depuis la racine. La publication Next doit passer par GitHub Actions ; aucune nouvelle version distante n'est encore annoncée comme disponible.

Réalisation : mode `output: export` à la demande de `npm run build:pages`, pages FR/EN générées depuis le registre, inconnues refusées, dossiers avec `index.html`, redirection HTML racine vers `/geca/fr/`. Logos, photos, vidéo, affiche et favicon reçoivent le préfixe de publication. Next adapte les liens ; les barres finales sont normalisées dans le menu pour garder le repère de page active et le changement de langue. Workflow sur `main` : installation verrouillée, lint, export, TypeScript après génération des types Next, tests Pages, archive `out` et déploiement. Actions officielles verrouillées sur leurs références vérifiées ; droits de publication limités au travail de déploiement, identifiants Git non conservés après lecture.

Comparaison préalable documentée dans `docs/BENCHMARK.md` : guides officiels GitHub Pages, modèle de workflow et documentation locale Next 16.3.8 sur export, basePath, paramètres statiques et types. Aucun fait GECA ajouté. README et consignes locales actualisés pour le périmètre demandé.

Vérifications réalisées : lint, TypeScript, compilation statique (39 sorties), compilation locale, YAML et `git diff --check` réussis. **5 tests Pages réussis** : les 36 routes FR/EN du registre et leurs ressources, entrée racine, refus des chemins inconnus/fichiers privés/points d'envoi, absence de sources privées et de cartes de sources dans `out`, photos et vidéo sous `/geca`, navigation/langues/menu actif à 375 et 1440 px, règles axe du contact et accès sans JavaScript. **64 tests du site habituel réussis** sur le serveur final du port 3000 : accueil, À propos, domaines, projets, contact, menus, clavier, accès directs autorisés/refusés, champs acceptés/refusés, aucun envoi ni stockage de saisie, textes agrandis, mouvements réduits, vidéo et modes de secours. Les tests de protection existants restent intacts. Aucun motif courant de jeton ou clé privée détecté dans les 45 fichiers texte modifiés/nouveaux examinés ; cette recherche n'est pas un audit exhaustif de secrets. Archive publique d'environ 22 Mo.

Le premier essai statique a révélé deux détails corrigés : le `distDir` personnalisé désigne le dossier d'export, pas une compilation intermédiaire isolée ; le Route Handler racine produit un fichier `index` sans extension, renommé en `index.html` après export. Un sélecteur du test sans JavaScript désignait trois liens e-mail ; le test vérifie maintenant explicitement les trois liens et tous les champs désactivés. Aucune protection diminuée pour obtenir ces résultats.

Serveur local compilé identifié par son PID, sa commande Next et son répertoire GECA avant arrêt. Reconstruit puis redémarré sur **127.0.0.1:3000**. `/fr` et ses styles répondent HTTP 200 ; `X-Frame-Options: DENY` vérifié. Le test sur le port 3100 est un aperçu distinct et ne remplace pas ce serveur.

Sécurité et limites : maquette publique, sans comptes, sessions, données privées, paiement ou fonction d'envoi. Changement de compte et révocation de droits non applicables. Seulement les fichiers publics générés seront hébergés. Le serveur local conserve ses protections HTTP et ses restrictions d'images distantes. Pages ne permet pas de régler ces mêmes en-têtes ; l'export conserve `noindex`, précise le référent et interdit objets intégrés, changement de base et soumission de formulaire par politique HTML. L'interdiction d'intégration dans une iframe n'est pas reproductible par cette politique HTML. L'aperçu statique local ne prouve pas les réponses HTTP du futur hébergement ; elles restent à contrôler après déploiement. Sans authentification, le lien est public et `noindex` ne protège pas son accès.

État de livraison : code et workflow préparés, changements précédents conservés ; aucun commit ni push. Publication et contrôle du lien distant restent à effectuer après la confirmation explicite exigée par AGENTS.md.

Contrôle visuel final : les 5 tests Pages ont été relancés après ajustement des captures pour attendre le chargement des images. Tous réussis. Accueil examiné à 375 et 1440 px, contact à 375 et 1440 px : photos, logo, polices, couleurs, vidéo et composition présentes. Captures dans `test-results/pages-home-*.png` et `test-results/pages-contact-*.png`. Cela complète les mesures automatiques sans constituer un audit exhaustif d'accessibilité.

## Précision : hero et pied de page sur toute la fenêtre — 3 octobre 2026

Gassama excepte explicitement le hero et le pied de page de la largeur commune. Le hero reprend toute la fenêtre ; le fond du pied de page aussi, avec ses liens dans le conteneur partagé. Les autres sections d'accueil, le contact et les rubriques en préparation restent entre les bords du logo et du hamburger. Une classe `home-page` permet cette exception sans utiliser `100vw`, sans déplacer les sections ni doubler leurs marges. Les règles pour les prochaines pages et le benchmark du même jour sont actualisés ; la livraison ci-dessous décrit l'étape précédente, remplacée par cette précision.

TypeScript et lint réussis. Une erreur Turbopack d'ouverture de port interne persistait après relance hors bac à sable ; son cache généré a été déplacé et conservé dans `/tmp/geca-width-exceptions-cache-zk6ov9q7`, sans supprimer de source. Aucun contrôle d'accès, validation ou accessibilité modifié pour contourner cet incident.

Compilation finale réussie avec cache neuf ; serveur GECA redémarré après confirmation de son dossier et de sa commande. **88 contrôles de largeur réussis** : 48 routes FR/EN à 1440 px, puis accueil et contact FR/EN à dix tailles de 320 à 1920 px. Hero et pied de page mesurés à toute la largeur de la fenêtre ; autres sections, conteneurs internes et liens du pied de page alignés sur la barre. Aucun débordement horizontal aux tailles vérifiées ; pages et CSS HTTP 200. Captures `/tmp/geca-width-exceptions-*.png` : hero examiné à 375 et 1440 px, pied de page examiné à 1440 px. `/fr` répond HTTP 200, écoute limitée à `127.0.0.1:3000`.

**41 tests navigateur réussis** sur ce serveur final : exceptions du hero et du pied de page, largeur des autres sections, clavier, menu immobile, texte à 200 %, accessibilité automatique, contact avec saisies acceptées/refusées sans envoi, routes autorisées/refusées, protections HTTP, images, vidéo et modes sans mouvement/JavaScript. `git diff --check` réussit.

Sécurité : présentation seulement, sans nouvelle collecte, dépendance, donnée privée, compte ou service. Protections HTTP, refus des routes inconnues/images distantes et validation du contact sans envoi restent dans la suite existante. Pas de comptes ni droits révocables à cette étape ; appareils simulés, sans audit de sécurité exhaustif. Photos temporaires et note sur les données à valider conservées. Aucun commit ni push.

## Largeur commune du logo au hamburger — 3 octobre 2026

Toutes les sections de l'accueil, du contact FR/EN, des rubriques en préparation et le pied de page partagent le cadre de la barre : bord gauche du logo jusqu'au bord droit du hamburger. Hero, vidéo et photographies sont maintenant dans ce cadre. Les variables `--site-max-width` et `--site-gutter` sont communes ; les conteneurs internes utilisent toute la largeur disponible sans retrancher une seconde marge. Les paragraphes et cartes gardent leurs limites de lecture et leurs espaces internes. La limite automatique Tailwind de `.container` est neutralisée : elle réduisait encore la barre sur certaines tailles malgré les valeurs communes. À 480 px, la navigation compacte garde désormais logo et commandes sur une seule ligne.

Vérifications complémentaires réelles sur `127.0.0.1:3000` : les **48 routes FR/EN** sont mesurées à 1440 px ; accueil et contact FR/EN sont ensuite contrôlés à 320, 375, 480, 600, 768, 1024, 1199, 1200, 1440 et 1920 px, soit **88 contrôles de mise en page réussis**. Pour chacun : HTTP 200, CSS chargé avec HTTP 200, mêmes bords pour barre, logo/menu, sections, conteneurs internes et pied de page, aucun débordement horizontal. Mesures : 296 px de largeur à 320 px, 351 px à 375 px, 1376 px à 1440 px, 1480 px à 1920 px. Captures finales accueil/contact à 375, 1440 et 1920 px dans `/tmp/geca-width-*.png` ; vues du haut examinées sur ordinateur et téléphone, avec images chargées avant capture.

TypeScript, lint et compilation réussis. Les assertions existantes de position du hero/contact sont adaptées au cadre réel, et les bords communs sont vérifiés dans les tests de disposition ; 480 px est ajouté pour couvrir le retour à la ligne de la barre. Aucun contrôle d'accessibilité ou de sécurité affaibli. Un premier contrôle a détecté la limite Tailwind ; un contrôle complémentaire a détecté la barre sur deux lignes à 480 px : les deux causes sont corrigées dans le site. Une recompilation pendant une série intermédiaire a invalidé les anciens fichiers CSS du serveur déjà démarré ; cette série ne vaut pas validation. La compilation finale est servie après redémarrage du seul processus GECA confirmé par son dossier et sa commande, puis les tests sont repris sur cette version stable.

Résultat final : **41 tests navigateur réussis** sur la version compilée finale du port 3000, dont alignement de toutes les sections d'accueil et contact, tailles intermédiaires, texte à 200 %, navigation clavier, menu superposé immobile, accessibilité automatique, vidéo et secours, modes sans JavaScript/mouvement, contact, routes autorisées/refusées et protections HTTP. Captures finales d'actualités et d'impact à 1440 px également examinées. `/fr` répond HTTP 200 ; écoute confirmée seulement sur `127.0.0.1:3000`. `git diff --check` réussit.

Périmètre sécurité : présentation uniquement ; pas de compte, service, dépendance, stockage ou collecte ajouté. Vérifications de refus d'accès direct, restrictions d'images distantes, protections HTTP, saisies contact refusées/acceptées et absence d'envoi conservées. Les cas de changement de compte/droits révoqués ne s'appliquent pas à cette maquette sans comptes. Vérification sur navigateur simulé, sans appareil physique ni audit de sécurité exhaustif. Photos temporaires et données à valider restent signalées. Benchmark et règle pour les prochaines pages actualisés ; changements antérieurs conservés, aucun commit ni push.

## Notre impact sur photo et mouvements partagés — 3 octobre 2026

La section « Notre impact » suit la capture fournie : photographie continue, message à gauche et trois cartes crème arrondies empilées à droite ; sur téléphone, message puis cartes. Les valeurs existantes sont conservées : 84 collectivités accompagnées, 40 ha de sites restaurés, 2016 comme année de création. La note des données à valider reste visible ; aucun chiffre de la capture ni comptage animé ajouté. Le h2 garde l'échelle et la police communes. L'alignement à gauche est l'exception demandée pour cette section ; les six autres en-têtes principaux restent centrés.

Photo : aucun cliché de terrain GECA authentifié trouvé dans le projet. Gassama confirme explicitement de garder provisoirement `impact-forest.jpg` avec « Image temporaire ». La source et la licence existantes restent dans `docs/IMAGES-TEMPORAIRES.md`. L'image de la vidéo fournie n'est pas présentée comme preuve de terrain GECA. Benchmark avant adaptation, références consultées et accès impossible à The Nature Conservancy consignés dans `docs/BENCHMARK.md`.

Mouvements : composant partagé `SiteMotion` dans le layout FR/EN, petits déplacements de 12 px en 480 ms lors de la première entrée des blocs dans la fenêtre. Aucun état CSS caché : contenu visible dès le HTML, sans JavaScript ou sans API d'animation. Aucun nouvel outil ni bibliothèque. Une seule observation par bloc, nettoyage après navigation et annulation sur focus clavier ; préférence de mouvement réduit et économie de données désactivent les apparitions, y compris si elles changent pendant la visite. Boutons : couleurs et flèches en 180 ms ; photos : zoom de 2,5 % limité à la souris et aux cadres existants ; cartes partenaires/actualités : ombre légère. Menu : dévoilement bref de son bord, sans déplacement de page et interrompu dès le focus interne. Aucune boucle, parallaxe, chiffre animé ou délai bloquant le contenu.

Correction réelle : un premier fondu de blocs faisait descendre le contraste d'un paragraphe contact à 3,43:1 pendant son animation. Le contrôle d'accessibilité a échoué. L'opacité animée a été retirée du code, et le fondu du menu remplacé par un effet de bord ; les textes gardent leur contraste normal à toutes les étapes. Aucun test de contraste désactivé ni affaibli. Une API absente est testée explicitement ; les notifications de connexion sont facultatives afin de conserver le mode économie de données même avec une implémentation partielle.

Vérifications finales réelles : lint, TypeScript, compilation et `git diff --check` réussis ; **40 tests passent dans la suite complète sur le serveur local final**, puis quatre tests d'apparition réussissent après renforcement du contrôle d'aller-retour. Les sept nouveaux contrôles couvrent la disposition à 320, 768 et 1440 px, photo couvrant toute la section, trois cartes empilées, contenu et mentions exacts, accessibilité automatique, absence de débordement avec texte à 200 %, déclenchement unique des trois cartes même après retour, opacité constante, annulation immédiate lors d'une demande de mouvement réduit, économies de données et API indisponible. Les 33 contrôles antérieurs passent aussi : routes autorisées/refusées, protections HTTP, images distantes refusées, contact sans envoi/stockage, clavier, langues, menu immobile, photos et vidéo. Le contrôle du centrage passe de sept à six en-têtes parce que le titre d'impact est désormais volontairement à gauche ; sa nouvelle disposition reçoit un contrôle séparé.

Captures d'impact examinées à 375, 1024 et 1440 px dans `/tmp/geca-impact-final-*.png`, et captures des tests à 320, 768 et 1440 px. Photo temporaire, note de validation, taille commune du h2 et retours à la ligne contrôlés. Aucun débordement aux tailles vérifiées ; écran simulé, sans appareil physique ni revue exhaustive par lecteur d'écran. Les scénarios d'accès direct autorisé/refusé restent contrôlés ; aucun compte ou droits révocables dans ce périmètre.

Serveur GECA : anciens processus du port 3000 confirmés par leur dossier et leur commande avant remplacement ; compilation finale redémarrée avec `npm run start`. `/fr`, `/fr/contact` et `/en/contact` ainsi que leurs styles répondent HTTP 200 sur cette version. Écoute confirmée uniquement sur `127.0.0.1:3000`. Aucun autre serveur arrêté, aucun nouveau téléchargement, collecte, session, paiement, service, fichier téléversé ou dépendance. Aucun nouvel audit de dépendances ; limites précédentes conservées. Changements antérieurs conservés, aucun commit, push ou déploiement.


## Hamburger superposé, page immobile — 3 octobre 2026

À la demande de Gassama, le panneau du menu apparaît au-dessus de la page, sous la barre du logo, sans agrandir cette barre. Le positionnement absolu, le fond crème et le niveau de superposition conservent la présentation existante. La hauteur réelle et les marges de la barre sont mesurées avec `ResizeObserver` pour limiter la hauteur du panneau et conserver son alignement, y compris après redimensionnement ou agrandissement du texte. Les liens défilent à l'intérieur du panneau sur écran court. Bouton de fermeture, Échap, clic extérieur, sortie du focus, sous-rubriques et langues conservés. Benchmark préalable dans `docs/BENCHMARK.md` ; règles communes dans `docs/TYPOGRAPHIE.md`.

Vérifications finales : lint, TypeScript, compilation et `git diff --check` réussis ; **33 tests navigateur réussis sur le serveur GECA final du port 3000**. Les cinq nouveaux tests vérifient accueil et contact à 320×900, 375×900, 768×600, 1440×900 et 667×375 : positions et dimensions de la barre et du contenu identiques avant/après ouverture du menu et des sous-rubriques ; panneau limité à la fenêtre ; langues accessibles en faisant défiler les liens ; alignement avec la barre ; aucun défilement de la page provoqué par le focus ; texte à 200 % ; fermeture au clavier et restitution du focus ; absence de débordement horizontal et aucun échec d'accessibilité automatique contrôlée. Les 28 contrôles existants continuent de passer, dont saisie contact acceptée/refusée, absence d'envoi, routes autorisées/refusées, protections HTTP, langues, clavier et vidéo. Le test de clic extérieur utilise désormais la zone de page visible sous le panneau : l'ancien titre est recouvert par le menu.

Contrôle visuel complémentaire : captures à 375, 667 et 1440 px examinées, puis nouvelles captures finales à 375 et 1440 px après correction d'un décalage horizontal dû à la largeur effective du conteneur. Mesures finales : début du contenu à 85 px sur téléphone et 105 px sur ordinateur, strictement identiques menu fermé/ouvert ; bords droits des liens et de la barre identiques (363 et 1360 px). Captures finales dans `/tmp/geca-menu-final-375.png` et `/tmp/geca-menu-final-1440.png`. L'accueil `/fr` et ses styles répondent HTTP 200 avec la version courante.

Compilation : le premier essai en bac à sable a échoué parce que Turbopack ne pouvait pas ouvrir son port interne. La même erreur persistait après autorisation de l'exécution hors bac à sable ; un essai direct a confirmé qu'un port interne local était disponible. Le cache généré Turbopack a donc été déplacé et conservé dans `/tmp/geca-turbopack-cache-c5oql5_l/`, sans suppression de sources. La recompilation avec cache neuf réussit, ainsi que celle de l'ajustement final. Les processus du port 3000 ont été confirmés par leur dossier et leur commande avant chaque remplacement ; version compilée finale démarrée avec `npm run start`, écoute limitée à `127.0.0.1`. Aucun autre serveur arrêté. Un script temporaire de contrôle avait une URL de style relative sans base ; corrigé avec une URL absolue, sans changement du site.

Sécurité et limites : navigation publique uniquement, aucun contrôle d'accès basé sur l'état visible du menu. Routes fermées, données, protections HTTP, validation contact et absence d'envoi conservées ; aucun service, compte, donnée privée, fichier, dépendance ni stockage ajouté. Scénarios de changement de compte et droits révoqués sans objet dans cette maquette sans comptes. Tests Chrome Linux avec tailles simulées, sans appareil physique ni revue exhaustive par lecteur d'écran ; pas de nouvel audit des dépendances. Changements précédents conservés. Aucun commit, push ou déploiement.


## Page contact FR/EN — 3 octobre 2026

La rubrique `/fr/contact` et sa version `/en/contact` remplacent leur écran d'attente. Composition inspirée des deux captures de Gassama : introduction et champs cultivés à gauche, formulaire sauge à droite, coordonnées sur fond vert, phrase finale centrée, feuillage panoramique et pied de page commun. Textes dans `src/content/site.ts`, polices et tailles communes, photos temporaires existantes avec étiquettes ; aucune nouvelle dépendance. Benchmark préalable, limites de lecture de The Nature Conservancy et adaptation dans `docs/BENCHMARK.md`.

Vérifications finales réelles : `npm run lint`, `npm run typecheck`, `npm run build` et `git diff --check` réussissent ; **28 tests navigateur passent dans la suite complète finale**. Le contrôle existant des pages d'attente est adapté seulement pour la rubrique contact devenue une page ; toutes les autres rubriques et les cas refusés restent contrôlés.

Les neuf contrôles contact vérifient FR/EN, coordonnées, validation d'un formulaire vide, e-mail invalide et message composé seulement d'espaces ; aperçu, focus, absence de code exécutable dans un texte contenant une balise script, effacement, absence de stockage local/session et absence de transmission pendant la saisie et la prévisualisation. Seul le chargement tardif d'un fichier JavaScript statique du même site est autorisé dans ce contrôle ; les autres requêtes sont refusées par le test. POST direct sur `/api/contact` renvoie 404. Sans JavaScript, champs et bouton restent désactivés et le texte d'explication ainsi que les coordonnées restent disponibles. Choix par Espace et flèche au clavier, navigation FR vers EN contrôlés.

Affichage : 320, 375, 768, 1024 et 1440 px ; deux colonnes à partir de 768 px, empilement sur téléphone, deux photos décodées, aucun débordement horizontal, aucun résultat d'accessibilité automatique en échec. Texte agrandi à 200 % aux cinq largeurs sans débordement. Captures complètes examinées à 375 et 1440 px, puis vues téléphone à taille lisible (`/tmp/geca-contact-mobile-top.png` et `/tmp/geca-contact-mobile-form.png`). Les 19 contrôles antérieurs de l'accueil, des routes, des accès refusés, des images distantes, des protections HTTP, du menu et de la vidéo passent également.

Deux attentes des nouveaux tests ont échoué au premier passage : le contrôle réseau confondait un fichier JS statique local avec une transmission et le sélecteur `noscript` ne retrouvait pas son paragraphe pourtant visible. Corrections des attentes selon les éléments réellement chargés/affichés, sans changer ni affaiblir le site ; tests ciblés puis suite complète réussis. Une commande documentaire a utilisé `python`, absent ici ; relancée avec `python3` sans effet sur le site. Les captures ont été prises en revenant en haut de page pour éviter un artefact du lien d'évitement dans la capture longue.

Serveur final : ancien processus compilé du port 3000 identifié par son PID et son dossier GECA, puis arrêté et remplacé par `npm run start` après compilation. L'accueil `/fr`, `/fr/contact` et `/en/contact` répondent HTTP 200 avec leurs titres actuels et leur feuille de styles HTTP 200. Écoute limitée à `127.0.0.1:3000`. Le serveur distinct du port 3100 n'a pas été arrêté ni utilisé pour valider cette livraison.

Sécurité et limites : aucune saisie envoyée au serveur, enregistrée par le site ou injectée comme HTML ; formulaire désactivé avant activation de JavaScript. Validation navigateur destinée à la démonstration uniquement : elle ne remplace pas la validation côté serveur et la protection contre les abus qu'exigerait un futur envoi réel. Aucun compte ni droits révocables dans ce périmètre : changement de compte et révocation sans objet. Les contrôles existants ne sont pas affaiblis. Essais Chrome Linux avec écrans simulés, sans appareil physique ni revue exhaustive par lecteur d'écran ; pas de nouvel audit des dépendances, aucune dépendance ajoutée. Photos et traductions restent à valider par GECA. Changements antérieurs conservés, aucun commit, push ou déploiement.


## Recherche avant le don, photo et vidéo séparées

Le 3 octobre 2026, la recherche quitte le hamburger et apparaît par icône juste avant « Faire un don ». Le menu conserve les langues. La commande pause/lecture n’affiche aucun mot : SVG seul, nom accessible conservé et cible de 44 px. La photo locale de feuillage remplit le haut droit du hero, avec mention « Image temporaire » ; la vidéo est désormais contenue dans le bloc bas gauche. La phrase courte reste présente ; un paragraphe de mission fondé sur les contenus déjà fournis est ajouté dans `src/content/site.ts`. Sur téléphone, les quatre blocs sont empilés. Aucun nouveau média téléchargé. Sources et observations dans `docs/BENCHMARK.md` ; provenance dans `docs/IMAGES-TEMPORAIRES.md` et `docs/CONTENU-CLIENT.md`.

Vérifications finales réelles : TypeScript, lint, compilation et **19 tests navigateur réussis** sur la version courante de `http://127.0.0.1:3000/fr`. Aux huit largeurs de 320 à 1440 px, les contrôles vérifient la séparation photo/vidéo, leurs limites, l’ordre recherche/don, le nom accessible de la recherche, son absence du menu, le centrage des commandes et du logo dans la barre, ainsi que le paragraphe ajouté. Les 13 photos temporaires visibles se chargent avec leur mention. Le contrôle vidéo vérifie une commande SVG sans texte visible, pause/reprise, clavier et préférences. Routes FR/EN autorisées et accès refusés, en-têtes HTTP protecteurs, refus des images distantes, liens, filtres, langues et accessibilité automatique passent. Texte agrandi à 200 % contrôlé à 320 et 1440 px sans débordement.

Captures à 320, 375 et 1440 px réalisées dans `/tmp/geca-hero-split-*.png` et examinées ; après l’ajustement final de la barre à 320 px, la capture est examinée à nouveau. Barre sur une ligne à ces trois largeurs, pas de débordement, styles HTTP 200 ; clic sur l’icône de recherche menant à `/fr/recherche` réellement vérifié. Un premier test comparait le haut de boutons de hauteurs différentes : corrigé pour comparer leurs centres, sans modifier le comportement ni réduire une protection. La revue visuelle a détecté le retour à la ligne de la barre à 320 px ; largeur du conteneur et taille du logo de l’en-tête ajustées, logo du pied de page conservé. Suite complète relancée après recompilation et redémarrage du serveur GECA identifié par son dossier. Écoute finale confirmée sur `127.0.0.1:3000` uniquement.

Sécurité et limites : aucune saisie, donnée privée, dépendance, collecte, paiement, service ou envoi ajouté. Vidéo et photo locales, noms accessibles, pause, mouvement réduit, économie de données et secours conservés. Le menu reste une navigation publique ; les protections serveur existantes passent leurs tests. Aucun compte ni droit révocable dans la maquette : changement de compte et droits révoqués sans objet. Chrome Linux et tailles simulées seulement, sans appareil physique ni revue exhaustive au lecteur d’écran ; recherche toujours en préparation, comme sa route existante. Aucun nouvel audit de dépendances, aucune protection assouplie, aucun commit ni push.

## Hero en blocs et hamburger permanent

Le 3 octobre 2026, le haut de page suit la capture choisie par Gassama : grand titre sans empattement vert sur fond crème à gauche, vidéo locale continue visible à droite et dessous, description sur la vidéo et bloc vert avec flèche dorée et deux liens arrondis. Sur téléphone, titre, vidéo et liens sont empilés. Les contenus de `src/content/site.ts` restent identiques. La barre affiche seulement logo, don et hamburger, même sur grand écran ; langues et recherche restent accessibles dans le menu. Les autres sections et les changements précédemment présents sont conservés. Comparaison réelle et sources dans `docs/BENCHMARK.md` ; règles mises à jour dans `docs/TYPOGRAPHIE.md` et README.

Vérifications finales : TypeScript, lint, compilation et **19 tests navigateur réussis** sur le serveur courant du port 3000. La suite vérifie routes connues FR/EN et accès refusés, en-têtes HTTP protecteurs, refus des images distantes, tous les liens internes, filtres, menus et contrôles automatiques d’accessibilité à 320, 375, 670, 767, 768, 970, 1024 et 1440 px. Le menu est désormais vérifié fermé puis ouvert à chaque largeur. Un test supplémentaire contrôle ouverture au clavier, premier lien après Tab, fermeture par Échap avec retour du focus, exclusion des liens fermés du parcours clavier, redimensionnement, clic extérieur et changement de langue. Texte agrandi à 200 % vérifié à 320 et 1440 px sans débordement. Pause/reprise vidéo, mouvement réduit, économie de données, lecture automatique refusée, vidéo indisponible et contenu sans JavaScript passent.

Contrôle complémentaire à 1199, 1200, 1399, 1400 et 1942 px : hamburger visible, navigation cachée avant ouverture puis visible après clic, aucun débordement horizontal. Styles locaux HTTP 200 et présence du nouveau balisage confirmées sur `http://127.0.0.1:3000/fr`. Captures à 375 et 1440 px réellement examinées dans `/tmp/geca-new-hero-*.png` ; captures de la suite conservées dans `test-results/`. Le serveur compilé GECA est identifié par son dossier avant arrêt, puis relancé avec la compilation finale ; écoute sur `127.0.0.1:3000` uniquement.

Une première modification CSS avait supprimé par erreur le cadre partagé des photos : les images suivantes recouvraient le hero et empêchaient le clic sur la pause. La revue visuelle et les tests l’ont détecté ; les règles sont rétablies, puis la suite complète réussit. Le cache du compilateur avait conservé une erreur liée au port interdit dans le bac à sable ; cache généré mis de côté dans `/tmp`, compilation hors bac à sable réussie. Aucun contrôle ni protection assoupli.

Sécurité et limites : aucune donnée privée, saisie, dépendance, collecte, paiement ou envoi ajouté. Menu de liens publics seulement ; il ne remplace aucun contrôle serveur. Vidéo et polices locales, routes fermées et protections HTTP conservées. Aucun compte ni droit révocable dans cette maquette : changement de compte et révocation sans objet. Essais Chrome Linux avec tailles simulées, sans appareil physique ni revue exhaustive avec lecteur d’écran. Le menu interactif demande JavaScript, comme auparavant ; les tests sans JavaScript portent sur le contenu et les liens du hero. Aucun nouvel audit de dépendances. Aucun commit, push ou déploiement.

## Cadre annulé, barre gauche et noms en gras

Le 3 octobre 2026, à la demande de Gassama, les trois bordures fines et les marges verticales ajoutées au tour précédent sont retirées. Seule la barre gauche de 4 px et son dégradé restent. « Global EcoAction (GECA) » et « RENASCEDD » sont mis en gras avec des éléments `strong` dans le paragraphe existant. Le nom officiel, le texte complet, le centrage et le lien sont conservés. Comparaison préalable actualisée dans `docs/BENCHMARK.md` ; règles courantes dans `docs/TYPOGRAPHIE.md`.

Vérifications réelles : TypeScript, lint, compilation et 18 tests navigateur existants réussissent sur le serveur courant de `http://127.0.0.1:3000/fr`. Routes autorisées et refusées, protections HTTP, restriction des images distantes, clavier, accessibilité automatique et texte agrandi à 200 % restent vérifiés. Aucun contrôle assoupli.

Contrôle complémentaire à 320, 375, 768, 1024, 1440 et 1942 px : barre de 4 px, absence du cadre, anciennes marges rétablies, deux noms au poids 700, textes centrés et aucun débordement horizontal. Captures à 375 et 1440 px examinées dans `/tmp/geca-about-bold/`. Lien vers `/fr/a-propos` fonctionnel ; styles HTTP 200. Serveur compilé identifié par son dossier puis redémarré ; écoute confirmée uniquement sur `127.0.0.1:3000`.

Sécurité et limites : balisage React sans injection de HTML ; aucun compte, service, saisie, donnée privée, dépendance ou protection modifié. Changement de compte et droits révoqués sans objet dans cette maquette. Essais Chrome Linux avec tailles simulées, sans appareils physiques ni revue exhaustive par lecteur d’écran ; aucun nouvel audit de dépendances. Limites antérieures conservées. Aucun commit, push ou déploiement.

## Cadre de « Notre organisation »

Le 3 octobre 2026, le bloc complet de présentation reçoit trois bordures vertes de 1 px en haut, à droite et en bas. Le trait gauche existant garde ses 4 px et son dégradé. Une marge intérieure de 24 px en haut et en bas sépare le texte du cadre. Textes centrés, typographie commune et lien conservés. Comparaison préalable dans `docs/BENCHMARK.md` ; changements précédemment présents dans Git conservés.

Vérifications réelles : TypeScript, lint, compilation et les 18 tests navigateur existants réussissent sur le serveur courant du port 3000. Routes autorisées et refusées, protections HTTP, refus des images distantes, clavier, accessibilité automatique et texte agrandi à 200 % restent vérifiés. Aucun test modifié ni protection affaiblie.

Contrôle complémentaire aux largeurs 320, 375, 768, 1024, 1440 et 1942 px : trait gauche de 4 px, trois bordures de 1 px, centrage et absence de débordement confirmés. Captures téléphone et ordinateur examinées (`/tmp/geca-organisation-frame/about-375.png` et `about-1440.png`). Le lien vers `/fr/a-propos` fonctionne et les styles répondent HTTP 200. Le premier script vérifiait l’adresse trop tôt après le clic ; le contrôle corrigé attend la navigation et réussit, sans modification du site. Le serveur compilé a été identifié par son dossier puis redémarré ; écoute confirmée uniquement sur `127.0.0.1:3000`.

Sécurité et limites : modification décorative sans donnée privée, service ni dépendance ajouté. Maquette sans comptes ni droits révocables : changement de compte et révocation sans objet. Essais Chrome Linux avec tailles simulées ; aucun appareil physique ni revue exhaustive par lecteur d’écran. Aucun nouvel audit de dépendances ; limites précédentes conservées. Aucun commit, push ou déploiement.

## Sections regroupées, fonds alternés et retrait de la signature

Le 3 octobre 2026, les sections ordinaires alternent blanc (`#ffffff`) et vert très clair (`#edf3ee`). Les bandeaux photographiques sombres restent présents. Marges internes communes de 52, 68 ou 80 px selon la largeur, trait de limite discret et distance entre en-tête et contenu ramenée à 28 px : titre, description et contenus partagent le même fond et restent regroupés. La présentation « Qui sommes-nous ? » reçoit une ligne verticale verte de 4 px à gauche du bloc, avec un dégradé discret et des bouts arrondis. Les textes restent centrés. Le bloc « Notre signature », sa phrase et son repère de date sont retirés de l’affichage ; leurs textes sources restent conservés. Le paragraphe de présentation contient toujours l’année 2016.

Avant modification, Git était propre. Comparaison préalable dans `docs/BENCHMARK.md` ; règles réutilisables actualisées dans `docs/TYPOGRAPHIE.md`. Aucun nouveau média, service, dépendance, saisie ou donnée privée. Polices communes, liens et protections conservés.

Vérifications réelles : TypeScript, lint et compilation réussis ; **18 tests navigateur passent** sur la version courante de `http://127.0.0.1:3000`. Les routes FR/EN, accès directs autorisés/refusés, en-têtes protecteurs, refus des images distantes, liens, menus, filtres, clavier, règles automatiques d’accessibilité et comportements vidéo sont conservés. Le centrage des en-têtes et les cartes partenaires égales passent aux huit largeurs de la suite. Texte agrandi à 200 % à 320 et 1440 px : aucun débordement horizontal. Aucun test assoupli.

Contrôle complémentaire à 320, 375, 768, 1024, 1440 et 1942 px : fonds alternés effectivement appliqués, en-têtes à l’intérieur de leur section, signature absente, ligne de 4 px présente, aucun débordement et feuilles de styles HTTP 200. Captures de la présentation sur téléphone et ordinateur et des transitions projets/équipe et actualités/partenaires examinées. Le premier script de capture temporaire avait une erreur de syntaxe puis un cadrage hors fenêtre ; après correction du script, les six contrôles et captures se terminent avec succès. Le code du site n’a pas été changé pour contourner ces erreurs d’outil.

Le serveur compilé GECA du port 3000 a été identifié par son dossier et son processus, puis redémarré avec cette compilation. La version courante et ses styles sont vérifiés ; écoute sur `127.0.0.1` uniquement. Aucun nouveau commit, push ou déploiement dans cette passe.

Limites : essais Chrome Linux avec tailles simulées, sans appareils physiques ni revue complète par lecteur d’écran ; contrôle CSS du texte agrandi, sans couvrir toutes les formes de zoom. Aucun compte ni droit révocable dans cette maquette : changement de compte et révocation sans objet. Aucun nouvel audit de dépendances, aucune dépendance modifiée ; les alertes antérieures restent documentées. Photos temporaires et données d’impact toujours à valider avant publication.

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
## Espaces intérieurs des sections — 3 octobre 2026

Correction demandée à partir de la capture de Gassama : le texte d'impact et les cartes touchaient les bords du fond. Les conteneurs du contenu principal gardent maintenant 20 à 48 px d'espace intérieur horizontal, avec une variable commune `--section-inset`. Les fonds gardent leurs bords alignés sur la barre ; l'accueil, les coordonnées et la conclusion du contact, ainsi que les pages en préparation bénéficient de cette règle. Les panneaux contact avaient déjà leurs propres espaces. Hero, navigation et pied de page conservent leurs dispositions.

Vérifications réelles : TypeScript, lint et compilation réussis ; **41 tests navigateur réussis** sur la version compilée corrigée de `http://127.0.0.1:3000/fr`. Les tests de disposition existants vérifient maintenant aussi que les enfants des conteneurs restent au moins à 20 px des deux bords, sans retirer les assertions du cadre commun, des routes ou de sécurité. Contrôles supplémentaires : **50 dispositions réussies**, sur `/fr`, `/fr/contact`, `/en/contact`, `/fr/a-propos` et `/en`, à 320, 375, 480, 600, 768, 1024, 1199, 1200, 1440 et 1920 px. Aucun débordement horizontal ; pages et CSS répondent HTTP 200 ; le CSS servi contient la nouvelle variable. Captures d'impact, domaines, actualités et appel à l'action à 375, 1024 et 1440 px dans `/tmp/geca-padding-*.png` ; impact ordinateur/téléphone, domaines téléphone, actualités ordinateur et appel à l'action téléphone examinés visuellement. Certaines captures incluent le lien clavier « Aller au contenu » ; ce lien n'appartient pas à la section.

Le processus précédent est identifié par sa commande `next-server` et son dossier GECA avant son arrêt. Le serveur du port 3000 est redémarré avec `npm run start`, écoute limitée à `127.0.0.1`, puis les contrôles sont effectués sur ce serveur courant. `git diff --check` réussit. Changements antérieurs conservés ; aucun commit ni push.

Sécurité : routes inconnues, chemins privés et API exclus refusés ; en-têtes protecteurs et refus d'images distantes vérifiés. Le contact conserve les saisies acceptées/refusées, l'affichage du texte sans exécution et l'absence de transmission/stockage. Clavier, accessibilité automatique, mouvement réduit, fonctionnement sans JavaScript et texte agrandi à 200 % contrôlés. Pas de compte ni de droits privés dans cette maquette : changement de compte et droits révoqués ne s'appliquent pas. Vérification par navigateur simulé ; aucun appareil physique ni audit exhaustif. Photos temporaires et données à valider restent signalées.

## Espaces uniformes et zoom du hero — 3 octobre 2026

Demande : séparer uniformément les sections, notamment « Passons à l'action » et le pied de page ; ajouter un zoom arrière à l'arrivée sur l'accueil. Modifications ciblées dans le CSS global et `SiteMotion`, avec mise à jour de la comparaison et des règles communes. Les changements déjà présents dans le dossier sont conservés. Aucun commit ni push.

La variable `--section-gap` réserve le même espace entre les sections principales et avant le footer : 24 px à 320, 375 et 768 px ; environ 43,2 px à 1440 px ; 48 px à 1920 px. Mesures réelles sur `/fr`, `/en` (page encore en préparation) et `/fr/contact` : règle respectée, styles chargés, aucun débordement horizontal. Les marges internes restent distinctes. Captures examinées sur téléphone et ordinateur ; la séparation avant le footer est visible.

Le hero entier passe de 104,5 % à 100 % en 1,1 seconde. Vérification du recul au début et à mi-parcours, de l'arrêt au focus clavier, de l'absence de répétition au défilement et de l'annulation lors du passage aux mouvements réduits pendant l'effet. L'étiquette temporaire et le bouton pause restent entièrement dans le cadre sur ordinateur dès le début. Captures début/fin examinées. Le contenu reste visible sans animation ; aucune nouvelle dépendance.

TypeScript, ESLint, `git diff --check` et compilation réussis. La première série de mesures lisait parfois la position pendant le zoom : le test attend désormais la fin réelle de l'animation avant de mesurer, sans supprimer d'assertion. Une compilation déclenchée pendant le dernier test a ensuite rendu ses styles périmés ; serveur redémarré et suite intégrale relancée sur un build stable.

Le processus Next.js a été confirmé par son dossier GECA avant chaque arrêt. Le dernier build est servi par `npm run start` sur `127.0.0.1:3000`. Vérification directe de `/fr` et des feuilles de style sur cette adresse.

Résultat final sur le dernier build stable : **42 tests Playwright sur 42 réussis** en 2,6 minutes. Accessibilité automatique, neuf largeurs d'accueil, cinq largeurs contact, texte à 200 %, navigation, vidéo et comportements sans JavaScript vérifiés.

Sécurité : aucun changement de droits, de service ou de données. Les tests confirment les routes autorisées et refusées, les restrictions d'images distantes, les protections HTTP, la validation du contact sans transmission, l'absence de requêtes externes, les préférences de mouvement et le clavier. La maquette ne possède pas de comptes : changement de compte, propriétaire des données et droits révoqués ne sont pas applicables à ce périmètre. Ces contrôles devront exister lors de l'ajout de fonctions réelles.

## Page À propos — 3 octobre 2026

La page remplace l'écran d'attente sur `/fr/a-propos` et `/en/a-propos`. Six sections : présentation, histoire, mission/ambition, approche avec les communautés, six domaines et contact. Les contenus développent les informations déjà fournies ; provenance et limites dans `docs/CONTENU-CLIENT.md`. Composant serveur `About`, contenu FR/EN centralisé, métadonnées dédiées, layout et composants partagés. Les sous-rubriques restent inchangées.

Contrôles réussis : TypeScript, ESLint, compilation des 51 pages et `git diff --check`. Sept tests À propos réussis sur le dernier build : cinq largeurs de 320 à 1920 px, cadre commun, photos effectivement chargées et étiquetées, accessibilité automatique, texte à 200 %, navigation depuis l'accueil, ancre au clavier, langue anglaise, lien contact et fonctionnement sans JavaScript en FR/EN. Cinq tests existants réussis : toutes les routes connues FR/EN, les accès refusés, l'accueil à 375/1440 px et le clavier avec mouvements réduits. La suite complète n'a pas été relancée ; ces vérifications ciblent les changements et les protections concernées.

Mesures complémentaires : mêmes tailles de h2 et séparations entre les six sections et le footer, 24 px sur petit écran, environ 43,2 px à 1440 px et 48 px à 1920 px ; aucun débordement horizontal. Captures téléphone/ordinateur et bandeau photographique final à 1920 px examinés. Aucun service externe demandé par la nouvelle page lors des tests.

Un contrôle complémentaire initial à 1920 px a dépassé son délai sur la variante WebP de la photographie. La taille demandée dépassait aussi son emplacement réel dans le cadre limité : `sizes` est désormais plafonné à 922 px CSS sur grand écran. Après reconstruction et redémarrage, la variante WebP de 1920 px répond en HTTP 200 en environ 0,3 seconde et les tests de chargement à 1920 px passent. La cause exacte du blocage transitoire de l'optimiseur n'est pas établie ; aucune restriction de média n'a été assouplie.

Le processus Next.js a été confirmé par son dossier GECA avant chaque arrêt. Le serveur final reste sur `127.0.0.1:3000` en mode compilé. Vérification finale de `/fr`, `/fr/a-propos` et `/en/a-propos` : HTTP 200, styles chargés, aucun débordement.

Sécurité : le registre fermé continue de refuser les adresses inconnues, dont `/fr/a-propos/inconnue`, et les fichiers privés. En-têtes de protection et rejet d'images distantes vérifiés. Aucun compte, session, saisie, stockage, service, dépendance ou injection HTML ajouté. Les scénarios de propriétaire, changement de compte et droits révoqués ne sont pas applicables à cette page publique sans comptes. Les photos restent temporaires et les formulations/traductions restent à relire par GECA avant publication. Pas de sécurité absolue revendiquée. Changements antérieurs conservés ; aucun commit ni push.

## Projets & programmes — 3 octobre 2026

Catalogue public sur `/fr/projets`, `/fr/projets/en-cours`, `/fr/projets/realises` et leurs équivalents EN. Composant serveur `ProjectPortfolio`, données FR/EN centralisées dans `src/content/site.ts`, branchement exact dans le registre existant. Les quatre projets et leurs statuts restent ceux du brief. Les informations à confirmer sont signalées ; les photos gardent leur étiquette temporaire. Les fiches individuelles restent en préparation. Aucun service ou dépendance ajouté.

TypeScript, ESLint, compilation des 51 pages et `git diff --check` réussis. **14 tests ciblés réussis** : 8 pour le catalogue, 6 pour les routes, protections et parcours existants. Le catalogue a été contrôlé à 320, 375, 768, 1440 et 1920 px : quatre projets visibles dans Tous, deux par statut, photographies chargées et étiquetées, trois informations pratiques par projet, cadre commun, texte à 200 %, absence de débordement et accessibilité automatique. Parcours validés : arrivée depuis l'accueil, filtre au clavier, changement de statut, retour arrière, langue conservant la vue, contact et fonctionnement sans JavaScript en FR/EN. Tous les liens internes du catalogue répondent.

Les tests existants vérifient toutes les routes FR/EN, les accès refusés, les en-têtes HTTP, le refus des images distantes, l'accueil à 375/1440 px, le clavier, les mouvements réduits et le secours vidéo avec ses liens. Deux assertions de navigation ont été adaptées aux pages désormais développées : retour par le logo et passage par l'accueil anglais, sans retrait des contrôles de sécurité. La suite intégrale n'a pas été relancée ; les vérifications portent sur les changements et les protections concernées.

Captures du haut de page et des projets examinées à 375 et 1440 px. Mesures complémentaires de l'accueil et du catalogue FR/EN à 320, 1440 et 1920 px : styles chargés, aucune largeur débordante, séparation identique entre les sections et avant le footer (24, environ 43,2 et 48 px).

Serveur GECA confirmé par son dossier avant l'arrêt, reconstruit et redémarré en mode compilé sur `127.0.0.1:3000`. Vérification réelle de `/fr` et des catalogues courants : HTTP 200 et styles de la version actuelle.

Sécurité : aucune donnée privée, collecte, session, saisie ou injection HTML. Les filtres ne sont pas des droits d'accès ; ils sélectionnent des données publiques déjà définies côté serveur. Les routes inconnues, y compris les sous-adresses inventées des vues, renvoient 404 en FR/EN. Aucun scénario de propriétaire ou de droits révoqués n'existe dans cette maquette sans comptes. Périodes, statuts, partenaires et traductions restent à relire par GECA avant publication. Les contrôles automatisés ne constituent pas une garantie de sécurité absolue. Changements antérieurs conservés, aucun commit ni push.

## Domaines d’intervention — 3 octobre 2026

Page FR/EN développée dans `InterventionAreas.tsx`, données dans `src/content/site.ts`, styles limités aux classes `intervention-*`. La route reste validée par la liste fermée existante ; métadonnées adaptées. Les six liens de l’accueil ciblent maintenant le domaine correspondant. Benchmark consigné avant réalisation dans `docs/BENCHMARK.md`. Guides Next locaux consultés : composants serveur/client, CSS et navigation.

Vérifications réalisées sur le build final et le serveur GECA `127.0.0.1:3000` :

- `npm run typecheck`, `npm run lint`, `npm run build` : réussis (51 pages générées).
- `tests/interventions.spec.ts` : **7 tests réussis**. Lecture à 320, 375, 768, 1440 et 1920 px ; cadre commun, marges entre sections et avant le footer ; six photos chargées avec leurs mentions ; texte à 200 % sans débordement horizontal ; aucune erreur JavaScript ni requête externe observée. Aucun problème détecté par axe sur les règles WCAG A/AA contrôlées. Cela ne remplace pas un audit complet.
- Sommaire et retours au clavier, arrivée à la bonne rubrique depuis l’accueil, passage FR/EN, métadonnées, destinations Projets/Contact et contenu sans JavaScript : réussis.
- Régression ciblée `tests/site.spec.ts` : **5 tests réussis** (routes connues FR/EN, accès refusés et protections, accueil à 375/1440 px, clavier/langue/mouvements réduits).
- Captures ordinateur et téléphone inspectées : titres centrés, sommaire lisible, alternance photo/texte, mention temporaire visible. Aucun changement de police. `git diff --check` réussi.

Le processus du port 3000 a été identifié comme celui de GECA par son répertoire `/proc/PID/cwd`, puis arrêté et redémarré après compilation. Les contrôles ont porté sur ce serveur, sans compilation concurrente aux tests. L’accueil charge ses styles et la nouvelle page est servie dans les deux langues.

Sécurité du périmètre : contenu public statique, aucune nouvelle dépendance, entrée utilisateur, requête externe ou collecte. Les chemins inconnus, fichiers privés et points d’envoi absents restent refusés ; les en-têtes de protection et l’interdiction des images distantes passent les tests existants. Aucun compte ni session à tester ici ; les limites et l’alerte des outils de développement documentées précédemment restent inchangées. Les textes et photos attendent toujours la validation/remplacement client avant publication. Aucun commit ni push.

## Page unique Projets & programmes — 3 octobre 2026

Demande : retirer les sous-pages et utiliser uniquement les informations de l’accueil. Les six sous-routes ont été retirées du registre fermé (listes En cours/Réalisés et quatre fiches). Le menu mène directement à `/projets`. Les cartes de l’accueil ciblent les quatre ancres de la page unique. Les textes français de présentation et de conclusion réutilisent les champs de l’accueil ; mêmes données `projects`, sans nouvel élément factuel. Les trois axes et textes supplémentaires de l’ancienne page ont été supprimés. Règle enregistrée dans `AGENTS.md` et `CLAUDE.md`. Benchmark relu et adaptation documentée avant réalisation.

Contrôles réels :

- TypeScript, lint, compilation (39 pages générées) et `git diff --check` réussis.
- **8 scénarios Projets réussis** : cinq formats (320, 375, 768, 1440, 1920 px), photos locales chargées et mentions visibles, texte à 200 %, absence de débordement, accessibilité axe, menu direct, ancre au clavier depuis l’accueil, changement FR/EN, lien Contact, fonctionnement sans JavaScript, comparaison des quatre titres/descriptions/zones/périodes/partenaires/statuts avec les données partagées de l’accueil. Les six anciennes sous-routes répondent 404 en FR et EN. Aucun lien vers ces sous-routes sur la page.
- **5 scénarios de régression réussis** : routes connues FR/EN, accès refusés/protections, accueil à 375 et 1440 px, clavier/langue/mouvements réduits.
- Première exécution : 10 scénarios réussis et 3 échecs de sélection dans les tests, car « Nous contacter / Contact us » est présent dans la conclusion et le footer. Sélecteurs limités à la conclusion, puis ces 3 scénarios réussis. Aucun code du site ni protection modifié pour résoudre ces échecs.
- Captures ordinateur et téléphone inspectées : titres centrés, carte lisible, cadre et marges communs. L’accueil a été ouvert sur le serveur final : feuille de style HTTP 200, lien `/fr/projets#projet-kounounkan`. La page unique affiche les quatre projets et aucun lien de sous-page.

Serveur du port 3000 identifié par son PID et son répertoire GECA avant arrêt. Recompilé, puis redémarré sur `127.0.0.1:3000`. Les tests utilisent ce serveur final. Aucun nouveau compte, formulaire, service, dépendance, requête externe ou collecte. Refus des routes inconnues, fichiers privés, points d’envoi absents et images distantes conservés ; en-têtes de protection vérifiés. Les limites de la maquette et des contrôles précédents restent applicables. Pas de commit ni push.

## Images définitives des domaines — 3 octobre 2026

Six fichiers fournis par Gassama dans `Downloads/imageGeca/domaineDinterventions`. Association strictement fondée sur les noms, sans ouvrir les images. La correspondance complète est dans `docs/IMAGES-DOMAINES.md`. Copies JPEG proportionnelles de 1920 px maximum, sans recadrage ni agrandissement ; originaux conservés. Vérification du format, décodage avec Sharp et absence d’EXIF/XMP/IPTC dans les copies publiques. Poids réduit d’environ 60 Mo à 1,5 Mo. Aucun auteur, licence, lieu, personne ou événement déduit de ces fichiers.

Les six images sont partagées par l’accueil français et les pages Domaines FR/EN. Leurs mentions temporaires sont retirées ; celles des autres illustrations restent présentes. Les textes alternatifs nomment le domaine sans description visuelle inventée. L’accueil anglais reste la page de préparation existante ; À propos ne contient pas de photo individuelle par domaine.

Contrôles réalisés :

- `npm run typecheck`, `npm run lint`, `npm run build` : réussis, 39 pages générées. Aucune dépendance ajoutée.
- **27 tests réussis** : `tests/interventions.spec.ts` et `tests/site.spec.ts`, sur le serveur GECA courant du port 3000. Correspondance exacte des chemins d’image avec les domaines ; six images chargées ; absence de badge temporaire pour ces domaines et maintien des badges des autres illustrations. Domaines FR/EN vérifiés aussi sans JavaScript.
- Domaines à 320, 375, 768, 1440 et 1920 px ; accueil à neuf largeurs de 320 à 1440 px. Marges, absence de débordement, texte à 200 %, sommaire et liens au clavier, passage de langue, liens internes, modes de mouvement réduit et vidéo de secours : réussis. Aucun problème détecté par les règles axe contrôlées ; cela ne remplace pas un audit complet.
- Accès directs autorisés FR/EN, routes inconnues, fichiers privés et points d’envoi absents refusés ; restrictions des images distantes et en-têtes de protection conservés et vérifiés par les tests existants. Aucun compte ou session dans cette maquette : changements de compte et droits révoqués non applicables.
- Serveur compilé du port 3000 identifié par son PID et son répertoire GECA avant arrêt. Redémarré après compilation sur `127.0.0.1:3000`. Requête finale `/fr` : HTTP 200, six chemins actuels présents, feuille de style HTTP 200 avec les styles des domaines.

Conformément à la demande, aucune inspection visuelle des images ou des captures des tests. Les contrôles d’affichage sont automatiques ; le cadrage visuel et une description détaillée des scènes ne sont pas évalués. Aucun nouveau service, collecte ou requête externe du site. Changements antérieurs conservés, aucun commit ni push.

## Retrait des icônes décoratives — 3 octobre 2026

Demande de Gassama : alléger tout le site en retirant les icônes présentes partout. Suppression effective dans les composants, pas simplement masquage par CSS : flèches des boutons/liens et du hero, pictogrammes des titres, cartes, lieux, dates, coordonnées, priorités et pages de préparation. Le lien d’actualité précédemment représenté par une flèche affiche « Découvrir », avec au moins 44 px de hauteur et retour à la ligne possible dans le bas des cartes. Les deux boutons du hero sont centrés dans leur panneau. Les photographies, logos, textes factuels et liens GECA sont conservés.

Seuls les indicateurs des commandes de recherche, menu/fermeture, sous-menu et pause/lecture restent présents, avec leurs noms accessibles, états ouverts/fermés et navigation au clavier. Le composant `Icon` n’accepte plus de nom décoratif. Styles et champs de données des icônes supprimées retirés. Préférence pour les prochaines pages enregistrée dans `docs/TYPOGRAPHIE.md`. Benchmark réalisé avant adaptation dans `docs/BENCHMARK.md` ; guides locaux Next CSS et Link lus.

TypeScript et lint réussis sans avertissement après nettoyage. Compilation Turbopack réussie (39 pages) après renouvellement du cache : première tentative bloquée lors de l’ouverture d’un port interne du moteur de styles ; le cache conservait cet échec à la tentative autorisée suivante. Ancien cache déplacé dans `/tmp/geca-icones-cache-l5cv4_2r/cache`, sans suppression de fichier source, puis compilation autorisée réussie.

Serveur compilé du port 3000 identifié par son PID et son répertoire GECA avant arrêt ; redémarré après compilation sur `127.0.0.1:3000`. Contrôle navigateur supplémentaire à 375 px sur douze routes FR/EN (accueil, À propos, Domaines, Projets, Contact et Équipe) : HTTP 200, styles chargés, aucun débordement horizontal et zéro SVG décoratif dans le contenu ou le pied de page. L’unique SVG du contenu autorisé par ce contrôle est la commande vidéo. Les contrôles d’interface sont automatiques ; pas d’inspection visuelle des photos ou captures.

Sécurité du périmètre : modification de présentation, aucune dépendance, collecte, compte, session, requête externe ou envoi ajouté. Routes fermées, validation du contact sans transmission et protections HTTP conservées. Aucun système de comptes dans cette maquette : changement de compte et droits révoqués non applicables. Les contrôles automatiques d’accessibilité ne remplacent pas un audit complet. Changements antérieurs conservés ; aucun commit ni push.

Résultat final : **64 tests existants réussis** avec `npm run test:e2e` sur le serveur courant du port 3000. À propos, Contact, Domaines, Projets, accueil, menu, langue, modes sans JavaScript/mouvement réduit, photos, vidéo et texte agrandi à 200 % contrôlés. Formats de 320 à 1920 px selon la page et téléphone en paysage. Validation et absence d’envoi du contact, accès directs connus, refus des chemins inconnus/sous-pages retirées/fichiers privés et images distantes, en-têtes de protection et accessibilité axe contrôlée : réussis. Aucun test modifié pour ce retrait. `git diff --check` réussi.

## Suppression des dernières icônes de commande — 3 octobre 2026

La nouvelle demande de Gassama est appliquée aussi à la recherche, au menu, aux sous-menus et à la vidéo. Tous les SVG d’interface et le composant `Icon` sont retirés. Les commandes affichent des mots : Rechercher, Menu/Fermer, Afficher/Masquer et Pause/Lire. Le bouton de don affiche Don sur petit écran et conserve le nom accessible complet « Faire un don ». Les photographies, logos et favicon restent présents ; aucun contenu factuel GECA n’est modifié. Préférence enregistrée dans `AGENTS.md` et `docs/TYPOGRAPHIE.md`, benchmark consulté avant adaptation dans `docs/BENCHMARK.md`.

Les tailles des boutons Menu/Fermer et Pause/Lire suivent l’agrandissement du texte. La barre reste sur une ligne à taille normale ; les commandes peuvent se répartir sur plusieurs lignes quand le texte est agrandi. Le menu reste superposé, sans déplacer la page. Noms accessibles, états ouverts/fermés, pause/lecture, focus et touche Échap conservés. L’ancien test de la vidéo demandait une icône sans texte ; seules ces attentes de présentation sont remplacées par Pause, Lire et absence de SVG. Les assertions de lecture, pause au clavier et réduction de mouvement sont conservées.

Un premier contrôle a détecté une barre sur deux lignes à 320 px. Le premier lancement des tests avait également détecté un déplacement de la page à 200 % lors du passage de Menu à Fermer (8 tests réussis, 1 échec ; suite interrompue pour corriger). Correction des largeurs, unités proportionnelles au texte et retour à la ligne des commandes ; aucun test d’accessibilité ou protection assoupli.

TypeScript, lint et compilation finale : réussis (39 pages). Serveur du port 3000 identifié par son PID et son répertoire GECA avant chaque redémarrage, puis actualisé après compilation sur `127.0.0.1:3000`.

Contrôle navigateur final supplémentaire : 96 vues réussies (12 routes FR/EN, quatre largeurs 320/375/768/1440 px, texte normal et 200 %). Zéro SVG dans l’interface ; pages HTTP 200 ; barre sur une ligne avec texte normal ; aucun débordement horizontal ; aucune variation de la position du contenu à l’ouverture du menu ; libellés Fermer/Close corrects. Accueil du port 3000 : styles présents et chargés en HTTP 200. Contrôles d’interface automatiques, sans ouvrir les images fournies ni les captures.

Périmètre public statique : aucun compte, session, nouvelle dépendance, collecte, service, envoi ou secret ajouté. Contrôles de routes, refus, restrictions d’images et en-têtes HTTP conservés. Changements de compte et droits révoqués non applicables à cette maquette sans comptes. L’accessibilité automatique contrôlée ne remplace pas un audit complet. Aucun commit ni push.

Résultat final : **33 tests réussis** sur le serveur courant du port 3000 (`tests/site.spec.ts`, `tests/navigation.spec.ts`, `tests/impact-motion.spec.ts`). Neuf largeurs de l’accueil, menu sur téléphone/tablette/ordinateur/paysage et à 200 %, clavier, noms des commandes, langues, liens internes, vidéo/pause/reprise/échec/autoplay refusé, sans JavaScript, réduction de mouvement et économie de données : réussis. Routes connues FR/EN autorisées ; chemins inconnus, fichiers privés et points d’envoi absents refusés ; restrictions des images distantes et en-têtes de protection vérifiés. Aucune violation détectée par les règles axe contrôlées. Aucune compilation concurrente aux tests finaux. `git diff --check` réussi.

## Projets alternés, langues dans la barre et crédit — 3 octobre 2026

Demande de Gassama : les quatre projets alternent image/texte puis texte/image à partir de 768 px. Sur téléphone, chaque photo reste au-dessus du texte associé. L’ordre du contenu HTML reste photo puis texte pour chaque projet. Le footer affiche « Site réalisé par GassTech Solutions » en français, « Website by GassTech Solutions » en anglais, sans adresse inventée.

L’unique sélecteur FR/EN quitte le menu et se place entre Rechercher et Faire un don. Les trois groupes disposent d’au moins 12 px de séparation ; la barre utilise 16 à 28 px sur grand écran. Sous 768 px, logo et Menu occupent la première ligne, les trois groupes la seconde. Le changement de langue conserve la page courante. Navigation au clavier, noms accessibles, états du menu et fermeture par Échap conservés. Aucune icône réintroduite.

Benchmark documenté avant réalisation dans `docs/BENCHMARK.md` : The Nature Conservancy et recommandations W3C sur l’ordre de lecture et les zones cliquables. Les limites des observations externes sont indiquées. Guides locaux Next CSS, Link et composants serveur/client consultés. Consignes communes et README actualisés.

TypeScript, lint et compilation finale réussis (39 pages). Un contrôle initial a détecté le retour à la ligne de « Fermer » à 320 px, qui déplaçait le contenu. Largeur du bouton augmentée et mot conservé sur une ligne ; contrôles répétés après reconstruction et redémarrage. Aucun test d’accessibilité ou de protection assoupli.

Contrôle navigateur supplémentaire : **48 vues réussies**, accueil/Projets/Contact FR et EN à 320, 375, 768 et 1440 px, avec texte normal et agrandi à 200 %. Alternance des quatre projets, ordre et espacement des langues, crédit exact, absence de SVG d’interface et de débordement horizontal, position de la page inchangée à l’ouverture du menu : vérifiés. Contrôles automatiques, sans ouvrir les images fournies ni les captures. Cela ne remplace pas un audit visuel ou d’accessibilité complet.

Serveur compilé du port 3000 confirmé comme appartenant à GECA par son répertoire avant chaque arrêt. Reconstruit et redémarré sur `127.0.0.1:3000`. L’accueil `/fr` affiche la version actuelle ; page et feuilles de style répondent en HTTP 200. Aucun nouveau service, dépendance, compte, session, collecte, envoi ou secret. Les scénarios de changement de compte et de droits révoqués ne s’appliquent pas à cette maquette publique sans comptes. Changements antérieurs conservés ; aucun commit ni push.

Résultat final : **64 tests réussis** avec `npm run test:e2e` sur ce serveur courant, sans compilation concurrente. À propos, Contact, Domaines, Projets, accueil, navigation au clavier, langues, modes sans JavaScript, vidéo et mouvements réduits vérifiés ; affichages de 320 à 1920 px selon la page, paysage et texte à 200 %. Les tests Projets contrôlent maintenant la position alternée des quatre photos à chaque largeur ; les tests de navigation contrôlent les langues hors du menu et leurs espacements. Validation et absence de transmission du contact, accès directs connus autorisés, chemins inconnus/sous-pages supprimées/fichiers privés/images distantes refusés, en-têtes de protection : réussis. Aucune violation détectée par les règles axe contrôlées. `git diff --check` réussi.

## Rétablissement des icônes utiles — 3 octobre 2026

Précision de Gassama : le retrait concernait surtout les pictogrammes encombrants des cartes. Retour des icônes hamburger/croix, loupe, chevrons des sous-menus et pause/lecture vidéo. Noms accessibles, états, focus, touche Échap et comportements existants conservés. La grande flèche dorée du hero pointe en bas à droite vers les deux liens. Les cartes, statistiques, lieux et dates restent sans pictogrammes. Le composant `Icon` n’accepte que ces commandes et la flèche demandée ; aucune icône générale n’est ajoutée aux boutons partagés. FR/EN reste hors du menu entre recherche et don ; alternance des projets et crédit du footer conservés.

La consigne précédente de retrait total est corrigée dans `AGENTS.md` et `docs/TYPOGRAPHIE.md`. README actualisé. Benchmark préalable : références GOV.UK et W3C consultées à nouveau, observations et adaptation consignées dans `docs/BENCHMARK.md`. Guide local Next CSS lu avant réalisation. Icônes locales SVG simples, sans nouvelle bibliothèque ou ressource distante.

TypeScript, lint et compilation réussis (39 pages). Serveur compilé GECA du port 3000 identifié par son PID et son répertoire avant arrêt, puis redémarré après compilation sur `127.0.0.1:3000`. Contrôle navigateur supplémentaire : **96 vues réussies**, douze routes FR/EN, quatre largeurs 320/375/768/1440 px, texte normal et 200 %. Icônes de recherche et menu, noms accessibles, chevrons, flèche du hero, cartes sans SVG, langues et espacement, absence de débordement et position du contenu inchangée à l’ouverture : vérifiés. Accueil `/fr` et styles HTTP 200. Le premier script avait utilisé `/a-propos/equipe`, adresse absente du registre ; chemin corrigé en `/equipe` puis contrôle intégral réussi, sans modification des routes du site. Aucun test affaibli pour ce contrôle. Vérification automatique, sans ouvrir les photographies fournies ou les captures ; cela ne remplace pas un audit visuel ou d’accessibilité complet.

Sécurité du périmètre : aucune nouvelle dépendance, saisie, collecte, requête externe, session, donnée privée, envoi ou secret. Aucune protection modifiée. Les SVG sont définis dans le code, sans contenu utilisateur ou injection HTML. Changements de compte et droits révoqués non applicables à cette maquette publique sans comptes. Changements antérieurs conservés ; aucun commit ni push.

Résultat final : **33 tests réussis** (`tests/site.spec.ts`, `tests/navigation.spec.ts`, `tests/impact-motion.spec.ts`) sur le serveur courant du port 3000, sans compilation concurrente. Neuf largeurs d’accueil, téléphone/paysage/tablette/ordinateur, clavier, texte à 200 %, langues, liens internes, vidéo/pause/reprise/échec/lecture automatique refusée, modes sans JavaScript/mouvements réduits/économie de données : réussis. Les attentes de présentation de la commande vidéo portent maintenant sur l’icône et son nom accessible, en conservant les contrôles de lecture et pause. Recherche/hamburger/flèche du hero et absence d’icônes dans les cartes ajoutés aux vérifications existantes d’affichage. Accès directs connus autorisés ; chemins inconnus, fichiers privés et points d’envoi absents refusés ; restrictions des images distantes et en-têtes de protection vérifiés. Aucune violation détectée par les règles axe contrôlées. `git diff --check` réussi.


## RECOMMANDATIONS.docx — 6 octobre 2026

Application des cinq paragraphes de résultats, du titre corrigé, de la casse « Global EcoAction », des proportions du hero (slogan −40 %, nom +50 %), de l’adresse Sangoyah Marché et des cinq logos fournis. Les anciens partenaires et chiffres validés restent en place. Texte reçu, corrections limitées et remplacements archivés dans `TEXTES-AUTHENTIQUES-CLIENT.md`. Copie Word identique au document reçu, vérifiée par SHA-256 : `d6ba74bb843ab160d366b4fd69d180d962918e9f212242697b7335ec3101ea7c`. Benchmark actualisé avant adaptation ; aucune source externe utilisée pour inventer un fait GECA.

### Contrôles réels

- Lint complet et TypeScript réussis, y compris après les corrections des tests. `git diff --check` réussi.
- Compilation locale, export Pages puis reconstruction locale finale réussis (31 sorties Next). La première compilation Pages est restée bloquée en phase de compilation dans le bac à sable, sans activité CPU supplémentaire ; seul son processus a été arrêté après vérification du dossier GECA. La relance hors bac à sable a réussi. Aucune modification du code de production pour contourner ce blocage.
- Suite locale : 76 tests réussis sur 89 au premier passage. Les 13 échecs concernaient quatre mesures Contact prises pendant l’apparition de 12 px, et neuf contrôles qui attendaient encore cinq logos. Le test de disposition Contact utilise désormais la préférence de mouvement réduit pour mesurer les positions au repos ; les tests dédiés aux animations, au focus et à l’accessibilité sont conservés et réussis. Le nombre de logos attendu devient dix, conformément aux cinq ajouts. Reprise ciblée : 14 tests réussis (les 13 concernés et Contact à 320 px). Les 89 scénarios sont donc couverts avec succès, sans prétendre que le premier passage était entièrement vert.
- Export : huit tests réussis. Routes FR/EN, ressources, images locales, navigation, langues, recherche, saisie sans envoi, absence de JavaScript, refus d’URL inconnues et de fichiers privés. Aucun document Word ni original source dans `out` ; nouveaux textes et cinq logos présents dans l’export.
- Contrôle complémentaire direct à 320, 375, 768 et 1440 px : nom exact sans transformation en majuscules, taille de 21 px, slogan exactement à 60 % de sa taille précédente, cinq paragraphes dans l’ordre reçu, dix images de partenaires décodées, aucun débordement à 200 %. À propos, Contact et pied de page contrôlés en FR/EN : nouvelle adresse et absence de Kissosso dans le contenu courant. Aucune erreur JavaScript observée.
- Treize variantes ajoutées pour les cinq logos, 71 522 octets cumulés ; dimensions vérifiées, aucune métadonnée EXIF, XMP ou IPTC. Les originaux restent hors du dossier public. Accès direct au document Word et aux originaux MEDD/OGPNRF : 404.
- Six captures examinées : hero, impact et partenaires à 375 et 1440 px, sous `/tmp/geca-recommandations-*.png`. Couleurs et proportions des logos conservées ; textes et cartes lisibles. Certaines captures longues de section montrent un artefact de capture du lien fixe d’évitement ; aucun style de masquage ajouté à ce contrôle accessible.
- Serveur final démarré après reconstruction locale sur `127.0.0.1:3000`, écoute vérifiée. `/fr` et sa feuille de styles répondent 200. Chrome relève « Global EcoAction », 21 px pour le nom et 24 px pour le slogan à 375 px, dix logos et l’adresse Sangoyah Marché. En-têtes `DENY` et `nosniff` vérifiés.

### Sécurité et limites

Aucun compte, droit utilisateur, changement de compte ou révocation n’existe dans cette maquette : ces cas ne sont pas applicables. Les tests des saisies autorisées et hostiles, refus d’accès directs, routes suspendues, absence d’envoi et de stockage passent. Registre fermé des médias et routes, préférences de mouvement, commandes clavier et chargement local conservés. Aucune dépendance ni service ajouté ; aucun nouvel audit des dépendances revendiqué. Next journalise encore `NoFallbackError` sur certaines adresses refusées, déjà documenté dans les précédentes vérifications ; les réponses 404 sont contrôlées.

Les licences des cinq logos ne sont pas précisées dans le document client ; leur provenance et cette limite sont conservées dans `LOGOS-PARTENAIRES.md`. L’accueil EN demeure en préparation ; les pages EN existantes reprennent la nouvelle adresse et le nom corrigé. Aucun commit, push ou déploiement effectué. La référence personnelle de bonnes pratiques du Bureau n’a pas été modifiée.

### Publication autorisée ensuite — 6 octobre 2026

Gassama demande explicitement de terminer, faire le commit et pousser sur GitHub Pages. Les contrôles ci-dessus restent pertinents pour cette même version : aucun code du site n’a changé depuis leur réussite. La branche distante `main` a été relue avant le commit, sans divergence avec le HEAD local ; le workflow publie uniquement `out` et conserve ses vérifications avant déploiement.

Le Word source contient un nom d’auteur et de dernier éditeur dans ses métadonnées. Il reste intact dans l’archive locale, mais son chemin est exclu de Git pour ne pas diffuser ces données inutiles au site dans le dépôt public. Les textes extraits, corrections et logos nécessaires sont versionnés. Les liens vers ce Word dans la documentation désignent donc une archive locale, absente du dépôt distant et de Pages.


## Cartes des logos qui se chevauchent — 6 octobre 2026

Gassama signale des cartes jointives sur sa capture et autorise explicitement le commit et le push. Cause reproduite : à 1024 px, chaque carte mesurait 212,39 px pour une colonne de 160,5 px, avec un chevauchement réel de 35,89 px. Retrait du rapport imposé `aspect-ratio: 1.18` sur les cartes ; grille reliée à `--card-gap` (20–32 px). Les images conservent leurs proportions, textes alternatifs, sources et tailles de chargement. Aucun contenu GECA modifié.

Vérifications réussies : lint, TypeScript, compilation Pages puis reconstruction locale, huit tests de l’export et sept tests locaux ciblés (règles communes, routes FR/EN, accès refusés, écrans 320/1024/1440 px). Le contrôle existant des logos mesure désormais la distance entre leurs bords et leur maintien dans la grille ; il ne se limite plus à comparer leurs tailles.

Mesures complémentaires sur 13 largeurs (320, 375, 599, 600, 768, 1023, 1024, 1041, 1100, 1199, 1200, 1440, 1920 px), à 100 % et 200 % : dix cartes dans leur cadre, distances horizontales/verticales conformes au gap commun, aucun chevauchement ni débordement de page. Survol sans variation de dimensions ni de padding. Espacement également contrôlé sans JavaScript à 1041 px. Captures à 1041 et 1440 px examinées, cartes distinctes ; capture mobile disponible sous `/tmp/geca-logo-spacing-375.png`.

Serveur local reconstruit et redémarré sur `127.0.0.1:3000` après identification du processus GECA avant arrêt. Contrôles visuels réalisés sur ce serveur. Changement limité au CSS et aux contrôles de disposition : aucun service, collecte, dépendance, accès aux données ou protection modifié. Les tests de routes inconnues, fichiers privés et URL d’images refusées restent réussis. Les comptes et droits révoqués ne sont pas applicables à cette maquette sans compte. Les limites des licences déjà documentées restent inchangées. La référence de bonnes pratiques du Bureau n’a pas été modifiée.
