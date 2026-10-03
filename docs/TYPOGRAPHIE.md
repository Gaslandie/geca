# Typographie commune GECA — 3 octobre 2026

Cette règle répond à la demande de Gassama : un style proche de Panthera, des écritures plus lisibles et une même logique sur l’accueil et les prochaines pages. La comparaison mesurée est dans `docs/BENCHMARK.md`.

## Les polices

Panthera utilise Circular Std pour les textes et titres de section, et Exemplar Pro pour certains grands titres. Ces polices demandent une licence. Aucun fichier autorisé n’a été fourni pour GECA. Les fichiers commerciaux de Panthera ne sont pas récupérés.

GECA utilise donc deux alternatives gratuites : **DM Sans** pour les textes, titres de section, cartes et navigation ; **DM Serif Display** pour le titre principal de page et les courtes signatures. Leur proximité est une adaptation visuelle, pas une copie exacte de Circular ou Exemplar.

Les fichiers proviennent du dépôt officiel Google Fonts : [DM Sans](https://github.com/google/fonts/tree/main/ofl/dmsans) et [DM Serif Display](https://github.com/google/fonts/tree/main/ofl/dmserifdisplay). Les licences SIL Open Font License accompagnent les fichiers dans `src/app/fonts/`. Le chargement passe par `next/font/local` dans le layout commun FR/EN : le navigateur contacte seulement GECA, jamais Google Fonts ou Panthera. Les anciens fichiers restent conservés, mais ne sont plus chargés.

## Une taille pour chaque rôle

Les valeurs sont définies une seule fois dans `:root`, au début de `src/app/globals.css`. Elles suivent la largeur de l’écran. Une variable CSS est simplement une valeur nommée, réutilisée partout.

| Rôle | Valeur commune | Usage |
| --- | --- | --- |
| Titre principal | `--text-page-title` : 40–72 px | Un `h1` par page, DM Serif Display |
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

## Pour créer les prochaines pages

1. Utiliser le layout commun `[locale]/layout.tsx`, sans charger une autre police dans la page.
2. Garder un seul `h1`. Utiliser `h2` pour une section et `h3` pour ses cartes ou sous-parties.
3. Réutiliser `Container`, `SectionHeading` et `Button` de `src/components/ui.tsx`.
4. Réutiliser les variables communes. Ne pas ajouter une taille isolée à une section pour la faire paraître plus importante.
5. Prévoir le retour à la ligne. Une grille doit accepter des colonnes `minmax(0, 1fr)` ; un petit écran ne doit pas couper un mot ou un bouton.
6. Vérifier téléphone, tablette, ordinateur, texte agrandi, clavier et contrastes. Conserver les contrôles de sécurité côté serveur, le registre fermé des routes et les protections existantes. Une page réelle avec comptes doit aussi vérifier propriétaire des données, accès direct, changement de compte et droits révoqués.

La navigation reste un menu à ouvrir sous 1200 px. De 1200 à 1399 px, les liens prennent une seconde ligne pour conserver 18 px. À partir de 1400 px, la barre élargie peut les afficher à côté du logo. Si le texte est agrandi, les liens peuvent revenir sur plusieurs lignes pour rester dans le cadre. Cette disposition est propre à GECA ; ce n’est pas celle du menu Panthera.

Les textes des pages encore en préparation restent inchangés, mais leur police, leur h1, leurs paragraphes et leurs boutons utilisent déjà les règles communes. Ce travail ne crée pas encore le contenu des futures rubriques.
