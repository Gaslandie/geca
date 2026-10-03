# GECA — Maquette et aperçu GitHub Pages

Maquette de l’accueil institutionnel et des pages À propos, Domaines d’intervention, Projets & programmes et Contact de Global EcoAction. Les autres rubriques affichent une page « en préparation ». Aucun service de paiement, CMS, base de données, suivi d’audience ou envoi de courriel n’est installé.

## Partager l'aperçu avec le client

La configuration GitHub Pages est dans `.github/workflows/pages.yml`. Le dépôt `Gaslandie/geca` utilise maintenant **Settings → Pages → Source → GitHub Actions**. Après publication du code validé sur `main`, le travail GitHub construit et vérifie les fichiers du site avant de les publier.

Adresse de l'accueil : **https://gaslandie.github.io/geca/fr/**. Cette adresse ne doit être partagée comme version actuelle qu'après réussite du déploiement et contrôle du site distant. Le site est public. Le formulaire affiche seulement un aperçu local ; il n'envoie aucun message.

Pour vérifier cet export sur la machine :

```bash
npm run build:pages
npm run test:pages
npm run preview:pages
```

L'aperçu statique se trouve sur **http://127.0.0.1:3100/geca/fr/**. Il reste limité à cette machine. Le serveur habituel de Gassama reste sur **http://127.0.0.1:3000/fr**. Next utilise `.next` pour les deux compilations : après un export Pages, exécuter `npm run build`, puis redémarrer `npm run start` pour retrouver le mode local habituel. Seul le dossier `out` est envoyé à l'hébergement ; ne jamais y ajouter des fichiers privés.

Les photos, logos, polices et vidéos sont locaux. L'export ajoute `/geca` aux fichiers et laisse Next adapter les liens. Les pages inconnues restent absentes. Les en-têtes personnalisés du serveur local ne peuvent pas être repris par GitHub Pages ; limites et mesures HTML documentées dans `docs/BENCHMARK.md`. Aucune authentification, donnée privée ou fonction d'envoi n'est ajoutée. L'interdiction d'indexation est une indication aux moteurs de recherche, pas un mot de passe.

## Ouvrir le site local

Node.js 24 et npm 12 ont été utilisés. Next.js nécessite Node.js 20.9 ou plus récent.

```bash
npm ci
npm run dev
```

Ouvrir **http://127.0.0.1:3000/fr**. Le serveur écoute seulement sur la machine locale.

La page À propos est disponible sur **http://127.0.0.1:3000/fr/a-propos** et `/en/a-propos` : histoire, mission, ambition, approche avec les communautés et six domaines d’intervention. Elle reprend le cadre, les polices, les couleurs et les espaces de l’accueil. Les textes développent les informations client existantes ; les deux photos restent des illustrations temporaires.

La page Domaines d’intervention est disponible sur **http://127.0.0.1:3000/fr/a-propos/domaines-intervention** et son équivalent `/en/` : six rubriques expliquées, trois priorités par domaine, sommaire au clavier et liens directs depuis l’accueil. Les six images définitives fournies par Gassama sont associées exactement selon leurs noms et utilisées aussi sur l’accueil français, sans mention temporaire. Provenance : `docs/IMAGES-DOMAINES.md`. Les contenus et traductions proposés sont centralisés dans `src/content/site.ts`.

La page unique **http://127.0.0.1:3000/fr/projets**, également disponible sur `/en/projets`, présente les quatre projets déjà visibles sur l’accueil. Aucune sous-page par statut ni fiche individuelle. Les boutons de l’accueil ciblent directement la rubrique du projet sur cette page. Textes français et données repris de l’accueil, sans nouvelle information ; zones, périodes, statuts et partenaires restent à confirmer.

La page contact est disponible sur **http://127.0.0.1:3000/fr/contact** et `/en/contact`. Elle reprend les deux captures fournies par Gassama : introduction et photo à gauche, formulaire vert clair à droite, coordonnées, phrase finale et photographie panoramique. Le bouton « Prévisualiser mon message » montre un aperçu local ; il n'envoie et ne sauvegarde rien. Les champs sont désactivés sans JavaScript ; les coordonnées restent accessibles.

Le premier écran reprend la composition choisie par Gassama : titre « AGIR POUR / UN AVENIR DURABLE » sur fond crème à gauche, photo temporaire de forêt en haut à droite, vidéo locale avec description et paragraphe de mission en bas à gauche et une grande flèche dorée vers les deux boutons arrondis dans un bloc vert à droite. Sur téléphone, ces blocs sont empilés. La barre garde le logo, la loupe, FR/EN, le don et le hamburger ; les langues sont hors du menu, entre recherche et don. Sous 768 px, logo/hamburger occupent une ligne et recherche/langues/don la suivante. Le menu s’ouvre par-dessus la page, sans la déplacer ; ses liens défilent à l’intérieur du panneau quand l’écran est court. Une commande avec une icône pause/lecture permet de mettre la vidéo en pause ou de reprendre sa lecture. Une image fixe reste disponible avant lecture ou en cas d'échec ; la vidéo ne démarre pas automatiquement si le visiteur demande moins d'animations ou l'économie de données quand cette préférence est disponible. Les fichiers et leur provenance sont décrits dans `docs/VIDEO-HERO.md` ; les captures sont dans `test-results/hero-*.png`.

Pour regarder la version compilée :

```bash
npm run build
npm run start
```

Arrêter le serveur avec `Ctrl+C` avant de passer d’un mode à l’autre sur le même port.

## Où modifier

| Fichier                                | Rôle                                                                                |
| -------------------------------------- | ----------------------------------------------------------------------------------- |
| `src/content/site.ts`                  | Textes, coordonnées, chiffres, projets, partenaires, navigation et liste des routes |
| `src/app/globals.css`                  | Couleurs du logo et variantes lisibles, tailles et adaptation aux écrans            |
| `src/components/BrandLogo.tsx`         | Logo fourni par Gassama, partagé entre l’en-tête et le pied de page                 |
| `src/components/Home.tsx`              | Les sections affichées de l’accueil                               |
| `src/components/ProjectPortfolio.tsx`  | Page unique FR/EN, quatre projets déjà présents sur l’accueil |
| `src/components/InterventionAreas.tsx` | Domaines FR/EN, sommaire et six rubriques détaillées                |
| `src/components/About.tsx`             | Page À propos FR/EN, histoire, mission et approche                 |
| `src/components/Contact.tsx`           | Page contact FR/EN, photos et coordonnées                          |
| `src/components/ContactForm.tsx`       | Formulaire de démonstration, validation et aperçu local            |
| `src/components/HeroVideo.tsx`         | Vidéo locale, pause et préférences de mouvements réduits / économie de données     |
| `src/components/SiteMotion.tsx`        | Mouvements discrets, préférences du visiteur et contenu toujours visible           |
| `src/components/ui.tsx`                | Container, SectionHeading, Button, StatCard et emplacement photo partagé            |
| `src/components/Header.tsx`            | Menu desktop et mobile, langue et recherche                                         |
| `src/components/Footer.tsx`            | Navigation et coordonnées                                                           |
| `src/components/Projects.tsx`          | ProjectCard et filtre En cours / Réalisés                                           |
| `src/components/UnderConstruction.tsx` | Écran commun des rubriques en préparation                                           |
| `src/app/[locale]/layout.tsx`          | Langue du document, polices locales, header, footer et métadonnées                  |
| `src/app/[locale]/page.tsx`            | Accueil FR et écran d’attente EN                                                    |
| `src/app/[locale]/[...slug]/page.tsx`  | Rubriques FR et EN, sans duplication de composants                                  |
| `tests/site.spec.ts`                   | Vérifications dans Chrome et tests d’accès directs                                  |
| `tests/projects.spec.ts`               | Page unique : ancres, accès directs, langues et écrans              |
| `tests/interventions.spec.ts`          | Domaines : ancres, langues, écrans, images et accessibilité        |
| `tests/about.spec.ts`                  | À propos : langues, clavier, lecture sans JavaScript et écrans    |
| `tests/contact.spec.ts`                | Contact : saisie, absence d'envoi, clavier, langues et écrans       |
| `tests/impact-motion.spec.ts`           | Impact, animations, mouvements réduits et secours sans effets      |
| `tests/navigation.spec.ts`             | Menu superposé : page immobile, liens accessibles et texte agrandi |

Les pages sont générées depuis une liste fermée de routes. Une adresse inconnue renvoie une erreur 404. Les contenus sont typés : une donnée conserve une forme claire, par exemple un projet a un titre, un statut et une période. Cette séparation facilitera le branchement à Payload plus tard, sans installer ce CMS maintenant.

Le message transmis par le client pour l’accueil a été intégré le 3 octobre 2026. Sa provenance et sa répartition dans les sections sont décrites dans `docs/CONTENU-CLIENT.md`.

Le logo transmis le même jour est conservé sans modification dans `public/images/brand/global-ecoaction-logo.png`. Le vert `#026a2a` et le jaune doré `#ebad0e` sont relevés dans ce fichier ; les variantes sombres gardent les petits textes lisibles. Voir `docs/IDENTITE-VISUELLE.md`.

## Garder la même présentation sur les prochaines pages

Suivre [la typographie commune](docs/TYPOGRAPHIE.md). Les titres, paragraphes, cartes et boutons partagent une échelle de tailles dans `src/app/globals.css`. Le layout FR/EN charge les mêmes polices locales. Réutiliser `Container`, `SectionHeading` et `Button`, avec un `h1` par page et des `h2` uniformes pour les sections.

Garder les en-têtes et leurs contenus dans une même section. Alterner `.section` (blanc) et `.section.section--tinted` (vert très clair), avec les marges communes, pour rendre les limites visibles.

## Ajouter les vraies photos

Placer les photographies GECA autorisées dans `public/images/`. Dans les données correspondantes, remplacer la photo temporaire (ou `photo: undefined` pour les emplacements encore vides) par :

```ts
photo: {
  src: "/images/terrain-geca.jpg",
  alt: "Description réelle et courte de la photographie",
}
```

Les cinq logos partenaires sont maintenant intégrés à la demande de Gassama, depuis des fichiers authentifiés servis dans `public/images/partners/`. Le champ `logo` renseigne aussi leurs dimensions réelles. Sources et limites : `docs/LOGOS-PARTENAIRES.md`. `next/image` intervient uniquement lorsqu’un fichier local a été renseigné. À la demande de Gassama, huit photos gratuites Unsplash sont conservées pour illustrer les domaines, les projets, le bandeau d’impact et les actualités et événements. Elles sont conservées dans `public/images/temporary/` et affichent « Image temporaire ». Leurs sources sont dans `docs/IMAGES-TEMPORAIRES.md`. Aucun visuel n’a été généré. Les polices libres DM Sans et DM Serif Display proviennent du dépôt officiel Google Fonts, sont incluses avec leurs licences et chargées par `next/font/local`. Le navigateur n’a donc pas besoin de contacter Google Fonts ou Unsplash.

Le premier écran utilise maintenant la vidéo fournie par Gassama et une image extraite de cette vidéo. Les photos temporaires restent dans les projets et illustrent les six domaines d'intervention, qui n'affichent plus d'icônes ni de numérotation. Sur téléphone, chaque photo précède son texte. À partir de 768 px, les domaines forment des lignes avec photo et texte côte à côte, en alternant leurs positions. Leur champ `temporary: true` déclenche l’étiquette. Lors du remplacement par une vraie photo GECA, retirer ce champ et renseigner son vrai texte alternatif. Les portraits d’équipe restent des emplacements vides jusqu’à réception des photos des membres.

## Vérifier

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm audit --omit=dev
npm audit
```

Les tests utilisent Chrome installé dans `/usr/bin/google-chrome`. Sur une autre machine, adapter `launchOptions.executablePath` dans `playwright.config.ts`, ou installer Chromium avec `npx playwright install chromium` et retirer ce chemin explicite. L’option `--no-sandbox` concerne seulement le navigateur automatique de cet environnement ; ce n’est pas une option du site.

Notre impact utilise maintenant une photographie continue avec le message à gauche et trois cartes crème à droite ; les chiffres et leur note de validation sont conservés. La photo actuelle reste temporaire, conformément au choix de Gassama. Les effets de lecture sont gérés par `src/components/SiteMotion.tsx` dans le layout partagé ; transitions et survols sont dans `src/app/globals.css`. Les préférences de mouvements réduits sont respectées, et le contenu reste visible sans JavaScript.

Les captures apparaissent dans `test-results/`. Le rapport navigateur est dans `playwright-report/`. Ces fichiers, `node_modules/` et `.next/` sont ignorés par Git.

## À valider avec GECA

- Charte graphique chiffrée si GECA en possède une ; le logo fourni est déjà intégré et ses couleurs ont été relevées dans l’image.
- Photos de terrain et d’équipe, noms et fonctions.
- Chiffres et justificatifs de l’impact. La valeur de 550 000 arbres reste uniquement dans un commentaire TODO, sans affichage.
- Résumés, zones exactes, périodes, statuts des projets et partenaires cités. Les données 2025–2026 restent classées selon le brief, sans supposer leur avancement réel.
- Articles et événement réels. Aucun rendez-vous ni date ne sont inventés.
- Accords de publication des logos partenaires déjà intégrés à la maquette locale ; liens des réseaux sociaux.
- Contenu anglais, mentions légales et politique de confidentialité.

Le bouton de don, la recherche et les rubriques non développées ouvrent leur écran d’attente. Les liens `tel:` et `mailto:` ouvrent l’application du visiteur : ils n’envoient rien automatiquement.

## Sécurité et limites

La maquette est disponible localement et prévue pour un aperçu GitHub Pages public, marqué `noindex`. Elle n’a ni compte, ni session, ni collecte côté serveur, ni téléversement de fichier. Le formulaire contact produit seulement un aperçu en mémoire du navigateur, sans envoi ni stockage par le site. Utiliser des données d'exemple pour l'essayer. Il n’y a donc pas de scénario de changement de compte ou de droits révoqués à vérifier ici. Ces contrôles devront être ajoutés côté serveur au moment du CMS et des comptes ; un rôle donné par le navigateur ne suffira jamais. Un futur envoi réel devra aussi valider les données côté serveur et protéger contre les abus.

Le serveur local interdit l’intégration dans une fenêtre d’un autre site, empêchent l’interprétation approximative des types de fichiers et désactivent caméra, microphone et géolocalisation. Les images distantes ne sont pas autorisées. GitHub Pages ne reprend pas tous ces en-têtes HTTP ; les limites et protections de l’export sont décrites dans `docs/BENCHMARK.md`. Les détails réels des vérifications et l’alerte restante des outils de développement figurent dans `docs/VERIFICATIONS.md`.

## Git

Au départ, aucun dépôt Git utilisable n’était accessible. Le 3 octobre 2026, à la demande explicite de Gassama de relire, committer et pousser le projet, un dépôt a été initialisé sur la branche `main` dans l’environnement autorisé. Aucun historique existant n’a été remplacé. La destination actuelle est `https://github.com/Gaslandie/geca.git`. Le 3 octobre 2026, Gassama a demandé de pousser l’ensemble et de publier la maquette sur GitHub Pages. Les anciens bilans de `docs/VERIFICATIONS.md` décrivent l’état de leurs passes respectives.

Les sources et les observations du benchmark du **3 octobre 2026** sont dans `docs/BENCHMARK.md`. Le fichier `docs/VERIFICATIONS.md` contient le bilan de livraison et l’inventaire des fichiers.

## Barre et effets actuels — 3 octobre 2026

La barre conserve une seule ligne sur téléphone : logo, Faire un don, recherche et hamburger. FR/EN est accessible dans le menu et conserve la rubrique courante. Les boutons partagent des contours et retours au survol et à l’appui. Le don pulse pendant 4,5 secondes à l’arrivée. Les cartes de toutes les pages ont des apparitions et transitions douces. Les préférences de mouvements réduits sont respectées ; les contenus restent visibles sans effets. Cette demande remplace les anciennes descriptions des langues dans la barre et de l’en-tête mobile sur deux lignes.
