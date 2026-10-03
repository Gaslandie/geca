# GECA — Maquette locale

Première version de l’accueil institutionnel de Global EcoAction. Les autres rubriques affichent une page « en préparation ». Aucun service de paiement, CMS, base de données, suivi d’audience ou envoi de courriel n’est installé.

## Ouvrir le site

Node.js 24 et npm 12 ont été utilisés. Next.js nécessite Node.js 20.9 ou plus récent.

```bash
npm ci
npm run dev
```

Ouvrir **http://127.0.0.1:3000/fr**. Le serveur écoute seulement sur la machine locale.

Le premier écran affiche la vidéo locale fournie par Gassama, avec le titre « AGIR POUR / UN AVENIR DURABLE », une phrase courte et deux boutons centrés dessus. Sur téléphone, les boutons passent l'un sous l'autre. Un bouton permet de mettre la vidéo en pause. Une image fixe reste disponible avant lecture ou en cas d'échec ; la vidéo ne démarre pas automatiquement si le visiteur demande moins d'animations ou l'économie de données quand cette préférence est disponible. Les fichiers et leur provenance sont décrits dans `docs/VIDEO-HERO.md` ; les captures sont dans `test-results/hero-*.png`.

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
| `src/components/HeroVideo.tsx`         | Vidéo locale, pause et préférences de mouvements réduits / économie de données     |
| `src/components/ui.tsx`                | Container, SectionHeading, Button, StatCard et emplacement photo partagé            |
| `src/components/Header.tsx`            | Menu desktop et mobile, langue et recherche                                         |
| `src/components/Footer.tsx`            | Navigation et coordonnées                                                           |
| `src/components/Projects.tsx`          | ProjectCard et filtre En cours / Réalisés                                           |
| `src/components/UnderConstruction.tsx` | Écran commun des rubriques en préparation                                           |
| `src/app/[locale]/layout.tsx`          | Langue du document, polices locales, header, footer et métadonnées                  |
| `src/app/[locale]/page.tsx`            | Accueil FR et écran d’attente EN                                                    |
| `src/app/[locale]/[...slug]/page.tsx`  | Rubriques FR et EN, sans duplication de composants                                  |
| `tests/site.spec.ts`                   | Vérifications dans Chrome et tests d’accès directs                                  |

Les pages sont générées depuis une liste fermée de routes. Une adresse inconnue renvoie une erreur 404. Les contenus sont typés : une donnée conserve une forme claire, par exemple un projet a un titre, un statut et une période. Cette séparation facilitera le branchement à Payload plus tard, sans installer ce CMS maintenant.

Le message transmis par le client pour l’accueil a été intégré le 3 octobre 2026. Sa provenance et sa répartition dans les sections sont décrites dans `docs/CONTENU-CLIENT.md`.

Le logo transmis le même jour est conservé sans modification dans `public/images/brand/global-ecoaction-logo.png`. Le vert `#026a2a` et le jaune doré `#ebad0e` sont relevés dans ce fichier ; les variantes sombres gardent les petits textes lisibles. Voir `docs/IDENTITE-VISUELLE.md`.

## Ajouter les vraies photos

Placer les photographies GECA autorisées dans `public/images/`. Dans les données correspondantes, remplacer la photo temporaire (ou `photo: undefined` pour les emplacements encore vides) par :

```ts
photo: {
  src: "/images/terrain-geca.jpg",
  alt: "Description réelle et courte de la photographie",
}
```

Les cinq logos partenaires sont maintenant intégrés à la demande de Gassama, depuis des fichiers authentifiés servis dans `public/images/partners/`. Le champ `logo` renseigne aussi leurs dimensions réelles. Sources et limites : `docs/LOGOS-PARTENAIRES.md`. `next/image` intervient uniquement lorsqu’un fichier local a été renseigné. À la demande de Gassama, sept photos gratuites Unsplash sont conservées pour illustrer les domaines, les projets et le bandeau d’impact. Elles sont conservées dans `public/images/temporary/` et affichent « Image temporaire ». Leurs sources sont dans `docs/IMAGES-TEMPORAIRES.md`. Aucun visuel n’a été généré. Les polices déjà présentes sur la machine sont incluses avec leurs licences et chargées par `next/font/local`. Le navigateur n’a donc pas besoin de contacter Google Fonts ou Unsplash.

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

Les captures apparaissent dans `test-results/`. Le rapport navigateur est dans `playwright-report/`. Ces fichiers, `node_modules/` et `.next/` sont ignorés par Git.

## À valider avec GECA

- Charte graphique chiffrée si GECA en possède une ; le logo fourni est déjà intégré et ses couleurs ont été relevées dans l’image.
- Photos de terrain et d’équipe, noms et fonctions.
- Chiffres et justificatifs de l’impact. La valeur de 550 000 arbres reste uniquement dans un commentaire TODO, sans affichage.
- Résumés, zones exactes, périodes, statuts des projets et partenaires cités. Les données 2025–2026 restent classées selon le brief, sans supposer leur avancement réel.
- Articles et événement réels. Aucun rendez-vous ni date ne sont inventés.
- Accords de publication des logos partenaires déjà intégrés à la maquette locale ; liens des réseaux sociaux.
- Contenu anglais, mentions légales et politique de confidentialité.

Le bouton de don, la recherche et les liens des rubriques ouvrent leur écran d’attente. Les liens `tel:` et `mailto:` ouvrent l’application du visiteur : ils n’envoient rien automatiquement.

## Sécurité et limites

La maquette est locale et marquée `noindex`. Elle n’a ni compte, ni session, ni formulaire, ni données privées, ni téléversement de fichier. Il n’y a donc pas de scénario de changement de compte ou de droits révoqués à vérifier ici. Ces contrôles devront être ajoutés côté serveur au moment du CMS et des comptes ; un rôle donné par le navigateur ne suffira jamais.

Les réponses interdisent l’intégration dans une fenêtre d’un autre site, empêchent l’interprétation approximative des types de fichiers et désactivent caméra, microphone et géolocalisation. Les images distantes ne sont pas autorisées. Les détails réels des vérifications et l’alerte restante des outils de développement figurent dans `docs/VERIFICATIONS.md`.

## Git

Au départ, aucun dépôt Git utilisable n’était accessible. Le 3 octobre 2026, à la demande explicite de Gassama de relire, committer et pousser le projet, un dépôt a été initialisé sur la branche `main` dans l’environnement autorisé. Aucun historique existant n’a été remplacé. La destination du push reste à renseigner ; aucune adresse de dépôt n’a été fournie. Les anciens bilans de `docs/VERIFICATIONS.md` décrivent l’état de leurs passes respectives.

Les sources et les observations du benchmark du **3 octobre 2026** sont dans `docs/BENCHMARK.md`. Le fichier `docs/VERIFICATIONS.md` contient le bilan de livraison et l’inventaire des fichiers.
