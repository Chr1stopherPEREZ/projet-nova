# Mapping Compétences CDA (Référentiel Titre Professionnel)

Ce tableau fait le lien entre les réalisations du projet Nova et les compétences évaluées lors du titre CDA.

| Bloc de Compétence | Éléments de Preuve (Nova) | Source / Fichier                             | Dossier CDA (Section) |
| :--- | :--- |:---------------------------------------------| :--- |
| **1. Concevoir une application** | Diagrammes UML, MCD/MLD/MPD. | `docs/16-uml-classes.md`, `docs/19-mcd.md`   | Section 5 |
| **2. Développer l'interface utilisateur** | SPA React, Tailwind CSS, Gestion d'état. | `web/src/App.tsx`, `web/src/pages/`          | Section 6 |
| **3. Développer les composants métier** | Services de parsing (Nike/Shopify), Logique worker. | `api/app/services/check_engine.py`           | Section 6 |
| **4. Contribuer à la gestion de projet** | Backlog Jira, Timeline Git, Agile (Sprints). | `docs/gestion-projet.md`, `jira-updated.csv` | Section 4 |
| **5. Sécuriser une application** | JWT, Argon2id, RBAC, CSRF Protection. | `api/app/core/security.py`, `csrf.py`        | Section 7 |
| **6. Qualité et Tests** | Pytest (Unitaires & Intégration), Smoke Tests. | `api/tests/`, `api/pyproject.toml`           | Section 8 |
| **7. Déployer et Maintenir** | Docker Compose, Alembic (Migrations), Logs. | `docker-compose.yml`, `api/start.sh`         | Section 9 |
