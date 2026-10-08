# Back-office GECA — décision du 7 octobre 2026

## Choix validé

Gassama choisit Laravel en PHP avec MySQL pour l’administration. Cette décision remplace la proposition WordPress. Le domaine `globalecoaction.org` est acheté chez OVH ; l’hébergement est l’abonnement Bluehost existant. La capture transmise montre WordPress Plus Hosting, 10 sites sur 20 utilisés avant l’ajout de GECA, et environ 0,99 Go utilisés sur 20 Go.

Le site public Next.js et son design sont conservés. Au début de ce point d’étape, le dépôt local ne contenait aucune application Laravel. La base locale ajoutée lors de la reprise est décrite à la fin de ce document. Une base Laravel est désormais installée sur Bluehost selon les sorties terminal transmises par Gassama (voir le point d’étape ci-dessous). Aucune interface d’administration GECA ni liaison éditoriale n’est encore livrée. Le site Next.js reste fonctionnel avec les données partagées de `src/content/site.ts`.

## Vérifications d’hébergement

Cible envisagée : Laravel 13, qui demande PHP 8.3 minimum et les extensions décrites dans sa documentation. Choisir une version PHP encore maintenue, compatible avec les dépendances effectivement installées. Contrôler PHP utilisé par le site et PHP utilisé dans le terminal : ils peuvent être différents.

Sur l’offre Bluehost réelle, relever :

- Nom de l’offre, emplacement disponible et éventuel site déjà rattaché au domaine.
- Versions PHP disponibles et extensions Ctype, cURL, DOM, Fileinfo, Filter, Hash, Mbstring, OpenSSL, PCRE, PDO, Session, Tokenizer et XML ; pilote `pdo_mysql` pour MySQL.
- Version du serveur MySQL et maintenance assurée par l’hébergeur. La présence de MySQL ne prouve pas que sa version est encore maintenue.
- Accès SSH utilisable et possibilité d’exécuter Composer 2 pour les dépendances, ou d’installer des dépendances préparées dans un environnement compatible.
- Possibilité de diriger le site d’administration uniquement vers le dossier `public` de Laravel, avec écriture réservée aux dossiers nécessaires. Ne jamais exposer la racine du projet, `.env`, les journaux ou les sauvegardes.
- Tâches planifiées disponibles si le fonctionnement retenu en a besoin ; ne pas supposer qu’un processus permanent peut tourner sur une offre mutualisée.
- HTTPS, quotas de stockage, sauvegardes et possibilité de restaurer fichiers et base ensemble.

La documentation publique Bluehost décrit plusieurs générations de serveurs et ne constitue pas une vérification du compte de Gassama. Les opérations distantes ci-dessous ont été exécutées par Gassama, qui transmet les captures et résultats ; elles ne proviennent pas d’une session SSH authentifiée contrôlée par l’agent.

## Liaison avec le site public

Le futur back-office doit fournir les contenus publiés au site Next.js. Pour conserver un site public statique sur Bluehost, une publication devra déclencher une reconstruction et une livraison des fichiers publics dans un environnement de compilation adapté. Le simple ajout d’une base MySQL ne mettra pas à jour les pages existantes.

Cette chaîne reste à réaliser et tester : aucune publication automatique n’est actuellement installée. Elle devra conserver la version publique précédente si la reconstruction échoue, afficher à l’administrateur l’état de publication réel et permettre un retour à la version précédente. Ni secret de livraison ni accès MySQL dans le navigateur.

Le périmètre éditorial initial à détailler reprend les rubriques déjà présentes : actualités, projets, équipe et médias. Ce sont des rubriques envisagées, pas des fonctions livrées. Ne pas ajouter d’articles individuels, de routes de projets, de paiement, d’envoi d’e-mails ou d’autres services par simple effet de ce choix technique.

Les textes authentiques restent prioritaires (`docs/TEXTES-AUTHENTIQUES-CLIENT.md`), avec traductions fidèles FR/EN. Préserver périodes et dates réelles, crédits/licences et mentions « Illustration du thème ». Aucune donnée GECA inventée lors de l’importation.

## Sécurité à intégrer à la réalisation

Contrôler les droits côté serveur pour chaque lecture privée, modification et publication, en utilisant l’utilisateur réellement connecté. Aucun rôle ou propriétaire transmis par le navigateur ne suffit à autoriser une action. Pas d’inscription publique par défaut. Protéger les sessions, les formulaires et les tentatives de connexion ; vérifier la révocation des accès.

Valider et limiter les fichiers par contenu, type et taille ; refuser les fichiers exécutables, traiter les images et retirer leurs métadonnées privées des variantes publiques. Conserver brouillons et originaux privés hors de l’export et du dossier public. Séparer les informations nécessaires au public des données d’administration.

Prévoir sauvegardes de la base et des fichiers, avec restauration testée. Tester les parcours autorisés et refusés : visiteur anonyme, URL directe, utilisateur sans droit, changement de compte et droits révoqués. Ne jamais affaiblir une protection pour réussir un test.

## État de préparation local

Vérification du 7 octobre : PHP CLI 8.5.4 disponible. Composer absent du PATH de cette session ; extensions cURL, DOM, Mbstring, XML et `pdo_mysql` absentes de ce PHP CLI. Ce constat concerne l’environnement de travail, pas Bluehost. Aucune installation système ni application Laravel exécutée, aucun compte créé, aucune migration ou connexion MySQL effectuée.

Les modifications visuelles GECA précédentes restent conservées et non commitées. Ce document ne modifie pas le site, ses routes ou le serveur local. Les opérations distantes effectuées ensuite par Gassama sont consignées ci-dessous.

## Point d’étape distant — 7 octobre 2026

Éléments issus des captures et sorties terminal transmises par Gassama :

- Site vide GECA ajouté sur Bluehost ; racine publique `/home2/fnksrwmy/public_html/website_43934bdf`, avec `.well-known` et `cgi-bin` conservés.
- Enregistrements A du domaine et de `www` dirigés vers `50.6.153.225`. DNS et messagerie maintenus chez OVH. AutoSSL affiché valide pour le domaine et `www` ; cela ne valide pas encore un futur sous-domaine d’administration.
- PHP CLI 8.4.26 ; Composer 2.10.3 installé dans `/home2/fnksrwmy/geca-tools/composer.phar`, après vérification SHA-384 de l’installateur officiel. Le chemin Composer cPanel proposé initialement n’existait pas sur ce compte.
- Laravel Framework 13.35.0 installé dans `/home2/fnksrwmy/geca-backoffice`, hors du dossier public, avec `--no-dev --no-scripts`. Vérification Composer des prérequis installés réussie ; aucun avis de vulnérabilité connu signalé lors de cette installation. Ce résultat ne constitue pas un audit du futur back-office.
- Fichier `.env` préparé avec permissions 600 et génération de clé, consignes `APP_ENV=production` et `APP_DEBUG=false`. Gassama confirme l’enregistrement ; les valeurs privées n’ont pas été transmises. Leur prise en compte par PHP web reste à vérifier avant ouverture.
- Test de connexion MySQL réussi vers `fnksrwmy_geca`, avec zéro table avant migration. Utilisateur configuré : `fnksrwmy_geca_app` ; aucun mot de passe conservé dans cette documentation.
- `php artisan migrate --force` réussi. Les trois migrations de base `create_users_table`, `create_cache_table`, `create_jobs_table` apparaissent exécutées, lot 1, dans `migrate:status`.

### Raccordement web réalisé ensuite le même jour

Gassama a créé `admin.globalecoaction.org` avec la racine `/home2/fnksrwmy/public_html/geca-admin`, puis l’entrée A `admin` vers `50.6.153.225` chez OVH. Après une première erreur de nom de certificat vérifiée à distance, AutoSSL a délivré un certificat valide pour ce sous-domaine. `www.admin.globalecoaction.org` n’est pas utilisé et sa validation DNS n’est pas configurée.

Le test temporaire exécuté par Gassama via HTTPS retourne PHP web 8.4.26 et toutes les extensions contrôlées présentes, dont `pdo_mysql`. Le script comprend la suppression automatique du fichier de test. Les permissions constatées sont 700 pour l’application privée, `public`, `storage` et `bootstrap/cache`, et 750 pour la racine web dédiée avec groupe `nobody` ; aucune ouverture globale des dossiers privés n’a été demandée.

Le raccordement exécuté par Gassama a vérifié en CLI le mode production, le debug désactivé et la présence d’une clé. Il a copié uniquement `.htaccess` depuis Laravel et installé un `index.php` public adapté : base privée obtenue par `dirname(__DIR__, 2).'/geca-backoffice'`, chemins de maintenance/autoload/bootstrap privés, puis `usePublicPath(__DIR__)`. Syntaxe PHP validée avant installation, arrêt prévu si les fichiers publics existent déjà, permissions 644. `.well-known` et `cgi-bin` conservés. Les réglages HTTPS et cookies ont été indiqués pour `.env` sans lecture ni conservation des secrets. L’usage de `usePublicPath` concerne pour l’instant l’entrée HTTP ; harmoniser le chemin public pour les futures commandes CLI et livraisons d’assets avant de construire l’administration.

Vérifications HTTP indépendantes de l’agent après raccordement, le 7 octobre 2026 :

- DNS : `50.6.153.225`. Certificat TLS vérifié avec chaîne de confiance et nom du serveur, valide jusqu’au 5 janvier 2027 à 10:35:33 UTC.
- `/` : HTTP 200 sur HTTPS, marqueur Laravel présent ; `/up` : HTTP 200. Ce sont les pages de base, pas une interface GECA.
- Chemins privés refusés : `/.env` retourne 406, `/.git/config` et `/storage/logs/laravel.log` retournent 403 ; `/composer.json`, `/bootstrap/cache/config.php` et `/vendor/autoload.php` retournent 404. Aucun contenu de ces réponses conservé ni affiché. Le 406 atteste le refus de cette requête, sans attribution certaine à une couche de filtrage particulière.
- Deux cookies observés sur HTTPS avec `Secure` et `SameSite=Lax`, dont un avec `HttpOnly` ; aucune valeur de cookie conservée dans la documentation.
- Lors du premier contrôle, HTTP sans TLS retournait 200 sans redirection ; corrigé ci-dessous. Aucun en-tête `X-Robots-Tag` observé ; prévoir la non-indexation de l’administration, sans la confondre avec un contrôle d’accès.

### Redirection HTTPS vérifiée — 7 octobre 2026

Le bouton cPanel est désactivé avec une indication de certificat manquant pour certains alias ; l’alias `www.admin.globalecoaction.org` est un candidat constaté précédemment, sans confirmation exclusive de la cause. Le certificat du nom utilisé reste valide.

Gassama a exécuté l’ajout d’une règle au début du `.htaccess` de `geca-admin` : destination HTTPS fixe `admin.globalecoaction.org`, redirection 301 lorsque HTTPS est désactivé, exception pour `/.well-known/` afin de préserver les validations de certificat. Les règles Laravel sont conservées. Le script prévoit une sauvegarde privée sous `geca-tools/https-backup-*`, un arrêt si son marqueur existe déjà et une restauration en cas d’échec du contrôle HTTPS `/up`.

Vérification indépendante après exécution : HTTP `/` redirige en 301 vers HTTPS `/` ; HTTP `/up?geca_check=1` redirige en 301 en conservant chemin et paramètre ; HTTPS `/` et `/up` répondent 200 avec certificat vérifié ; HTTPS `/.env` reste refusé en 406. Aucune boucle observée sur ces parcours. La bascule cPanel peut rester sur Off, la règle étant gérée dans le fichier. Aucun changement des autres sites de l’abonnement effectué par ce script.

Restent à vérifier ou réaliser : version du serveur MySQL, sauvegarde/restauration, authentification et autorisations, développement/import des contenus authentiques et chaîne de publication statique. Aucun compte administrateur GECA créé ni parcours d’accès privé applicatif testé à ce stade. Les tests de chemins ci-dessus ne constituent pas un audit complet.

## Références comparées le 7 octobre 2026

- [Laravel — déploiement](https://laravel.com/docs/13.x/deployment) : PHP 8.3 minimum, extensions et racine publique limitée à `public`.
- [Bluehost — versions des logiciels](https://www.bluehost.com/help/article/bluehost-software-and-program-versions) : plusieurs piles serveur avec versions PHP/MySQL différentes ; nécessité d’inspecter l’offre réelle.
- [Bluehost — accès SSH](https://www.bluehost.com/help/article/ssh-access) : accès shell documenté pour des offres mutualisées, avec activation depuis le compte.
- [WordPress — prérequis](https://wordpress.org/about/requirements/) : autre solution PHP/MySQL avec administration éditoriale existante, écartée au profit du choix explicite Laravel de Gassama.

Le benchmarking sert au choix technique, jamais à produire des faits GECA. Expliquer chaque prochaine étape en français simple : ce qui change, pourquoi et comment l’essayer.

## Reprise locale — 7 octobre 2026 (nouveaux contrôles)

L’application locale est désormais dans `backoffice/` : Laravel 13.35.0, verrou Composer ciblant PHP 8.4.26, Blade sans dépendance d’administration supplémentaire. PHP local 8.5.4, extensions Ubuntu et Composer 2.10.3 préparés dans `/tmp/geca-php-tools/` sans installation système. Détails reproductibles dans `backoffice/README.md`. Aucun déploiement distant, commit ou push.

Fonctions construites : connexion/déconnexion sans inscription publique, comptes créés/récupérés/révoqués par saisie masquée en terminal, contrôle administrateur actif et version de session relus en base, limites des tentatives, CSRF, cookies protégés, en-têtes privés et erreurs françaises. Réinitialiser un mot de passe ne réactive pas un compte révoqué. Aucun compte de démonstration ni e-mail envoyé.

24 références authentiques importées depuis `src/content/site.ts` : 7 projets, 9 archives, 8 membres. Les archives liées à un projet ouvrent le projet commun. Édition FR/EN des textes existants en brouillons privés avec source conservée, note de provenance, historique et auteur serveur ; conflits refusés. Aucune publication vers Next.js, création/suppression de fiche ou gestion visuelle des révisions à ce stade. Fichiers privés non servis. `GECA_PUBLIC_PATH` prévoit l’harmonisation du chemin public HTTP/CLI depuis la configuration sans remplacement de l’entrée HTTP distante.

Premiers contrôles réalisés : 23 tests PHP / 184 assertions réussis, Pint et validation stricte Composer réussis, audit sans avis connu. Contrôles Chrome avec profil/base/cache/compte jetables : connexion, CSRF réel (419), brouillon, révocation (403), sans JavaScript, 320/768/1440 px, texte 200 %, axe sans violation sur les écrans testés. Captures examinées. SQLite/PHP 8.5.4 uniquement : ce ne sont pas des essais MySQL/PHP web Bluehost. La base de travail locale conserve zéro compte et zéro brouillon de test, seulement les 24 références. Les essais du site public lancés juste avant l’interruption n’ont pas fourni de résultat final récupérable : ne pas les compter comme réussis.

Lint, TypeScript et build Webpack Next ont réussi. Le dossier PHP est exclu de ces deux analyses, sans retirer leurs contrôles sur le site. Serveur du port 3000 confirmé par PID et dossier GECA puis redémarré ; `/fr` et CSS HTTP 200. Le design, les contenus et médias publics restent inchangés. Aperçu local de connexion préparé sur `127.0.0.1:8000/connexion`. Paquet de code avec manifeste préparé, excluant secrets, base, journaux, `vendor`, entrée HTTP et `.htaccess` Bluehost ; aucune extraction distante autoréalisée. Documentation et paquet seront actualisés après les prochains travaux.

### Résultat distant transmis par Gassama pendant cette reprise

```text
MySQL : 8.0.46-37
Images GD : présent
Lock SHA256 : 6b13b9fa143b9d9afd308044494e7940302b68f2b503c6252f892402b0f57e17
```

Résultat cPanel fourni par Gassama, pas une session SSH de l’agent. GD concerne PHP CLI ; vérifier aussi PHP web avant les médias. Verrou local `4dcefa38a47c398c56f6c44da852dac9c803e0e9a489b1443decada87b5d6740` différent du distant : comparer les paquets avant livraison. La différence ne prouve pas une incompatibilité.

La chaîne MySQL correspond à la version Percona du 10 juin 2026, annoncée comme dernière de la série 8.0 en fin de vie. Le fournisseur exact reste déduit de cette chaîne, pas confirmé par `version_comment`. Un support post-EOL existe ; sa couverture sur ce serveur Bluehost n’est pas établie. Confirmation demandée à Gassama auprès du support avant la mise en service. Aucun changement du serveur partagé ou des autres sites. Aucune faille exploitable ou compromission particulière affirmée. Développement local poursuivi ; sauvegarde/restauration distante, comparaison de code et essais PHP web/MySQL restent à réaliser.

Nouvelles requêtes publiques de l’agent : HTTP `/`, HTTPS `/up` et `/.env` répondent 406 depuis les clients utilisés (également avec identification de navigateur). Anciens succès 200/301 non reconfirmés ; origine du filtrage inconnue. Aucun contenu privé lu, aucune protection changée.

### Suite après « on continue » — 7 octobre 2026

Les outils temporaires et serveurs avaient disparu avec l’interruption. Laravel et ses dépendances sont restés présents : aucune réinstallation de l’application. Extensions PHP désormais extraites dans `backoffice/.local-tools/` (ignoré par Git) avec lanceur local ; aucune installation système. Serveur public relancé sur `127.0.0.1:3000` à partir du build vérifié, serveur du back-office sur `127.0.0.1:8000`. La commande de création locale est `cd "/home/mohamed-gassama/Desktop/Projets Clients/geca/backoffice" && .local-tools/php artisan geca:admin create` ; les saisies restent dans le terminal, mot de passe masqué.

La rubrique Médias dispose maintenant d’un formulaire et d’une bibliothèque privée. Original JPEG/PNG/WebP limité à 6 Mo, 12 millions de pixels, 6 000 pixels par côté, mémoire disponible contrôlée avant décodage. MIME réel, extension, décodage et noms vérifiés ; formats non nécessaires et signatures PHP refusés. Aperçu GD WebP recréé à 1 280 px maximum, sans copie des métadonnées. Source, licence/autorisation et descriptions FR/EN obligatoires, crédit facultatif et mention d’illustration explicite. Aucun nouveau fait GECA ni photo ajouté aux contenus publics.

Originaux en `.bin` et aperçus sous UUID serveur, dans `storage/app/private/media`. Droits privés explicitement demandés lors de chaque écriture ; fichiers 600 vérifiés. Aucun accès web aux originaux. Aperçus soumis au même contrôle d’administrateur actif à chaque lecture ; auteur de l’envoi issu du compte connecté, pas du formulaire. Envoi limité à 4/minute/administrateur ; quota propre GECA de 200 fichiers média et 256 Mio cumulés, incluant les fichiers orphelins éventuels. Verrou commun pour les écritures. Envoi désactivé par défaut avec `GECA_MEDIA_UPLOADS_ENABLED=false`, activation locale seulement ; vérifier GD HTTP, limites PHP et permissions avant activation distante. Absence d’antivirus documentée ; le réencodage et la validation ne constituent pas une garantie absolue. Orientation à vérifier dans l’aperçu. Les médias existants du site ne sont pas déplacés.

Validation finale de cette étape : **33 tests PHP, 251 assertions**, Pint réussi. Tests navigateur répétés avec envoi d’une image artificielle réservée aux tests, affichage privé autorisé et aperçu anonyme refusé ; mêmes tailles, 200 %, axe et sans JavaScript. Stockage/base/cache/compte du navigateur jetables et supprimés. Captures Médias mobile/ordinateur examinées. Deux tests existants Next des routes FR/EN et accès refusés passent après l’interruption. Le paquet privé contient désormais 53 fichiers avec manifeste ; il n’a pas été livré. Les trois nouvelles migrations restent additives et locales.

La demande de confirmation du support prolongé MySQL a été transmise à Gassama ; aucune réponse Bluehost reçue à ce stade, aucun message envoyé directement par l’agent. La suite distante reste conditionnée à cette réponse, à la comparaison des dépendances et à la sauvegarde/restauration testée. La publication vers le site, l’affectation des nouveaux médias aux contenus, la création/suppression de fiches et la gestion visuelle des révisions restent à construire. Les références et brouillons actuels sont uniquement locaux ; ne pas qualifier l’administration complète de terminée.

### Erreurs de connexion sous les champs — 7 octobre 2026

À la demande de Gassama, le bandeau récapitulatif disparaît uniquement du formulaire de connexion. Erreurs de saisie sous l’adresse et/ou le mot de passe ; refus d’identifiants sous le mot de passe, avec le même texte générique pour compte absent, inactif, non administrateur ou mauvais mot de passe. Clé interne `credentials` distincte des erreurs de format. Messages reliés aux champs par `aria-describedby`, état invalide et bordure rouge ; focus sur le premier champ à corriger. Validation serveur utilisée pour afficher aussi les champs vides sous leurs champs (bulles natives désactivées avec `novalidate`), attributs `required` conservés. Adresse conservée, mot de passe jamais réaffiché.

Vérifications : 23 tests d’authentification/gestion réussis (185 assertions), Pint et compilation Blade réussis. Tests Chrome existants complétés : champs vides, adresse mal formée, identifiants refusés, absence du bandeau, messages réellement sous les champs, focus, 320/1440 px, texte 200 % et sans JavaScript ; autres parcours du script conservés et réussis. Capture mobile examinée. Aperçu réel du port 8000 et CSS vérifiés avec la version courante ; `/fr` et styles du port 3000 disponibles. Aucune modification des comptes existants, du site Next ou des protections d’accès. Paquet local de code actualisé ; aucun commit, push ou déploiement distant.

### Vérification des tentatives et des accès — 7 octobre 2026

À la demande de Gassama, lecture du code et contrôles supplémentaires sans changement des comptes ni de la politique de connexion. Limites existantes confirmées : 5 tentatives/minute/adresse e-mail normalisée et 20/minute/IP. La sixième est refusée jusqu’à expiration de la fenêtre de 60 secondes ouverte par la première tentative, même avec le bon mot de passe. Changer de session, d’IP ou la casse de l’adresse ne réinitialise pas le compteur du compte ; faux en-têtes X-Forwarded-For et X-Real-IP n’évitent pas le compteur réseau dans la configuration actuelle. Après expiration, un compte autorisé peut se connecter. Aucun verrouillage permanent automatique.

Suite complète locale : 36 tests / 329 assertions réussis ; Pint réussi. Elle couvre aussi connexion autorisée, rotation de session, accès direct anonyme/non-admin, révocation, changement de mot de passe, CSRF et refus sur contenus/médias. Configuration locale effective contrôlée par une liste fermée sans secrets : debug désactivé, cache et sessions en base, session 30 minutes, HttpOnly, SameSite=Lax. Secure désactivé uniquement pour l’aperçu HTTP sur boucle locale ; la valeur de production devra rester vraie et être vérifiée sur HTTPS. Aucun déploiement distant réalisé.

Avant mise en service robuste : ajouter une seconde preuve de connexion (MFA) avec récupération protégée, organiser une surveillance des connexions sans mots de passe ni jetons dans les journaux, vérifier configuration/cookies/limitations effectives chez Bluehost, confirmer maintenance MySQL et tester sauvegarde/restauration. La limitation ralentit les essais automatisés, mais ne protège pas seule d’un mot de passe déjà volé. Pas d’audit indépendant ni de validation de résistance à une attaque réseau massive revendiqués. Benchmark et limites détaillés dans `docs/BENCHMARK.md`.


### Tableau de bord avec menu latéral — validation du 7 octobre 2026

Après examen de l’image proposée, Gassama valide sa mise en place. Layout Blade commun : logo GECA local, navigation gauche sur grand écran, état courant dans les listes et les formulaires, nom du compte connecté échappé, lien vers le site dans un nouvel onglet et déconnexion POST avec CSRF. La page d’accueil reprend les cartes, couleurs et état de préparation de l’image. Le lien du site vient de `GECA_PUBLIC_SITE_URL` dans la configuration de confiance : aperçu local sur le port 3000, valeur de production par défaut `https://globalecoaction.org`. Aucun paramètre du navigateur ne contrôle cette destination.

Compteurs calculés depuis `content_entries` par `DashboardController`, après les mêmes contrôles auth/admin/auth.session. Pas de nombre constant : zéro avant import, puis les groupes réels. Le logo transparent WebP reprend le dérivé déjà utilisé par le site ; copie publique fermée `brand/geca-logo.webp`, sans donnée privée. L’archive de code inclut explicitement le CSS et ce logo, jamais le dossier public complet. Aucune dépendance supplémentaire ni JavaScript.

Sur les écrans étroits ou avec texte doublé, une ouverture native `details/summary` permet de déployer le menu en restant au clavier et sans JavaScript. Navigation réutilisée dans les deux présentations ; la variante masquée ne reçoit pas le focus. Le menu n’est pas modal et ne bloque pas le reste de la page. Le menu latéral reste dans la vue par position sticky ; sa propre liste défile si sa hauteur manque. Une requête CSS de conteneur compare la place disponible à la taille du texte réelle ; un navigateur sans cette prise en charge garde le menu compact. Pas d’assouplissement de la politique restrictive des ressources.

Validation finale locale : 38 tests PHP / 339 assertions réussis, Pint et compilation Blade réussis, diff sans erreur d’espacement. Contrôles Chrome avec compte et base jetables : 320/768/1440 px, menu ouvert/fermé par clavier, état courant, barre latérale pendant le défilement, texte à 200 % sur 320 et 1440 px, accès à l’Équipe et déconnexion sans JavaScript. Axe n’a signalé aucune violation sur les états vérifiés. Brouillons, CSRF réel, médias privés, accès anonyme et révocation toujours vérifiés. Un défaut de repère sémantique du menu mobile et la bascule avec texte agrandi ont été détectés puis corrigés sans retirer les contrôles. Captures ordinateur et mobile examinées. Aperçu du port 8000 : connexion, CSS courant et logo HTTP 200 ; accueil du port 3000 disponible. Paquet privé de code actualisé : 57 fichiers autorisés, nouveau contrôleur, vues et logo inclus ; ni secrets ni données de travail. Aucun commit, push ou déploiement distant. La publication, le second facteur, les essais MySQL/PHP web et la sauvegarde/restauration distante restent hors de cette réalisation visuelle.


## Newsletter interne — réalisée en local le 8 octobre 2026

Choix de Gassama : gestion interne d’abord lorsque pertinente et de bonne qualité. Nouveau module `/administration/newsletter`, protégé par les contrôles administrateur actif et version de session existants. Liste GECA commune privée, adresses chiffrées, clé de recherche HMAC, dates de demande/confirmation/désinscription et version du texte de consentement. Seul le créateur réel connecté peut modifier, autoriser ou arrêter sa campagne ; le travailleur vérifie encore son compte actif et ses droits. Rédaction en texte simple FR ou EN, aperçu échappé, conflits de révision refusés, validation explicite du message enregistré avant préparation. Aucun abonné ni contenu réel ajouté par l’agent.

### Essayer maintenant

1. Ouvrir `http://127.0.0.1:3000/fr`, saisir une adresse dans le bandeau et choisir S’abonner.
2. La page GECA locale sur le port 8000 demande l’accord et précise le mode test. Confirmer la demande.
3. Se connecter à `http://127.0.0.1:8000/administration/newsletter` avec le compte administrateur existant. Aucun mot de passe n’a été changé.
4. Dans Traitements récents, ouvrir le message de test puis son lien de confirmation. Une action explicite confirme l’adresse.
5. Rédiger une newsletter, enregistrer le brouillon, vérifier l’aperçu et cocher l’accord de préparation. Choisir Préparer la simulation puis Traiter la simulation depuis la liste.
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

## Double authentification locale — 8 octobre 2026

Gassama autorise l’étape Authenticator avec codes de secours. La protection est obligatoire sur les comptes administrateurs, même si GECA n’utilise qu’un compte. Les autres protections ne sont pas supprimées. Cette réalisation choisit l’application Authenticator ; les clés de sécurité physiques WebAuthn ne sont pas encore proposées.

### Activer votre téléphone

1. Ouvrir [la connexion locale](http://127.0.0.1:8000/connexion). Utiliser vos identifiants habituels.
2. Dans une application Authenticator déjà installée, ajouter un compte puis scanner le QR code affiché. Si le scan n’est pas possible, ouvrir « Ajouter le compte sans scanner » et saisir la clé dans l’application en choisissant un code basé sur le temps.
3. Saisir le code de six chiffres affiché pour Global EcoAction, puis choisir « Activer la double authentification ».
4. Conserver les dix codes de secours dans un endroit sûr, séparé du téléphone. Ils ne sont affichés qu’une fois. Ne pas les envoyer dans le chat, par e-mail ou dans une capture partagée.
5. Cocher « J’ai conservé mes codes de secours », puis entrer dans votre espace.

Lors des connexions suivantes, saisir le mot de passe puis un code Authenticator. Chaque code change normalement toutes les trente secondes. Un code déjà utilisé est refusé : attendre le suivant. L’étape après le mot de passe expire au bout de cinq minutes ; recommencer si nécessaire. L’heure automatique du téléphone et celle du serveur doivent être correctes.

### Si votre téléphone n’est pas disponible

Après le mot de passe, ouvrir « Utiliser un code de secours ». Chaque code de secours ne fonctionne qu’une fois. Dans « Sécurité du compte », créer une nouvelle liste si nécessaire : le mot de passe actuel et une seconde preuve sont demandés. Les anciens codes et les autres sessions sont annulés. Le nouveau jeu est affiché seulement dans la réponse de création.

Si la page des premiers codes est actualisée avant leur conservation, ils ne sont pas affichés de nouveau. Revenir à la connexion, utiliser Authenticator et créer une nouvelle liste dans Sécurité du compte. Ne pas retirer la protection pour résoudre ce cas.

### Perte du téléphone et de tous les codes

Pas de récupération publique par simple e-mail. Le responsable disposant de l’accès au terminal privé doit vérifier hors ligne l’identité et l’autorisation réelle de la personne avant toute récupération. La commande interactive est :

```bash
cd "/home/mohamed-gassama/Desktop/Projets Clients/geca/backoffice"
.local-tools/php artisan geca:admin recover-mfa
```

Cette commande demande une confirmation explicite de la vérification d’identité, puis un nouveau mot de passe masqué et sa confirmation. Elle annule le téléphone enregistré, les codes de secours et les sessions, et impose une nouvelle activation à la prochaine connexion. Un compte révoqué reste révoqué. Cette opération exceptionnelle ne doit jamais être exécutée simplement sur demande d’un e-mail ; l’accès au terminal est un accès de confiance à protéger. La commande `reset` existante change seulement le mot de passe et conserve le second facteur.

### Conservation des données

Migration additive locale, précédée d’une sauvegarde SQLite privée à droits 600. Empreinte des comptes avant/après identique sur identifiants, noms, adresses, mots de passe, droits et versions de session. Aucun téléphone configuré par l’agent pour le compte réel. Garder la clé APP_KEY existante : elle chiffre le secret Authenticator et les données privées déjà présentes. Ne pas la remplacer pendant une installation ou une restauration. Les sauvegardes contiennent les informations de sécurité privées et doivent rester hors du dossier public.

Benchmark et limites de dépendances dans `BENCHMARK.md`. Déploiement distant non effectué ; vérifications Bluehost/MySQL, HTTPS effectif et restauration distante restent nécessaires.

### Vérifications réellement terminées

81 tests PHP / 782 assertions réussis, dont activation, code incorrect/expiré/réutilisé, secours à usage unique, étape de cinq minutes, révocation et mot de passe changé pendant cette étape, mauvais compte, anciennes sessions sans MFA, CSRF, limitation par compte malgré changement d’IP, régénération et récupération terminal refusée/confirmée. Test de sauvegarde SQLite jetable avec restauration et déchiffrement du secret Authenticator au moyen de la clé existante ; intégrité de la copie locale et droits 600 vérifiés. Les contrôles des contenus, médias et newsletter restent dans la suite.

Pint, compilation Blade, validation Composer stricte et simulation d’installation réussis. Suite Chrome complète réussie avec compte/base/cache/storage jetables : activation et secours, régénération sans JavaScript, contrôles CSRF réels, révocation, 320/768/1440 px, texte 200 %, brouillons, médias privés et newsletter simulée. Axe ne signale aucune violation sur les états examinés ; son analyse est séparée du navigateur sans JavaScript, car l’outil nécessite JavaScript. Les parcours sans JavaScript sont réellement parcourus. Captures d’activation et de secours examinées, QR/clé/codes masqués. Aucun essai avec le téléphone réel de Gassama ou une clé physique ; scan réel à effectuer pendant son activation.

Serveur utilisé par Gassama : connexion et CSS courants vérifiés sur `127.0.0.1:8000`, sans toucher au serveur distant. Accueil `/fr` et styles HTTP 200 sur `127.0.0.1:3000`. Archive privée de code actualisée, sans secrets/base/vendor ; aucune livraison distante, aucun commit/push.
