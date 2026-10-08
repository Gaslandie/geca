# Bonnes pratiques retenues pour la connexion administrateur GECA

Date : 8 octobre 2026. Synthèse de la liste proposée par Gassama et de son examen dans ce chat.

L’objectif est de protéger l’espace de gestion tout en gardant une connexion simple. Les priorités sont la double authentification, des droits vérifiés côté serveur, des sessions protégées et une récupération fiable. Une adresse de connexion discrète reste une protection secondaire.

Ce fichier conserve les principes retenus. Il ne signifie pas que toutes ces protections sont déjà installées. Il n’autorise aucune mise en ligne, modification de compte ou activation d’envoi. La référence personnelle `BONNES-PRATIQUES-SITES-WEB.md` du Bureau reste distincte.

## Les dix pratiques retenues

### 1 Choisir une adresse de connexion claire

Le chemin `/connexion` peut être conservé. Une URL personnalisée peut réduire certains robots, mais elle reste découvrable et ne remplace pas les contrôles de sécurité. Une restriction par adresse IP peut compléter la protection lorsque les personnes autorisées utilisent des adresses stables. Elle doit prévoir les déplacements et changements de connexion.

### 2 Ajouter la double authentification

Pour l’administration en ligne, prévoir une seconde preuve en plus du mot de passe. Privilégier une clé de sécurité ou une passkey, mieux protégée contre les fausses pages de connexion. Une application Authenticator est une autre option ; éviter le SMS lorsque possible. Prévoir dès le départ des moyens de secours. [OWASP — authentification multifacteur](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html)

### 3 Limiter les tentatives

Combiner les limites par compte et par adresse IP. Préférer des délais temporaires et adaptés aux abus. Éviter un blocage que quelqu’un pourrait déclencher facilement pour empêcher le véritable administrateur de travailler. « Cinq échecs puis quinze minutes » est un exemple, pas une règle universelle. [OWASP — authentification](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

### 4 Garder les erreurs de connexion générales

Dire « Identifiant ou mot de passe incorrect », sans confirmer l’existence d’un compte ni préciser quel secret est faux. Les délais et réponses du serveur doivent aussi éviter de révéler cette information. Les erreurs de format, comme une adresse e-mail mal écrite, peuvent rester utiles et claires. [OWASP — authentification](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

### 5 Faciliter les mots de passe solides

Retenir au moins 15 caractères lorsque le mot de passe est le seul facteur. Autoriser les longues phrases, le copier-coller et les gestionnaires de mots de passe. Refuser les mots de passe courants ou compromis, sans imposer des mélanges artificiels de caractères ni des changements périodiques sans raison. Ajouter un bouton accessible Afficher/Masquer. Utiliser `autocomplete="username"` et `autocomplete="current-password"`. [NIST — mots de passe](https://pages.nist.gov/800-63-4/sp800-63b.html)

### 6 Protéger et faire expirer les sessions

Une session est ce qui permet au serveur de reconnaître la personne connectée. Fixer des délais d’inactivité et une durée maximale selon les risques. Renouveler son identifiant après connexion et invalider les accès après révocation ou récupération du compte.

En ligne, les cookies doivent utiliser `Secure` et `HttpOnly`. `SameSite=Strict` est préférable lorsque les parcours le permettent ; `Lax` peut être adapté. Ces réglages ne remplacent pas la protection CSRF. Le HTTP sur `127.0.0.1` reste un fonctionnement local distinct du futur service HTTPS. [OWASP — sessions](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

### 7 Prévoir une récupération sûre

Si une récupération par e-mail est ajoutée, utiliser des liens imprévisibles, temporaires et à usage unique. Leur durée doit être adaptée au parcours. Garder une réponse qui ne révèle pas les comptes existants. [OWASP — récupération du mot de passe](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)

Prévoir aussi la perte du téléphone ou de la clé : codes de secours ou procédure contrôlée. La récupération doit conserver une vérification forte de l’identité, sans exiger uniquement le facteur devenu inaccessible ni permettre de contourner la double authentification avec un simple e-mail. [OWASP — authentification multifacteur](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html)

### 8 Protéger les échanges et les formulaires

En ligne, utiliser HTTPS pour la connexion et toutes les pages privées. Garder les jetons CSRF, qui empêchent une autre page de déclencher une action à la place de l’utilisateur. Conserver des en-têtes adaptés, notamment une politique CSP et une protection contre l’affichage de l’administration dans une autre page. [OWASP — authentification](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [OWASP — sessions](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

### 9 Garder des traces privées et des alertes utiles

Journaliser les accès et événements de sécurité utiles, avec une conservation limitée et des droits restreints. Ne jamais enregistrer mots de passe, codes de double authentification, identifiants de session ou liens secrets. Une nouvelle IP ne suffit pas à prouver une attaque. Ajuster les alertes pour éviter les notifications répétitives ; aucun service d’alerte externe n’est connecté par ce mémo. [OWASP — journalisation](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)

### 10 Garder une interface simple et accessible

Afficher clairement GECA et l’environnement utilisé : local, test ou production. Garder des champs bien nommés, des erreurs compréhensibles, un focus visible et un parcours complet au clavier. Vérifier téléphone, ordinateur et texte agrandi. Un lien de retour au site public peut être utile s’il est clairement identifié ; son absence n’est pas une protection de sécurité.

## Contrôles indispensables au-delà de la page de connexion

Le serveur doit vérifier les droits et le propriétaire réel des données à chaque lecture ou modification privée. Un bouton caché, un rôle ou un identifiant envoyé par le navigateur ne suffit jamais. Conserver validation des entrées et fichiers, protection des secrets et données privées, et sauvegardes avec restauration vérifiée.

Tester les accès autorisés et refusés : visiteur anonyme, URL directe, autre compte, droits retirés et session expirée. Ne jamais retirer une protection pour réussir un test. Un risque confirmé bloque l’action qui expose les données jusqu’à sa correction.

## État constaté dans le code local GECA

Lecture du code le 8 octobre 2026 ; ce tableau ne remplace pas un audit ni les essais de l’hébergement réel.

| Sujet | État constaté |
| --- | --- |
| Tentatives de connexion | Limites de 20 tentatives par minute et par IP, et de 5 par adresse e-mail. Elles concernent les tentatives, pas uniquement les échecs. |
| Erreur de connexion | Message général, sans distinction compte inconnu ou mauvais mot de passe. |
| Formulaire | Jeton CSRF et champs compatibles avec les gestionnaires de mots de passe. |
| Session | Identifiant renouvelé à la connexion ; invalidation à la déconnexion. Configuration prévue de 30 minutes, réglage effectif à vérifier selon l’environnement. |
| Droits administrateur | Compte, statut actif et version de session relus côté serveur à chaque accès privé. |
| Mot de passe | Création et réinitialisation par commande locale avec saisie masquée ; minimum de 15 caractères. Refus des mots compromis à prévoir. |
| Récupération | Commande locale contrôlée ; réinitialisation fermant les sessions sans réactiver un compte révoqué. Aucun parcours de récupération par e-mail livré. |
| En-têtes | CSP et protection contre l’affichage dans une autre page présents dans le middleware d’administration. Réglages et cookies réels à vérifier sur l’hôte. |
| Double authentification | Non implémentée dans les fichiers examinés. |
| Confort et surveillance | Bouton Afficher/Masquer et journal dédié des accès avec alertes à préparer. |

Fichiers examinés : `backoffice/app/Http/Controllers/SessionController.php`, `backoffice/app/Http/Middleware/RequireAdministrator.php`, `backoffice/app/Http/Middleware/AdminHeaders.php`, `backoffice/app/Providers/AppServiceProvider.php`, `backoffice/app/Console/Commands/AdminAccount.php`, `backoffice/config/session.php`, `backoffice/resources/views/auth/login.blade.php` et `backoffice/routes/web.php`.

## Priorités pour GECA

1. Préparer la double authentification et sa récupération de secours avant l’ouverture de l’administration sur Internet.
2. Vérifier les sessions et cookies réellement utilisés sur l’hôte, ainsi que la révocation des accès et HTTPS.
3. Ajouter le refus des mots de passe courants ou compromis, puis les journaux privés et alertes pertinentes.
4. Améliorer le confort avec Afficher/Masquer et l’indication claire de l’environnement.

Ces priorités complètent les protections existantes. Elles ne garantissent pas une sécurité absolue et ne remplacent pas les vérifications de déploiement dans [BACKOFFICE.md](BACKOFFICE.md).

## Comparaison et consignes pour les prochaines évolutions

Références OWASP et NIST consultées le 8 octobre 2026 pour l’examen dans le chat, puis réutilisées ce même jour : les recommandations restent pertinentes pour ce mémo. La comparaison retient authentification forte, limites contre les abus, sessions protégées et récupération contrôlée. Elle corrige le caractère obligatoire d’une URL cachée, d’un blocage fixe et de `SameSite=Strict` dans tous les parcours. Les valeurs proposées ne sont pas présentées comme des réglages déjà appliqués à GECA.

Avant toute réalisation, vérifier la pertinence de ces références et documenter les observations réelles et leur adaptation. Signaler les accès impossibles sans inventer de résultats. Expliquer les décisions à Gassama en français simple, avec des phrases courtes et des exemples concrets. Ne créer aucun fait GECA non fourni. Tout prompt destiné à un autre chat ou agent doit reprendre explicitement ces exigences, la sécurité permanente et les contrôles autorisés/refusés.


## Mise à jour — double authentification, 8 octobre 2026

L’état du tableau précédent correspond à la lecture avant cette réalisation. La double authentification par application Authenticator est désormais réalisée dans le back-office local, avec activation confirmée, dix codes de secours à usage unique et régénération protégée. Le compte réel sera configuré par son propriétaire lors de sa connexion ; l’agent n’a ni changé son mot de passe ni enregistré un téléphone à sa place.

Cette étape ne réalise pas les clés physiques WebAuthn, les alertes de connexion ou les autres améliorations de la liste. Guide d’utilisation et récupération dans [BACKOFFICE.md](BACKOFFICE.md), comparaison et limites dans [BENCHMARK.md](BENCHMARK.md). Aucun déploiement distant.
