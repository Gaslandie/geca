# Design du back-office GECA

Style actuel : **Flat Design 2.0**, demandé par Gassama le 9 octobre 2026.

Les cartes sont claires, les ombres légères et les commandes visibles. Le vert GECA identifie les actions. Le rouge reste réservé aux erreurs et aux suppressions. Les titres et les actions gardent les alignements validés. Le menu mobile reste au-dessus du contenu.

## Un seul fichier pour changer le style

Ouvrir `backoffice/public/admin-theme.css`. Modifier le bloc **STYLE ACTIF DU BACK-OFFICE**, à la fin du fichier. Les réglages se transmettent aux pages de connexion, à la double authentification et à toutes les pages privées. Il n’est pas nécessaire de reprendre chaque formulaire ou chaque rubrique.

Une variable CSS est un réglage nommé. Par exemple, `--radius-panel` règle les coins de toutes les cartes. Les composants lisent ce réglage au lieu de garder chacun leur propre valeur.

| Réglage | Ce qu’il change |
| --- | --- |
| `--green`, `--dark` | Actions, liens et couleur au survol |
| `--page-bg`, `--surface` | Fond des pages et fond des cartes |
| `--workspace-text`, `--muted` | Texte principal et descriptions |
| `--line`, `--input-border` | Séparations et contours des champs |
| `--secondary-bg`, `--secondary-border` | Boutons secondaires |
| `--selected-bg` | Rubrique active du menu |
| `--radius-panel`, `--radius-control`, `--radius-badge` | Arrondis des cartes, commandes et badges |
| `--shadow-card`, `--shadow-button`, `--shadow-overlay` | Relief des cartes, boutons et menu ouvert |
| `--font-family`, `--text-heading`, `--text-card-title`, `--text-body` | Police et tailles de texte |
| `--space`, `--gap`, `--gap-actions`, `--heading-gap` | Marges des cartes et espaces entre les éléments |
| `--page-padding`, `--page-padding-desktop` | Marges du contenu sur petit et grand écran |
| `--workspace-width`, `--form-width`, `--sidebar-width` | Largeur du contenu, des formulaires et du menu |
| `--menu-background`, `--menu-padding`, `--menu-content-width` | Fond, marges et largeur des liens du menu plein écran |
| `--focus-color` | Repère visible pendant la navigation au clavier |
| `--motion-duration`, `--motion-easing` | Transitions, si le visiteur autorise le mouvement |

Exemple : pour des cartes plus carrées et sans ombre, remplacer dans ce bloc :

```css
--radius-panel: 4px;
--shadow-card: none;
```

Pour changer une taille ou une police, ajouter le réglage correspondant dans ce même bloc s’il est seulement défini dans la base `:root`. Le nouveau réglage remplace la base dans le back-office.

Enregistrer puis recharger la page sur `http://127.0.0.1:8000/administration`. Les liens CSS portent la date de modification du fichier : une nouvelle version prend une nouvelle adresse et évite de garder un ancien thème en cache. Pas de compilation Node ou de redémarrage requis pour une modification CSS locale.

## Où se trouve le reste ?

- `backoffice/public/admin.css` : composants communs, disposition, tailles adaptées aux écrans, ordre des éléments et protections d’accessibilité. Les couleurs, ombres, arrondis et police viennent du thème.
- `backoffice/resources/views/components/admin-styles.blade.php` : charge le thème puis les composants. Utilisé dans le layout de gestion et les deux vues publiques newsletter.
- `backoffice/resources/views/layouts/admin.blade.php` : pose le repère `data-admin-theme` qui active le style sur tout le back-office et la connexion.

La base `:root` du thème sert aussi aux formulaires newsletter publics existants. Le bloc `[data-admin-theme]` ne s’applique pas à ces écrans publics. Le site Next.js utilise ses propres styles et reste indépendant. Aucun choix de thème transmis par un visiteur, aucun script de thème, stockage navigateur ou fichier distant ajouté.

## Lors d’un futur changement

Conserver des textes et contours de champs lisibles, les erreurs nommées et le repère clavier. Garder les commandes à 48 px minimum. Ne pas masquer une commande ou modifier son rôle pour obtenir un effet visuel. Vérifier le menu, les titres longs, les formulaires, la confirmation de suppression et les codes de secours à 320 px et avec texte à 200 %. Les cartes ne doivent pas changer de taille au survol. Respecter le mouvement réduit.

Cette centralisation rend les changements d’apparence rapides. Un changement de navigation ou de fonctionnement reste un travail distinct. Les routes, droits, session, double authentification, CSRF, validation et stockage privé ne dépendent pas du thème.

Pour une future livraison, inclure les deux fichiers CSS et le composant Blade, puis reconstruire le cache des vues. Aucun déploiement distant effectué par cette modification.

## Menu plein écran — 9 octobre 2026

Sur mobile, tablette et lorsque le texte agrandi ramène la navigation compacte, « Menu » ouvre un panneau qui couvre tout l’écran. La croix reste en haut ; les liens défilent dans la partie inférieure sur les petits écrans. Échap ou la croix ferment le menu. Le contenu derrière ne reçoit pas de clic ou de focus tant que le menu est ouvert. Les liens et le formulaire de déconnexion gardent leurs routes et protections.

Le layout partagé utilise un dialogue HTML et une commande native de bouton, sans script supplémentaire ni changement de politique de sécurité. Les couleurs et marges du menu viennent du thème central. Le menu latéral reste présent sur grand écran. La commande HTML nécessite un navigateur récent : support commun aux versions actuelles depuis décembre 2025, selon MDN. Les essais locaux utilisent Chrome 154, avec et sans JavaScript ; les anciennes versions ne sont pas couvertes.


## Icônes de navigation — 10 octobre 2026

Chaque rubrique a son dessin : maison pour Accueil, document pour Projets et programmes, journal pour Actualités, enveloppe pour Newsletter, bouclier avec coche pour Sécurité du compte, groupe de personnes pour Équipe. Les menus ordinateur et mobile utilisent le même composant `admin-icon` et la même liste du layout. Les textes gardent le nom accessible ; les icônes restent décoratives. Comparaison et vérifications dans `docs/BENCHMARK.md`.


## Corbeille et en-têtes de listes — 10 octobre 2026

Corbeille est une entrée du menu partagé, avec sa propre icône. Elle regroupe les projets, actualités et membres retirés ; chaque fiche indique sa rubrique et conserve son action Restaurer. Les anciennes corbeilles par rubrique restent accessibles par leur route. L’état actif du menu est Corbeille pour toutes ces vues.

Sur mobile/tablette et avec texte agrandi, logo et bouton Menu partagent une ligne. Les listes Projets, Actualités et Équipe affichent le retour au tableau de bord sur une ligne séparée, puis le repère et le titre centrés, puis les cartes. Aucun lien Corbeille isolé sous le titre. Réglages communs dans admin.css ; contrôles et comparaison dans docs/BENCHMARK.md.


## Rubrique active simplifiée — 10 octobre 2026

À la demande de Gassama, le libellé « Contenus » est retiré des deux menus. La rubrique active garde le fond du menu, sans ombre ni barre latérale : texte et icône verts, graisse 600, petit point à droite. Cette demande remplace le grand fond vert clair et la barre épaisse antérieurs. Aria-current, focus visible, survol, hauteur des liens et icônes adaptées aux rubriques conservés. Réglage `--selected-bg: transparent` dans admin-theme.css et point décoratif dans admin.css.


## Menu PC repliable — 10 octobre 2026

Menu ouvert par défaut. Une icône de panneau avec flèche dans la barre haute permet de le fermer puis de le rouvrir ; la page récupère l’espace disponible. Bouton de 48 px, intitulé accessible adapté à l’état, clavier Entrée/Espace ; Échap depuis le menu le ferme et ramène au bouton. L’état ne persiste pas après changement de page. Le menu mobile et le défaut ouvert sans JavaScript sont conservés. Le script local `admin-navigation.js` est chargé par le layout commun sous CSP avec nonce, sans dépendance ni requête.


## Ajouter des fiches — 10 octobre 2026

Chaque liste affiche une action principale centrée : « Ajouter un projet », « Ajouter une actualité » ou « Ajouter un membre ». Le formulaire reprend celui de modification, avec retour séparé du titre, champs facultatifs nommés et anglais replié. Photo avec aperçu avant enregistrement, note d’origine et bouton Ajouter au bas du formulaire ; Annuler revient à la liste. Le message confirme le brouillon privé, sans annoncer une publication. Les listes identifient ces nouvelles fiches comme « Brouillon enregistré ». Même thème, clavier et tailles adaptées ; comparaison et essais dans docs/BENCHMARK.md.


## Mention privée dans le menu uniquement — 10 octobre 2026

« Global EcoAction · Espace privé » reste seulement sous les commandes Voir le site et Se déconnecter dans les menus PC/mobile. Le pied répété sous chaque page du layout privé et sous les pages de connexion est retiré. Les titres, noms de compte et autres repères de gestion conservent leur rôle. Modification locale partagée ; vérifications dans docs/BENCHMARK.md.


## Sécurité du compte complétée — 10 octobre 2026

Page commune avec en-tête, cartes espacées : Changer mon mot de passe, Déconnecter tous les appareils et, en mode e-mail, rappel de protection de la boîte mail. Le mode Authenticator conserve la régénération des codes de secours. Les commandes annoncent la fermeture de toutes les connexions, courante incluse. Champs nommés, gestionnaires de mots de passe autorisés et erreurs renvoyées vers cette page même avec plusieurs onglets ouverts.

En accès local temporaire : explication visible, formulaires sensibles désactivés et même refus au serveur. Si SMTP local manque, la page le dit clairement et garde l’accès de consultation ; elle ne propose pas de quitter cet accès pour une connexion indisponible. Même thème, boutons et espacements ; grille et cartes limitées à la largeur disponible à 200 %. Aucun affichage de secret ou de liste d’adresses IP.


## Flèche de retour — 10 octobre 2026

Le texte « Retour au tableau de bord » devient une flèche gauche seule, en haut à gauche du contenu des listes et de la corbeille globale. Commande discrète de 48 px, nom accessible et infobulle conservés, intervalle de 8 px avant le titre. Le lien mène toujours à l’accueil du back-office. Composant admin-back et dessin back du composant d’icônes partagé ; clavier et style commun conservés.

## Portraits dans la liste Équipe — 10 octobre 2026

Chaque membre a son portrait en cercle de 56 px, immédiatement avant son nom dans le même groupe horizontal. Espace de 16 px, visage cadré vers le haut ; le nom peut se répartir sur plusieurs lignes sur un petit écran, mais le portrait reste à côté. Le groupe garde le centrage commun. La photo enregistrée dans le brouillon prime sur le portrait importé ; sans photo disponible, cercle neutre avec la première lettre du nom. Aucun portrait inventé et aucun fichier original modifié. Les images passent par les routes privées existantes ; le nom voisin suffit à leur identification accessible. Comparaison et vérifications dans docs/BENCHMARK.md.

## Remplacement de photo avant confirmation — 10 octobre 2026

À la demande de Gassama, une seule image apparaît dans la zone photo. Un fichier valide choisi remplace visuellement la photo actuelle, au-dessus du champ de sélection, avec « Nouvelle photo — à enregistrer ». Les informations de l’ancienne photo sont masquées avec celle-ci pour éviter la confusion. « Annuler le choix de la photo » vide le champ et réaffiche la photo actuelle ; un fichier refusé conserve aussi cette photo. L’aperçu reste dans le navigateur et ne crée aucun brouillon en base à lui seul. L’enregistrement du formulaire confirme le nouveau brouillon privé ; les photos précédentes restent conservées dans l’historique. Même parcours dans Équipe, Projets et Actualités, noms accessibles et messages annoncés conservés. Sans JavaScript, l’aperçu apparaît après enregistrement, comme indiqué dans le formulaire.


## Photo sans questionnaire — 10 octobre 2026

À la demande de Gassama, retirer « Que montre la nouvelle photo ? » et toutes les informations photo facultatives : origine, photographe, autorisation, description EN et activité/illustration. Le bloc replié des anciennes informations est aussi retiré de l’écran. Le champ fichier nommé, la photo actuelle, l’aperçu unique, l’annulation, les poids et l’allègement automatique restent. Les informations générales de la fiche et la note de changement gardent leurs rôles. Aucun champ de réponse caché ; les informations déjà enregistrées sont conservées en base.
