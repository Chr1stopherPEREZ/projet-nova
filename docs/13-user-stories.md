# Nova - User stories (01–18) + critères d’acceptation

> Convention : Priorité = Must / Should / Could

## Auth & comptes
### US-01 (Must) — Inscription
**En tant que** USER, **je peux** créer un compte avec email + mot de passe.
- Given je suis non connecté
- When je soumets un email valide et un mot de passe conforme
- Then le compte est créé, je peux me connecter, et mes données sont isolées

### US-02 (Must) — Connexion
- Given j’ai un compte
- When je soumets des identifiants valides
- Then je suis connecté

### US-03 (Must) — Déconnexion
- Given je suis connecté
- When je clique “logout”
- Then ma session/mon token devient invalide

### US-04 (Must) — Réinitialisation mot de passe
- Given j’ai oublié mon mot de passe
- When je demande une réinitialisation
- Then je reçois un e-mail avec un lien/token valide et expirant

## Suivis
### US-05 (Must) — Créer un suivi
- Given je suis connecté
- When j’ajoute une URL valide
- Then le système normalise l’URL, associe un `site_profile` si possible, et crée le suivi en état `ACTIVE`

### US-06 (Must) — Voir mes suivis
- Given j’ai des suivis
- When j’ouvre le dashboard
- Then je vois : URL, statut stock, dernier contrôle, dernier e-mail éventuel

### US-07 (Must) — Mettre en pause / reprendre
- Given un suivi existe
- When je le passe en PAUSED
- Then le worker ne le contrôle plus

### US-08 (Must) — Supprimer un suivi
- Given un suivi existe
- When je le supprime
- Then il disparaît de ma liste et n’est plus contrôlé

## Worker & détection
### US-09 (Must) — Vérifier automatiquement les stocks
- Given un suivi est ACTIVE
- When le scheduler déclenche un cycle
- Then le worker fetch la page, évalue les règles, écrit un compte-rendu de contrôle (`watch_check`)

### US-10 (Must) — Gérer les erreurs proprement
- Given un site renvoie 404 / 403 / timeout
- When le worker échoue
- Then le suivi passe `UNKNOWN` ou `BROKEN` selon règles, et un log d’erreur est enregistré

## Notifications
### US-11 (Must) — Notifier sur retour en stock
- Given un suivi est `OUT_OF_STOCK` (ou `UNKNOWN`)
- When un check le détecte `IN_STOCK`
- Then une notification e-mail est envoyée **une seule fois** et enregistrée

### US-12 (Must) — Anti-spam notifications
- Given un suivi reste `IN_STOCK`
- When le worker re-check
- Then aucune nouvelle notification n’est envoyée

## Admin — profils de sites
### US-13 (Must) — CRUD profils
- Given je suis ADMIN
- When je crée/modifie/supprime un `site_profile`
- Then les changements sont persistés et auditables

### US-14 (Must) — Tester un profil sur une URL
- Given je suis ADMIN et un profil existe
- When je lance “Test sur URL”
- Then je vois : fetch_mode utilisé, règles matchées, statut final, erreurs éventuelles

## Qualité & conformité
### US-15 (Must) — Accessibilité minimale
- Given je navigue au clavier
- When je parcours les pages
- Then focus visible, labels, erreurs lisibles, structure sémantique correcte

### US-16 (Should) — Export / suppression
- Given je suis USER
- When je demande suppression du compte
- Then mes données sont supprimées (ou anonymisées) selon la politique RGPD

### US-17 (Could) — Renommer un suivi
- Given un suivi existe
- When je lui donne un label
- Then le dashboard affiche ce label

## Admin — Métriques
### US-18 (Must) — Consulter les métriques
- Given je suis ADMIN
- When j’ouvre l’espace administration
- Then je vois le nombre de suivis actifs, les notifications envoyées (24h) et les suivis en erreur ("cassés")

## Traçabilité
La correspondance entre les User Stories et les tests (unitaires, intégration) est détaillée dans la matrice de traçabilité du document suivant :
- [`06-test-strategy.md`](./06-test-strategy.md)
