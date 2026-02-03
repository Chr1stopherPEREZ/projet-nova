# Nova - Matrice de traçabilité complète

## Objectif
Assurer la traçabilité entre les **User Stories**, les **Endpoints API**, les **Entités/Tables** de données, les **Tests** associés et les **preuves de démonstration**. Ce document est une preuve de cohérence pour le jury CDA.

---

## Matrice US → Endpoints → Tables → Tests → Preuves

| User Story | Endpoint(s) | Tables | Test(s) | Preuves / Démo |
|------------|-------------|--------|---------|----------------|
| **US-01** Inscription | `POST /auth/register` | `users` | `test_register_*` | Écran register (Front), Swagger `/docs` |
| **US-02** Connexion | `POST /auth/login` | `users` | `test_login_*` | Écran login (Front), JWT retourné |
| **US-03** Déconnexion | `POST /auth/logout` | `users` | `test_logout_*` | Bouton logout (Front) |
| **US-04** Reset Password | `POST /auth/forgot-password`, `POST /auth/reset-password` | `users` | `test_reset_*` | Email Mailhog, lien reset |
| **US-05** Créer un suivi | `POST /watches` | `watches`, `site_profiles` | `test_create_watch_*` | Formulaire ajout URL (Front), `/docs` |
| **US-06** Voir mes suivis | `GET /watches` | `watches`, `watch_checks` | `test_get_watches_*` | Dashboard liste suivis (Front) |
| **US-07** Pause / Reprise | `PATCH /watches/{id}` | `watches` | `test_patch_watch_*` | Bouton pause/resume (Front) |
| **US-08** Suppression | `DELETE /watches/{id}` | `watches`, `watch_checks`, `notifications` | `test_delete_watch_*` | Bouton supprimer (Front) |
| **US-09** Vérif auto | Worker: `run_cycle()` | `watches`, `watch_checks` | `test_worker_*` | Logs worker, `docker compose logs worker` |
| **US-10** Gestion erreurs | Worker: `process_watch()` | `watches`, `watch_checks` | `test_worker_error_*` | Log `watch_check_failed`, statut BROKEN |
| **US-11** Notifier retour stock | Worker + `NotificationService` | `watches`, `notifications` | `test_notify_*` | **Email Mailhog**, log `notification_sent` |
| **US-12** Anti-spam notifs | `NotificationService` | `notifications` | `test_notify_no_duplicate_*` | Relancer cycle → pas de 2e email |
| **US-13** CRUD profils | `GET/POST/PATCH/DELETE /admin/site-profiles` | `site_profiles`, `audit_logs` | `test_admin_crud_*` | Interface Admin (Front), `/docs` |
| **US-14** Test profil URL | `POST /admin/site-profiles/{id}/test` | `site_profiles` | `test_admin_profile_test_*` | Bouton "Tester" Admin, résultat affiché |
| **US-15** Accessibilité | — (Frontend) | — | `test_accessibility_*` | Audit Lighthouse, navigation clavier |
| **US-16** Export / Suppression | `DELETE /users/me` | `users`, `watches`, `notifications` | `test_delete_user_*` | Bouton "Supprimer mon compte" |
| **US-17** Renommer suivi | `PATCH /watches/{id}` | `watches` | `test_patch_watch_label_*` | Champ label éditable (Front) |
| **US-18** Métriques admin | `GET /admin/metrics` | `watches`, `notifications` | `test_get_metrics_*` | Dashboard Admin métriques |

---

## Détail des tests par User Story

| US | Tests (à créer) | Type |
|----|-----------------|------|
| US-01 | `test_register_success`, `test_register_duplicate`, `test_register_invalid_email` | Integration |
| US-02 | `test_login_success`, `test_login_invalid_credentials` | Integration |
| US-03 | `test_logout_invalidates_token` | Integration |
| US-04 | `test_forgot_password_sends_email`, `test_reset_password_success`, `test_reset_token_expired` | Integration |
| US-05 | `test_create_watch_normalizes_url`, `test_create_watch_ssrf_blocked`, `test_create_watch_associates_profile` | Unit + Integration |
| US-06 | `test_get_watches_list`, `test_get_watches_empty` | Integration |
| US-07 | `test_patch_watch_pause`, `test_patch_watch_resume` | Integration |
| US-08 | `test_delete_watch_cascade` | Integration |
| US-09 | `test_worker_run_cycle`, `test_worker_selects_due_watches` | Integration |
| US-10 | `test_worker_error_handling_404`, `test_worker_error_sets_broken` | Integration |
| US-11 | `test_notify_on_transition_to_in_stock` | Unit + Integration |
| US-12 | `test_notify_no_duplicate_when_in_stock` | Unit |
| US-13 | `test_admin_crud_site_profile`, `test_admin_profile_requires_role` | Integration |
| US-14 | `test_admin_profile_test_endpoint`, `test_admin_profile_test_returns_result` | Integration |
| US-15 | `test_accessibility_lighthouse` | Manual / E2E |
| US-16 | `test_delete_user_cascades_data` | Integration |
| US-17 | `test_patch_watch_label` | Integration |
| US-18 | `test_get_metrics_returns_counts` | Integration |

---

## Couverture par composant

### API (FastAPI)
| Module | Endpoints couverts | Tests associés |
|--------|-------------------|----------------|
| Auth | `/auth/*` | US-01 à US-04 |
| Watches | `/watches/*` | US-05 à US-08, US-17 |
| Admin | `/admin/*` | US-13, US-14, US-18 |
| User | `/users/*` | US-16 |

### Worker (Scheduler + Scraping)
| Service | Fonction | Tests associés |
|---------|----------|----------------|
| `SchedulerService` | `run_cycle()`, `select_due_watches()` | US-09 |
| `ScraperService` | `process()`, `fetch()`, `parse()` | US-09, US-10 |
| `ProfileEngine` | `evaluate()`, `derive_stock_state()` | US-09, US-11 |
| `NotificationService` | `send_back_in_stock_email()` | US-11, US-12 |

### Sécurité
| Exigence | Composant | Test(s) | Preuve démo |
|----------|-----------|---------|-------------|
| SSRF Protection | `url_validator` | `test_ssrf_blocks_private_ip`, `test_ssrf_blocks_localhost` | Log `ssrf_blocked`, tentative URL privée |
| RBAC Admin | Middleware | `test_admin_endpoint_requires_admin_role` | 403 si USER accède `/admin/*` |
| Rate Limiting | Middleware | `test_rate_limit_on_login` | 429 après N tentatives |
| JWT Expiration | Auth | `test_expired_token_rejected` | 401 avec token expiré |

---

## Preuves de démonstration par catégorie

### Frontend (écrans)
| Écran | US couverts |
|-------|-------------|
| Page Login / Register | US-01, US-02 |
| Page Reset Password | US-04 |
| Dashboard utilisateur | US-06, US-07, US-08, US-17 |
| Formulaire ajout watch | US-05 |
| Interface Admin - Profils | US-13, US-14 |
| Interface Admin - Métriques | US-18 |
| Page Mon compte | US-16 |

### Backend (endpoints via `/docs`)
| Endpoint | US couverts |
|----------|-------------|
| `POST /auth/register` | US-01 |
| `POST /auth/login` | US-02 |
| `POST /watches` | US-05 |
| `GET /watches` | US-06 |
| `PATCH /watches/{id}` | US-07, US-17 |
| `DELETE /watches/{id}` | US-08 |
| `GET /admin/metrics` | US-18 |
| `POST /admin/site-profiles/{id}/test` | US-14 |

### Outils externes
| Outil | Preuves |
|-------|---------|
| **Mailhog** (http://localhost:8025) | US-04, US-11 - Emails de reset et notification |
| **Logs worker** (`docker compose logs worker`) | US-09, US-10, US-11, US-12 |
| **Swagger /docs** | Tous les endpoints API |

---

## Référence croisée
- User Stories détaillées : [`13-user-stories.md`](./13-user-stories.md)
- Stratégie de tests : [`06-test-strategy.md`](./06-test-strategy.md)
- Spécification API : [`07-api-spec.md`](./07-api-spec.md)
- Modèle de données : [`18-mpd.md`](./18-mpd.md)
- Plan de démo : [`26-demo-plan.md`](./26-demo-plan.md)
