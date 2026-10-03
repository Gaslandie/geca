# Vidéo du premier écran — 3 octobre 2026

> Mise à jour du 3 octobre 2026 : les copies d’origine décrites ci-dessous sont conservées sous `assets/source-images/` (ou `assets/source-videos/` pour la vidéo), hors du dossier public. Le site utilise désormais des variantes légères. Voir [PERFORMANCE-MEDIAS.md](PERFORMANCE-MEDIAS.md) pour les chemins actuels et les poids mesurés.

Source fournie et autorisée pour la maquette locale par Gassama : `/home/mohamed-gassama/Downloads/Green Minimalist Environment Landscape Video.mp4`.

La copie utilisée est `public/videos/geca-forest.mp4`. Elle est identique au fichier source, vérifiée par SHA-256 ; le fichier de Downloads n'a pas été modifié. Le navigateur sert uniquement la copie publique, sans accès au dossier Downloads. Aucun autre fichier de ce dossier n'est exposé.

Le fichier MP4 est décodé dans Chrome : 1920 × 1080, environ 11,93 secondes, 13 085 133 octets. Trois images, au début, au milieu et à la fin, ont été examinées. Elles montrent une forêt vue du dessus. Aucun texte incrusté n'a été observé dans ces trois images. `public/videos/geca-forest-poster.jpg` est extrait de la première image du fichier, sans visuel généré ; il pèse 446 646 octets.

Il s'agit d'un visuel fourni pour l'habillage, pas d'une preuve de terrain GECA ni d'une localisation en Guinée. Sa licence d'origine n'a pas été transmise. Aucune publication ni recherche de droits externes n'est faite ici. Le fichier original de 13 Mo est conservé pour la maquette ; une version plus légère sera utile avant une éventuelle publication, particulièrement sur connexion mobile.

La vidéo tourne sans son, en boucle, dans la page. Le lecteur attend de vérifier la préférence de mouvements réduits et l'économie de données disponible dans le navigateur avant de charger le MP4. Dans ces deux cas, seule l'image fixe s'affiche au départ ; une lecture demandée par le visiteur reste possible. Une demande de mouvements réduits pendant la lecture la met en pause.

Un bouton permet de mettre en pause et de reprendre au clavier ou au toucher. L'image sert aussi de fond avant chargement, si la lecture automatique est refusée, en cas d'échec du média et sans JavaScript. Le texte et les deux liens restent du HTML indépendant du lecteur. Le média est décoratif et caché aux lecteurs d'écran ; aucun message essentiel ne dépend de sa lecture ou de son audio.

Les textes et chemins se modifient dans `src/content/site.ts`, le lecteur dans `src/components/HeroVideo.tsx`, et le rendu dans `src/app/globals.css`. Aucune plateforme vidéo, dépendance, collecte, session ou formulaire ajouté. Les restrictions des images distantes et les en-têtes protecteurs du site sont conservés.
