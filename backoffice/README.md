# Administration GECA — base locale du 7 octobre 2026

Cette base permet de se connecter, d’ajouter et de modifier des fiches Projets, Actualités et Équipe en brouillons privés FR/EN, avec photos facultatives. Elle ne publie rien sur le site. L’ajout du 10 octobre reste local ; l’état de la livraison précédente sur Bluehost est décrit plus bas.

## Ce qui fonctionne

- Menu latéral commun et accueil de gestion validés par Gassama : compteurs réels, état de préparation, menu compact mobile/texte agrandi utilisable sans JavaScript.

- Connexion sans inscription publique, déconnexion, cookies de session et protection CSRF des formulaires.
- Accès réservé aux administrateurs actifs ; droits relus côté serveur à chaque requête, révocation et changement de mot de passe invalidant les anciens accès.
- Sécurité du compte : changement de son propre mot de passe et déconnexion de tous ses appareils, avec mot de passe actuel et connexion complète. Toutes les sessions, y compris la courante, sont fermées après succès. L’accès local sans identification permet de consulter ces formulaires, sans exécuter ces actions.
- Limitation des connexions : 5 par minute et adresse de compte, 20 par minute et IP. Un blocage de compte peut durer une minute sous attaque ; les clés du cache ne contiennent pas l’adresse e-mail en clair.
- Comptes créés, mots de passe remplacés et accès révoqués depuis le terminal. Mot de passe saisi masqué, jamais en argument. Limite bcrypt : 72 octets, sans troncature ; au moins 15 caractères. Pas de compte par défaut.
- Import idempotent de 7 projets, 9 archives et 8 membres depuis `src/content/site.ts`. Les 7 archives de projets ouvrent leur référence commune. Les photos, crédits, statuts absents et dates reçues sont conservés dans la source privée et dans le site autonome.
- Modification des textes FR/EN existants, note de provenance obligatoire, historique privé avec auteur issu de la session. Un conflit entre deux modifications bloque l’écrasement.
- Ajout de projets, actualités et membres depuis chaque liste : informations françaises nécessaires, anglais et photo facultatifs, note d’origine obligatoire. Lieu, période et partenaire inconnus restent vides ; rien n’est déduit ou traduit automatiquement. Première version conservée, historique et auteur serveur. Un même formulaire ne crée qu’une fiche.
- Suppression avec confirmation dans Projets, Actualités et Équipe ; corbeille avec restauration des textes et photos. Les actualités liées sont retirées avec leur projet, après avertissement.
- En-têtes sans cache, non-indexation, anti-inclusion dans un autre site et politique restrictive des ressources. Les sorties sont échappées ; les textes ne deviennent pas du HTML exécutable.

Les administrateurs autorisés gèrent les mêmes contenus GECA. Ce n’est pas une application multi-organisations. Aucun rôle ou auteur reçu dans un formulaire n’accorde de droit. Pour ouvrir à d’autres rôles, construire les règles correspondantes avant de créer leurs accès.

## Installer une autre copie locale

Prérequis : PHP 8.4+ avec les extensions Laravel, `pdo_sqlite` pour ces tests et `pdo_mysql` pour MySQL ; Composer 2. Le verrou cible PHP 8.4.26 et contient Laravel 13.35.0. Aucun Node n’est nécessaire pour servir les écrans Blade. Node 24 et les dépendances du dépôt Next sont nécessaires pour l’export de référence et les tests navigateur.

Depuis `backoffice/`, dans une copie neuve uniquement :

```bash
composer install --no-interaction
php scripts/setup-local.php
php artisan migrate
php artisan geca:import-reference
php artisan geca:admin create
php artisan serve --host=127.0.0.1 --port=8000
```

Le script refuse tout `.env` ou base locale déjà présent. **Ne pas l’exécuter sur Bluehost.** Ne jamais remplacer la clé distante par la clé locale.

Dans cette session, PHP système manque d’extensions. Après disparition du dossier temporaire lors de l’interruption, les extensions officielles Ubuntu sont conservées dans `backoffice/.local-tools/`, exclu de Git, sans installation système. Depuis `backoffice/`, utiliser `.local-tools/php` à la place de `php`. Ce lanceur vise les extensions extraites pour PHP 8.5 de cette machine ; sur une autre machine, installer les extensions adaptées et utiliser son PHP. Composer 2.10.3 avait été installé temporairement pour produire le verrou ; il n’est pas inclus dans le dépôt. Le téléchargement a gardé TLS actif et l’installateur Composer a été vérifié par SHA-384. Les dépendances officielles ont été résolues avec un point d’accès Packagist disponible, sans changement des DNS du système.

## Accès perdu ou révoqué

```bash
php artisan geca:admin reset
php artisan geca:admin revoke
```

Ces commandes demandent l’adresse dans le terminal ; `reset` demande ensuite deux saisies masquées et confirmation. Elles ferment les sessions du compte. Un reset ne réactive pas un accès révoqué. Aucune route de récupération publique et aucun e-mail automatique. La création de compte refuse une adresse existante.

## Tests

Depuis `backoffice/` :

```bash
php vendor/bin/phpunit
php vendor/bin/pint --test
composer validate --strict
composer check-platform-reqs --no-dev
composer audit
```

Depuis la racine GECA :

```bash
GECA_PHP="$PWD/backoffice/.local-tools/php" node backoffice/tests/browser.mjs
```

Le navigateur utilise Chrome installé (surcharge `GECA_CHROME`), un profil, une base, des caches et un mot de passe de test jetables. Serveur sur `127.0.0.1:8001`, arrêté en fin de test. Captures exclues de Git dans `artifacts/`. Les tests PHP utilisent SQLite en mémoire, jamais la base distante. Les résultats n’établissent pas encore la compatibilité du serveur MySQL Bluehost.

Pour régénérer les références après une mise à jour authentique des données du site :

```bash
node backoffice/scripts/export-reference.mjs
```

L’import n’écrase pas les entrées existantes. Une modification future de la référence doit être réconciliée explicitement avec les brouillons. Aucune synchronisation automatique de ce JSON vers Next.js.

## Livraison à préparer avec le résultat Bluehost

Le paquet de code se prépare depuis la racine :

```bash
python3 backoffice/scripts/package-release.py
```

Ce paquet n’est **pas un script de déploiement**. Le déposer dans un dossier privé de préparation ; ne pas le décompresser dans l’application active ou dans `public_html`. Il ne contient ni `.env` privé, `vendor`, base, journal, compte, sauvegarde, ni l’entrée HTTP et le `.htaccess` déjà installés sur Bluehost. Le manifeste donne les empreintes des fichiers à examiner.

Avant une livraison : comparer `composer.lock`, migrations et fichiers de base distants avec cette copie ; relever MySQL et vérifier les prérequis réels. Faire une sauvegarde privée cohérente des fichiers, de `.env` et de MySQL, puis tester sa restauration dans un emplacement séparé. La sauvegarde des fichiers et leur extraction d’essai sont confirmées ; le 9 octobre, la copie MySQL restaurée a été comparée avec succès au dump initial (voir `docs/MISE-EN-PRODUCTION.md`). Préparer le code et les dépendances avec `composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader`, pas `composer update` en production. Ne pas remplacer le `.env`, ne pas régénérer APP_KEY.

Les nouvelles migrations sont additives ; les trois migrations d’origine gardent leurs noms. Seul un `migrate --force` après comparaison est envisagé. Aucun `migrate:fresh`, `reset`, ni suppression de données. Conserver le code précédent pour retour arrière ; ne pas lancer aveuglément les migrations inverses.

Le futur réglage privé `GECA_PUBLIC_PATH=/home2/fnksrwmy/public_html/geca-admin` harmonise HTTP et CLI. Le fournisseur de services charge ce réglage après la configuration et refuse un dossier invalide. Le CSS et le logo local `brand/geca-logo.webp` doivent rejoindre la racine publique, aux mêmes chemins ; conserver l’entrée `index.php`, les règles HTTPS, `.well-known`, `cgi-bin` et les permissions en place. Garder `APP_DEBUG=false`, cookies Secure/HttpOnly, domaine de cookie vide et `MAIL_MAILER=array`. Reconstruire les caches après changement de configuration, puis refaire les essais HTTP et accès privés sur place.

Préparation reprise le 9 octobre : Gassama confirme que le point de maintenance de l’hébergement est réglé, sans document de support transmis. Le paquet actuel inclut aussi `public/admin-theme.css` et `public/photo-preview.js`, nécessaires au thème central et à l’aperçu des photos. Archive privée vérifiée : `artifacts/geca-backoffice-code.tar.gz`, 85 fichiers de code plus le manifeste, 123 483 octets, SHA256 `2f2de21a6472001640d263811ade22d0624132c2bccff16a4c904f935b5356d5`. Aucun `.env` réel, dépendance, base ou entrée HTTP distante ajouté. 98 tests PHP / 1144 assertions, Pint, vues compilées et suite navigateur complète réussis sur données jetables ; Composer valide et prérequis locaux satisfaits. Simulation d’installation sans écriture réussie, avec avertissement réseau ; audit en ligne non abouti, à reprendre avant installation des dépendances distantes. Serveur local 8000 et assets actuels disponibles, dashboard anonyme redirigé vers la connexion. Inventaire distant, sauvegarde/restauration, transfert et extraction privée confirmés ensuite le 9 octobre ; installation et contrôles de mise en service restent à faire. Ce paquet ne relie pas les modifications au site statique.

## Limites explicites

Pas encore de publication, gestion visuelle des révisions ou livraison du site Next.js. Création, photos affectées aux fiches nouvelles ou existantes et suppression/restauration disponibles localement. Double vérification requise hors exception locale temporaire documentée. Aucune route de fichiers privés signés n’est activée. Les envois restent désactivés par défaut en production tant que le traitement PHP web n’est pas vérifié. Sauvegarde/restauration distante validée le 9 octobre ; essais applicatifs MySQL/PHP 8.4 web encore à faire avant mise en service. Ne pas présenter cette base comme un back-office terminé.

## Médias privés ajoutés

La bibliothèque accepte JPEG, PNG et WebP après contrôle de l’extension, du type réel et décodage GD. Maximum 6 Mo, 12 millions de pixels et 6 000 pixels par côté, avec contrôle de mémoire disponible. Limites PHP web (`upload_max_filesize`, `post_max_size`, `memory_limit`) à vérifier sur Bluehost : elles peuvent réduire ces plafonds. Pas de SVG, PDF, document Office, archive ou exécutable. La signature PHP dans un fichier et les noms de type `photo.php.jpg` sont refusés ; ce contrôle ne remplace pas un antivirus ni le maintien à jour de GD.

Original stocké sous UUID en `.bin`, hors racine web ; aperçu WebP de 1 280 pixels maximum recréé depuis les pixels, sans recopier EXIF/XMP/ICC. Permissions privées imposées à chaque écriture (600 pour les fichiers, dossiers privés). Source, auteur reçu facultatif, autorisation/licence et descriptions FR/EN sont des champs explicites ; aucune attribution automatique. L’utilisateur vérifie l’orientation dans l’aperçu. Les crédits et les photos existants du site restent conservés ; aucune migration des originaux existants vers cette bibliothèque n’a été effectuée.

Seul l’aperçu est consultable via une route administrateur contrôlée à chaque requête. Aucune route de téléchargement d’original, aucun lien public, aucun fichier dans l’export Next. Quota 200 médias / 256 Mio (originaux et aperçus), verrou d’envoi commun et 4 envois/minute/administrateur. Un échec ordinaire d’écriture/enregistrement nettoie le dossier créé ; une interruption brutale peut laisser un fichier orphelin privé, inclus dans le quota, à examiner lors de la maintenance. Pas de suppression de médias pour l’instant.

`GECA_MEDIA_UPLOADS_ENABLED=false` par défaut. N’activer sur Bluehost qu’après tests de GD **HTTP**, des limites mémoire/fichiers et des permissions. Le `setup-local.php` l’active seulement pour une nouvelle copie locale. La présence de GD CLI signalée par Gassama n’est pas une preuve du traitement HTTP. Tests supplémentaires : fichiers déguisés, métadonnées de test présentes dans l’original mais absentes de l’aperçu, quotas, permissions, droits retirés et aperçu anonyme refusé.

## Point Bluehost reçu pendant la reprise

MySQL `8.0.46-37`, GD CLI présent. Gassama confirme le 9 octobre que le point des mises à jour de sécurité chez Bluehost est réglé ; aucun document de support n’a été inspecté. Sauvegarde/restauration distante validée, paquet extrait en privé. Précontrôle Composer distant réussi : prérequis PHP CLI satisfaits et audit du verrou de production sans avis connu ; ctype et mbstring sont fournis par des polyfills. Ce résultat complète l’audit local resté sans résultat. Installation privée de 77 packages ensuite confirmée, trois migrations d’origine identiques et verrou livré inchangé. Comparaison des bibliothèques : quatre ajouts pour QR/TOTP et trois retraits liés à Tinker, aucune différence de version entre packages communs. Configuration privée et démarrage sur la seule base de test confirmés, puis six migrations appliquées avec conservation des données initiales et comptes inactifs. Import des 24 références réussi, second passage sans doublon. Compilation Blade et dix contrôles internes anonymes/CSRF réussis sur PHP CLI/MySQL Bluehost, sessions d’essai annulées. Assemblage privé de la copie de production confirmé sur Bluehost, avec conservation de la clé et de la connexion source. Installation sous maintenance confirmée : nouveau code, quatre fichiers publics et stockage conservé ; ancienne application gardée dans le dossier privé de livraison. Sauvegarde SQL fraîche vérifiée, six migrations de production et import des 24 références confirmés, anciennes données conservées. Administration toujours en maintenance, aucun compte activé ; création interactive du premier administrateur préparée. Parcours authentifiés distants, contrôles du nouveau code en PHP web et mise en service restent à faire. Sources et résultats dans `../docs/MISE-EN-PRODUCTION.md`.


## Newsletter interne — réalisée en local le 8 octobre 2026

Choix de Gassama : gestion interne d’abord lorsque pertinente et de bonne qualité. Nouveau module `/administration/newsletter`, protégé par les contrôles administrateur actif et version de session existants. Liste GECA commune privée, adresses chiffrées, clé de recherche HMAC, dates de demande/confirmation/désinscription et version du texte de consentement. Seul le créateur réel connecté peut modifier, autoriser ou arrêter sa campagne ; le travailleur vérifie encore son compte actif et ses droits. Rédaction en texte simple FR ou EN, aperçu échappé, conflits de révision refusés, validation explicite du message enregistré avant préparation. Aucun abonné ni contenu réel ajouté par l’agent.

### Essayer maintenant

1. Ouvrir `http://127.0.0.1:3000/fr`, saisir une adresse dans le bandeau et choisir S’abonner.
2. La page GECA locale sur le port 8000 demande l’accord et précise le mode test. Confirmer la demande.
3. Se connecter à `http://127.0.0.1:8000/administration/newsletter` avec le compte administrateur existant. Aucun mot de passe n’a été changé.
4. Dans la page Newsletter, ouvrir « Messages de test », puis le message et son lien de confirmation. Une action explicite confirme l’adresse.
5. Rédiger une newsletter, enregistrer le brouillon, vérifier l’aperçu et cocher l’accord de préparation. Choisir « Préparer la simulation », puis « Lancer le test » dans « Messages de test » depuis la liste.
6. Consulter le message de campagne simulé et essayer son lien de désinscription. Les GET montrent une page ; seul un POST protégé effectue l’action.

Le mode `GECA_NEWSLETTER_MODE=preview` ne contacte aucune messagerie. Les états Simulé et Remis au serveur sont différents. L’état Remis au serveur ne garantit ni réception ni absence de classement indésirable. Une erreur SMTP ou interruption laisse À vérifier / En cours ; aucun réessai automatique susceptible de doubler l’envoi. La confirmation de test peut être ouverte dans l’administration seulement en mode preview ; ces aperçus n’existent pas en mode SMTP.

### Liaison du site

Le formulaire du site utilise `NEXT_PUBLIC_NEWSLETTER_URL` en local, configuré dans `.env.local` ignoré par Git. Pour un export Pages, le code ignore cette adresse et attend `NEXT_PUBLIC_NEWSLETTER_PUBLIC_URL` ; HTTPS requis, aucune URL localhost ou 127.0.0.1 autorisée. Sans adresse publique validée : bouton désactivé et message vrai d’indisponibilité. Le site et le back-office sont deux services : l’export HTML n’installe ni PHP, ni base, ni tâche planifiée. Aucun service privé ne rejoint `out`.

La première transmission est un POST vers `/newsletter/fr/commencer` (ou EN), sans écriture, sans e-mail et avec origine vérifiée. Seuls ces deux chemins de présentation sont exemptés de CSRF. Le vrai POST d’inscription, la confirmation, la désinscription et toutes les actions privées restent protégés. Cookie public `geca_newsletter_session` séparé du cookie d’administration. Aucun secret SMTP, abonné ou jeton privé dans le navigateur du site statique. Le lien signé est envoyé à son destinataire dans le message, pas exposé dans une liste publique.

### Mise en service distante restante

Aucun changement sur Bluehost ou OVH effectué. Avant activation : vérifier PHP web compatible, MySQL maintenu, racine limitée à public, HTTPS et cookies Secure, sauvegarde/restauration de la base **avec la clé APP_KEY existante**. Ne jamais changer cette clé pour installer ce module : elle protège les adresses et les messages chiffrés et signe les liens. Le HMAC d’un même e-mail dépend aussi de cette clé ; une rotation demande une migration préparée, pas un remplacement aveugle. La migration ajoute trois tables et ne supprime aucun contenu existant. Une sauvegarde SQLite locale privée a été créée avant son application.

Configurer sur l’hôte privé : `APP_URL` pour l’adresse réelle Laravel ; `GECA_NEWSLETTER_ORIGINS` avec les seules origines du site autorisées ; `GECA_NEWSLETTER_FROM` avec une adresse d’expédition autorisée ; `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD` et `MAIL_SCHEME` selon la messagerie de l’offre. Aucune valeur distante inventée. TLS requis et délai réseau de 15 secondes ; pas de fallback vers le journal. Vérifier la configuration SPF/DKIM/DMARC du domaine avec les réglages réels de la messagerie, quotas, retours d’échec et réception de tests autorisés avant `GECA_NEWSLETTER_MODE=smtp`. Ne pas coller de mot de passe dans le chat ou les fichiers publics.

Planifier `php artisan schedule:run` chaque minute sur l’hôte, après validation du chemin PHP réel. Le traitement utilise la base et un verrou partagé, dix messages au plus par passage (option bornée à vingt), plafond initial conservateur de trente tentatives SMTP/heure à adapter seulement après vérification des quotas. Commande manuelle : `php artisan geca:newsletter-process --limit=10`. Pas de processus permanent requis ni de nouvelle dépendance. Limites d’inscription : cinq tentatives/minute/IP, deux/jour/adresse normalisée, cent/heure globalement ; une confirmation au plus par adresse par période de vingt-quatre heures. Honeypot complémentaire ; pas une protection anti-abus absolue. Les liens de confirmation expirent après vingt-quatre heures. Nettoyage quotidien des demandes restées non confirmées pendant sept jours ; activer et surveiller réellement le planificateur.

L’administrateur peut supprimer une adresse et ses messages depuis la liste ; les copies présentes dans les sauvegardes privées suivent la politique de conservation à définir avec GECA. Un message déjà remis au serveur ne peut pas être rappelé ; une désinscription annule les messages encore en attente. Pas de suivi d’ouverture, pixel, statistiques de fréquentation ou export public d’abonnés. La gestion des rebonds SMTP et des plaintes, une sauvegarde/restauration distante réelle et la délivrabilité du domaine restent à valider avant ouverture publique.


Les mots utiles : **SMTP** est le serveur qui transmet les e-mails. **TLS** protège la connexion pendant cette transmission. **CSRF** est le code de contrôle qui empêche une autre page de déclencher une action à votre place. **HMAC** est une empreinte calculée avec une clé secrète : elle permet de retrouver une adresse sans mettre cette adresse en clair dans l’index. **APP_KEY** est la clé qui permet de lire les informations chiffrées ; perdre cette clé empêche leur restauration correcte. **SPF, DKIM et DMARC** sont les réglages du domaine qui aident les destinataires à vérifier l’expéditeur. Un **rebond** est un message refusé ou retourné. La **délivrabilité** décrit la capacité des messages à atteindre les boîtes des destinataires.


## Supprimer et retrouver une fiche — 9 octobre 2026

Dans Projets, Actualités ou Équipe, ouvrir la fiche avec « Modifier », puis choisir « Supprimer » sous le formulaire. La page suivante affiche la fiche concernée. Cocher la confirmation et cliquer sur « Confirmer la suppression » ; « Annuler » conserve la fiche. Les listes et compteurs du back-office excluent les fiches supprimées. Dans chaque liste, « Corbeille » permet de les restaurer avec leurs textes et photos.

Supprimer un projet retire aussi ses actualités liées encore présentes ; la confirmation indique leur nombre. Restaurer ce projet récupère seulement les actualités retirées lors de cette même suppression. Une actualité supprimée séparément reste dans sa corbeille. Pour restaurer une actualité liée, son projet doit d’abord être présent.

Les sources, textes enregistrés, photos et révisions restent privés. La corbeille n’efface pas physiquement les fichiers et ne libère pas le quota des médias. Aucune purge définitive ajoutée. L’import de référence ne réintroduit pas les fiches supprimées. L’auteur réel vient de la session ; les suppressions/restaurations ajoutent une révision. Accès administrateur actif, MFA, version de session, CSRF et contrôle du type de fiche obligatoires ; 12 demandes de suppression/restauration par minute et compte. Si la fiche ou une actualité liée change depuis la confirmation, l’opération est refusée. Une erreur d’écriture annule l’ensemble de l’opération.

Migration additive `2026_10_09_000001_add_content_trash.php` appliquée uniquement à la copie locale, après sauvegarde SQLite privée. Ne pas l’inverser sans examen : les marqueurs de corbeille seraient perdus. Les suppressions concernent le back-office ; le site Next.js autonome n’est pas encore relié à ces données. Événements reste retiré, comme confirmé par Gassama. Aucun déploiement distant, envoi réel, compte ou contenu réel supprimé pour les essais.


## Design centralisé — 9 octobre 2026

Style Flat Design 2.0 appliqué à la connexion et aux pages privées : surfaces unies, relief léger, champs visibles et commandes cohérentes. Les réglages sont dans `public/admin-theme.css`, bloc `[data-admin-theme]` : couleurs, police/tailles, arrondis, ombres, espaces et largeurs. `public/admin.css` contient les composants et leur disposition. Guide avec exemples : `../docs/DESIGN-BACKOFFICE.md`. Pour changer l’apparence, modifier le bloc de thème, enregistrer et recharger ; aucune compilation Node requise.

Le composant `resources/views/components/admin-styles.blade.php` charge les deux fichiers CSS locaux, avec une version calculée depuis la modification du fichier. Inclure ces trois fichiers lors d’une future livraison puis reconstruire les vues. Les formulaires newsletter publics gardent la base partagée, sans thème privé. Aucun sélecteur de thème public ou script ajouté. Les protections serveur et le site Next.js restent indépendants de ce thème.


Le menu compact couvre désormais tout l’écran. Croix et Échap pour fermer, en-tête toujours visible et liens à défilement interne. Ouverture/fermeture HTML natives sans script supplémentaire ; navigateur récent nécessaire pour la commande show-modal (support commun depuis décembre 2025). Les réglages menu-background, menu-padding et menu-content-width restent dans le thème central.


## Examiner les écrans sans saisie en local — 10 octobre 2026

Entrée temporaire demandée par Gassama : `http://127.0.0.1:8000/connexion-locale`, bouton « Entrer dans le back-office ». Autorisation du terminal, réservée à 127.0.0.1, à l’environnement local et à la base SQLite du projet. Aucun secret dans le lien. Session d’une heure au maximum ; activation initiale de quatre heures. Désactivée sans les variables du processus, en production ou après expiration. Les droits du compte restent contrôlés sur toutes les pages privées. Guide et fermeture dans `docs/BACKOFFICE.md`.
