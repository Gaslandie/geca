# Publication automatique Bluehost — préparation du 10 octobre 2026

Après un push sur `main`, GitHub pourra vérifier et publier la vitrine sur
`globalecoaction.org`. Gassama n’aura plus à recopier la commande à chaque
changement du site public. La connexion Bluehost n’est pas encore installée
ni testée : cette préparation n’active aucune publication.

## Ce qui est préparé

`.github/workflows/bluehost.yml` installe les dépendances verrouillées, lance
lint, compilation publique à la racine du domaine, TypeScript et les tests
publics, puis crée l’archive vérifiée. Une étape SSH transmet cette archive à
`deploy/receive-public.py`, installé séparément sur Bluehost avec l’outil
`deploy/update-public.py`. La sauvegarde privée et le retour des fichiers sur
erreur ordinaire sont conservés. Une interruption brutale doit être examinée
avant toute relance. Les sauvegardes restent sur Bluehost ; leur rétention et
l’espace disque devront être suivis.

Le back-office, ses comptes, sa configuration et MySQL sont exclus. Les
contenus Laravel ne reconstruisent toujours pas automatiquement la vitrine.
Une future publication du back-office demandera un protocole distinct pour
les dépendances, sauvegardes SQL et migrations.

## Connexion à installer une seule fois

1. Vérifier que SSH est activé sur l’abonnement et confirmer l’hôte et le port.
2. Installer les deux outils dans `/home2/fnksrwmy/geca-deploy` (dossier 700,
   fichiers 600, propriétaire `fnksrwmy`). Vérifier leurs empreintes.
3. Créer une clé dédiée. Autoriser sa partie publique dans `authorized_keys`
   avec une commande forcée vers `/bin/python3
   /home2/fnksrwmy/geca-deploy/receive-public.py`, sans terminal ni transfert
   de ports, agent ou X11. Ne pas remplacer les clés existantes. Le chemin
   Python réel doit être confirmé sur Bluehost avant installation.
4. Vérifier l’identité SSH du serveur depuis cPanel ou une source Bluehost
   indépendante, puis conserver la ligne `known_hosts` correspondante. Un
   `ssh-keyscan` réseau seul ne prouve pas cette identité.
5. Configurer GitHub. Dans **Settings → Secrets and variables → Actions**,
   ajouter les secrets `BLUEHOST_SSH_KEY` (clé privée dédiée) et
   `BLUEHOST_KNOWN_HOSTS` (identité du serveur vérifiée). Ne jamais transmettre
   la clé privée dans le chat ou la committer. Préférer les secrets de
   l’environnement `bluehost-production` restreint à `main`.
6. Ajouter les variables `BLUEHOST_SSH_HOST`, `BLUEHOST_SSH_PORT` et, seulement
   après les vérifications, `BLUEHOST_DEPLOY_ENABLED=true`. Le workflow reste
   désactivé sans cette dernière variable. Déclencher d’abord un essai manuel
   et contrôler les pages FR/EN dans un navigateur réel.

Les commandes et valeurs exactes seront fournies directement dans le chat
après vérification des accès. Aucun mot de passe de boîte mail ou du
back-office n’est nécessaire pour cette connexion.

## Protections et essais réellement effectués

La clé ne peut demander que `deploy-public` suivi d’une empreinte SHA256.
Le récepteur refuse shell, SFTP/SCP, commandes additionnelles, fichiers PHP,
chemins privés/cachés, chemins remontant un dossier, modification des règles
Apache et archives différentes. L’outil de mise à jour installé sur le
serveur reste hors du ZIP. Les fichiers publics autorisés suivent le registre
de livraison actuel ; un nouveau nom de logo ou type de fichier nécessitera
une adaptation explicite du récepteur installé. Deux publications ne peuvent
pas modifier simultanément la vitrine grâce à un verrou serveur.

Le client SSH exige la clé du serveur enregistrée, sans acceptation
automatique d’une identité inconnue, et conserve la clé privée dans un
dossier temporaire supprimé en sortie. Les secrets ne sont fournis qu’à
l’étape de transmission, après les tests. Les actions GitHub sont épinglées
par commit et les credentials checkout ne sont pas conservés.

`python3 deploy/test-auto-public.py` : huit essais isolés réussis le 10 octobre
2026, dont installation avec sauvegarde, commandes refusées, empreinte
incorrecte, fichiers interdits, protections Apache modifiées, lien vers un
outil, erreur de remplacement avec restitution, verrou concurrent. Le
fichier privé factice du back-office est conservé. Ces simulations ne
constituent pas un test de connexion ni une publication Bluehost réelle.

## Comparaison des références officielles

Consultées le 10 octobre 2026 :

- [Bluehost — accès SSH](https://www.bluehost.com/help/article/ssh-access) :
  SSH peut être activé sur l’hébergement partagé ; le port annoncé est 22.
  À confirmer dans cet abonnement avant de configurer la connexion.
- [Bluehost — SFTP](https://www.bluehost.com/help/article/sftp) : le transfert
  sécurisé nécessite SSH sur l’offre partagée. Pour GECA, une commande forcée
  remplace le transfert SFTP général et réduit les opérations disponibles.
- [GitHub — environnements de déploiement](https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments) :
  restrictions de branches et secrets d’environnement permettent de limiter
  l’usage de la connexion. GECA prépare `bluehost-production` pour `main`,
  sans ajouter une approbation manuelle à chaque push demandée automatique.

L’accès SSH du compte réel, l’identité du serveur, les restrictions de la
clé, la configuration GitHub et la réception distante restent à vérifier.

### Connexion vérifiée par étapes

Gassama confirme dans le portail Bluehost : Shell Access activé, compte
`fnksrwmy`, IP `50.6.153.225`. Le Terminal cPanel retourne le 10 octobre 2026
la même clé publique ED25519 que la lecture réseau indépendante :
`AAAAC3NzaC1lZDI1NTE5AAAAIHkq+rGDwr0P1UrcJPAFuZlG5Mm/nF1Swa/Vw+/ElKiE`.
Le chemin Python confirmé est `/bin/python3`. Le test SSH avec la clé locale
existante, identité serveur strictement vérifiée, est refusé : aucun accès
authentifié ni changement distant. Une nouvelle clé dédiée est préparée
localement dans `release/bluehost-ssh` (ignoré par Git, privé). Sa partie
privée ne sera jamais affichée ni incluse dans une livraison.

L’enregistrement initial de la clé privée dans GitHub a été refusé par la
vérification automatique faute d’accord explicite pour ce transfert précis.
Gassama a ensuite donné cet accord dans le chat le 10 octobre 2026. Les deux
secrets sont enregistrés dans `bluehost-production`, restreint à la branche
`main`. Les variables sont IP `50.6.153.225`, port `22`, activation `false`.
Aucune clé privée affichée, ajoutée au dépôt ou envoyée à Bluehost.

`deploy/install-connection.py` prépare l’installation côté serveur à partir
de deux outils aux empreintes fixées et d’une clé publique ED25519. Il
contrôle compte, chemins, propriétaires et droits, refuse liens/outils
modifiés et une même clé préexistante sans restrictions. Il sauvegarde les
anciennes clés avant un ajout atomique ; une répétition conforme ne duplique
pas la clé. Cinq fixtures locales réussissent : installation, répétition,
lien de dossier SSH, clé préexistante non limitée, outil modifié. Installation
réelle, restrictions effectives et première publication toujours attendues.

Installation cPanel confirmée par Gassama : trois empreintes OK, nouvelle clé
limitée installée, anciennes clés sauvegardées dans
`/home2/fnksrwmy/geca-connexion-G4aehq6j/authorized_keys-avant`. Test SSH réel
avec la clé dédiée : commande générale `id -un` refusée, code de sortie 1.
Premier transfert de la candidate publique interrompu. La relecture locale
révèle 95 noms Next.js normaux contenant crochets ou `$`, non admis par le
filtre initial ; ce défaut est corrigé, sans élargir les types ou les racines
publiques. Contrôle de tous les noms du ZIP réel réussi et huit essais
réussis avec chunks dynamiques/RSC ajoutés aux fixtures de succès. Le
récepteur affiche maintenant une phase fixe en cas d’arrêt, jamais un secret
ou un message d’exception brut. Mise à jour distante du récepteur requise ;
automatisation toujours désactivée, première publication non confirmée.

Correctif du récepteur confirmé par Gassama : empreintes ancienne/nouvelle
OK, outil remplacé sans mise à jour de la vitrine. Nouveau transfert SSH
réussi le 10 octobre 2026 : sauvegarde publique vérifiée
`/home2/fnksrwmy/geca-mise-a-jour-t9d_bs4o/sauvegarde-verifiee`, archive du logo
client installée. Chrome indépendant confirme pages FR/EN HTTP 200, logos
header/footer tous sur le nouveau fichier, dimensions naturelles 1600×666,
proportions et absence de débordement à 320/375/1440 pixels. WebP servi de
SHA256 `c150abe510680a0fa2ea9922cc6d32c65409c09e27f56dd343520a1c9f11c964`.
Back-office et MySQL exclus de ce transfert.

Variable d’activation GitHub mise à `true` après ce succès. Premier parcours
complet Actions déclenché manuellement sur main : run 38080882644, commit
516ec5ae58bab043d202639ad05cac2e5dea08b4. Résultat encore attendu au moment de
cette note. La rotation proposée des cinq sauvegardes n’est pas encore
implémentée : les sauvegardes existantes restent conservées.

Résultat confirmé : run 38080882644 terminé avec succès. Lint, compilation,
TypeScript, neuf essais publics, packaging et transfert SSH réussis depuis
le runner GitHub. Sauvegarde vérifiée créée sur Bluehost :
`/home2/fnksrwmy/geca-mise-a-jour-h6dvv9eg/sauvegarde-verifiee`. La publication
sur push main est active ; aucun secret fourni aux étapes de compilation ou
tests, pas de publication Laravel/MySQL. Ce circuit reste distinct de la
future publication des contenus édités dans le back-office et de sa mise à
jour logicielle. Le logo du back-office n’a pas été changé par cette
publication limitée à la vitrine.
