# Back-office GECA

Appliquer les consignes du fichier AGENTS.md à la racine et la demande de reprise de Gassama.

- Français simple, phrases courtes et exemples concrets, sans ton infantilisant. Dire ce qui change, pourquoi et où agir.
- Sécurité à chaque étape : droits et propriétaire contrôlés côté serveur, entrées/fichiers validés, secrets privés, sessions protégées, refus testés (anonyme, identifiant changé, autre compte, révocation). Ne jamais affaiblir une protection. Examiner dépendances, abus, sauvegarde/restauration. Rapporter tests et limites réels.
- Benchmarking avant conception/adaptation : comparer les références reconnues, privilégier les sources officielles, noter date, observations et adaptation GECA. Signaler les accès impossibles.
- Contenus : lire docs/TEXTES-AUTHENTIQUES-CLIENT.md à la racine ; aucun fait GECA inventé. Préserver FR/EN, crédits, licences et illustrations.
- Reprendre explicitement ces quatre exigences dans tout prompt pour un autre agent ; aucune délégation sans demande de Gassama.
- Aucune inscription publique, aucun envoi réel d’e-mails ou paiement, aucun commit/push sans nouvelle demande. Ne jamais toucher à l’installation distante, son .env, APP_KEY ou ses données par une installation locale.
- Les dépendances sont verrouillées ; installation par composer install. Aucun migrate:fresh/reset sur une base de travail. Les tests utilisent une base jetable dédiée.

## Présentation validée du tableau de bord — 7 octobre 2026

Gassama valide l’image proposée avec menu latéral gauche. Utiliser le layout Blade commun sur les écrans privés : menu Vue d’ensemble, Projets et programmes, Actualités, Équipe, Médias ; rubrique active, logo local existant, couleurs GECA, cartes sobres. Les compteurs doivent venir des contenus réels après contrôle serveur, jamais de nombres codés en dur ni de fausses statistiques. Le menu compact natif reste utilisable au clavier et sans JavaScript, et remplace la barre latérale lorsque le texte agrandi manque de place. Les titres du tableau de bord suivent l’alignement de la maquette validée. Ne pas prétendre une publication ou une double vérification encore absente. Aucun ajout de dépendance d’administration, service externe, suivi ni compte par ce changement. Préserver les refus, CSRF, sessions, échappement et fichiers privés.


## Newsletter interne — 8 octobre 2026

Gassama autorise la réalisation interne de la newsletter, remplaçant pour ce périmètre l’interdiction antérieure d’inscription/envoi. Gestion locale et simulations d’abord ; envoi réel seulement avec messagerie configurée explicitement. Aucun déploiement distant, commit ou push autorisé. Conserver abonnés privés, protections serveur, consentement confirmé, désinscription, limites d’abus et tests autorisés/refusés. Proposer l’interne en priorité lorsque pertinent et de bonne qualité.


## Double authentification obligatoire — 8 octobre 2026

Mot de passe puis application Authenticator, codes de secours consommés une seule fois. Aucune session privée avant les deux preuves ; contrôler côté serveur compte actif, droits, version et preuve MFA sur toutes les routes privées. Les comptes sans téléphone passent par l’activation confirmée lors de la connexion. Secret chiffré avec APP_KEY existante, pas de rotation aveugle de cette clé. Ne jamais envoyer QR, clés ou codes à un service extérieur, les journaliser ou les transmettre dans le chat. Régénération avec mot de passe et seconde preuve ; aucun bouton de désactivation. Récupération terminal exceptionnelle avec identité vérifiée hors ligne, nouveau mot de passe, fermeture des sessions et réactivation obligatoire du second facteur. Guide dans docs/BACKOFFICE.md, benchmark et limites dans docs/BENCHMARK.md. Local uniquement, WebAuthn non réalisé, audit réseau complet et MySQL/Bluehost à vérifier avant livraison. Les fixtures de tests utilisent des comptes jetables avec preuve MFA complète ; ne pas désactiver le contrôle pour faire passer les tests.

## Code de connexion par e-mail — demande prioritaire du 10 octobre 2026

Gassama remplace Authenticator par mot de passe puis code envoyé à l'adresse du compte. Cette demande autorise les e-mails transactionnels de connexion ; elle n'active pas la newsletter. Compte/adresse issus du serveur, aucune session privée avant validation, usage unique et expiration cinq minutes, liaison à la session, essais/envois limités, refus si SMTP indisponible. Secrets et code hors chat/journaux/URLs ; configuration SMTP privée avec TLS obligatoire. Les anciennes preuves Authenticator ne donnent pas accès en mode e-mail. Conserver les anciennes données et la clé pour un retour contrôlé, sans permettre de choix de mode dans le navigateur. La sécurité dépend aussi de la boîte mail ; ne pas présenter ce choix comme équivalent à Authenticator. SMTP réel et déploiement restent à vérifier, sans les déduire des tests locaux.


## Exception locale temporaire — demande du 10 octobre 2026

Gassama demande un accès au back-office local sans saisir e-mail, mot de passe ni code. Cette exception est explicitement autorisée pour son ordinateur : `/connexion-locale`, formulaire POST avec CSRF, compte choisi au terminal, preuve locale distincte de la preuve MFA. Autorisation temporaire par variables du processus (`GECA_LOCAL_ACCESS_USER`, `GECA_LOCAL_ACCESS_UNTIL`), absentes par défaut. Vérifier local/127.0.0.1/Host numérique/base SQLite du projet à chaque requête privée, ainsi que droits, activation et version du compte ; une session dure au plus une heure. Aucune exception de production, aucun mot de passe modifié ni preuve e-mail fabriquée. Ne pas pérenniser ces variables dans le .env distant. Détails et limite de confiance dans docs/BACKOFFICE.md et docs/BENCHMARK.md.


## Ajout de fiches — 10 octobre 2026

Gassama demande de pouvoir ajouter des contenus. Projets, Actualités et Équipe proposent un formulaire partagé de création en brouillon privé, avec photo et anglais facultatifs. Informations GECA confirmées et note d’origine obligatoire ; laisser vides les faits inconnus, aucune traduction automatique. Première saisie conservée comme source, historique avec auteur serveur ; identifiant, type et origine technique décidés par le serveur. Les fiches importées conservent leurs contraintes. Jeton de formulaire à usage unique lié au compte, au type et à une expiration d’une heure ; sessions verrouillées pendant l’ajout et limite de six demandes par minute par administrateur. Conserver toutes les protections de connexion, droits, CSRF et fichiers privés. Aucune publication vers Next.js ou livraison distante autorisée par cette demande. Tests sur base séparée, jamais d’ajout fictif dans les données de travail.


## Commandes Sécurité du compte — 10 octobre 2026

Gassama demande de vérifier et compléter la rubrique. Le changement de mot de passe et la déconnexion de tous les appareils exigent une connexion complète avec seconde preuve et le mot de passe actuel, même quand l’exception locale permet de voir la page. Ces deux actions restent refusées depuis l’accès local seul, côté serveur comme dans l’interface. Identité de la session uniquement, droits/propriété/preuve/version relus sous verrou ; cinq demandes par minute et par compte partagées entre les actions. Nouveau mot de passe : au moins 15 caractères, au plus 72 octets pour bcrypt, confirmé et différent ; aucun caractère nul ni troncature. Fermer toutes les sessions, y compris la courante, invalider les challenges e-mail en attente et renouveler le jeton de rappel. Secrets jamais conservés dans l’ancien formulaire, les URLs ou les journaux. Garder l’adresse et la seconde protection, aucune désactivation de compte ou de MFA dans cet écran. Copie locale : l’envoi SMTP réel reste à configurer ; tests sur comptes séparés, sans modifier les comptes de Gassama ni toucher à Bluehost.


## Photo sans questions supplémentaires — 10 octobre 2026

Gassama demande le retrait de toutes les questions de description, origine, photographe, autorisation, anglais et illustration liées à une nouvelle photo. Création et modification gardent uniquement le choix du fichier, l’aperçu, son annulation et les indications de poids. Les droits, CSRF, validations des fichiers et allègement automatique sont conservés. Aucun champ caché pour simuler une réponse. Le serveur crée un simple libellé d’association à la fiche, sans décrire une scène ni traduire le contenu ; source et droits non précisés, photographe inconnu, illustration par défaut. Anciennes métadonnées, crédits et originaux conservés. La note générale du changement reste requise. Cette demande remplace l’exigence antérieure de saisir une description avec la photo ; elle n’autorise aucune publication ni fait GECA inventé.
