# Vidéos Projets & programmes — 15 octobre 2026

Quatre derniers téléchargements WhatsApp sélectionnés par date de modification, conformément à la demande de Gassama. Originaux intacts dans son dossier Downloads, hors Git. Ordre de présentation : ordre des téléchargements. Auteur, licence et autorisations des personnes filmées non précisés ; aucune attribution inventée. Aucun lien avec un projet précis ni identité de personne déduit des scènes.

Les pistes H.264 et AAC d’origine sont copiées sans réencodage : qualité, cadrage et son conservés. Conteneur MP4 préparé pour le Web (`faststart`), métadonnées et chapitres sources retirés. Affiches WebP issues de la quatrième seconde, sans génération de visuel. Les fichiers totalisent environ 70 Mo et ne sont chargés qu’à la lecture.

## Vidéo 1

- Source : `WhatsApp Video 2026-10-13 at 12.18.20.mp4` ; 34,02 s, 832 × 464, son AAC stéréo.
- Source SHA-256 : `be52eb84326a7f4c2286766910fb39e213a3563d3bd72e396a34e04e48956d8f`.
- Public : `/videos/geca-projets-20261015-1.mp4` ; 3603267 octets ; SHA-256 `a4f3454889d6b6ee178d3fe2661601b2b36cd60a41640b96adbff17e0124f1d9`.
- Affiche : `/videos/geca-projets-20261015-1.webp` ; 47464 octets ; SHA-256 `cfefeb06cd471e574d95e6fcefe71b25c97fe79b91ae7b616cf11b32adcc62e9`.

## Vidéo 2

- Source : `WhatsApp Video 2026-10-13 at 12.18.32.mp4` ; 201,29 s, 832 × 464, son AAC stéréo.
- Source SHA-256 : `1683e8bb80f7639e9f8fb1f4eeabf2868a92eb3eb9b9ae93f8d620911d2875e8`.
- Public : `/videos/geca-projets-20261015-2.mp4` ; 18435555 octets ; SHA-256 `258cce8239877f4786f3348f12fe93c17ed7bbb94227c008506d0cf313acf6a0`.
- Affiche : `/videos/geca-projets-20261015-2.webp` ; 52234 octets ; SHA-256 `b82b109f905a384783d61dda098a0f45e2a4a9f9d8fb395c66644a512842a4ea`.

## Vidéo 3

- Source : `WhatsApp Video 2026-10-13 at 12.18.40.mp4` ; 113,20 s, 640 × 360, son AAC stéréo.
- Source SHA-256 : `b201369b9168980106911c3e01ffde9a378ea047461b92636ee6bcce970ce538`.
- Public : `/videos/geca-projets-20261015-3.mp4` ; 20813827 octets ; SHA-256 `b947c35007b6b1c177c1b440af5ee8d66783b84fd67610b3741b6c542b9e8ffc`.
- Affiche : `/videos/geca-projets-20261015-3.webp` ; 37468 octets ; SHA-256 `4e3ed42066c8cbd82e7827e745b2e6e1b296e552114c71ff9a8a694c97cfb8a2`.

## Vidéo 4

- Source : `WhatsApp Video 2026-10-13 at 12.18.39.mp4` ; 158,46 s, 640 × 360, son AAC stéréo.
- Source SHA-256 : `cd21e67c439a387d77ea21927df39eb2503616477aa4a3418fdeb66f1a983b82`.
- Public : `/videos/geca-projets-20261015-4.mp4` ; 27149928 octets ; SHA-256 `06a53513235d290251f7fb813b78c255d224db19f8bc39f3d041aa7986e95ad2`.
- Affiche : `/videos/geca-projets-20261015-4.webp` ; 52076 octets ; SHA-256 `e0f2629f4a498a9b89cf90922b559dff25c89aae158d34ebb445c09f3235766d`.

## Intégration et limites

Données fermées dans `src/content/project-videos.json`, libellés FR/EN dans `src/content/site.ts`. Les scripts d’export et de réception autorisent ces huit noms précis en plus de la vidéo d’accueil ; fichiers inconnus, exécutables et chemins privés restent refusés. Mise à niveau des outils distants préparée avec empreintes attendues ; aucun outil Bluehost changé à distance par cette tâche.

Lecture en fenêtre native dialog, Échap et fermeture arrêtent le son et libèrent le fichier ; focus rendu au panneau. Repli vers le fichier direct sans JavaScript. Sous-titres et transcription non fournis. Vérification Chrome sur ordinateur avec tailles mobiles simulées ; aucune affirmation de test sur téléphone réel.

Avant le déploiement du remplacement de la vidéo d’accueil, Gassama demande le retrait de « Ouvrir la vidéo directement » sous les quatre lecteurs Projets. Lien retiré en FR/EN et message d’erreur adapté aux commandes restantes. Les panneaux de lecture, commandes natives, son, fermeture, clavier et accès sans JavaScript restent disponibles.

## Vérifications locales du 15 octobre 2026

Lint, TypeScript, compilation locale et export public réussis. Les 18 parcours de l’export passent : pages FR/EN, médias, clavier, fermeture et arrêt, lecture des quatre vidéos, affichage 320/768/1440 px, texte à 200 %, absence de chargement MP4 avant clic, mouvement réduit, JavaScript absent et erreur réseau. Le parcours local complémentaire confirme aussi le lecteur à 375 px. Captures ordinateur et mobile inspectées. Les 21 tests des outils de livraison passent, dont les noms vidéo autorisés et refusés et les versions partielles refusées. Export complet : 137 832 027 octets, sous la limite de réception de 200 Mo. Serveur local du port 3000 actualisé en développement ; aucun commit, push ou déploiement effectué pour cette nouvelle section.
