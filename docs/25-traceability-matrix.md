# Nova - Matrice de traçabilité complète

## Objectif
Assurer la traçabilité entre les **User Stories**, les **Endpoints API**, les **Entités/Tables** de données, les **Tests** associés et les **preuves de démonstration**. Ce document est une preuve de cohérence pour le jury CDA.

---

## Matrice US → Endpoints → Tables → Tests → Preuves

| User Story | Endpoint(s) | Tables | Test(s) | Preuves / Démo |
|------------|-------------|--------|---------|----------------|
| **US-01** Inscription | `POST /auth/register` | `users` | `test_register_*` | Écran register (Front), Swagger `/docs` |
| **US-02** Connexion | `POST /auth/login` | `users` | `test_login_*` | Écran login (Front), Session établie (Cookie HttpOnly) |
| **US-03** Déconnexion | `POST /auth/logout` | `users` | `test_logout_*` | Bouton logout (Front) |
| **US-04** Reset Password | — | — | — | Prévu V2 |
| **US-05** Créer un suivi | `POST /watches` | `watches`, `site_profiles` | `test_create_watch_*` | Formulaire ajout URL (Front), `/docs` |
| **US-06** Voir mes suivis | `GET /watches` | `watches`, `watch_checks` | `test_list_watches_*` | Dashboard liste suivis (Front) |
| **US-07** Pause / Reprise | `PATCH /watches/{id}` | `watches` | — | Bouton pause/resume (Front) |
| **US-08** Suppression | `DELETE /watches/{id}` | `watches`, `watch_checks`, `notifications` | — | Bouton supprimer (Front) |
| **US-09** Vérif auto | Worker: `run_cycle()` | `watches`, `watch_checks` | `test_run_check_*` | Logs worker, `docker compose logs worker` |
| **US-10** Gestion erreurs | Worker: `process_watch()` | `watches`, `watch_checks` | `test_load_fixture_*` | Log `watch_check_failed`, statut BROKEN |
| **US-11** Notifier retour stock | Worker + `NotificationService` | `watches`, `notifications` | `test_run_job_email_*` | **Email Mailhog**, log `notification_sent` |
| **US-12** Anti-spam notifs | `NotificationService` | `notifications` | `test_run_job_no_email_*` | Relancer cycle → pas de 2e email |
| **US-13** Liste profils | `GET /admin/stats/site-profiles` | `site_profiles` | — | Interface Admin (Front) |
| **US-14** Test profil URL | — | — | — | Prévu V2 |
| **US-15** Accessibilité | — (Frontend) | — | — | Prévu V2 |
| **US-16** Export / Suppression | — | — | — | Prévu V2 |
| **US-17** Renommer suivi | `PATCH /watches/{id}` | `watches` | — | Champ label éditable (Front) |
| **US-18** Métriques admin | `GET /admin/stats/dashboard` | `watches`, `notifications` | — | Dashboard Admin métriques |

---

## Détail des tests par User Story

| US | Tests | Type |
|----|-----------------|------|
| US-01 | `test_register_success`, `test_register_duplicate_email` | Integration |
| US-02 | `test_login_success`, `test_login_invalid_password` | Integration |
| US-03 | `test_logout_returns_204` | Integration |
| US-04 | — | — |
| US-05 | `test_create_watch_success`, `test_create_watch_duplicate_url` | Integration |
| US-06 | `test_list_watches_returns_created_watch` | Integration |
| US-07 | — | — |
| US-08 | — | — |
| US-09 | `test_run_check_creates_watch_check`, `test_in_stock_fixture_*` | Unit + Integration |
| US-10 | `test_load_fixture_nonexistent_fixture_raises` | Unit |
| US-11 | `test_run_job_email_sent_on_change` | Integration |
| US-12 | `test_run_job_no_email_without_change` | Integration |
| US-13 | — | — |
| US-14 | — | — |
| US-15 | — | — |
| US-16 | — | — |
| US-17 | — | — |
| US-18 | — | — |

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
| SSRF Protection | Schémas API | — | Validation `HttpUrl` (Pydantic) |
| RBAC Admin | Dépendances API | — | 403 si USER accède `/admin/*` |
| Rate Limiting | Middleware | — | Prévu V2 |
| JWT Expiration | Logiciel | — | Prévu V2 |

---

## Preuves de démonstration par catégorie

### Frontend (écrans)
| Écran | US couverts |
|-------|-------------|
| Page Login / Register | US-01, US-02 |
| Page Reset Password | Prévu V2 |
| Dashboard utilisateur | US-06, US-07, US-08, US-17 |
| Formulaire ajout watch | US-05 |
| Interface Admin - Profils | US-13 |
| Interface Admin - Métriques | US-18 |
| Page Mon compte | Prévu V2 |

### Backend (endpoints via `/docs`)
| Endpoint | US couverts |
|----------|-------------|
| `POST /auth/register` | US-01 |
| `POST /auth/login` | US-02 |
| `POST /watches` | US-05 |
| `GET /watches` | US-06 |
| `PATCH /watches/{id}` | US-07, US-17 |
| `DELETE /watches/{id}` | US-08 |
| `GET /admin/stats/dashboard` | US-18 |
| `POST /admin/site-profiles/{id}/test` | Prévu V2 |

### Outils externes
| Outil | Preuves |
|-------|---------|
| **Mailhog** (http://localhost:8025) | US-11 - Emails de notification retour en stock |
| **Logs worker** (`docker compose logs worker`) | US-09, US-10, US-11, US-12 |
| **Swagger /docs** | Tous les endpoints API |

---

## Référence croisée
- User Stories détaillées : [`13-user-stories.md`](./13-user-stories.md)
- Stratégie de tests : [`06-test-strategy.md`](./06-test-strategy.md)
- Spécification API : [`07-api-spec.md`](./07-api-spec.md)
- Modèle de données : [`18-mpd.md`](./18-mpd.md)
- Plan de démo : [`26-demo-plan.md`](./26-demo-plan.md)
