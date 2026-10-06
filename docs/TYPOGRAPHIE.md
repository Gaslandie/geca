# Typographie commune GECA — 3 octobre 2026


## Règle actuelle prioritaire — 4 octobre 2026

Défilement : `SiteMotion` est commun à toutes les pages FR/EN. Tous les blocs ciblés utilisent une apparition unique de 12 px vers 0 sur 480 ms, avec la même courbe. Le hero suit désormais cette règle, sans zoom particulier. Les en-têtes, cartes et photos partagés sont détectés automatiquement ; ajouter `data-reveal` pour les nouveaux blocs autonomes de texte. Ne pas ajouter un autre effet à une section qui contient déjà des blocs animés. Aucun masquage ni variation d’opacité ; mouvement réduit, économie de données, focus clavier et fonctionnement sans JavaScript préservés. Les survols gardent leurs transitions courtes distinctes du défilement.

Cette règle remplace les anciens alignements particuliers décrits plus bas, notamment le titre Impact à gauche. Les sections datées ci-dessous conservent l’historique des choix ; en cas de contradiction, appliquer cette règle.

- Titres de page, section et carte centrés sur toutes les pages FR/EN, ainsi que repères et sous-titres. `SectionHeading` occupe la largeur disponible avant les colonnes. Les titres de cartes sont centrés dans le corps de leur carte.
- Réutiliser la classe `.card-content` pour chaque corps de carte : photos hors de ce corps, ou classe directement sur une carte uniquement textuelle. Un seul niveau de padding. Les futures sous-lignes peuvent utiliser `.card-subtitle` ; les titres natifs `h1` à `h6` sont centrés par défaut dans `main`.
- Padding commun : `--card-padding`, de 20 à 32 px. Espacement des grilles : `--card-gap`, de 20 à 32 px. Les cartes d’information, chiffres, projets, équipe, actualités, domaines, coordonnées, sommaires et appels à l’action suivent les mêmes valeurs.
- Marges entre sections et avant le pied de page : `--section-gap`, de 24 à 48 px. En-tête vers contenu : `--heading-gap`, 28 px. Espace vertical des sections ordinaires et bandeaux : `--section-padding`, de 52 à 80 px. Les compositions contenant des photos ou le formulaire utilisent les mêmes corps et cadres sans doubler les espaces.
- Survol et focus : dimensions, marges et padding identiques au repos. Les effets changent uniquement l’ombre, la couleur ou le recadrage interne d’une image ; les préférences de mouvements réduits restent actives.
- Le court sous-titre du hero est centré. Le paragraphe long de mission et la présentation « Notre organisation » restent justifiés, comme demandé auparavant. Les paragraphes longs hors cartes, labels de saisie et textes de listes gardent leur rôle de lecture ; ne pas les transformer en titres.
- La carte événement réserve sous son corps la place de la mention de photo temporaire, pour éviter un chevauchement. Cette légende n’ajoute pas un deuxième padding de carte.
- Les informations du catalogue de projets occupent deux rangées à toutes les tailles : territoire et période côte à côte, puis partenaire/bailleur sur toute la largeur. Laisser les valeurs longues revenir à la ligne dans leur cellule.
- Avant 768 px, centrer tout le pied de page partagé : logo, textes, rubriques, liens, coordonnées et mentions finales.

Les règles sont partagées dans `src/app/globals.css`, avec les variables au début du fichier et les sélecteurs communs à la fin. Les contrôles de régression sont dans `tests/design-rules.spec.ts`. Lire également les exigences permanentes de sécurité, de benchmarking et de français simple dans `AGENTS.md`.


## Icônes — préférence du 3 octobre 2026

Gassama précise : les cartes restent sans pictogrammes encombrants. Les commandes retrouvent leurs icônes utiles : hamburger/croix, loupe, chevrons de sous-menu et pause/lecture vidéo, avec noms accessibles et états clavier conservés. Rétablir aussi la grande flèche dorée du hero vers les deux boutons. Cette précision remplace la consigne précédente de retrait total. Sur petit écran, Don conserve le nom accessible complet « Faire un don ». Conserver photos, logos et typographie commune.

Cette règle répond à la demande de Gassama : un style proche de Panthera, des écritures plus lisibles et une même logique sur l’accueil et les prochaines pages. La comparaison mesurée est dans `docs/BENCHMARK.md`.

## Les polices

Panthera utilise Circular Std pour les textes et titres de section, et Exemplar Pro pour certains grands titres. Ces polices demandent une licence. Aucun fichier autorisé n’a été fourni pour GECA. Les fichiers commerciaux de Panthera ne sont pas récupérés.

GECA utilise donc deux alternatives gratuites : **DM Sans** pour les textes, titres de section, cartes et navigation ; **DM Serif Display** pour les titres principaux des pages internes et les courtes signatures. Le hero de l’accueil utilise DM Sans pour suivre la nouvelle référence. Leur proximité est une adaptation visuelle, pas une copie exacte de Circular ou Exemplar.

Les fichiers proviennent du dépôt officiel Google Fonts : [DM Sans](https://github.com/google/fonts/tree/main/ofl/dmsans) et [DM Serif Display](https://github.com/google/fonts/tree/main/ofl/dmserifdisplay). Les licences SIL Open Font License accompagnent les fichiers dans `src/app/fonts/`. Le chargement passe par `next/font/local` dans le layout commun FR/EN : le navigateur contacte seulement GECA, jamais Google Fonts ou Panthera. Les anciens fichiers restent conservés, mais ne sont plus chargés.

## Une taille pour chaque rôle

Les valeurs sont définies une seule fois dans `:root`, au début de `src/app/globals.css`. Elles suivent la largeur de l’écran. Une variable CSS est simplement une valeur nommée, réutilisée partout.

| Rôle | Valeur commune | Usage |
| --- | --- | --- |
| Titre principal | `--text-page-title` : 40–72 px | Un `h1` par page, DM Serif Display ; hero en DM Sans |
| Titre de section | `--text-section-title` : 30–45 px | Tous les `h2` principaux, DM Sans, poids 500 |
| Titre de carte | `--text-card-title` : 22–25 px | Cartes, domaines, membres, événement ; poids 700 |
| Paragraphe principal | `--text-body` : 17–20 px | Présentation et introductions de sections |
| Paragraphe de carte | `--text-card-copy` : 17–18 px | Descriptions plus courtes dans les cartes |
| Petit texte | `--text-small` : 14 px | Dates, lieu, rôle, statut, mentions |
| Repère de section | `--text-label` : 14 px | Petit intitulé en capitales, espacement 0,08 em |
| Bouton et lien d’action | `--text-button` : 16 px | Même taille sur les cartes et sections |
| Navigation principale | `--text-nav` : 18 px | Menu ordinateur et téléphone ; sous-menus 16 px |

Les paragraphes utilisent une hauteur de ligne de 1,6. Les titres de section et de carte utilisent 1,3. Les titres ne sont plus artificiellement resserrés. La couleur dépend du fond : elle doit garder le contraste existant.

## Les différences utiles

Le grand titre de l’accueil conserve ses bandes dorées et une taille adaptée à sa longue ligne. Les chiffres d’impact restent plus grands que le texte. Les rubriques du pied de page utilisent un titre de 16 px, car elles sont des groupes de liens secondaires. Les catégories peuvent rester en capitales.

À la demande de Gassama, tous les en-têtes principaux de section sont centrés : repère, trait doré, titre et description. Les liens d’ensemble se placent en dessous. Utiliser `SectionHeading`, ou la classe commune `.section-heading` quand le titre nécessite plusieurs éléments. Le centrage doit se faire sur toute la largeur de la section, pas dans une colonne latérale. Les deux blocs d’appel à l’action sont centrés chacun dans leur colonne. Les titres de cartes et les groupes de liens du pied de page gardent la disposition propre à leur contenu.

Ces différences répondent à un rôle précis. Les sections Impact, Actualités et Partenaires ne reçoivent plus chacune une taille de h2 différente.

## Regrouper chaque section

Le repère, le titre, la description, les liens d’ensemble et le contenu doivent rester dans le même élément `section`, avec un fond continu. Utiliser `.section` pour les marges communes et le fond blanc ; ajouter `.section--tinted` pour alterner avec le vert très clair. Les valeurs sont `--section-light` et `--section-tint`. Les bandeaux photographiques sombres gardent leur rôle distinct. Les sections ordinaires ont 52, 68 ou 80 px de marge interne en haut et en bas selon l’écran ; l’en-tête est séparé de son contenu par 28 px. Cette différence aide à associer le titre au contenu qui suit. Éviter un grand espace vide entre eux.

« Notre signature » est retiré de l’accueil à la demande de Gassama. La présentation « Qui sommes-nous ? », repérée « Notre organisation », conserve ses textes et son lien avec seulement une barre verte verticale de 4 px à gauche, intégrée dans la largeur réservée. Le cadre et les marges verticales ajoutées sont annulés à sa demande. Ses textes restent centrés ; « Global EcoAction (GECA) » et « RENASCEDD » sont en gras dans le paragraphe.

## Pour créer les prochaines pages

Largeur commune demandée le 3 octobre 2026 : placer le contenu dans `main#main-content`. Ce cadre et la barre du logo partagent `--site-max-width` et `--site-gutter` dans `globals.css`. Les sections, dont le contact et les photographies de fond, restent entre le début du logo et la fin du bouton hamburger. **Exceptions précisées par Gassama : le hero et le fond du pied de page occupent toute la fenêtre.** L'accueil utilise `main#main-content.home-page` avec les sections ordinaires contraintes individuellement ; les liens du pied de page gardent un `Container` à la largeur commune. Les `Container` internes utilisent 100 % du cadre, avec un espace intérieur commun `--section-inset` de 20 à 48 px sur les côtés, demandé pour éviter les textes et cartes collés aux bords. Cette marge intérieure ne réduit pas le fond de la section et ne s'ajoute pas à la navigation ou au pied de page. Les panneaux contact déjà espacés gardent leurs règles. Ne pas ajouter de largeur particulière aux actualités, partenaires ou nouvelles sections. Les paragraphes peuvent garder une limite plus courte pour rester lisibles.

1. Utiliser le layout commun `[locale]/layout.tsx`, sans charger une autre police dans la page.
2. Garder un seul `h1`. Utiliser `h2` pour une section et `h3` pour ses cartes ou sous-parties.
3. Réutiliser `Container`, `SectionHeading` et `Button` de `src/components/ui.tsx`.
4. Réutiliser les variables communes. Ne pas ajouter une taille isolée à une section pour la faire paraître plus importante.
5. Prévoir le retour à la ligne. Une grille doit accepter des colonnes `minmax(0, 1fr)` ; un petit écran ne doit pas couper un mot ou un bouton.
6. Vérifier téléphone, tablette, ordinateur, texte agrandi, clavier et contrastes. Conserver les contrôles de sécurité côté serveur, le registre fermé des routes et les protections existantes. Une page réelle avec comptes doit aussi vérifier propriétaire des données, accès direct, changement de compte et droits révoqués.

La navigation reste dans le bouton Menu à toutes les largeurs, même sur ordinateur. La barre garde le logo, puis la loupe, FR/EN, Faire un don et le hamburger. Les langues sont hors du menu, entre recherche et don, avec au moins 12 px entre les groupes et 16 à 28 px sur grand écran. Sous 768 px, logo et hamburger occupent la première ligne ; recherche, langues et don la seconde. Les commandes peuvent se répartir sur plusieurs lignes à 200 % sans déplacer la page à l’ouverture. Les liens du menu conservent 18 px, les sous-menus 16 px ; leur chevron indique l’ouverture et la fermeture.

Le hero utilise désormais le grand titre commun en DM Sans locale, à gauche sur un aplat crème, pour suivre la capture choisie le 3 octobre 2026. Son rôle reste distinct des h2 centrés : deux lignes de titre, photo en haut à droite, vidéo en bas à gauche avec une description et un paragraphe de mission, puis bloc vert avec les deux liens à droite. Sur téléphone, les quatre blocs sont empilés. La commande vidéo affiche seulement l’icône pause/lecture, avec un nom accessible conservé. Les anciennes bandes dorées du hero sont remplacées ; les autres sections gardent leurs règles communes.

Les textes des pages encore en préparation restent inchangés, mais leur police, leur h1, leurs paragraphes et leurs boutons utilisent déjà les règles communes. Ce travail ne crée pas encore le contenu des futures rubriques.

## Page contact — 3 octobre 2026

Le h1 interne conserve DM Serif Display et `--text-page-title`. La référence de la capture apporte les aplats et les deux colonnes, sans ajouter de police. Le titre du formulaire joue le rôle d'un petit intitulé de bloc et reprend `--text-card-title`. La section finale utilise `SectionHeading` : repère, trait, h2 et description centrés sur toute la largeur. Les labels, boutons et choix reprennent `--text-button` ; les consignes utilisent `--text-small`. Le formulaire s'empile sous la photo sur téléphone.

## Menu superposé — 3 octobre 2026

Le panneau du hamburger apparaît au-dessus de la page, sous la barre du logo, sans agrandir cette barre ni déplacer le contenu. Les liens gardent leurs tailles, marges et alignement existants. La hauteur du panneau est limitée à l'espace de la fenêtre sous la barre ; il défile à l'intérieur lorsque les liens, les sous-rubriques ou le texte agrandi dépassent cette hauteur. Le bouton de fermeture reste dans la barre.

## Impact selon la nouvelle référence — 3 octobre 2026

Gassama demande explicitement pour « Notre impact » une photographie continue, un titre à gauche et trois cartes claires empilées à droite. Cette consigne remplace le centrage pour cette section seulement ; les autres en-têtes restent centrés. Le h2 conserve DM Sans, `--text-section-title`, le poids et la hauteur de ligne communs. Les valeurs chiffrées gardent leur rôle distinct, les descriptions suivent `--text-card-copy`. Les cartes sont sous le message avant 768 px ; les très petits écrans placent la valeur au-dessus de sa description. La mention des données à valider reste visible.

Les mouvements partagés sont courts et ponctuels : apparition de blocs à leur première entrée dans la fenêtre, dévoilement bref du bord des menus, transitions de boutons et léger agrandissement des photos au survol avec une souris. Aucun chiffre animé, boucle ou effet de parallaxe. Les préférences de mouvements réduits coupent les effets ; les apparitions sont aussi coupées en économie de données. Le HTML reste visible par défaut.

## Espace entre sections et arrivée du hero — 3 octobre 2026

Les sections principales successives de `main#main-content` partagent `--section-gap` : 24 px sur petit écran, jusqu'à 48 px sur grand écran. La même séparation s'applique avant le pied de page, notamment après « Passons à l'action ». Les espaces intérieurs restent distincts et conservent leurs valeurs.

À l'arrivée sur l'accueil, la grille entière du hero effectue un zoom arrière discret de 104,5 % à 100 % pendant 1,1 seconde, sans déplacer les sections suivantes. `SiteMotion` gère cet effet ponctuel et son annulation au focus, en mouvements réduits ou en économie de données. Aucun contenu ne dépend de l'animation pour être visible.

## Page À propos — 3 octobre 2026

Le h1 centré utilise DM Serif Display et `--text-page-title`. Tous les en-têtes de section passent par `SectionHeading` et conservent la largeur, le centrage et les tailles communes. La date 2016 utilise la taille de grand titre avec DM Sans pour son rôle de repère. Les cartes mission/ambition, étapes et domaines reprennent les h3 et paragraphes communs.

La page reste dans le cadre `main#main-content`, avec les mêmes espacements externes et internes que l'accueil. Son premier bloc associe crème, photographie et panneau vert ; les sections suivantes alternent blanc et vert clair. Les grilles s'empilent sur téléphone, passent à deux colonnes à 768 px et les domaines à trois colonnes à 1100 px. Les photos et les panneaux ne doivent pas déborder avec le texte à 200 %. Le layout, le pied de page, le menu et les mouvements réduits restent partagés.

## Projets & programmes — 3 octobre 2026

Le h1 utilise la taille commune des pages et DM Serif Display. Les en-têtes de section restent centrés et passent par `SectionHeading`. Les titres des projets utilisent les h3 communs ; objectifs, métadonnées et filtres reprennent les rôles de paragraphes, petits textes et boutons existants. Le catalogue conserve le cadre commun, les marges intérieures et les séparations entre sections, jusqu'au footer.

Les quatre projets sont présentés en lignes alternées à partir de 768 px : image/texte, texte/image, image/texte, texte/image. La photo conserve la même largeur relative sur chaque ligne. Sur téléphone, chaque image précède son texte. L’ordre de lecture du document est conservé ; les images n’ont pas de lien qui changerait l’ordre du clavier. La photographie est dimensionnée selon le cadre réel de la carte, sans demander systématiquement la largeur de l’écran. L’organisation actuelle sans filtres ni sous-pages est décrite ci-dessous.

## Domaines d’intervention — 3 octobre 2026

Le h1 centré utilise DM Serif Display et la taille commune des pages. Les six rubriques ont leurs titres, repères et descriptions centrés sur toute la largeur avec `SectionHeading`. Les paragraphes et priorités reprennent les tailles communes ; aucune police ni taille spéciale ajoutée. Introduction crème, sommaire en une, deux puis trois colonnes, photographies alternées sur ordinateur et empilées sur téléphone. Les rubriques conservent les marges communes jusqu’au footer. Les liens natifs du sommaire, les retours et les liens depuis l’accueil ciblent des ancres stables, utilisables au clavier et sans JavaScript. La préférence de mouvements réduits reste gérée par le composant partagé.

## Simplification Projets & programmes — 3 octobre 2026

Une seule page, sans sous-menu ni filtres par route. Introduction, catalogue des quatre projets et appel à l’action conservent les tailles, couleurs, titres centrés et marges communes. Les trois axes propres à l’ancienne page ont été retirés. Les liens de l’accueil ciblent des ancres sur les articles, avec une marge de lecture de 24 px ; ils fonctionnent au clavier et sans JavaScript. Aucun style d’une autre page modifié.

## Barre mobile et effets — demande du 3 octobre 2026

La demande actuelle remplace les dispositions précédentes : une seule ligne sur mobile avec logo, « Faire un don » complet, recherche puis hamburger ; l’unique FR/EN est dans le menu sur tous les écrans. Garder page courante, clavier, Échap, noms accessibles, panneau superposé et défilement interne. À 200 %, permettre au texte du don de se répartir à l’intérieur du bouton sans débordement. Boutons partagés harmonisés ; don animé immédiatement par trois pulsations de 1,5 seconde, puis arrêt. Toutes les cartes ont une apparition ponctuelle et des transitions de relief. Respecter mouvements réduits, contenu visible sans effets, économie de données pour les apparitions et annulation au focus. Pas de nouvelle donnée GECA ni de service réel. Gassama autorise explicitement le commit et le push de l’ensemble pour publier cet aperçu GitHub Pages.

## Hero — demande du 4 octobre 2026

Le seul grand titre « AGIR POUR UN AVENIR DURABLE » utilise Ubuntu Sans locale, poids 600, via `--font-hero` dans le layout partagé. Le fichier déjà présent et sa licence restent dans `src/app/fonts/`. Les tailles communes et les autres polices sont conservées. Avant 768 px, titre et repère sont centrés ; au-dessus, ils restent à gauche. La photo fournie remplace celle du hero sur tous les écrans. Sur mobile, elle est le seul média du hero, recadrée derrière le titre et la mission avec un voile sombre. Le titre et les textes sont blancs et centrés ; le repère est jaune clair (`--gold-light`). La flèche et les deux liens restent dans un bloc vert séparé sous la photo. La vidéo et sa commande sont réservées aux écrans de 768 px ou plus. Le don reçoit un halo doré plus visible pendant les trois pulsations existantes (4,5 s au total), avec arrêt au focus, au survol et en mouvements réduits.

## Paragraphes justifiés — demande du 4 octobre 2026

Les deux paragraphes du hero et le paragraphe de présentation sous « Notre organisation » sont justifiés : lignes alignées sur les deux bords, dernière ligne à gauche. La coupure automatique des mots suit la langue française du document et les capacités du navigateur. Cette précision remplace le centrage pour ces trois paragraphes seulement ; les titres et les repères conservent leurs alignements existants. Ne pas étendre cette règle à toutes les descriptions du site.


## Ajustements du client — règle prioritaire du 6 octobre 2026

Source : `RECOMMANDATIONS.docx`. Sur l’accueil seulement, le slogan « AGIR POUR UN AVENIR DURABLE » utilise `calc(var(--text-page-title) * 0.6)` : 24–43,2 px au lieu de 40–72 px avec la taille racine habituelle. Le nom « Global EcoAction » utilise `calc(var(--text-label) * 1.5)` : 21 px au lieu de 14 px. La casse du nom reste exacte (`text-transform: none`), sur le hero et sur le repère du bloc final de Contact. Aucun pays n’est ajouté au nom. Les autres tailles, polices, centrages, animations et espacements communs restent applicables. Cette demande est l’exception explicite à la taille commune du titre du hero décrite le 4 octobre.
