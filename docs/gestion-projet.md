# Gestion de Projet - Nova (Timeline & Backlog)

Ce document présente la gestion du projet Nova à travers la chronologie réelle (Git) et l'état d'avancement du backlog (Jira corrigé).

## 1. Timeline Réelle (Source : Git Log & Proofs)

Le projet a été mené sur une période de 4 semaines intensives, structurées en "Lots" fonctionnels (Sprints).

| Période | Phase / Lot | Jalons & Livrables                                                             | Statut |
| :--- | :--- |:-------------------------------------------------------------------------------| :--- |
| **28 Jan - 03 Fév** | **Lot 0 : Conception** | Spécifications MVP, MCD/MLD, Architecture, Personas. (Source: `docs/`)         | ✓ |
| **04 Fév** | **Lot 1 : Fondations** | Docker Compose, API Setup, Swagger, Mailhog. (Preuve: `lot1`)                  | ✓ |
| **05 Fév** | **Lot 2 : Sécurité** | Auth JWT, Argon2id, CSRF, Pytest setup. (Preuve: `lot2`)                       | ✓ |
| **05 Fév** | **Lot 3 : Watches API** | CRUD Suivis, Normalisation URL. (Preuve: `lot3`)                               | ✓ |
| **06 Fév - 09 Fév** | **Lot 4 & 5 : Worker** | Logique de check batch, Logs, DB Checks. (Preuve: `lot4`, `lot5`)              | ✓ |
| **17 Fév** | **Lot 6 : Front Login** | React initialization, Page Login, Dashboard UI. (Preuve: `lot6`)               | ✓ |
| **23 Fév** | **Lot 7 : Front Watches** | Liste suivis, Création, Détails, Trigger check. (Preuve: `lot7`)               | ✓ |
| **25 - 26 Fév** | **Lot 8 : Qualité UI** | Gestion d'erreurs (401, 403, 404, 422), Feedback utilisateur. (Preuve: `lot8`) | ✓ |
| **27 Fév** | **Lot 9 : Tests Finaux** | Pytest Full Suite, Smoke Tests, Validation Démo. (Preuve: `lot9`)              | ✓ |
| **En cours** | **Lot 10 : Finalisation** | Dossier Projet, Checklist Soutenance.                                          | * |

## 2. Mapping Jira (Backlog) vs Réalité

L'export Jira CSV initial comportait des statuts non mis à jour ("À faire"). Voici la correction basée sur le code présent dans le dépôt.

| Ticket Jira | Résumé                                    | Réalité (Code/Fichier)                    | Statut Réel |
| :--- |:------------------------------------------|:------------------------------------------| :--- |
| **NOVA-34** | Docs MVP/API/Profils                      | `docs/11-mvp.md`, `docs/07-api-spec.md`   | Terminé |
| **NOVA-33** | Scénario démo 'retour en stock'           | `docs/13-demo-plan.md`, `api/app/seed.py` | Terminé |
| **NOVA-31** | Backend: Worker et Logique de check       | `api/app/worker.py`, `check_engine.py`    | Terminé |
| **NOVA-25** | Sécurité: Hashage Argon2id                | `api/app/core/security.py`                | Terminé |
| **NOVA-23** | Frontend: Dashboard et gestion des suivis | `web/src/pages/DashboardPage.tsx`         | Terminé |
| **NOVA-12** | Database: Migration Alembic               | `api/alembic/versions/`                   | Terminé |
| **NOVA-XX** | Dossier Projet                            |                                           | En cours |

## 3. Gestion des Risques & Arbitrages

1. **Scraping Nike** : Arbitrage vers un mode "Fixture" (données simulées) pour garantir une démonstration stable devant le jury sans blocage réseau (Anti-bot).
2. **Shopify Live** : Implémentation d'une exception via HTTPX pour démontrer la capacité à traiter du contenu dynamique en temps réel.
3. **Sécurité CSRF** : Ajout du middleware `verify_csrf` pour sécuriser le frontend React face aux vulnérabilités courantes, en complément du JWT.

## 4. Proposition de Jira-Updated.csv (Extrait)

| Clé | Résumé | État (Corrigé) | Mise à jour |
| :--- | :--- | :--- | :--- |
| NOVA-31 | Backend: Worker | Terminé | 09/févr./26 |
| NOVA-23 | Frontend UI | Terminé | 26/févr./26 |
| NOVA-1 | Conception | Terminé | 03/févr./26 |
