# Nova — Plateforme de suivi de retour en stock

Nova est une application web conçue pour surveiller la disponibilité de produits sur des sites marchands et notifier les utilisateurs dès qu'un retour en stock est détecté. Ce projet est réalisé sur un cycle court de **5 semaines**, avec un suivi de projet rigoureux assuré via **Jira (Kanban)**.

## Objectifs du projet
L'application permet d'automatiser une veille qui est aujourd'hui manuelle et fastidieuse. Elle repose sur un moteur de scraping intelligent capable de s'adapter aux changements de structure des sites cibles grâce à un système de profils dynamiques.

## Structure de la documentation
Le projet est entièrement documenté pour garantir une implémentation fluide et cohérente :

- **[`Nova_cahier_des_charges.md`](./Nova_cahier_des_charges.md)** : Le document de référence définissant le périmètre, les contraintes et les critères de validation.
- **[`docs/`](./docs/)** : Spécifications détaillées (MVP, User Stories, Modèles de données, UML, API, Sécurité, etc.).
    - [`01-methodology-tools.md`](./docs/01-methodology-tools.md) : Méthodologie et outils.
    - [`02-seo-responsive.md`](./docs/02-seo-responsive.md) : SEO et Design adaptatif.
    - [`03-accessibility.md`](./docs/03-accessibility.md) : Accessibilité.
    - [`04-architecture-decisions-justification.md`](./docs/04-architecture-decisions-justification.md) : Architecture et justifications.
    - [`05-security.md`](./docs/05-security.md) : Sécurité baseline.
    - [`06-test-strategy.md`](./docs/06-test-strategy.md) : Stratégie de tests.
    - [`07-api-spec.md`](./docs/07-api-spec.md) : Spécification API.
    - [`08-site-profiles-spec.md`](./docs/08-site-profiles-spec.md) : Profils de sites.
    - [`09-target-audience-personas.md`](./docs/09-target-audience-personas.md) : Public cible et Personas.
    - [`10-graphic-charter.md`](./docs/10-graphic-charter.md) : Charte graphique et UX.
    - [`11-mvp.md`](./docs/11-mvp.md) : Cadrage MVP.
    - [`12-user-flow-activity.md`](./docs/12-user-flow-activity.md) : Flux utilisateur et activités.
    - [`13-user-stories.md`](./docs/13-user-stories.md) : Backlog détaillé.
    - [`14-uml-use-cases.md`](./docs/14-uml-use-cases.md) : Cas d'utilisation.
    - [`15-uml-sequence.md`](./docs/15-uml-sequence.md) : Diagrammes de séquence.
    - [`16-uml-classes.md`](./docs/16-uml-classes.md) : Diagramme de classes.
    - [`17-mld.md`](./docs/17-mld.md) : Modèle Logique de Données.
    - [`18-mpd.md`](./docs/18-mpd.md) : Modèle Physique de Données.
    - [`19-mcd.md`](./docs/19-mcd.md) : Modèle Conceptuel de Données.
    - [`20-green-it.md`](./docs/20-green-it.md) : Éco-conception.
    - [`21-database-ops.md`](./docs/21-database-ops.md) : Opérations BDD.
    - [`22-compliance.md`](./docs/22-compliance.md) : Conformité et RGPD.
    - [`23-deployment.md`](./docs/23-deployment.md) : Déploiement et DevOps.
    - [`24-glossary.md`](./docs/24-glossary.md) : Glossaire technique.
- **[`docs/adr/`](./docs/adr/)** : Architecture Decision Records traçant les choix techniques structurants (Auth, Scheduling, Scraping).

## Stack Technique (Prévisionnelle)
- **Backend** : Python 3.12+, FastAPI
- **Base de données** : PostgreSQL
- **Worker / Scraping** : APScheduler, HTTPX, Playwright
- **Frontend** : Dashboard minimaliste (3-4 écrans clés). La stack technique est flexible (React/Tailwind ou HTML/CSS/JS natif) et sera validée à l'issue de la phase de prototypage Figma.
- **Déploiement** : Docker & Docker Compose

## 📖 Guide de démarrage (Plan 5 semaines)
1. **Semaine 1 : Analyse & Design (Phase 1)** - Lire `docs/11-mvp.md`, valider le backlog (`13-user-stories.md`) et initialiser l'environnement Docker. Travail sur **Figma** : Création de la **charte graphique** et des **wireframes**.
2. **Semaine 2 : Données & Design (Phase 2)** - Implémenter le modèle (`18-mpd.md`) et les endpoints de base (`07-api-spec.md`). Suite sur **Figma** : Réalisation des **maquettes haute-fidélité** et du **prototype interactif**.
3. **Semaine 3 : Worker & Scraping** - Développer le cœur du système à partir de `docs/08-site-profiles-spec.md` et de l'ADR 003.
4. **Semaine 4 : Développement Frontend & Notifications** - Intégration de l'interface utilisateur basée sur les maquettes Figma et mise en place des alertes e-mail.
5. **Semaine 5 : QA & Déploiement** - Exécuter la stratégie de tests (`06-test-strategy.md`) et finaliser le déploiement.
