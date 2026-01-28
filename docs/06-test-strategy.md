# Nova - Stratégie de tests + matrice Exigences → Tests

## Objectifs
- Prouver que le scénario “retour en stock” fonctionne.
- Prouver que la sécurité “scraping” (SSRF + throttling) est respectée.
- Prouver que l’API est fiable (CRUD suivis, admin profils).

## Pyramide de tests
### Unit tests (pytest)
- Normalisation URL (canonisation, suppression tracking, etc.)
- Évaluation des règles (ProfileEngine)
- Transitions stock → notification (anti-doublon)
- Validation sécurité SSRF (hosts/IP/private ranges)

### Integration & Non-régression
- API ↔ DB : register/login + CRUD suivis
- Worker ↔ DB : insertion watch_checks + mise à jour suivi
- NotificationService : SMTP en mode “mailhog” (ou fake)
- **Non-régression** : Vérification que les nouveaux profils de sites ne cassent pas les détections existantes via fixtures.

### E2E (optionnel)
- Parcours UI (Playwright) : login → ajouter suivi → voir statut

## Données de test
- HTML fixtures (fichiers statiques) pour simuler in_stock / out_of_stock.
- 1 site réel max en test manuel (pas en CI).

## Matrice Exigences → Tests
*Note : Les tests listés ci-dessous sont définis comme objectifs cibles pour la phase de développement.*

| User Story | Test(s) | Type | Commande | Statut |
|---|---|---|---|---|
| US-01 (Inscription) | test_register_success, test_register_duplicate | integration | pytest -k register | Prévu |
| US-02 (Connexion) | test_login_success, test_login_invalid | integration | pytest -k login | Prévu |
| US-03 (Déconnexion) | test_logout | integration | pytest -k logout | Prévu |
| US-04 (Reset Password) | test_forgot_password, test_reset_password | integration | pytest -k reset | Prévu |
| US-05 (Créer un suivi) | test_create_watch_normalizes_url, test_ssrf_protection | unit | pytest -k watch | Prévu |
| US-06 (Voir mes suivis) | test_get_watches_list | integration | pytest -k get_watches | Prévu |
| US-07 (Pause / Reprise) | test_patch_watch_status | integration | pytest -k patch_watch | Prévu |
| US-08 (Suppression) | test_delete_watch | integration | pytest -k delete_watch | Prévu |
| US-09 (Vérif auto) | test_worker_run_cycle | integration | pytest -k worker | Prévu |
| US-10 (Gestion erreurs) | test_worker_error_handling | integration | pytest -k worker_error | Prévu |
| US-11 (Notifier) | test_notify_on_transition | unit | pytest -k notify | Prévu |
| US-12 (Anti-spam) | test_notify_no_duplicate | unit | pytest -k notify_spam | Prévu |
| US-13 (CRUD profils) | test_admin_crud_site_profile | integration | pytest -k admin_profile | Prévu |
| US-14 (Test profil) | test_admin_profile_test_endpoint | integration | pytest -k admin_profile_test | Prévu |
| US-15 (Accessibilité) | test_accessibility_lighthouse | manual | - | Prévu |
| US-18 (Métriques) | test_get_metrics | integration | pytest -k metrics | Prévu |

## CI (minimum)
- Lint : ruff
- Tests : pytest
- (Optionnel) scan deps : pip-audit
