# Nova - Architecture : Décisions et Justifications

## Choix de la Stack Technique
Le choix de la stack est guidé par la problématique du projet : **Scraping performant, asynchrone et fiable.**

| Technologie | Pourquoi ce choix ? | Alternatives envisagées |
| :--- | :--- | :--- |
| **FastAPI** | Rapidité de développement, support natif de l'asynchrone, validation Pydantic. | Django (trop lourd), Flask (moins moderne pour l'async). |
| **PostgreSQL** | Fiabilité ACID, gestion native des JSONB (pour les règles de scraping), robustesse. | MySQL (moins performant sur le JSON), SQLite (pas pour la prod). |
| **SQLAlchemy 2.0** | ORM puissant, permet de passer du SQL complexe si besoin tout en gardant une abstraction. | Tortoise ORM (moins mature), Raw SQL (difficile à maintenir). |
| **HTTPX / Playwright** | HTTPX pour la rapidité (90% des sites), Playwright pour les sites SPA/JS complexes. | Selenium (trop lent, gourmand en ressources). |

### Pourquoi SQL plutôt que NoSQL ?
Bien que le scraping puisse sembler adapté au NoSQL (données variables), Nova utilise SQL pour :
1.  **Relationnel fort** : Les liens entre Utilisateurs, Suivis et Historique (Checks) bénéficient de l'intégrité référentielle.
2.  **Consistance** : Les alertes de stock ne tolèrent pas d'écarts de données (éventuelle consistance du NoSQL).
3.  **JSONB** : PostgreSQL permet de stocker les règles de scraping variables dans un champ JSON tout en gardant les avantages du relationnel.

## Architecture logicielle (MVC et Couches)
Bien que le projet Nova soit une API moderne, il respecte les principes du pattern **MVC (Modèle-Vue-Contrôleur)** adapté au web :

1.  **Modèle (Model)** : Représenté par les entités SQLAlchemy (`app/models`) qui définissent la structure des données et les règles d'intégrité en base de données PostgreSQL.
2.  **Vue (View)** : Pour une API REST, la "Vue" est constituée des réponses JSON structurées via Pydantic (`app/schemas`). Le Frontend (React/Tailwind) consomme ces vues pour l'affichage final.
3.  **Contrôleur (Controller)** : Les routes FastAPI (`app/api`) reçoivent les requêtes, valident les entrées et orchestrent les appels.

### Extension : Le pattern Service Layer
Pour éviter un contrôleur trop "gras" et isoler la logique métier complexe (notamment le scraping et le moteur de règles), nous avons ajouté une couche supplémentaire : le **Service Layer**. Cela permet de séparer la gestion des requêtes HTTP de la logique pure de l'application (ex: `ScraperService`).

## Design Patterns utilisés
L'application implémente plusieurs patrons de conception pour assurer la maintenabilité :

1.  **Pattern Service Layer** : La logique métier (ex: `ScraperService`) est isolée des routes API.
2.  **Pattern Repository (via SQLAlchemy)** : Abstraction de l'accès aux données.
3.  **Pattern Strategy** : Le moteur de détection (`ProfileEngine`) choisit la règle à appliquer selon le profil du site.
4.  **Pattern Factory** : Pour l'instanciation des clients de fetch (HTTPX ou Playwright) selon le mode requis.
5.  **Instance partagée** : Utilisation d'une instance unique de l'Engine SQLAlchemy au niveau du module pour optimiser la gestion du pool de connexions.

## Benchmarks & Performance

### 1. Pourquoi FastAPI (Asynchrone) ?
Le cœur de Nova est le scraping, une tâche **I/O bound** (limitée par les entrées/sorties réseau). 
*   **Modèle Synchrone (ex: Flask)** : Chaque requête de scraping bloque un thread. Pour gérer 100 sites en parallèle, il faudrait 100 threads, ce qui est gourmand en RAM.
*   **Modèle Asynchrone (FastAPI)** : Un seul thread peut gérer des milliers de requêtes en attente. Pendant qu'on attend la réponse du site A, le CPU peut traiter l'analyse du site B.
*   **Objectif de performance** : L'asynchronisme permet de traiter un lot de suivis sans bloquer le thread principal. Les estimations basées sur la nature I/O bound du projet prévoient un traitement 5 à 10 fois plus rapide qu'une boucle séquentielle classique, avec une consommation de ressources optimisée.

### 2. Throttling vs Rapidité
La performance n'est pas seulement la vitesse pure, c'est aussi la **discrétion**.
*   Nova implémente un délai aléatoire entre les requêtes sur un même domaine pour simuler un comportement humain.
*   L'utilisation de **HTTPX** est privilégiée car son démarrage est quasi instantané (< 10ms) contrairement à **Playwright** qui nécessite d'instancier un processus de navigateur (~500ms à 1s).
