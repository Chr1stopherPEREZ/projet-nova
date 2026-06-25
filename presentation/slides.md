---
theme: seriph
background: https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070
class: text-center
highlighter: shiki
lineNumbers: true
info: |
  ## Présentation CDA - Projet Nova
  Christopher Perez
drawings:
  persist: false
transition: slide-left
title: Nova - Soutenance CDA
---

# Nova V2
## Application de suivi de disponibilité produit
### Soutenance de titre CDA

<div class="pt-12">
  <span class="px-2 py-1 rounded">
    Christopher Perez
  </span>
</div>

<!--
Notes orateur :
- Bonjour à tous, je m'appelle Christopher Perez.
- Je vous présente Nova V2, une solution automatisée pour surveiller la disponibilité des produits e-commerce.
- Cette présentation est structurée autour des compétences du titre CDA démontrées par ce projet.
- Chaque partie montrera comment Nova apporte une preuve concrète de ces compétences.
-->

---

# 1. Introduction

*   **Besoin** : Ruptures de stock fréquentes et vérifications manuelles chronophages.
*   **Solution Nova** : Dashboard centralisé, historisation des vérifications et test de notification via Mailhog.
*   **Parcours central** :
    1. Créer un suivi (URL) → 2. Analyser le produit (Preview) → 3. Déclencher une vérification (Worker) → 4. Historiser (DB) → 5. Tester une notification via Mailhog.
*   **Objectif V2** : Une version stable, sécurisée et reproductible, alignée sur les attendus du titre.

<!--
Notes orateur :
- L'idée est de passer d'une vérification manuelle frustrante à un dashboard automatisé.
- La V2 se concentre sur la robustesse technique et la fiabilité des données.
- Je vais maintenant détailler comment Nova répond aux compétences du référentiel.
-->

---

# 2. Contribuer à la gestion d’un projet

### Compétence CDA : "Planifier, suivre et assurer la qualité du projet"

*   **Réalisation** : Backlog Jira consolidé, découpage en lots, gestion des risques.
*   **Outils** : Jira (planification), Git (versioning), Docker (environnement).

| Point clé | Détail Nova |
| :--- | :--- |
| **Planification** | Backlog agile avec US priorisées (EPIC A à G). |
| **Qualité** | Linting (ESLint), typage (TS/Python), tests automatiques. |
| **Risques** | Identification des instabilités web → Solution : Mode Fixture pour la démo. |
| **Preuves** | Backlog CSV, Historique Git, Dossier projet (section Gestion). |

<!--
Notes orateur :
- J'ai utilisé une démarche agile pour prioriser le "Must Have" (Auth, CRUD, Worker).
- L'arbitrage V2/V3 a été crucial pour garantir une version démontrable et stable dans les temps.
- Les preuves sont disponibles dans le dossier projet et via le backlog consolidé fourni.
-->

---

# 3. Analyser les besoins et maquetter

### Compétence CDA : "Formaliser les besoins et concevoir l'UX/UI"

*   **Réalisation** : Étude personas, User Stories, parcours utilisateur et maquettes Figma.
*   **Focus** : Simplicité du parcours "Ajout de suivi".

*   **User Story** : "En tant qu'utilisateur, je veux coller une URL pour voir si le produit est disponible".
*   **Maquettage** : Wireframes basse fidélité → Prototypes haute fidélité (Figma).
*   **Preuves** : Dossier projet, captures `docs/proofs/v2-design` (Application Map, Style Guide).

<!--
Notes orateur :
- L'analyse a permis de définir le parcours central pour éviter que l'utilisateur ne se perde.
- J'ai conçu des maquettes pour valider l'ergonomie (Navigation, Dashboard) avant de coder.
- J'ai pris en compte les contraintes d'accessibilité (contraste, labels) dès la conception.
-->

---

# 4. Définir l’architecture logicielle

### Compétence CDA : "Concevoir une architecture multicouche sécurisée"

*   **Réalisation** : Architecture Monorepo avec séparation stricte des responsabilités.
*   **Stack** : React (Web) + FastAPI (API) + PostgreSQL (DB) + Worker (Batch).

*   **Sécurité** : Communication via API REST, isolation des services par Docker.
*   **Extensibilité** : Moteur de parsing modulaire (Shopify, Fixture).
*   **Preuves** : Schéma d'architecture, `docker-compose.yml`, structure des dossiers.

<!--
Notes orateur :
- J'ai choisi une architecture multicouche pour faciliter la maintenance et l'évolution.
- Le backend FastAPI génère automatiquement une doc Swagger, point d'entrée technique clair.
- Docker Compose orchestre l'ensemble des 5 services (Web, API, DB, Worker, Mailhog).
-->

---

# 5. Développer des interfaces utilisateur

### Compétence CDA : "Développer des interfaces sécurisées et adaptées"

*   **Réalisation** : SPA avec React, Vite, TypeScript et Tailwind CSS.
*   **Fonctionnalités** : Dashboard, Preview produit, Historique dynamique.

*   **Sécurité** : `ProtectedRoute`, gestion du token CSRF dans le client API.
*   **UX** : États de chargement, gestion des erreurs (404, 403), responsive design.
*   **Preuves** : Code `/web/src`, captures Dashboard et Detail (`lot7`), build/lint OK.

<!--
Notes orateur :
- L'interface utilise Tailwind pour un design moderne et responsive.
- Le client API centralise les appels et injecte automatiquement le header CSRF pour les actions mutatives.
- J'ai implémenté des routes protégées pour garantir que seuls les utilisateurs authentifiés accèdent aux données.
-->

---

# 6. Développer des composants métier

### Compétence CDA : "Développer la partie dynamique sécurisée"

*   **Réalisation** : API FastAPI avec validation Pydantic et moteur de check.
*   **Logique** : Parsing HTML/JSON, détection des états `IN_STOCK` / `OUT_OF_STOCK`.

*   **Sécurité** : Authentification par Cookie HttpOnly, hashage Argon2id.
*   **Défensif** : Validation stricte des entrées via schémas, gestion des exceptions métier.
*   **Preuves** : Routes API, Tests Pytest (107 passed), documentation Swagger UI.

<!--
Notes orateur :
- FastAPI garantit la performance et la sécurité grâce au typage Python et à Pydantic.
- Le moteur de check est le cœur du projet : il analyse les pages produits de manière asynchrone.
- Le code est structuré en services (Email, Check Engine, Auth) pour une meilleure modularité.
-->

---

# 7. Concevoir une base de données relationnelle

### Compétence CDA : "Modéliser et mettre en place la persistance"

*   **Réalisation** : Schéma PostgreSQL optimisé pour l'historisation.
*   **Modélisation** : Relations 1:N entre Utilisateurs → Suivis (Watches) → Vérifications (Checks).

*   **Intégrité** : Contraintes `UniqueConstraint` (URL+Variant) et clés étrangères SQL.
*   **Évolutivité** : Gestion des versions de schéma via migrations Alembic.
*   **Preuves** : Schéma Merise (MCD/MLD), migrations Alembic, script `seed.py`.

<!--
Notes orateur :
- La base de données est conçue pour garder une trace immuable de chaque vérification effectuée.
- Alembic me permet de faire évoluer la base de manière reproductible sur tous les environnements.
- J'ai créé un jeu d'essai complet (seed) pour sécuriser la démonstration.
-->

---

# 8. Développer des composants d’accès aux données

### Compétence CDA : "Gérer les manipulations de données sécurisées"

*   **Réalisation** : Utilisation de SQLAlchemy (ORM) avec style défensif.
*   **Confidentialité** : Filtrage systématique par `user_id` pour chaque requête SQL.

*   **Transactions** : Gestion des sessions et rollbacks via context managers FastAPI.
*   **Validation** : Vérification de la propriété de la donnée avant toute modification (DELETE/PATCH).
*   **Preuves** : Modèles SQLAlchemy, services CRUD, tests unitaires d'accès.

<!--
Notes orateur :
- L'utilisation d'un ORM et de requêtes paramétrées protège contre les injections SQL.
- J'ai porté une attention particulière à l'isolation des données : un utilisateur ne peut jamais interférer avec les suivis d'un autre.
-->

---

# 9. Sécuriser l’application (Synthèse)

### "La sécurité n'est pas une option, c'est une compétence"

*   **Protections** : Authentification, cookie HttpOnly, CSRF, validation backend et isolation des données.
*   **Données** : Hashage Argon2id, validation Pydantic, isolation par utilisateur.
*   **Preuves** : Code `core/csrf.py`, dossier projet section "Sécurité", figure flux CSRF.

<!--
Notes orateur :
- J’ai mis en place plusieurs protections attendues sur une application web : authentification, cookie HttpOnly, CSRF, validation backend et isolation des données.
- Le CSRF est ici systématiquement vérifié par une dépendance globale au niveau des routes mutatives.
- Les erreurs sont gérées pour ne pas divulguer d'informations sensibles sur l'infrastructure.
-->

---

# 10. Préparer et exécuter les plans de tests

### Compétence CDA : "Garantir le fonctionnement et la non-régression"

*   **Réalisation** : Suite de tests automatisés avec Pytest sur les principales fonctionnalités backend.
*   **Tests** : Unitaires (parsers), Intégration (API), Sécurité (Auth/CSRF).

*   **Mode Fixture** : Utilisation de fichiers HTML locaux pour tester le moteur sans dépendre du web réel.
*   **Qualité** : Linting ESLint et build de production validés (Zéro erreur bloquante).
*   **Preuves** : Captures `pytest passed`, logs de build, Swagger UI pour tests manuels.

<!--
Notes orateur :
- Les tests couvrent le parcours critique : inscription, création de suivi, parsing et notifications.
- Le mode fixture est une stratégie qui a fiabilisé ma démonstration et mes tests d'intégration.
- La non-régression est assurée par l'exécution de la suite de tests avant chaque livraison.
-->

---

# 11. Préparer et documenter le déploiement

### Compétence CDA : "Rendre l'application installable et documentée"

*   **Réalisation** : Orchestration Docker Compose pour un déploiement reproductible.
*   **Documentation** : README complet (procédure de lancement) et dossier technique PDF.

*   **Configuration** : Gestion des secrets via variables d'environnement (`.env`).
*   **Services** : 5 conteneurs isolés (Web, API, DB, Worker, Mailhog).
*   **Preuves** : Fichier `docker-compose.yml`, capture `docker compose ps`, README.md.

<!--
Notes orateur :
- L'application est portable. Docker Compose permet de reproduire l’environnement localement avec les services nécessaires.
- La documentation technique détaille la procédure pour passer du mode fixture au mode live.
-->

---

# 12. Démarche DevOps

### Compétence CDA : "Automatiser et collaborer efficacement"

*   **Réalisation** : Utilisation de Git, branches de travail, conteneurisation et automatisation locale.
*   **Livrables** : Scripts de démarrage (`start.sh`) automatisant migrations et seeds.

*   **Versioning** : Historique Git reflétant les itérations et les corrections de bugs.
*   **Conteneurs** : Dockerfiles multi-étapes pour des images optimisées.
*   **Preuves** : Historique Git, `Dockerfile`, scripts d'automatisation dans `/api`.

<!--
Notes orateur :
- Git a permis de gérer les différentes étapes du développement et les arbitrages techniques.
- Docker et Git facilitent la cohérence entre les environnements et le suivi des corrections.
-->

---

# 13. Use Case Complet : De l'URL à l'historique

### Démonstration du trajet de la donnée

1.  **Frontend** : L'utilisateur colle une URL → React appelle l'API (`POST /watches`).
2.  **API** : FastAPI valide la donnée, crée le `Watch` et déclenche une analyse.
3.  **Moteur** : Le `CheckEngine` parse la page (Fixture HTML) et détermine l'état.
4.  **DB** : Création d'un `WatchCheck` pour l'historique (ex: `IN_STOCK`, 49.99€).
5.  **Notification** : Le Worker détecte le changement et envoie un mail (Mailhog).
6.  **Interface** : L’interface affiche l’état courant et l’historique des vérifications.

<!--
Notes orateur :
- Ce flux démontre ma maîtrise de l'ensemble du cycle de vie d'une donnée.
- Chaque couche (UI, API, Service, DB, Worker) joue son rôle de manière sécurisée et coordonnée.
-->

---

# 14. Conclusion

*   **Résultat** : Nova V2 est une application **cohérente, sécurisée et démontrable**.
*   **Compétences** : Les principales compétences du titre CDA sont démontrées par des preuves concrètes.
*   **Limites** : Pas de déploiement Cloud AWS ni de scheduler configurable en V2.
*   **Perspectives V3** : Multi-sites robuste, notifications in-app ou email production, Dashboard admin complet.

**Merci pour votre attention !**

<!--
Notes orateur :
- Nova V2 n'est plus seulement un prototype : c'est une version structurée et techniquement cohérente.
- J'ai appris à concilier les exigences du référentiel avec les réalités du développement.
- Je suis maintenant prêt pour vos questions.
-->
