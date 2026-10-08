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
