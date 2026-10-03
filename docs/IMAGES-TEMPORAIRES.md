# Images temporaires — 3 octobre 2026

**Mise à jour du même jour :** les six photos des domaines sur l’accueil et la page Domaines d’intervention ont été remplacées par les images définitives fournies par Gassama. Association exacte et provenance dans `docs/IMAGES-DOMAINES.md`. Le tableau ci-dessous conserve l’historique des sources temporaires ; il ne décrit plus les images actuelles des domaines. Les fichiers temporaires restent conservés, notamment pour leurs autres usages.

Gassama a demandé des images provenant d’Internet, avec une étiquette « Image temporaire ». Cette instruction remplace la restriction initiale aux emplacements vides pour la maquette locale.

## Sources et auteurs

Les six pages de photographie ont été consultées et indiquent une utilisation gratuite sous la [licence Unsplash](https://unsplash.com/license). Aucun visuel Unsplash+ n’est utilisé. Les trois premières images ont été validées avec Sharp ; les trois ajouts pour les domaines avec Pillow, après contrôle de leur signature JPEG et d'une limite de téléchargement de 2 Mo. Leur décodage dans le site est aussi contrôlé par les tests navigateur. Les six photos ont été examinées visuellement.

| Fichier local                          | Auteur et page source                                                                                                                                             | Emplacement                             | Dimensions  |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------- |
| `public/images/temporary/forest.jpg`   | [Krystal Ng — Dense palm fronds in tropical forest](https://unsplash.com/photos/dense-palm-fronds-in-tropical-forest-O07o2Cd_vX0)                                 | Hero en haut à droite, restauration des écosystèmes, projet Kounounkan | 1600 × 2400 |
| `public/images/temporary/planting.jpg` | [Jonathan Kemper — Gloved hands planting seedling in soil](https://unsplash.com/photos/gloved-hands-planting-seedling-in-soil-CbZh3kaPxrE)                        | Éducation environnementale, appui social et protection de la nature | 1400 × 2100 |
| `public/images/temporary/fields.jpg`   | [Bernd Dittrich — Aerial view of green and brown agricultural fields](https://unsplash.com/photos/aerial-view-of-green-and-brown-agricultural-fields-3vgvdshL0_0) | Agroécologie, planification climatique, PROTEMO | 1400 × 1007 |
| `public/images/temporary/climate.jpg` | [Dan Meyers — Cracked surface with plants growing on it](https://unsplash.com/photos/a-picture-of-a-cracked-surface-with-plants-growing-on-it-yW9YbBc4YJA) | Climat & résilience | 1200 × 900 |
| `public/images/temporary/water.jpg` | [Frans Daniels — River in forest](https://unsplash.com/photos/river-in-forest-Iu6EW0NgejY) | Ressources naturelles | 1200 × 1800 |
| `public/images/temporary/community.jpg` | [Zacqueline Baldwin — A group of people putting their hands together](https://unsplash.com/photos/a-group-of-people-putting-their-hands-together-K7IvqBpE5uY) | Gouvernance & communautés | 1200 × 800 |
| `public/images/temporary/impact-forest.jpg` | [Chandu J S — Misty forest landscape with layered hills](https://unsplash.com/photos/misty-forest-landscape-with-layered-hills-WmG0GxmyY-k) | Bandeau Notre impact | 1920 × 2247 |
| `public/images/temporary/event-leaf.jpg` | [Aaron Burden — Green leaf with water drops](https://unsplash.com/photos/green-leaf-with-water-drops-dXYE1d08BiY) | Carte Prochain événement | 1200 × 900 |

Ajout des actualités le 3 octobre 2026 : réutilisation de `planting.jpg` et `community.jpg` pour les deux cartes ; aucun membre ou projet GECA ne leur est attribué. Feuille d’Aaron Burden téléchargée en HTTPS depuis `https://images.unsplash.com/photo-1495584816685-4bdbf1b5057e?fit=max&fm=jpg&q=80&w=1200` avec limite de 2 Mo. Fichier JPEG de 72 190 octets, dimensions et décodage contrôlés avec Pillow, puis photo examinée. La page source et la licence gratuite Unsplash ont été relues. Affichage local avec voile clair et étiquette « Image temporaire », sans contact avec Unsplash pendant la visite.

Ajout du bandeau Notre impact le 3 octobre 2026 : JPEG de 380 893 octets, téléchargé en HTTPS depuis `https://images.unsplash.com/photo-1658817410225-df7829a97a9d?fit=max&fm=jpg&q=80&w=1920`. La page source indique la licence gratuite Unsplash, vérifiée le même jour, et une prise de vue à Venjarammoodu en Inde. Format, dimensions et décodage contrôlés avec Pillow ; photo examinée visuellement. Le cadrage sur les collines et le voile vert sont appliqués en CSS. L'image reste étiquetée et ne représente pas un territoire ou un projet GECA.

Ajout des domaines le 3 octobre 2026 : trois fichiers téléchargés directement depuis `images.unsplash.com`, avec JPEG demandé, largeur limitée à 1200 px et qualité 80. Poids : climat 354 546 octets, eau 654 002 octets, entraide 108 395 octets. Les photos sont ensuite redimensionnées et chargées à la demande par `next/image` dans le site. Les sources précisent un désert en Oregon et une cascade à Bali ; aucune localisation guinéenne n'est attribuée à ces images. La photo de plantation illustre un geste à transmettre, pas une formation réelle. Les mains réunies n'appartiennent pas à des membres GECA identifiés.

Ces images illustrent la maquette. Elles ne représentent pas les projets, les équipes ou les territoires réels de GECA. Les textes alternatifs le précisent. Aucun portrait extérieur n’est attribué à un membre de l’équipe.

## Affichage et remplacement

Les références se trouvent dans `src/content/site.ts`, avec `temporary: true`. Le composant photo partagé affiche automatiquement « Image temporaire » sur une étiquette blanche contrastée, avec un accent doré. L’étiquette est placée en bas des photos des domaines et des projets. Le premier écran utilise désormais la vidéo fournie par Gassama, documentée dans `docs/VIDEO-HERO.md`.

Remplacer la référence `photo` par le fichier GECA autorisé, son texte alternatif réel et retirer `temporary: true`. Aucun autre changement de composant n’est nécessaire. Les photographies sont servies localement par `next/image` ; les hôtes distants restent interdits dans `next.config.ts`.

## Fichiers concernés

Créés : les trois JPEG ci-dessus et ce document. Modifiés : `src/content/site.ts`, `src/components/ui.tsx`, `src/app/globals.css`, `README.md`, `AGENTS.md`, `docs/BENCHMARK.md`, `docs/VERIFICATIONS.md` et les vérifications des images dans `tests/site.spec.ts`.

## Vérifications de cette adaptation

`npm run lint`, `npm run typecheck` et `npm run build` réussissent. Les neuf tests de `npm run test:e2e` passent. Le chargement réel des photos visibles et la présence des étiquettes sont contrôlés à 320, 375, 768, 1024 et 1440 px. Aucun débordement horizontal ni violation des règles d’accessibilité automatique contrôlées n’est détecté. Les cas refusés, dont une image distante non autorisée, restent vérifiés ; aucune protection n’a été désactivée.

La capture du premier écran à 1440 px a été examinée après l’ajout. Les photos restent des illustrations temporaires ; aucune localisation ni appartenance à GECA n’est affirmée. Les limites et l’alerte de développement déjà documentées dans `docs/VERIFICATIONS.md` restent valables. Aucun commit, push ou déploiement.

## Réutilisation sur la page contact — 3 octobre 2026

`fields.jpg` illustre la colonne d'accueil de la page contact ; `forest.jpg` forme le bandeau panoramique final. Sources et licence Unsplash du tableau ci-dessus conservées. Aucun téléchargement supplémentaire. Étiquette « Image temporaire » sur les deux photos ; descriptions alternatives FR/EN précisant leur rôle d'illustration, sans localisation guinéenne ni action GECA attribuée.

## Nouvelle disposition de Notre impact — 3 octobre 2026

Gassama confirme de garder provisoirement `impact-forest.jpg` avec « Image temporaire » dans la nouvelle composition : photo continue derrière le message et les trois cartes. Auteur, licence et description du tableau conservés. Cette image n'est pas présentée comme une photographie de terrain GECA. Aucun nouveau fichier ni téléchargement.
