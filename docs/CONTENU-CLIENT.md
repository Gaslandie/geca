# Message du client pour l’accueil — 3 octobre 2026

Source fournie par Gassama : `/home/mohamed-gassama/Downloads/MESSAGE POUR LA PAGE D'ACCUEIL.docx`. Le document original a été lu sans être modifié. Il contient un titre, deux paragraphes et une signature ; aucune instruction technique, aucun chiffre d’impact, aucune liste de projets ou de membres de l’équipe. Il est utilisé comme source de contenu dans le périmètre de la maquette.

Actualisation du 3 octobre 2026 : Gassama a ensuite demandé dans le chat un premier écran avec sa vidéo et moins de texte. Cette instruction remplace le titre et l'introduction ci-dessous uniquement pour le premier écran. Le nouveau texte est « GLOBAL ECOACTION · GUINÉE », « AGIR POUR / UN AVENIR DURABLE », puis « Restaurer les écosystèmes · Renforcer les communautés », avec les liens « Découvrir nos projets » et « Devenir partenaire ». Les autres sections gardent la répartition du document client. La carte latérale et le repère Conakry du premier écran sont retirés. Voir `docs/VIDEO-HERO.md`.

Nouvelle précision du 3 octobre 2026 dans le chat : la section immédiatement après le premier écran doit être « Qui sommes-nous ? ». Elle présente brièvement l'organisation, commence par « Global EcoAction (GECA), anciennement RENASCEDD » et comporte le lien « À propos de GECA » vers `/fr/a-propos`. Cette instruction remplace le titre et le paragraphe précédents de cette présentation. La signature reste à côté. Les informations de création et de mission viennent du brief et du document client déjà fournis.

## Répartition initiale dans l’accueil

| Élément reçu                                                                                                             | Utilisation                                                                               |
| ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| « Restaurer la nature, renforcer les communautés, construire l’avenir. »                                                 | Titre principal repris exactement                                                         |
| Première phrase sur les terres dégradées, les forêts, la biodiversité, l’agroécologie et le climat                       | Texte d’introduction repris exactement sous le titre                                      |
| Ambition de faire de la protection de l’environnement un moteur de développement et d’amélioration des conditions de vie | Section de présentation, avec l’identité de GECA déjà fournie dans le brief               |
| Reboisement et pépinières communautaires                                                                                 | Domaine « Restauration des écosystèmes », dans une formulation courte adaptée à la grille |
| Gouvernance environnementale et développement local                                                                      | Domaine « Gouvernance & communautés », dans une formulation courte                        |
| Populations au cœur de la gestion durable des ressources naturelles                                                      | Principe de participation communautaire, repris exactement                                |
| Renforcement des capacités des femmes, des jeunes et des producteurs ; territoires résilients, inclusifs et durables     | Introduction de « Notre approche », phrase du client reprise exactement                   |
| « Global EcoAction — Agir pour un avenir durable. »                                                                      | Signature reprise exactement à côté de la présentation                                    |

Le document apporte des contenus éditoriaux. Il ne valide pas les chiffres d’impact provisoires, les statuts des projets ou les photographies temporaires. Les mentions de validation et les étiquettes photo restent présentes. Aucun compte, service externe ou traitement de données n’est ajouté.

Les textes sont modifiés dans `src/content/site.ts`, sans nouvelle dépendance ni changement de route. Le benchmark du même jour a été relu et sa pertinence expliquée dans `docs/BENCHMARK.md`.

## Vérifications

`npm run lint`, `npm run typecheck` et `npm run build` réussissent. Les neuf tests de `npm run test:e2e` passent : routes prévues, cas refusés, menus, filtres, images temporaires, clavier et cinq tailles d’écran. Aucun débordement horizontal ni violation d’accessibilité automatique contrôlée n’est détecté. Les captures du premier écran à 320 et 1440 px ont été examinées après le changement de texte.

Les protections existantes restent actives ; aucun nouveau traitement de fichier, compte ou secret n’est ajouté au site. La lecture du DOCX n’a exécuté aucune macro ni ouvert ses éventuels liens externes. Les limites du contrôle navigateur et l’alerte de développement déjà indiquées dans `docs/VERIFICATIONS.md` restent applicables. Aucun commit ni push.
