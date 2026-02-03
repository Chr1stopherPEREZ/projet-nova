# Nova - Méthodologie et Environnement de travail

## Environnement de travail
*   **Versionnage :** GitHub (dépôt privé/public, gestion des Pull Requests).
*   **Gestion de projet :** Jira (Backlog, Sprints, Ticketing).
*   **Communication :** Discord (échanges quotidiens, alertes CI/CD).
*   **Documentation :**
    *   Markdown dans le dossier `docs/` du projet.
    *   Documentations officielles (FastAPI, SQLAlchemy, Pydantic, PostgreSQL, Docker).

## Méthodologie de projet
Le projet suit une méthodologie **Agile** de type **Kanban**, adaptée à un développement continu et fluide. Cette approche permet un **suivi du travail** en temps réel et facilite l'**organisation personnelle** sur les 4 semaines du projet.

### Organisation Jira
Le board Jira est le point central du pilotage :
*   **Backlog :** Liste de toutes les User Stories (US) et tâches techniques prioritaires.
*   **Tableau Kanban :** 
    *   `To Do` : Tâches prêtes à être lancées.
    *   `In Progress` : Tâches en cours de développement.
    *   `Review` : Pull Request ouverte, en attente de validation/test.
    *   `Done` : Tâche terminée, testée et mergée.
*   **Suivi du travail :** Utilisation des étiquettes (labels) pour distinguer le Frontend, Backend, et DevOps, permettant de mesurer l'avancement par domaine.
*   **Organisation personnelle :** Chaque tâche est estimée et assignée, permettant de garantir le respect du planning de 4 semaines.

## Qualité et Suivi
*   Réunions de synchronisation régulières (auto-bilan quotidien).
*   Respect des **Conventional Commits** pour un historique clair.
*   Automatisation des tests via GitHub Actions avant chaque fusion.

## Preuves de gestion (pour le jury)
*   **Captures d'écran du board Kanban** montrant l'évolution des tâches.
*   **Historique des commits** (GitHub) lié aux tickets Jira.
*   **Backlog trié** par priorité (Must/Should/Could).
