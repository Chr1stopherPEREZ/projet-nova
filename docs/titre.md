# Titre Professionnel : Concepteur Développeur d'Applications (CDA)

Ce document récapitule les compétences et livrables requis pour le passage du titre CDA, en faisant le lien avec la documentation du projet **Nova**.

---

### 1. Installer et configurer son environnement de travail en fonction du projet
*   **Contenu :** Choix technologiques, outils collaboratifs, moyens de communication, organisation et sources de documentation.
*   **Documentation de référence :**
    *   [`01-methodology-tools.md`](./01-methodology-tools.md) : Outils (GitHub, Jira, Discord) et méthodologie.

### 2. Développer des interfaces utilisateur
*   **Contenu :** Technologies utilisées, accessibilité, respect de la maquette, design adaptatif/responsive (Media Queries), framework CSS, SEO.
*   **Documentation de référence :**
    *   [`02-seo-responsive.md`](./02-seo-responsive.md) : Stratégie SEO et Responsive Design.
    *   [`03-accessibility.md`](./03-accessibility.md) : Accessibilité (a11y).
    *   [`10-graphic-charter.md`](./10-graphic-charter.md) : Charte graphique et composants UI.

### 3. Développer des composants métier
*   **Contenu :** Intégration de la logique métier, Programmation Orientée Objet (POO), code sécurisé, documentation, tests et architecture répondant à la problématique.
*   **Documentation de référence :**
    *   [`04-architecture-decisions-justification.md`](./04-architecture-decisions-justification.md) : Justifications et Service Layer.
    *   [`05-security.md`](./05-security.md) : Sécurité (SSRF, RBAC).
    *   [`11-mvp.md`](./11-mvp.md) : Périmètre fonctionnel du projet.
    *   [`13-user-stories.md`](./13-user-stories.md) : Backlog détaillé.

### 4. Contribuer à la gestion d'un projet informatique
*   **Contenu :** Choix de la méthodologie (Agile/Kanban), suivi du travail, qualité de la gestion de projet et organisation personnelle.
*   **Documentation de référence :**
    *   [`01-methodology-tools.md`](./01-methodology-tools.md) : Méthodologie Agile et organisation Jira.

### 5. Analyser les besoins et maquetter une application
*   **Contenu :** Conception et analyse, démarche structurée, public cible, charte graphique, cahier des charges, maquettes, prototype, User Flow, UML (Use Cases, Séquences, Classes, Activités) et Merise (MCD, MLD, MPD).
*   **Documentation de référence :**
    *   [`09-target-audience-personas.md`](./09-target-audience-personas.md) : Public cible et Personas.
    *   [`10-graphic-charter.md`](./10-graphic-charter.md) : Charte graphique et UX.
    *   [`12-user-flow-activity.md`](./12-user-flow-activity.md) : Enchaînement des écrans et diagrammes d'activités.
    *   [`14-uml-use-cases.md`](./14-uml-use-cases.md) / [`15-uml-sequence.md`](./15-uml-sequence.md) / [`16-uml-classes.md`](./16-uml-classes.md) : UML complet.
    *   [`19-mcd.md`](./19-mcd.md) / [`17-mld.md`](./17-mld.md) / [`18-mpd.md`](./18-mpd.md) : Modélisation Merise.

### 6. Définir l'architecture logicielle d'une application
*   **Contenu :** Choix techniques et d'architecture (MVC), définition des couches, sécurité répartie, Design Patterns et Éco-conception (Green IT).
*   **Documentation de référence :**
    *   [`04-architecture-decisions-justification.md`](./04-architecture-decisions-justification.md) : Architecture MVC, Service Layer et Design Patterns.
    *   [`20-green-it.md`](./20-green-it.md) : Stratégie d'éco-conception.
    *   **Architecture Decision Records (ADR) :**
        *   [`adr/001-auth.md`](./adr/001-auth.md) : Choix de la stratégie d'authentification.
        *   [`adr/002-scheduling.md`](./adr/002-scheduling.md) : Choix du moteur de planification.
        *   [`adr/003-scraping-modes.md`](./adr/003-scraping-modes.md) : Choix des modes de récupération (HTTP vs Navigateur).

### 7. Concevoir et mettre en place une base de données relationnelle
*   **Contenu :** Schémas Merise/UML, réflexion préalable, cohérence de nommage, déploiement, sécurité (droits utilisateurs), jeux de tests, RGPD et stratégie de sauvegarde.
*   **Documentation de référence :**
    *   [`21-database-ops.md`](./21-database-ops.md) : Sauvegardes, sécurité des droits et scripts de Seed.
    *   [`22-compliance.md`](./22-compliance.md) : Conformité et RGPD.
    *   [`18-mpd.md`](./18-mpd.md) : DDL PostgreSQL de référence.

### 8. Développer des composants d'accès aux données SQL et NoSQL
*   **Contenu :** Requêtage (SQL/ORM), justification des choix, sécurité (injections SQL), étapes du CRUD.
*   **Documentation de référence :**
    *   [`21-database-ops.md`](./21-database-ops.md) : Exemples de CRUD via SQLAlchemy et justifications.
    *   [`04-architecture-decisions-justification.md`](./04-architecture-decisions-justification.md) : Justification SQL vs NoSQL.

### 9. Préparer et exécuter les plans de tests d'une application
*   **Contenu :** Tests unitaires, d'intégration, de non-régression et de sécurité.
*   **Documentation de référence :**
    *   [`06-test-strategy.md`](./06-test-strategy.md) : Stratégie complète et matrice Exigences → Tests.

### 10. Préparer et documenter le déploiement d'une application
*   **Contenu :** CI/CD, scripts de déploiement, Docker, GitHub Actions, automatisation DevOps.
*   **Documentation de référence :**
    *   [`23-deployment.md`](./23-deployment.md) : Conteneurisation, Pipelines CI/CD et exploitation.

### 11. Contribuer à la mise en production dans une démarche DevOps
*   **Contenu :** Livraison régulière, environnements chaînés (test/prod), virtualisation.
*   **Documentation de référence :**
    *   [`23-deployment.md`](./23-deployment.md) : Stratégie de mise en production et virtualisation Docker.

---

### Mots-clés à retrouver dans la présentation
> Maquettage, Responsive design, framework CSS, optimisation SEO, architecture MVC, langage SQL, sécurité web, RGPD, tests, virtualisation, agile, versioning, Docker, CI/CD.

---

### Lexique
*   [`24-glossary.md`](./24-glossary.md) : Glossaire technique et métier du projet.

