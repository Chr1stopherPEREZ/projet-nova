# REAC — Mapping compétences CDA (RNCP 37873) → preuves Nova

## Méthode de vérification

* Règle : une compétence = “couverte” uniquement si une preuve existe (fichier / test / capture).
* Statuts :
  * **Implémenté** : présent dans le code + prouvé (tests/proofs)
  * **Partiel** : présent en partie ou sans preuve complète
  * **Prévu** : mentionné/planifié mais non implémenté
  * **Non couvert** : absent du projet
  * **À confirmer** : incertain, nécessite vérification

## Tableau de synthèse (CP1 → CP11)

| CP | Statut | Preuves principales (3 max)                                            | Commentaire (1 phrase) |
| :--- | :--- |:-----------------------------------------------------------------------| :--- |
| CP1 | **Implémenté** | `docker-compose.yml`, `api/Dockerfile`, `api/start.sh`                 | Environnement entièrement conteneurisé et reproductible. |
| CP2 | **Implémenté** | `web/src/pages/`, `lot7-watches-list.png`, `lot6-dashboard.png`        | SPA React avec dashboard, formulaires et gestion d'état. |
| CP3 | **Implémenté** | `shopify_parser.py`, `check_engine.py`, `test_parsers.py`              | Logique de scraping Shopify Live et moteur de transition d'état. |
| CP4 | **Implémenté** | `docs/gestion-projet.md`, `Nova.csv`, `git log`                        | Gestion par lots (Sprints), backlog Jira et historique Git traçable. |
| CP5 | **Implémenté** | `docs/09-personas.md`, `docs/11-mvp.md`, `assets/Charte_Graphique.png` | Analyse de besoins documentée et éléments de charte graphique. |
| CP6 | **Implémenté** | `docs/04-architecture.md`, `docker-compose`                            | Architecture en couches, services isolés et orchestration Docker. |
| CP7 | **Implémenté** | `api/app/models/`, `api/alembic/`, `docs/19-mcd.md`                    | Modélisation relationnelle Postgres 16 avec migrations Alembic. |
| CP8 | **Implémenté** | `api/app/core/database.py`, SQLAlchemy 2.0, JSON/JSONB                 | Accès SQL via ORM et utilisation de JSON/JSONB pour la flexibilité (SQL). |
| CP9 | **Implémenté** | `api/tests/`, `lot9-pytest-full-suite.png`, `docs/06-test-strategy.md` | Pyramide de tests (> 100 tests) incluant unitaires et intégration. |
| CP10 | **Implémenté** | `README.md` (Runbook), `docs/23-deployment.md`, `docker-compose`       | Procédure de démarrage "1 commande" et documentation d'exploitation. |
| CP11 | **Implémenté** | `.github/workflows/ci.yml`, Docker (Volumes/Networks), Ruff (Lint)     | Pipeline CI/CD automatisée (Lint, Tests, Build) et conteneurisation. |

## Détail par compétence

### CP1 — Installer et configurer son environnement

* **Statut :** **Implémenté**
* **Ce que Nova démontre** :
  * Virtualisation complète des services (API, Web, Worker, DB, Mailhog).
  * Automatisation du démarrage (scripts de migration et de seed intégrés).
  * Gestion des variables d'environnement via `.env.example`.
* **Preuves** :
  * Fichiers :
    * `docker-compose.yml`
    * `api/Dockerfile`, `web/Dockerfile`
    * `api/start.sh`
    * `README.md`
  * Captures `docs/proofs` :
    * `lot1/screens/s1-02-compose-ps.png` (Services Up)
* **Vérifications rapides (commandes)** :
  * `docker compose up --build`
  * `docker compose ps`

### CP2 — Développer des interfaces utilisateur

* **Statut :** **Implémenté**
* **Ce que Nova démontre** :
  * Création d'une Single Page Application (SPA) avec React et Tailwind CSS.
  * Gestion de l'authentification (Login/Logout) et des sessions.
  * Dashboard interactif avec listes, badges d'état et actions (CRUD).
* **Preuves** :
  * Fichiers :
    * `web/src/pages/DashboardPage.tsx`
    * `web/src/pages/LoginPage.tsx`
    * `web/src/components/layout/DashboardLayout.tsx`
  * Captures UI `docs/proofs` :
    * `lot7/screens/s3-11-lot7-watches-list.png`
    * `lot6/screens/s3-04-lot6-dashboard.png`
* **Vérifications** :
  * Parcours démo : connexion -> dashboard -> preview -> ajout de suivi.

### CP3 — Développer des composants métier

* **Statut :** **Implémenté**
* **Ce que Nova démontre** :
  * Moteur de détection de stock (Check Engine) asynchrone.
  * Parsers spécialisés pour Shopify (Live API HTTPX).
  * Système de notification automatique sur changement d'état.
* **Preuves** :
  * Fichiers :
    * `api/app/services/check_engine.py` (Moteur de règles)
    * `api/app/services/shopify_parser.py` (Scraping live)
    * `api/app/services/email.py` (Notification service)
  * Tests :
    * `api/tests/test_parsers.py`
    * `api/tests/test_worker.py`
* **Vérification** :
  * Lancement du worker et réception de l'email dans Mailhog.

### CP4 — Contribuer à la gestion d’un projet informatique

* **Statut :** **Implémenté**
* **Ce que Nova démontre** :
  * Suivi de projet par lots (9 lots de preuves).
  * Réconciliation du backlog Jira avec la réalité technique (Git).
  * Respect des critères de la "Definition of Done" (DoD).
* **Preuves** :
  * Fichiers :
    * `docs/gestion-projet.md`
    * `Nova.csv` (Export Jira)
    * `docs/nova-planning.md`
  * Git :
    * Commits préfixés (`feat:`, `fix:`, `docs:`)
  * Capture :
    * `docs/proofs/lot1/screens/s1-01-jira-backlog.png` (Backlog initial)
* **Vérifications** :
  * Cohérence : US terminées ↔ Preuves fournies ↔ Commits Git.

### CP5 — Analyser les besoins et maquetter

* **Statut :** **Implémenté** (Analyse) / **Partiel** (Maquettes)
* **Ce que Nova démontre** :
  * Définition de personas et d'objectifs produit clairs.
  * Rédaction de User Stories au format Gherkin avec critères d'acceptation.
  * Création d'une charte graphique et de schémas de navigation.
* **Preuves** :
  * Fichiers :
    * `docs/09-target-audience-personas.md`
    * `docs/13-user-stories.md`
    * `docs/11-mvp.md`
  * Assets :
    * `docs/assets/Projet_Nova_ Charte_Graphique.png`
    * `docs/assets/Navigation_User.png`
* **Note** : Les captures d'écran de l'UI finale servent de validation visuelle par rapport aux besoins exprimés.

### CP6 — Définir l’architecture logicielle

* **Statut :** **Implémenté**
* **Ce que Nova démontre** :
  * Architecture en couches (API, Service, Data Access).
  * Isolation des processus (Worker batch séparé de l'API).
  * Utilisation de design patterns (Strategy pour les parsers, Service Layer).
* **Preuves** :
  * Fichiers :
    * `docs/04-architecture-decisions-justification.md`
    * `docker-compose.yml` (Orchestration des services)
    * Schémas (Mermaid)
* **Vérification** :
  * Structure du code dans `api/app/`.

### CP7 — Concevoir et mettre en place une base relationnelle

* **Statut :** **Implémenté**
* **Ce que Nova démontre** :
  * Modèle de données normalisé (MCD/MLD/MPD).
  * Gestion des contraintes d'intégrité (FK, Unicité, Cascade).
  * Versioning de la base de données (Migrations).
* **Preuves** :
  * Fichiers :
    * `api/app/models/watch.py`, `user.py`, `watch_check.py`
    * `api/alembic/versions/` (Historique des migrations)
    * `docs/19-mcd.md`, `docs/18-mpd.md`
* **Vérification** :
  * `docker compose exec api alembic current` (Version active de la DB).

### CP8 — Développer des composants d’accès aux données (SQL/NoSQL)

* **Statut :** **Implémenté** (SQL) / **Non couvert** (NoSQL)
* **Ce que Nova démontre** :
  * Utilisation de l'ORM SQLAlchemy 2.0 pour les interactions SQL.
  * Requêtes complexes pour les statistiques et le dashboard.
  * Utilisation des types JSON et JSONB (PostgreSQL) pour les données flexibles.
* **Preuves** :
  * Fichiers :
    * `api/app/core/database.py` (Session management)
    * `api/app/api/routes/stats.py` (Agrégations SQL)
    * `api/app/api/routes/watches.py` (CRUD ORM)
* **IMPORTANT** : Le projet est exclusivement relationnel (SQL), le NoSQL n'est pas utilisé.

### CP9 — Préparer et exécuter des plans de tests

* **Statut :** **Implémenté**
* **Ce que Nova démontre** :
  * Stratégie de tests structurée (Unitaire, Intégration, Sécurité).
  * Automatisation via Pytest avec exécution asynchrone.
  * Couverture des cas d'erreurs (404, CSRF, Auth).
* **Preuves** :
  * Fichiers :
    * `api/tests/` (107 tests détectés)
    * `docs/06-test-strategy.md`
  * Captures :
    * `docs/proofs/lot9/screens/s4-10-lot9-pytest-full-suite.png`
* **Vérification** :
  * `docker compose exec api pytest -q api/tests`

### CP10 — Préparer et documenter le déploiement

* **Statut :** **Implémenté**
* **Ce que Nova démontre** :
  * Document de déploiement (Runbook) détaillé.
  * Configuration de l'environnement de production (Docker multi-stage).
  * Scripts de démarrage automatisant les migrations et le seed.
* **Preuves** :
  * Fichiers :
    * `README.md` (Section Installation)
    * `docs/23-deployment.md`
    * `api/start.sh`
* **Vérification** :
  * Succès du `docker compose up --build`.

### CP11 — Contribuer à la mise en production (DevOps)

* **Statut :** **Implémenté**
* **Ce que Nova démontre** :
  * Mise en place d'une pipeline CI/CD via **GitHub Actions**.
  * Automatisation des tests (Pytest) et du linting (Ruff/ESLint).
  * Vérification automatique de la buildabilité des images Docker.
  * Observabilité via les logs centralisés de Docker.
* **Preuves** :
  * Fichiers :
    * `.github/workflows/ci.yml` (Workflow d'intégration continue)
    * `api/pyproject.toml` (Config Ruff)
    * `docker-compose.yml` (Infrastructure)
* **Vérifications** :
  * Exécution automatique des tests à chaque `push` ou `PR`.
  * `docker compose logs -f api`

## Conclusion

* **Couverture globale** : Nova couvre de manière solide les 11 compétences du REAC CDA.
* **Points forts** : Architecture (CP6), Développement (CP2/CP3), Tests (CP9), Base de données (CP7) et DevOps (CP11).
* **Partiel / Non couvert** :
  * Le NoSQL (CP8) est absent par choix architectural (PostgreSQL JSONB suffit).
  * Le maquettage (CP5) est présent via des assets graphiques mais manque d'un prototype interactif complet (Figma).

---
