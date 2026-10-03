# Logo et couleurs — 3 octobre 2026

> Mise à jour du 3 octobre 2026 : les copies d’origine décrites ci-dessous sont conservées sous `assets/source-images/` (ou `assets/source-videos/` pour la vidéo), hors du dossier public. Le site utilise désormais des variantes légères. Voir [PERFORMANCE-MEDIAS.md](PERFORMANCE-MEDIAS.md) pour les chemins actuels et les poids mesurés.

Gassama a fourni `Global EcoAction Logo.png` et demandé de reprendre ses couleurs. Le fichier est une source visuelle ; il n'apporte aucune instruction technique ni validation des autres contenus de la maquette.

## Intégration

Le PNG original est conservé sans modification dans `public/images/brand/global-ecoaction-logo.png`. Format PNG décodé et vérifié : 1774 × 887 px, RGB, 923 852 octets. La comparaison binaire avec le fichier reçu réussit. Le composant `BrandLogo` l'affiche dans l'en-tête et le pied de page de toutes les pages FR / EN, avec ses proportions d'origine et un fond blanc. Le nom accessible du lien de retour à l'accueil est conservé. Les images sont optimisées localement par `next/image` ; aucun hôte distant n'est autorisé.

## Palette

| Usage | Couleur | Origine |
| --- | --- | --- |
| Vert principal : boutons, titres, liens | `#026a2a` | Pixel vert le plus fréquent du PNG |
| Jaune doré : boutons et accents | `#ebad0e` | Pixel jaune le plus fréquent du PNG |
| Vert sombre : pied de page, texte sur jaune | `#003f1b` | Variante pour la lisibilité |
| Vert intermédiaire : zones impact et partenariat | `#005522` | Variante pour le texte doré sur fond vert |
| Doré foncé : petits textes sur blanc | `#805900` | Variante pour la lisibilité |
| Jaune au survol | `#f4bf38` | Variante du jaune principal |

Le fichier comporte de légères variations de couleur. Ces valeurs sont relevées dans l'image, sans prétendre remplacer une charte officielle. Le monogramme « G » déjà présent dans l'icône d'onglet garde sa forme et reprend le vert et le jaune reçus ; ce n'est pas une nouvelle version officielle du logo.

La comparaison préalable et les références W3C sont dans `docs/BENCHMARK.md`. Les photos temporaires et leurs étiquettes restent présentes. Aucun visuel généré, nouvelle dépendance, formulaire ou service externe n'est ajouté.

## Vérifications

TypeScript, lint et compilation réussissent. Le contrôle Git reste impossible : le dossier `.git` est vide et `git status` répond « not a git repository ». Aucun commit, push ou déploiement.

Les neuf tests navigateur passent sur la dernière compilation : 48 pages FR / EN, liens internes, menus, filtres, clavier, cinq tailles d'écran, chargement des photos temporaires et contrôles d'accessibilité automatique. Les accès publics autorisés répondent correctement ; les chemins inconnus, les chemins de fichiers privés et les images distantes non autorisées restent refusés. Aucune requête extérieure ni erreur JavaScript n'est détectée pendant ces parcours.

Un contrôle ponctuel supplémentaire vérifie le chargement réel des deux logos, leurs proportions et un en-tête sur une seule ligne à 320, 359, 360, 375, 479, 480, 768, 1024, 1199, 1200 et 1440 px. Aucun débordement horizontal n'est détecté. Les vues du premier écran à 320 et 1440 px ainsi que le pied de page à 1440 px ont été examinées. Un retour à la ligne des boutons sur les petits téléphones a été corrigé avant la dernière passe.

Contrastes calculés sur les couleurs finales : blanc / vert principal 6,78:1 ; vert sombre / jaune 6,09:1 ; doré foncé / blanc 6,27:1 ; jaune / vert intermédiaire 4,53:1. Les règles de contrôle n'ont pas été affaiblies. Les limites Chrome sur Linux et l'alerte des outils de développement décrites dans `docs/VERIFICATIONS.md` restent applicables ; aucun nouvel audit de dépendances n'est revendiqué. Il n'existe toujours aucun compte, droit révocable ou donnée privée dans cette maquette.

Le serveur local a été redémarré pour charger la dernière compilation. La maquette est disponible sur `http://127.0.0.1:3000/fr`, uniquement sur la machine locale.
