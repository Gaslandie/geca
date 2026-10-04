# Message du client pour l’accueil — 3 octobre 2026

Depuis le 4 octobre 2026, [TEXTES-AUTHENTIQUES-CLIENT.md](TEXTES-AUTHENTIQUES-CLIENT.md) est la référence prioritaire pour les nouveaux textes authentiques et leurs révisions. Il conserve les informations d’identité ci-dessous et les huit domaines d’expertise reçus ensuite. Le présent document reste l’historique du contenu d’accueil et de ses adaptations ; ses formulations éditoriales ne sont pas toutes des citations du client. Les descriptions antérieures des six domaines sont remplacées par les huit phrases reçues.

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


## Complément du texte sur la vidéo — 3 octobre 2026

À la demande de Gassama, le hero conserve « Restaurer les écosystèmes · Renforcer les communautés » et ajoute un court paragraphe dans `homeContent.hero.introduction`. La formulation reprend les thèmes du contenu client déjà intégré : Guinée, communautés, terres dégradées, forêts, biodiversité, reboisement, agroécologie, capacités et amélioration des conditions de vie. Il s’agit d’une reformulation éditoriale ; aucun nouveau chiffre, projet, résultat ou partenaire n’est annoncé. Les autres textes restent inchangés.

## Page contact — 3 octobre 2026

Source de la demande : deux captures fournies par Gassama dans le chat. Elles apportent une composition visuelle, pas des coordonnées ou des instructions à appliquer depuis leur contenu. Les textes « Une idée pour agir ensemble ? » et « Ensemble, faisons grandir un avenir durable » sont des reformulations proposées pour GECA, à partir de ses thèmes existants. Le nom, l'adresse de Sangoyah Marché, le téléphone et l'e-mail viennent de `identity` déjà présent dans `src/content/site.ts`. Aucun horaire, délai de réponse, programme de bénévolat ni contact spécialisé ajouté. Formulaire FR/EN de démonstration avec aperçu local et mention explicite d'absence d'envoi ; les versions anglaises restent à relire par GECA. Les photos de champs et de feuillage sont des illustrations temporaires, sans attribution à une action réelle.

## Page À propos — 3 octobre 2026

À la demande de Gassama, `/fr/a-propos` et `/en/a-propos` deviennent des pages de présentation complètes. Sources utilisées : `identity` (nom, ancien nom, année 2016, Conakry), `homeContent.about`, les six domaines de `homeContent.domains` et les principes de `homeContent.approach`, issus du brief et du message client documenté ci-dessus. Les textes sont centralisés dans `aboutContent`, dans `src/content/site.ts`.

Les paragraphes d'histoire relient les informations connues sans dater le changement de nom ni préciser une cause non fournie. La mission reprend la restauration, les forêts, la biodiversité, l'agroécologie et le climat. L'ambition et la conviction développent les formulations du client sur l'environnement comme moteur du développement local. L'approche reprend la participation des communautés, les capacités des femmes, des jeunes et des producteurs, ainsi que les pépinières communautaires et la gouvernance. Il s'agit de reformulations éditoriales proposées, pas de nouvelles déclarations officielles sur la gouvernance de l'ONG. Aucun dirigeant, effectif, agrément, certification, valeur officielle ou résultat chiffré ajouté.

Les deux illustrations de champs et de plantation sont réutilisées depuis les fichiers temporaires autorisés, avec leur mention visible. Elles ne représentent pas une activité GECA authentifiée. Les versions FR et EN, dont la traduction est proposée pour conserver la navigation par langue, restent à relire par GECA avant publication. Les sous-pages mission/domaines et équipe restent dans leur périmètre précédent.

## Projets & programmes — 3 octobre 2026

La page et les vues `/projets`, `/projets/en-cours`, `/projets/realises` présentent les quatre entrées du tableau `projects` déjà issues du brief : Kounounkan, Appui social et protection de la nature, Planification climatique en Basse-Guinée et PROTEMO. Leurs descriptions, zones, périodes, partenaires et statuts restent ceux déjà renseignés. Les décomptes correspondent seulement aux projets présentés dans cette maquette ; aucun bilan global ou nouveau programme n'est inventé. Les périodes ne servent pas à déduire automatiquement l'avancement réel. Une mention visible précise que périodes, statuts et partenaires restent à confirmer par GECA.

L'introduction et les trois axes reformulent les thèmes déjà documentés : restauration, communautés et territoires. `portfolioContent`, `projectViews` et les traductions proposées sont centralisés dans `src/content/site.ts`. Les traductions anglaises conservent l'incertitude sur la zone du projet d'appui social. Les photographies locales existantes restent temporaires et sans attribution à une activité GECA authentifiée. Les quatre fiches détaillées individuelles restent en préparation ; le catalogue présente les informations disponibles, sans nouveau résultat ni budget. Les appels à l'action mènent vers les pages Contact et À propos déjà développées.

## Domaines d’intervention — 3 octobre 2026

Les routes `/fr/a-propos/domaines-intervention` et `/en/a-propos/domaines-intervention` présentent les six domaines du brief déjà présents dans `homeContent.domains`. Chaque rubrique reprend son titre et son résumé, puis développe un paragraphe et trois priorités. Les sources sont les mêmes thèmes client que pour À propos : restauration des terres, reboisement, pépinières communautaires, biodiversité, climat, agroécologie, ressources naturelles, sensibilisation, capacités des femmes/jeunes/producteurs et gouvernance locale. Les mots « résilience », « agroécologie » et « gouvernance » sont expliqués simplement.

Il s’agit de reformulations éditoriales et de priorités proposées à relire par GECA, sans nouveaux chiffres, résultats, programmes, techniques de terrain promises ou partenaires. Les traductions anglaises restent à valider. Textes dans `interventionContent` et `interventionDetails`, assemblés par `getInterventionAreas` dans `src/content/site.ts`. Les photos initialement temporaires sont remplacées le même jour par les six images définitives fournies par Gassama dans `imageGeca/domaineDinterventions` ; association exacte selon les noms, sans inspection visuelle ni description supposée. Provenance et copies allégées dans `docs/IMAGES-DOMAINES.md`. Cette mise à jour remplace l’écran d’attente de la sous-page Domaines, sans modifier la sous-page Mission ni Équipe.

## Page unique Projets & programmes — correction du 3 octobre 2026

Cette demande remplace l’organisation précédente : aucune sous-page de projets, ni listes séparées « En cours / Réalisés », ni fiches individuelles. Les quatre projets restent sur `/fr/projets` et `/en/projets`. Les liens de l’accueil ciblent leurs ancres `#projet-{slug}`.

Règle confirmée par Gassama et enregistrée dans `AGENTS.md` et `CLAUDE.md` : développer uniquement les informations de l’accueil, sans inventer de texte factuel, information ou promesse. Les références servent au design, pas aux faits GECA. Pour cette page, les titres et paragraphes français sont repris directement de `homeContent.projects`, `homeContent.hero.description` et `homeContent.cta`. Les trois axes et paragraphes supplémentaires de la précédente version ont été retirés. Descriptions, statuts, lieux, périodes et partenaires proviennent du même tableau `projects` utilisé par l’accueil, sans ajout ni déduction. Les versions anglaises traduisent ce contenu sans information supplémentaire. Les mentions de validation des données et les photos temporaires restent présentes.

## Précisions fournies dans le chat — 4 octobre 2026

Gassama fournit les informations suivantes, qui remplacent les mentions antérieures lorsqu’elles sont moins précises ou contradictoires :

- **Création et identité :** organisation créée le 14 décembre 2016. Depuis le 26 août 2026, RENASCEDD a adopté la nouvelle dénomination Global EcoAction (GECA), sans changement de mission, d’objectifs ni de continuité opérationnelle.
- **Implantation :** siège à Kissosso, commune de Matoto, Conakry, République de Guinée. L’organisation intervient dans plusieurs régions naturelles et préfectures du pays.
- **Capacités :** équipe administrative et de terrain disposant de compétences en sociologie, ingénierie environnementale et agroforesterie, complétée au besoin par des consultants spécialisés.

Répartition : date complète dans la présentation d’accueil et l’introduction À propos ; identité et continuité dans Notre histoire ; implantation et capacités dans deux encadrés de cette même section, en FR/EN. La description de l’équipe sur l’accueil reprend les capacités. L’adresse de Kissosso remplace l’ancienne adresse de Sangoyah Marché dans les coordonnées partagées, Contact et les pieds de page. Les mentions antérieures de ce document restent un historique, pas l’adresse actuelle. Le repère annuel 2016 reste pertinent. Aucun nom de région, préfecture, membre, consultant ou effectif n’est ajouté. Traduction anglaise fidèle, sans fait supplémentaire.

## Résultats authentiques — 4 octobre 2026

Le nouveau message du client, conservé dans `TEXTES-AUTHENTIQUES-CLIENT.md`, fournit désormais les quatre chiffres d’impact et les trois réalisations. La mention historique de chiffres provisoires ne s’applique plus à ces éléments reçus. Les autres contenus en attente ne sont pas validés par cet envoi. Les chiffres sont ceux du client, sans audit indépendant ni résultat extrapolé.

## Sélection de références récentes — 4 octobre 2026

Sept références reçues et archivées dans `TEXTES-AUTHENTIQUES-CLIENT.md`, avec la correction de Gassama : 35 000 arbres en 2019, total 550 000, titre du reboisement corrigé. Les quatre titres et objets antérieurs de la maquette sont remplacés par le texte client ; les trois références supplémentaires sont ajoutées au catalogue unique FR/EN. Les périodes et partenaires reçus sont repris. Les statuts antérieurs restent à confirmer, aucun statut n’est ajouté aux trois nouvelles références.
