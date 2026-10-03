# Médias allégés — 3 octobre 2026

Les 21 photos, logos et affiche vidéo étaient déjà locaux. Sur GitHub Pages, le réglage `unoptimized` envoyait toutefois les fichiers JPEG/PNG d’origine. Les variantes préparées servent maintenant sur Pages et sur le serveur local, sans attendre une conversion par Next au premier chargement.

| Média | Avant | Version légère | Réduction |
| --- | ---: | ---: | ---: |
| Logo GECA | 923 852 octets | 8 234 octets à 320 px | 99,1 % |
| Forêt temporaire | 1 009 863 octets | 85 346 octets à 640 px | 91,5 % |
| Affiche vidéo | 446 646 octets | 52 322 octets à 960 px | 88,3 % |
| Vidéo forêt | 13 085 133 octets | 1 191 827 octets | 90,9 % |
| Ensemble des 21 images, une plus grande variante par image | 6 669 516 octets | 1 949 058 octets | 70,8 % |

Ce dernier total compare les fichiers, pas le téléchargement d’une page. Le navigateur choisit généralement une version plus petite. Les 122 variantes totalisent 5 185 370 octets sur disque ; elles ne sont pas toutes téléchargées. Le relevé détaillé est dans `docs/image-sizes.json`. Aucun temps de chargement sur le réseau de Gassama n’est déduit de ces poids.

## Poids observés sur l’accueil

Chrome, vue de 375 × 900 puis 1 440 × 900 px, densité d’écran 1, mouvements réduits pour isoler les images. Toutes les images de l’accueil ont été décodées après défilement, affiche vidéo comprise. Chaque original est compté une seule fois ; les différentes variantes effectivement choisies sont comptées séparément. Comparaison de poids avec les mêmes fichiers d’origine servis par l’ancien export Pages ; il ne s’agit pas d’une mesure de délai réseau.

| Vue | Poids des originaux correspondants | Variantes choisies | Réduction |
| --- | ---: | ---: | ---: |
| 375 px | 5 086 517 octets | 274 888 octets | 94.6 % |
| 1440 px | 5 086 517 octets | 470 212 octets | 90.8 % |

Les écrans de densité 2 ou 3 peuvent choisir des versions plus grandes. Le délai réel dépend aussi du réseau, des autres fichiers de la page et du cache.

Les photographies sont en WebP qualité 55, de 192 à 1 600 px maximum selon la source. Les logos conservent leur transparence, qualité 85, au plus 640 px. Aucun recadrage ni agrandissement ajouté. `next/image` conserve les proportions réservées, les textes alternatifs, les tailles selon l’écran et le chargement différé. Les images immédiatement visibles gardent leur priorité existante. Le même fichier préparé est partagé entre les pages lorsque photo et taille sont identiques. Les noms contiennent une empreinte du fichier pour éviter un ancien fichier après changement.

Les originaux inchangés sont conservés dans `assets/source-images/` et `assets/source-videos/`, hors du dossier public et de l’export `out`. Les chemins dans les données restent des identifiants stables ; `src/lib/image-loader.ts` les associe au registre fermé `src/content/image-variants.json`. Toute URL distante, source inconnue ou largeur invalide est refusée. Les métadonnées des copies publiques sont retirées. Sources, licences et mentions temporaires restent décrites dans les documents existants ; les anciens chemins publics y sont des références historiques aux copies archivées.

Pour une nouvelle image : ranger l’original sous `assets/source-images/images/`, exécuter `npm run optimize:images`, puis vérifier visuellement et reconstruire le site. Sharp 0.35.5, déjà présent avec Next, est déclaré explicitement comme outil de développement. Aucun service d’images externe ajouté.

Vidéo : même contenu, environ 12 secondes (arrondi de durée lié aux 24 images/seconde), rendu 1 280 × 720 à 24 images/seconde, H.264, qualité CRF 29, sans piste audio, métadonnées retirées, index placé au début du MP4. Compression locale avec FFmpeg 7.0.2 fourni par imageio-ffmpeg 0.6.0, installé seulement dans `/tmp/geca-video-tools`. Commande reproductible avec FFmpeg : `ffmpeg -i assets/source-videos/geca-forest.mp4 -map 0:v:0 -vf scale=1280:-2 -r 24 -c:v libx264 -preset slow -crf 29 -pix_fmt yuv420p -an -map_metadata -1 -movflags +faststart public/videos/geca-forest.mp4`. Lecture/pause, image de secours, refus de lecture automatique et préférences d’économie de données/mouvements réduits conservés.

Sécurité : audit des dépendances d’exécution sans alerte (`npm audit --omit=dev`, 3 octobre 2026). L’audit complet remonte cinq entrées liées à une même alerte `braces` via les outils ESLint, préexistantes à cette modification. Elles concernent le traitement de motifs profondément imbriqués. Aucun motif fourni par un visiteur n’est traité par ces outils ; ils ne figurent pas dans les fichiers statiques publiés. Pas de mise à niveau forcée ni de suppression d’une protection pour contourner une vérification. Cette alerte de développement reste à traiter séparément.
