# Nova - MVP (V1) — cadrage exécutable

## Objectif MVP
Permettre à un utilisateur de :
- créer un compte,
- ajouter une URL produit,
- voir un statut de stock,
- recevoir **un e-mail** quand le produit passe de *rupture/inconnu* à *en stock*,
- administrer (côté ADMIN) des profils de sites (règles) et les tester.

## Périmètre fonctionnel V1 (figé)
### Inclus
- Auth : register / login / logout / reset password.
- Suivis : CRUD (création, pause/reprise, suppression).
- UI : Dashboard, Page paramètres (lecture email + logout).
- Worker : contrôle planifié + historique minimal.
- Notifications : e-mail (anti-doublon).
- Admin : CRUD `site_profiles`, “Test profil sur URL” et consultation des métriques basiques (suivis actifs, notifs 24h, suivis en erreur).

### Hors périmètre V1
- Multi-canaux (Discord/Telegram/push),
- planification “queue” avancée (Redis/Celery),
- anti-bot avancé (rotation proxy/captcha solving),
- monitoring SRE (alerting, dashboards complets),
- multi-langues.

## Hypothèses et limites (V1)
### Sites supportés (V1)
- **2 sites réels maximum** (pour une démo stable).
- + 1 page de test contrôlée (fixture HTML / mini site) pour sécuriser la démo.

### Règles de détection supportées (V1)
- Mots-clés : présence/absence.
- Sélecteurs CSS : présence/absence.
- (Optionnel) extraction simple du titre produit.

### Fréquence & quotas
- Fréquence par suivi : **toutes les 15 minutes** (modifiable).
- Quota par utilisateur : **20 suivis max** (modifiable, limite définie pour garantir la stabilité).
- Throttling par domaine : **1 requête / 5 secondes** (modifiable).
- Timeout fetch : **10 s** (HTTP) / **20 s** (Playwright) (modifiable).

### Statuts (V1)
- Stock :
  - `IN_STOCK` / `OUT_OF_STOCK` : États nominaux détectés.
  - `UNKNOWN` : État par défaut ou échec ponctuel de détection (ex: sélecteur non trouvé mais page chargée).
  - `BROKEN` : État critique après **3 échecs consécutifs** de récupération (404, timeout, erreur 5xx) ou si le profil de site est devenu totalement incompatible.
- Suivi : `ACTIVE`, `PAUSED`.

### Règle de notification (V1)
- Notifier **uniquement** sur transition d'état en base de données :
  - Transition : `(OUT_OF_STOCK | UNKNOWN) -> IN_STOCK`.
- La logique compare le `stock_state` persisté (dernier état connu en base) avec le nouvel état détecté par le worker.
- L'e-mail n'est envoyé qu'une seule fois par cycle de disponibilité.

## Definition of Done (DoD) MVP
- API + worker + DB démarrent via `docker compose up`.
- Lint + tests passent en local et en CI.
- Scénario démo : “retour en stock” validé (réel ou simulé).
- Docs à jour (au minimum MVP, API, profils, sécurité, accessibilité, déploiement).
