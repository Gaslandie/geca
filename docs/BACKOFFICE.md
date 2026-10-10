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

24 références authentiques importées depuis `src/content/site.ts` : 7 projets, 9 archives, 8 membres. Les archives liées à un projet ouvrent le projet commun. Édition FR/EN des textes existants en brouillons privés avec source conservée, note de provenance, historique et auteur serveur ; conflits refusés. Lors de cette étape initiale, aucune création/suppression de fiche : ces fonctions locales sont ajoutées dans les étapes documentées ci-dessous. Publication vers Next.js et gestion visuelle des révisions encore absentes. Fichiers privés non servis. `GECA_PUBLIC_PATH` prévoit l’harmonisation du chemin public HTTP/CLI depuis la configuration sans remplacement de l’entrée HTTP distante.

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

La demande de confirmation du support prolongé MySQL a été transmise à Gassama ; aucune réponse Bluehost reçue à ce stade, aucun message envoyé directement par l’agent. La suite distante reste conditionnée à cette réponse, à la comparaison des dépendances et à la sauvegarde/restauration testée. À cette étape, l’affectation des nouveaux médias et la création/suppression de fiches restent à construire ; les étapes suivantes documentent leur réalisation locale. La publication vers le site et la gestion visuelle des révisions restent absentes. Les références et brouillons de cette étape sont uniquement locaux ; ne pas qualifier l’administration complète de terminée.

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


## Formulaires : audit de la version locale — 9 octobre 2026

Corrections UX du Contact statique : erreurs FR/EN sous les champs, résumé avec liens clavier, conservation de saisie, compteur et modification de l’aperçu. Aucun message Contact collecté ou envoyé. Newsletter Laravel : erreurs serveur traduites, adresse de taille bornée et accord conservés après refus, destination GET fixe dans la langue, liens de confidentialité et retour corrigés. En-têtes et contrôles serveur conservés ; aucune mise en service SMTP ou distante. Les protections limitent les abus ; elles ne garantissent pas l’absence d’attaque. Hébergement, configuration de messagerie, quotas réels, surveillance et sauvegarde/restauration distante restent à valider avant ouverture publique.

Validation locale : TypeScript, lint sans avertissement et compilation webpack réussis. Douze tests Contact passent : FR/EN, résumé et erreurs, saisie conservée, nom international, tailles et sujet forcés refusés, HTML affiché sans exécution, absence de transmission/stockage, effacement avec focus, clavier, sans JavaScript et cinq largeurs de 320 à 1440 px à 200 %. Axe sans violation sur les états initial et erreur du Contact. Suite Laravel complète finale : 86 tests / 855 assertions, Pint et compilation Blade réussis ; comprennent les parcours autorisés/refusés, CSRF, origine, accès anonyme/autre compte/révocation, sauvegarde SQLite jetable et déchiffrement, limitations et erreurs d’inscription nouvelles. Tests PHP sur base jetable, aucune base de travail réinitialisée.

Contrôles navigateur réels : newsletter FR/EN sans JavaScript, erreur et focus vers le résumé puis le champ, réponses conservées, langue des liens et absence de débordement à 200 %. Requêtes sans CSRF refusées en 419, pont avec origine non autorisée refusé en 403, CSP conservée. Tentative d’ajout d’une feuille inline par le test bloquée par CSP ; méthode de mesure corrigée via CSSOM, protection jamais désactivée. Captures de Contact et newsletter examinées ; serveur local Next sur 127.0.0.1:3000 et Laravel sur 127.0.0.1:8000 avec version courante, accueil et styles disponibles. Les contrôles ne couvrent pas une attaque réseau massive, un audit indépendant ou la production Bluehost. Contact reste un aperçu ; SMTP reste en simulation. Aucun commit, push, déploiement ou e-mail réel.

Compléments finaux : les refus publics newsletter 403/404/419/429 restent dans le parcours public FR/EN avec en-têtes et Retry-After conservés ; repli natif du Contact vers un POST fermé, sans saisie dans la query string. Les deux tests de refus publics supplémentaires passent. Axe sans violation sur l’état d’erreur newsletter sur ordinateur ; état expiré réel 419 et retour public EN vérifiés. Aucun envoi ni inscription réelle effectués pendant ces contrôles.

## Modifications réellement vérifiées — 9 octobre 2026

Tous les champs FR/EN de Projets, Actualités indépendantes et Équipe ont été changés sur base jetable, enregistrés puis relus après sortie de la fiche, rechargement et ouverture dans un nouveau contexte navigateur authentifié. Stockage et historique vérifiés indépendamment ; sources d’origine intactes. Photos ajoutées dans les trois rubriques, une photo remplacée puis relue, texte et photo modifiés sans JavaScript. Aucun contenu de la base de travail changé par ces essais.

Correction des actualités liées : leurs titres dans la liste et au-dessus du formulaire suivent désormais le projet associé modifié, comme leurs champs le faisaient déjà. Leur texte reste modifiable depuis le projet associé ; photo propre à l’actualité conservée. Protection contre le HTML et contrôle serveur des liens inchangés.

88 tests PHP / 897 assertions, Pint, compilation Blade et suite navigateur complète passent. La limite existante de quatre photos par minute a réellement refusé le cinquième envoi rapide ; le test a attendu le délai Retry-After puis enregistré avec succès, sans désactiver la protection. Serveur local et dossier de stockage contrôlés. Ces vérifications ne mettent pas en place la liaison de publication vers le site public et ne constituent pas des essais Bluehost/MySQL. Aucun commit, push ou déploiement.

## Voir une photo avant l’enregistrement — 9 octobre 2026

Dans Projets, Actualités et Équipe, choisir une photo JPEG, PNG ou WebP affiche son aperçu sous le champ du fichier. La photo actuelle reste visible au-dessus. « Annuler le choix de la photo » retire le nouveau fichier ; la photo enregistrée est conservée. La nouvelle photo n’est envoyée qu’en cliquant sur « Enregistrer les changements ». Remplir aussi « Que montre la nouvelle photo ? » avant d’enregistrer.

L’aperçu reste dans le navigateur, sans transmission ni stockage. Formats, taille et dimensions sont vérifiés pour aider à choisir ; le serveur garde ses propres contrôles obligatoires. Un script local autorisé seulement sur ces formulaires permet l’aperçu. Les autres écrans conservent leur interdiction de scripts. Sans JavaScript, le formulaire reste utilisable et la photo est visible après l’enregistrement.

Vérifié sur base jetable : 89 tests PHP / 924 assertions et parcours Chrome complets réussis, choix/annulation sans requête ou écriture en base, formats invalides refusés, protections d’accès et CSRF conservées. Aperçu à 320/375/1440 px et texte 200 % sans débordement, contrôle automatique d’accessibilité réussi, capture mobile examinée. Script et styles actuels disponibles sur le serveur local 8000 ; accueil et styles 3000 disponibles. Aucun contenu réel changé par les essais.


## Suppression et corbeille des contenus — 9 octobre 2026

Gassama confirme le périmètre : Projets, Actualités et Équipe ; Événements reste retiré. Ouvrir une fiche avec « Modifier », choisir « Supprimer » sous le formulaire, relire la confirmation puis cocher l’accord et confirmer. « Annuler » ne change rien. Les fiches retirées disparaissent des listes et compteurs privés. Le lien « Corbeille » de chaque liste permet la restauration, avec les textes et photos enregistrés.

Un projet emporte ses actualités liées encore présentes ; leur nombre est indiqué avant confirmation. La restauration du projet remet uniquement les actualités supprimées avec lui lors de cette opération. Les actualités supprimées séparément restent en corbeille. Une actualité liée ne se restaure pas tant que son projet est supprimé. Les membres concernés sont les fiches Équipe ; les comptes administrateurs restent gérés par les commandes protégées existantes.

Sources, révisions et photos restent privées et intactes ; aucune purge définitive ni suppression physique des médias. Ils continuent de compter dans le quota. L’import tient compte de la corbeille et ne ressuscite pas les références. Suppression et restauration enregistrées dans l’historique avec l’administrateur issu de la session. Transactions pour éviter une opération partielle ; conflits de révision et changements des actualités liées refusés, ordre de verrouillage projet puis actualité conservé pour les éditions/restaurations associées. Droits et session/MFA relus côté serveur, CSRF obligatoire, type et identité de la fiche contrôlés, limitation 12 demandes/minute/compte. Aucun identifiant de compte ou liste d’actualités reçu du navigateur n’accorde de droit.

Migration additive locale : date de suppression, administrateur et identifiant de l’opération. Sauvegarde privée SQLite préalable, intégrité vérifiée et permissions 600. Après les essais, comparaison de toutes les anciennes colonnes avec cette sauvegarde : comptes, contenus, révisions, médias, abonnés, campagnes et messages réels inchangés ; tous les nouveaux marqueurs de corbeille sont nuls sur la base de travail. Aucun reset ou suppression de donnée réelle. Les états antérieurs de ce document qui indiquent une suppression encore absente sont désormais remplacés pour ce périmètre local.

Validation : 98 tests PHP / 1144 assertions, Pint, compilation Blade et suite Chrome réussis sur bases/comptes/stockages jetables. Suppression, annulation, accord obligatoire, récupération et conservation des sources/photos dans les trois rubriques ; cascade exacte, actualité indépendante conservée en corbeille et restauration par un autre administrateur GECA autorisé. Accès anonyme/non-admin/inactif, session périmée, MFA absent, mauvais type/ID, CSRF, confirmation périmée, doubles demandes et limitation refusés. Échecs forcés d’historique : aucune suppression/restauration partielle. Parcours sans JavaScript, 320/1440 px et texte 200 %, alignements et axe vérifiés ; captures examinées. Routes privées et styles courants sur 127.0.0.1:8000, accueil et CSS 127.0.0.1:3000/fr disponibles. Liaison/publication vers le site, purge définitive et essais MySQL/Bluehost non réalisés. Aucun commit, push ou déploiement.


## Flat Design 2.0 et changement rapide de style — 9 octobre 2026

Gassama demande le Flat Design 2.0 et sa centralisation. Connexion, double authentification et pages privées utilisent désormais des surfaces unies, un fond neutre, de légères ombres et des commandes distinctes. Titres/actions centrés, cartes avec mêmes marges, boutons Modifier uniformes et menu mobile superposé conservés. Les champs gardent un contour visible et le clavier garde son repère ; mouvement réduit respecté.

Le fichier `backoffice/public/admin-theme.css` rassemble les réglages visuels. Son bloc `[data-admin-theme]` permet de modifier couleurs, arrondis, relief, typographie et espaces sans reprendre les pages. `admin.css` garde la disposition et les composants. Le composant Blade commun charge ces deux CSS locaux avec une version liée à leur modification ; simple rechargement après changement CSS local, sans compilation Node. La base des formulaires newsletter publics reste séparée du style privé. Guide pratique dans `docs/DESIGN-BACKOFFICE.md`. Aucun contenu, droit, secret, route, validation, fichier ou compte changé par le thème ; aucune bibliothèque ni script ajouté.

Validation finale : 98 tests PHP / 1144 assertions et compilation Blade réussis. Suite Chrome complète réussie sur base/compte/stockage jetables : comparaison des styles calculés après modification de variables communes, propagation aux cartes, navigation, police, champs et commandes du dashboard et d’un formulaire, retour au thème courant après l’essai. Contrôles de contraste axe sans violation dans les états examinés ; mobile/ordinateur, 320 à 1440 px, texte 200 %, menu superposé, alignements, édition, aperçu photo, suppression/restauration, MFA, codes de secours et parcours sans JavaScript conservés. Captures dashboard mobile/ordinateur, newsletter et aperçu photo examinées. CSS et thème finaux réellement servis sur 127.0.0.1:8000, liens versionnés et CSP self sans unsafe-inline vérifiés ; routes privées redirigées pour un anonyme. Accueil et styles 127.0.0.1:3000/fr HTTP 200. Anciennes colonnes des comptes/contenus/révisions/médias/newsletters comparées à la sauvegarde privée : données de travail inchangées. Aucun compte ou contenu réel changé, e-mail, déploiement, commit ou push. Essais locaux Chrome ; aucune validation distante Bluehost ou audit d’accessibilité humain complet.


## Menu plein écran — 9 octobre 2026

À la demande de Gassama, le bouton Menu du back-office ouvre désormais une surface qui couvre tout l’écran. Le logo et la croix restent dans son en-tête ; les liens et la déconnexion défilent dans le panneau inférieur sur les écrans courts. Le contenu derrière ne bouge pas et ne reçoit ni clic ni focus. Échap ou la croix ferment le panneau, avec retour au bouton Menu. Le menu latéral reste présent sur grand écran ; le panneau reste utilisable si l’écran grandit pendant son ouverture.

Dialogue HTML natif et commande show-modal, fermeture par formulaire dialog : aucun script ou changement de CSP. Les protections d’accès et le POST/CSRF de déconnexion sont conservés. Fond, marges et largeur des liens dans le fichier de thème commun. Support des commandes HTML dans les versions actuelles des navigateurs depuis décembre 2025 selon MDN ; Chrome 154 utilisé localement, anciens navigateurs non couverts. Référence Lizzirenedeco non accessible via l’outil web, aucune observation de son menu inventée. Guide actualisé dans docs/DESIGN-BACKOFFICE.md.

Validation finale : 98 tests PHP / 1144 assertions et compilation Blade réussis. Suite Chrome complète réussie sur base, compte et stockage jetables : menu de dimensions exactes 100 % du viewport à 320/375/768/1024 px et texte à 200 %, écrans courts 320×568, 927×835 et paysage 640×360. Contenu derrière de mêmes dimensions et position avant/après ouverture ; focus initial sur la croix, focus du contenu derrière refusé, Échap et bouton de fermeture avec retour au déclencheur. Le test distingue le focus sur les commandes de Chrome de celui des éléments GECA derrière le dialogue ; aucune protection désactivée. Contrôle de visibilité du dernier bouton avec une tolérance d’un pixel pour l’arrondi du défilement natif ; une première mesure dépassait de 0,156 px à 200 %. Le test d’alignement des cartes mesure désormais la largeur réelle du conteneur qui réserve la place de la barre de défilement, au lieu de supposer la largeur entière de la fenêtre.

Ouverture plein écran, fermeture Échap/croix, navigation Équipe et déconnexion POST réellement parcourues sans JavaScript. Axe sans violation sur les états examinés ; captures mobile, tablette et texte 200 % examinées. Parcours d’édition/photos privées, suppression/restauration, newsletter simulée, MFA/secours/révocation et refus CSRF conservés. Serveur de Gassama 127.0.0.1:8000 avec vues recompilées et CSS courant ; CSP sans unsafe-inline et accès privé redirigé pour un anonyme. Accueil et styles 127.0.0.1:3000/fr HTTP 200. Comparaison avec la sauvegarde antérieure : contenus, révisions, médias et newsletters inchangés ; seules updated_at et two_factor_last_step d’un compte ont évolué, compatibles avec son utilisation locale pendant le travail. Aucun compte, rôle, secret ou contenu réel modifié par l’agent. Aucun envoi, commit, push ou déploiement. Navigateurs anciens, Safari/Firefox et lecteurs d’écran non testés ici ; commande HTML récente requise.

## Code e-mail de connexion — 10 octobre 2026

Gassama remplace Authenticator par mot de passe puis code à six chiffres envoyé à l'adresse de connexion enregistrée. Émetteur et réglages Bluehost fournis : contact@globalecoaction.org, serveur globalecoaction.org, SMTP SSL/TLS port 465, authentification obligatoire. Ils concernent seulement l'envoi des codes ; les coordonnées publiques GECA restent inchangées. Mot de passe de la boîte jamais demandé dans le chat.

Mode `GECA_LOGIN_VERIFICATION=email` par défaut dans la nouvelle version. Ancien mode `authenticator` conservé seulement par configuration serveur pour un retour contrôlé ; aucun choix/fallback dans le navigateur. Preuves de session des deux modes distinctes : anciennes sessions Authenticator refusées en mode e-mail. Champs Authenticator, comptes et APP_KEY conservés. Les pages de QR, activation et secours répondent 404 en mode e-mail ; page Sécurité adaptée.

Code cinq minutes, usage unique consommé sous verrou de l'utilisateur, empreinte HMAC avec clé serveur et identifiant aléatoire de challenge. Table privée `login_email_challenges` ; aucun code en clair en base, session, URL, flash ou journal. Liaison par secret aléatoire privé de session (conservé lors d'une rotation légitime d'identifiant), compte, adresse, mot de passe et version. Nouveau code invalide le précédent. Cinq essais par challenge et budget par compte sur cinq minutes ; limites IP existantes conservées, formats invalides comptés, un envoi par minute après le bon mot de passe. Code validé/transaction confirmée avant création de session privée. Droits/compte actif/version/adresse et preuve e-mail relus sur chaque accès privé. Envoi indisponible : connexion refusée, aucun repli log/array en production.

Transport SMTP `login` séparé : `GECA_LOGIN_MAIL_FROM/HOST/PORT/SCHEME/USERNAME/PASSWORD`. TLS et certificat vérifié, timeout 15 secondes ; newsletter inchangée en simulation. `scripts/configure-login-mail.php` prépare seulement ces six clés après authentification SMTP, sans envoyer de message ni basculer le mode. Configuration .env privée 600, sauvegarde privée, comparaison des autres valeurs (clé/base/modes compris), contrôle du parser y compris caractères spéciaux, remplacement atomique. Commande cPanel complète préparée dans artifacts, saisie masquée et nettoyage du fichier temporaire du mot de passe après succès/échec ordinaire. Une interruption brutale peut laisser ce fichier 600 dans son dossier 700. Réglages SMTP réels/configuration distante et réception du premier code encore à vérifier.

Validation locale : 109 tests PHP / 1298 assertions, Pint et compilation Blade réussis. Onze nouveaux tests : destinataire issu du compte, bon mot de passe préalable, code erroné/expiré/réutilisé, session différente, changement de compte/adresse/mot de passe/droits/version, envoi impossible, cooldown, ancien mode refusé et CSRF. SMTP TLS authentifié en fixture avec certificat local explicitement approuvé, sans affaiblir la vérification : parcours Chrome complet avec/sans JavaScript, erreur puis succès, pages privées/Sécurité et contrôle axe à 320/375/1440 px. Configuration privée testée avec caractères spéciaux ; mauvais mot de passe, debug et certificat non approuvé refusés sans modifier la configuration. Aucun e-mail extérieur. Suite Chrome de régression existante réussie (ancien mode explicitement configuré pour les fixtures).

Aperçu local actualisé : sauvegarde SQLite 600 privée, intégrité et copie vérifiées avant migration additive ; anciennes lignes, y compris comptes/contenus/newsletters, comparées identiques après. Seule la table des codes et son entrée de migration ajoutées. Serveur sur 127.0.0.1:8000 ; aucun réglage SMTP réel local ajouté, connexion refusée tant que le transport n'est pas configuré. Candidate de code préparée sans configuration privée, base ou vendor : 93 fichiers plus manifeste, SHA256 b9baf42f2ce6ea82859d367be68f2f3a5a3998b4cf3c36a472ba19383af6dd7d. Archive du 9 octobre conservée séparément. Aucun compte distant modifié, commit/push, SMTP réel ou déploiement par cette étape. Limite : protection dépendante de la boîte mail et vulnérabilité au phishing, selon le benchmark ; pas de promesse d'équivalence à Authenticator.


## Entrée locale temporaire sans saisie — 10 octobre 2026

Gassama autorise une entrée locale sans e-mail, mot de passe ni code pour examiner les écrans. Ouvrir `http://127.0.0.1:8000/connexion-locale`, puis « Entrer dans le back-office ». Les modifications concernent la base locale ; cette entrée ne publie rien.

Le terminal fournit au processus local `GECA_LOCAL_ACCESS_USER` (identifiant de l’administrateur actif choisi côté serveur) et `GECA_LOCAL_ACCESS_UNTIL` (fin en secondes Unix). Valeurs absentes : accès fermé. Ne pas inscrire ces variables dans le .env distant ni dans un cache de configuration de production. Pour fermer l’exception, redémarrer le serveur local sans ces variables ; les sessions locales sont alors refusées à leur prochaine requête. La session expire après une heure au maximum ; une nouvelle entrée reste possible jusqu’à la fin de l’autorisation. Le démarrage de cette vérification autorise une fenêtre de quatre heures.

Accès limité à l’environnement local, l’adresse directe 127.0.0.1 et la base SQLite `backoffice/database/local.sqlite`. Aucun mot de passe changé, compte créé ou preuve MFA fabriquée. Les connexions ordinaires gardent leur vérification. Les droits retirés, la version de session modifiée et la désactivation de l’exception ferment l’accès. Comparaison et limite de confiance dans `docs/BENCHMARK.md`.


## Corbeille commune au menu — 10 octobre 2026

L’entrée Corbeille du menu ouvre `/administration/corbeille`. Elle regroupe uniquement les projets, actualités et membres déjà retirés, sans suppression définitive. Restaurer garde les contrôles de version et de type, la protection CSRF et le rétablissement des actualités associées lorsque prévu. Les routes de corbeille propres aux trois rubriques restent disponibles. La nouvelle liste utilise les mêmes contrôles administrateur que les autres pages privées.


## Ajouter des projets, actualités et membres — 10 octobre 2026

Demande explicite de Gassama : les écrans doivent permettre l’ajout, en plus de la modification. Réalisation locale, sans migration ni livraison distante : bouton Ajouter dans chacune des trois listes, formulaire partagé, premier enregistrement puis retour sur la fiche modifiable. Photo et anglais facultatifs. Pour un projet : titre et description français nécessaires ; lieu, période et partenaire peuvent rester vides. Pour une actualité : titre et description français nécessaires, période facultative. Pour un membre : nom et poste français nécessaires. Note d’origine de dix caractères minimum, sans secret ni donnée privée. Ne saisir que les informations confirmées par GECA ; rien n’est publié vers Next.js.

Le serveur fixe type, clé admin UUID et auteur. Première version des textes/photos et note conservées dans source_payload, brouillon courant dans draft_payload, première révision et acteur dans l’historique ; modifications, corbeille et restauration gardent les comportements existants. Un formulaire de création porte un jeton UUID privé de session à usage unique, lié au compte et au type, valable une heure ; dix formulaires ouverts maximum. GET/POST de création verrouillent la session pour éviter les doublons simultanés. Jeton consommé après enregistrement réussi ; six demandes de création/minute/administrateur. Accès auth/admin/auth.session, versions, vérification de connexion, CSRF, validation des champs autorisés et quotas photo conservés. Aperçu photo autorisé par nonce sur la création comme sur l’édition ; aucune permission CSP générale ajoutée. Échec de l’historique : transaction annulée et nouveau média nettoyé.

Validation : 128 tests PHP / 1603 assertions, Pint, compilation Blade et syntaxe du test navigateur réussis. Base SQLite de test séparée : création/modification/suppression/restauration des trois types, photo privée et aperçu, provenance/auteur, anglais facultatif, texte échappé, double soumission sans doublon, CSRF manquant, jeton expiré/autre compte/autre type, quotas et annulation vérifiés. Chrome à 320/375/768/1440 px et texte 200 % sans débordement ; axe sans violation sur les formulaires examinés ; création sans JavaScript vérifiée. Captures mobile et PC examinées. Le scénario navigateur utilise des comptes Authenticator jetables ; les tests PHP couvrent aussi la connexion e-mail et l’exception locale, aucun SMTP réel testé ici.

Serveur consulté par Gassama sur 127.0.0.1:8000 : trois boutons/listes/formulaires, tableau de bord, CSS et CSP courants vérifiés après recompilation des vues ; anonyme refusé. Site 127.0.0.1:3000/fr et styles en 200. Aucun contenu de travail fictif ajouté, compte modifié, envoi, publication, commit, push ou déploiement. Limites : brouillons locaux uniquement, pas encore de publication publique, de gestion visuelle des révisions ni de liaison d’une nouvelle actualité à un projet. Tests MySQL distants non réalisés pour cette étape ; ces vérifications ne constituent pas un audit exhaustif.


## Sécurité du compte : mot de passe et connexions — 10 octobre 2026

Avant cette demande, le mode e-mail affichait seulement des explications, sans changement de mot de passe dans l’écran. Ajout local de PUT /administration/securite/mot-de-passe et POST /administration/securite/deconnecter dans le groupe auth/admin/auth.session, avec CSRF et limite partagée de cinq demandes/minute/compte. Le serveur prend l’identité de la session, exige la preuve complète du mode configuré puis le mot de passe actuel. Une entrée locale temporaire sans seconde preuve reste autorisée en lecture, mais ces mutations sont refusées ; la page montre leur indisponibilité.

Changer le mot de passe demande une phrase de 15 caractères minimum, confirmation identique, différence avec l’ancien, 72 octets maximum sans troncature et absence de caractère nul. Hash Laravel existant conservé. Sous verrou du compte : relire activation/droits/version/protection, vérifier le mot de passe actuel, sauvegarder le nouveau hash si demandé, augmenter la version, changer remember_token et supprimer les sessions et challenges e-mail du seul compte. Opérations dans une transaction ; panne simulée : aucune mutation partielle. Ensuite fermeture de la session courante, renouvellement de son identifiant et du CSRF, retour à la connexion. L’adresse, les droits et l’Authenticator/codes existants restent conservés. Déconnecter tous les appareils fait la même révocation sans changer le mot de passe. Les anciens mots de passe/challenges/sessions ne réouvrent pas l’accès. Les erreurs reviennent explicitement sur Sécurité ; aucun mot de passe n’est conservé en old input.

Essais : douze tests spécifiques couvrent succès e-mail/Authenticator, compte ciblé au serveur malgré identifiants injectés, sessions/challenges d’autres comptes préservés, mauvais mot de passe, longueurs/accent/caractère nul/tableau, confirmation, anonymes/preuve manquante/droits retirés/changement de compte/version/adresse, CSRF, limite malgré autre IP/session, entrée locale et transaction annulée. Chrome avec SQLite et SMTP TLS authentifié jetables : changement réel du mot de passe de test, ancien refusé, nouveau suivi d’un code obligatoire accepté, cookie d’ancienne session refusé, erreurs sans valeurs de mots de passe, déconnexion sans JavaScript et autre compte conservé. Pas d’envoi extérieur. Huit combinaisons de largeur 320/375/768/1440 et texte normal/200 % sans débordement ; axe sans violation et captures examinées.

Serveur de Gassama 8000 actualisé après recompilation des vues : commandes présentes, avertissement local, POST direct refusé et comptes comparés identiques avant/après. CSS, accès anonyme refusé, 3000/fr et styles vérifiés. L’envoi SMTP réel de connexion n’est pas configuré sur cette copie locale, vérifié sans afficher de secret. Les commandes sont fonctionnelles après connexion complète dans les essais ; leur utilisation avec une vraie réception e-mail reste conditionnée à la configuration privée et à sa vérification. Aucun nouveau service, changement de compte réel, déploiement, commit ou push. Limite : aucune liste détaillée d’appareils, modification d’adresse ou récupération publique proposée ; aucun audit exhaustif de production par cette étape.

Validation finale de cette étape : suite de 140 tests / 1726 assertions réussie, puis douze tests Sécurité / 128 assertions réussis après alignement du contrôle Authenticator sur le middleware (secret vide et ancienne preuve refusés même avec accès local). Pint, compilation Blade, syntaxe JavaScript et diff réussis.


## Photos allégées automatiquement — 10 octobre 2026

Choisir une photo affiche l’aperçu unique ; Enregistrer confirme le brouillon et allège la photo automatiquement. Le formulaire indique ensuite le poids de la version allégée et celui de l’original. Formats JPEG/PNG/WebP et maximum d’entrée de 6 Mo conservés. Le serveur prépare deux WebP : version jusqu’à 1280 px sur le grand côté et 250 Kio maximum, miniature jusqu’à 192 px et 16 Kio maximum. Qualités 80 puis 72 ; si nécessaire, réduction proportionnelle supplémentaire, sans recadrage ni agrandissement. Le budget tient aussi compte du poids d’origine pour ne pas augmenter celui des images de plus de 1 Kio. Transparence conservée, métadonnées privées absentes des variantes. L’original exact reste en stockage privé, ainsi que les anciennes photos de l’historique.

La liste Équipe utilise la miniature, y compris une variante plus petite du registre fermé pour les portraits importés. Les anciens médias sans miniature gardent un repli privé sur leur aperçu existant, sans retraitement forcé des originaux de travail. Les trois fichiers sont comptés dans le quota et nettoyés ensemble si l’enregistrement échoue. Routes limitées au format thumbnail, UUID ou fiche de la bonne rubrique ; mêmes droits, preuve de connexion, CSRF, quotas et limites d’abus. L’envoi ne publie toujours pas vers Next.js : cette liaison reste à réaliser séparément. Aucun média fictif ajouté aux données de Gassama.

Le site public local bénéficie séparément d’un logo adapté à la largeur de l’écran et d’un chargement progressif des cinq fonds du hero. Mesures et limites dans docs/BENCHMARK.md. Le logo du back-office utilise aussi une copie réduite ; paquet de code mis à jour pour l’inclure. Aucun déploiement distant, commit ou push.


## Ajouter une photo sans questions supplémentaires — 10 octobre 2026

La demande de Gassama remplace les anciens formulaires photo : plus de description à saisir, de questions sur origine/photographe/droits, d’anglais ni de choix activité/illustration. Choisir le fichier, vérifier l’aperçu, puis enregistrer la fiche ; la note générale du changement reste demandée. L’allègement automatique et les limites de fichiers ne changent pas.

Aucune réponse cachée envoyée par le navigateur. Le serveur rattache un libellé de contexte au titre ou au nom validé de la fiche ; cela indique seulement l’association, sans inventer ce que montre l’image ni traduire les textes. Pour les nouveaux médias, origine/droits « Non précisée », photographe null et illustrative true. Les anciens champs soumis par une page restée ouverte sont ignorés ; aucun crédit ni droit affirmé par une requête n’est repris. Les anciens médias et toutes leurs métadonnées restent intacts, y compris après une modification de texte sans nouvelle photo. Les descriptions authentiques du site public et ses crédits ne changent pas ; aucun envoi ou publication.
