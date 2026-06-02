# Traceability Matrix — Nova (Lot 10)

Ce document établit le lien entre les exigences du MVP (Lot 10), les routes API, les composants Frontend et les tests associés.

| Exigence | Route API (Backend) | Page/Composant (Frontend) | Test / Preuve |
| :--- | :--- | :--- | :--- |
| **Rôles Utilisateurs** | `GET /auth/me` | `LoginPage.tsx`, `ProtectedRoute.tsx` | Test login admin vs user |
| **Dashboard User (KPIs)** | `GET /stats/dashboard` | `DashboardPage.tsx` | Affichage KPIs personnels |
| **Dashboard Admin (Global)**| `GET /admin/stats/dashboard` | `AdminDashboardPage.tsx` | Vision globale système |
| **Tous les suivis (Admin)** | N/A (MVP UI) | `AdminWatchesPage.tsx` | Liste globale des suivis |
| **Tester un profil** | N/A (MVP UI) | `AdminTestProfilePage.tsx` | Outil diagnostic admin |
| **Profils de site** | N/A (MVP UI) | `AdminSiteProfilesPage.tsx` | Gestion des templates |
| **Sécurité Admin** | `Depends(require_admin)` | `ProtectedRoute adminOnly` | Redirection + Alerte si USER tente /admin/* |
| **Suivis (CRUD)** | `GET /watches`, `POST /watches`| `WatchesPage.tsx`, `CreateWatchPage.tsx` | Création et liste suivis |
| **Exécution Check** | `POST /jobs/run` | `WatchDetailPage.tsx` (Bouton Run) | Log worker + email Mailhog |
| **Pages Non Vides** | N/A | `Settings`, `Help`, `Notifications`, `Privacy`, `Terms` | Navigation sans page vide |
| **Authentification** | `POST /auth/login` | `LoginPage.tsx` | Cookie JWT + CSRF Token |
| **Notifications (Badge)** | `GET /stats/dashboard` | `DashboardLayout.tsx` | Badge rouge si unread_count > 0 |
| **Marquer comme lu** | `POST /stats/notifications/mark-as-read` | `NotificationsPage.tsx` | Le badge disparaît après visite |

## Détails des Endpoints de Statistiques

### 1. User Dashboard (`GET /stats/dashboard`)
Retourne les KPIs de l'utilisateur connecté et un tableau de performance par domaine.
- **KPIs**: `active_watches`, `checks_today`, `changes_7d`, `errors_7d`, `last_check_at`, `unread_notifications_count`.
- **Table**: Liste de `{ host, checks, changes, alerts_sent }`.

### 2. Admin Dashboard (`GET /admin/stats/dashboard`)
Retourne la vision globale du système (tous utilisateurs).
- **KPIs globaux**: `active_watches`, `checks_today`, `alerts_sent_7d`, `errors_7d`, `last_check_at`.
- **Top Domaines**: Agrégation globale par host.

## Preuves de validation
- **Unit Tests**: `pytest` sur les modèles et la logique de stats.
- **Integration Tests**: Scénario complet login -> dashboard -> run check.
- **Demo**: Script de démonstration validant chaque point de la matrice.
