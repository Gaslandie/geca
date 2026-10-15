# Vidéo de l’accueil — 15 octobre 2026

Demande de Gassama : vidéo après le texte À propos de l’accueil, cadre simple, bouton inspiré de GassTech. FR/EN, lien « À propos de GECA » après le lecteur. Les faits GECA et les pages À propos dédiées sont conservés.

## Source initiale et préparation

Original intact : `/home/mohamed-gassama/Downloads/WhatsApp Video 2026-10-13 at 19.11.10.mp4`. Son nom ne confirme pas une date de tournage. Auteur et licence non fournis ; utilisation sur le site demandée par Gassama. Aucun autre fichier de Downloads exposé.

| Fichier | Octets | SHA-256 |
| --- | ---: | --- |
| Original WhatsApp | 37 533 231 | `29c02d641d8a3efff22fe2ab924f0b8ee2af9c4b984b7b06fedee8a44f855ffc` |
| `public/videos/geca-presentation-20261015.mp4` | 34 310 332 | `f2f32a531278a7ad9581f24256534887f66b71cb74f8b802f0d2697e156322b1` |
| `public/videos/geca-presentation-20261015.webp` | 34 314 | `7fa2b00a68ad8ce692e062b1d847f2c00d4586700b9cece6f66d1ea7df0f417f` |

Source : 313,01 secondes, 640 × 360, 25 images/seconde, H.264 et AAC stéréo. Version web H.264 CRF 22, AAC 96 kbit/s, sans changement de cadrage ni de durée, métadonnées et chapitres retirés, index MP4 placé en début (`faststart`). Affiche extraite à 8 secondes et convertie en WebP. Pas d’image générée ni d’agrandissement artificiel. Le texte de l’affiche appartient au film ; aucune information de celui-ci ajoutée aux textes GECA.

FFmpeg 7.0.2 fourni par `imageio-ffmpeg` 0.6.0 sous `/tmp/geca-video-tools`. Aucune dépendance du site ou installation système ajoutée. Conserver l’original pour la reprise sur un autre ordinateur ; les deux dérivés suffisent au lecteur public.

## Fonctionnement

`PresentationVideo`, textes FR/EN dans `site.ts`, chemins fermés dans `home-video.json`. Cadre clair bordé, coins arrondis, ombre discrète, largeur maximale 960 px, ratio 16:9. Bouton circulaire vert avec triangle blanc et halo statique. Apparition partagée `SiteMotion`, préférences de mouvement respectées.

Lecture au clic, `preload="none"`, commandes natives de pause, volume, progression et plein écran. Pas de lecteur tiers ni de suivi ajouté. Focus transféré au lecteur après activation au clavier. Commandes natives sans JavaScript ; message et lien direct en cas d’erreur. Ce média public ne donne aucun accès au back-office.

Correction après la capture du téléphone de Gassama : le bouton vert et les commandes natives ne sont plus affichés ensemble avant la lecture. Le HTML initial conserve le lecteur natif ; après activation de JavaScript, seul le bouton vert est visible jusqu’à l’appui. Les commandes natives prennent ensuite le relais et restent disponibles après pause ou erreur. Aucun masquage des commandes internes propre à Chrome, aucune modification du son ou du fichier vidéo.

Après le signalement « le son ne marche pas » : le bouton principal réactive explicitement le son et règle le lecteur à 100 %, puis commande visible « Couper le son / Activer le son », synchronisée avec les commandes natives. Le volume système n’est pas modifié. Les 30 premières secondes contiennent bien un signal audio : moyenne source -21,4 dB, dérivé -21,5 dB (FFmpeg). Le signal audio décodé par Chrome a aussi été mesuré : AudioContext actif, amplitude maximale 0,171, lecteur non muet, volume 1. Gassama confirme ensuite que le son fonctionne dans Chrome et que le problème concerne seulement l’aperçu VS Code. Aucun réglage système ou VS Code modifié.

Sous-titres/transcription non fournis : aucun texte inventé. Les contrôles automatiques ne prouvent pas l’accessibilité du contenu sonore. Résolution source limitée sur grand écran.

## Export et prochaine publication

Le build public copie seulement les deux chemins du registre. Les outils de livraison préparés acceptent exactement ce MP4 et son affiche ; MP4 inconnus, fichiers privés et chemins détournés restent refusés. Sauvegardes, empreintes et restauration conservées.

Avant une future publication explicitement demandée : vérifier puis actualiser les outils distants `receive-public.py` et `update-public.py` avec `upgrade-public-delivery.py`. Les anciennes versions peuvent refuser les nouveaux chemins. Seuls des ensembles complets d’empreintes connus sont acceptés, pas un mélange partiel. Aucune action distante, commit ou push effectué par cette demande.

Validation finale consignée dans `BENCHMARK.md`.

L’aperçu statique local prend aussi en charge les requêtes de portions MP4 pour avancer dans le film ; plages invalides refusées. Contrôles finaux : lint, TypeScript, builds locale/publique, 3 tests lecteur local, 14 tests export, 19 tests de livraison isolée réussis. Son confirmé par Gassama dans Chrome.

Gassama autorise ensuite le commit et le push de l’ensemble le 15 octobre 2026. Le contrôle de publication distante reste distinct ; prérequis des outils Bluehost indiqué ci-dessus.

## Remplacement demandé à 12 h 10 — 15 octobre 2026

Vidéo actuelle : `WhatsApp Video 2026-10-15 at 12.10.11.mp4`, dernier MP4 téléchargé et durée vérifiée de 299,82 secondes (4 min 59). L’original reste intact dans Downloads. Utilisation et commit/push/déploiement demandés par Gassama ; auteur et licence non précisés. Aucun fait ajouté aux textes à partir des images ou du son.

640 × 360, 25 images/seconde, H.264 High/yuv420p et AAC stéréo 44,1 kHz. Pistes copiées sans réencodage ni découpage ; métadonnées et chapitres retirés, index MP4 déplacé au début pour la lecture web. Affiche WebP extraite à 8 secondes, qualité 85, dimensions originales. Contrôle de décodage complet sans erreur.

| Fichier actuel | Octets | SHA-256 |
| --- | ---: | --- |
| Original WhatsApp | 35 951 216 | `278fb4f572de12cc2c7662dbbc5753da1ab508388f74bde5322eb92a18b70067` |
| `public/videos/geca-presentation-20261015.mp4` | 36 127 639 | `c4d3c03005f8f768ceb9ff3c33976d1e48eaf773a1e3582de800a28b448ed253` |
| `public/videos/geca-presentation-20261015.webp` | 33 496 | `3d840f81bd88802a54e4615abe817184bdce53c23903c19e0969670ccaee1e9c` |

Les chemins physiques restent dans le registre fermé déjà autorisé. La révision `c4d3c03005f8` ajoutée aux URL du lecteur et de l’affiche évite de réutiliser une ancienne copie en cache. Bouton mobile corrigé, son, contrôles, textes et quatre vidéos Projets conservés. L’ancien média reste récupérable dans Git et les sauvegardes de publication.
