# Publication depuis le back-office

Préparé le 20 octobre 2026. Liaison testée localement ; activation de production à effectuer après livraison du code.

## Pour GECA

1. Modifier ou ajouter une fiche dans Projets, Actualités ou Équipe, puis enregistrer.
2. Un administrateur ouvre **Publier sur le site**.
3. Relire les textes, vérifier les photos associées et les retraits annoncés. Cocher la confirmation, puis publier.
4. Actualiser l’état et ouvrir le site lorsque la publication est confirmée.

Enregistrer garde un brouillon. La publication porte sur l’ensemble des changements préparés, pas seulement la dernière fiche. Une modification faite après la confirmation attend la publication suivante. Les rapports PDF, comptes, abonnés, notes d’origine et historiques ne sont jamais exportés.

Le traitement automatique recherche une demande toutes les dix minutes. GitHub peut retarder son exécution ; le délai n’est pas garanti. Une publication en cours bloque une seconde demande. En cas d’échec, consulter le site et les journaux GitHub avant de réessayer : une livraison peut avoir réussi sans que sa confirmation ait abouti.

L’anglais n’est pas traduit automatiquement. Pour une nouvelle fiche sans anglais, les textes français sont repris. Les traductions existantes non modifiées sont conservées.

## Activation de production

Ne pas utiliser les données jetables des tests. Ne pas envoyer une base locale, un `.env`, un compte ou un mot de passe.

1. Après autorisation explicite de commit/push, livrer le code par les workflows existants. Laisser `GECA_CONTENT_PUBLICATION_ENABLED` désactivé pendant cette première livraison.
2. Attendre la réussite du workflow du back-office. Dans le terminal cPanel, exécuter `deploy/enable-content-publication.py` avec le SHA complet du commit livré, après téléchargement et vérification de l’empreinte du script. La commande exacte sera préparée pour ce commit. Le script vérifie l’ancien récepteur, le sauvegarde en privé et installe uniquement les commandes de publication fermées. Il conserve les clés et la base.
3. Activer la variable GitHub `GECA_CONTENT_PUBLICATION_ENABLED=true`, puis lancer manuellement « Publier la vitrine GECA sur Bluehost ». Les secrets SSH existants du back-office et de la vitrine doivent être accessibles dans l’environnement `bluehost-production`.
4. Cette première construction réimporte uniquement les références publiques manquantes dans le back-office (notamment les quatre membres ajoutés plus récemment au site). Aucune fiche existante, aucun brouillon et aucun élément de corbeille ne sont écrasés.
5. Vérifier avec un administrateur connecté un changement authentique choisi pour publication, son état final et son affichage HTTPS FR/EN. Cette preuve distante reste nécessaire avant de déclarer la liaison opérationnelle.

Le récepteur SSH installé est volontairement protégé contre les mises à jour ordinaires. Son extension initiale nécessite donc la commande cPanel ; les publications suivantes passent par le bouton.

## Fonctionnement et protections

- Copie immuable en stockage privé, empreinte SHA-256 et champs publics autorisés uniquement.
- Droits d’administrateur recontrôlés côté serveur lors de la demande, de la lecture et juste avant la livraison. Une révocation ou fermeture des sessions bloque une demande encore en attente.
- Confirmation, contrôle de session, CSRF, limite de demandes et verrou de publication conservés.
- Photos issues uniquement des aperçus WebP optimisés, pas des originaux. Le constructeur vérifie format, empreinte, dimensions, taille et absence de métadonnées privées.
- Une publication reconstruit les pages, la recherche et les liens d’actualités. Le HTML reste lisible sans JavaScript.
- Les futures livraisons de code reprennent la dernière copie publiée. Les fiches non modifiées restent celles du code public, sans remplacement par une ancienne importation.
- Le déploiement public existant conserve ses contrôles de fichiers et sauvegardes. L’état « publié » exige ensuite le marqueur de version sur l’accueil HTTPS.
- Limites : 300 fiches, 256 Kio par photo optimisée, 80 Mio par copie, 512 Mio d’archives privées. Si le quota est atteint, arrêter et organiser l’archivage avec le responsable ; aucune suppression automatique.

Ne pas désactiver la variable GitHub après activation sans préparer une livraison contenant les contenus déjà publiés : une construction sans cette liaison reprendrait uniquement le référentiel du code. Pour suspendre le traitement automatique tout en conservant la copie publiée, désactiver les exécutions programmées du workflow plutôt que retirer son entrée de publication.

L’aperçu GitHub Pages reste un aperçu du code. Il ne reçoit pas les publications du back-office. La liaison vise `globalecoaction.org`.

## Vérifications locales

Tests PHP : autorisation/refus, révocation, copie immuable, relecture périmée, double demande, échec, suppression et import additif des références. Parcours navigateur sur base jetable : connexion avec seconde preuve, CSRF, confirmation sans JavaScript, petits/grands écrans et contrôle Axe. Reconstruction avec un projet modifié, une actualité et un membre fictifs isolés : pages, accueil, recherche et absence de note privée vérifiés. Aucun de ces contenus de test n’a été livré.

Commandes de référence : `backoffice/.local-tools/php artisan test` depuis le bon répertoire (ou PHP compatible en CI), `node --test scripts/publication-input.test.mjs`, `python3 deploy/test-auto-backoffice.py`, `npm run lint`, `npm run typecheck`, `npm run build:public`, `npm run test:public`. Le navigateur isolé s’exécute depuis `backoffice` avec `GECA_PHP="$PWD/.local-tools/php" node tests/publication-browser.mjs`.
