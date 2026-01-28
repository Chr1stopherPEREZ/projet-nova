# Nova - Green IT et Éco-conception

## Philosophie
Le projet Nova intègre des principes de **Green IT** pour limiter son empreinte environnementale, tant au niveau du développement que de l'exécution.

## Optimisations Techniques

### 1. Efficience du Scraping
*   **Throttling & Scheduling** : Les vérifications ne sont pas effectuées en temps réel mais par cycles (ex: toutes les 15 ou 60 minutes). Cela réduit le nombre de requêtes HTTP et la consommation CPU des serveurs.
*   **Mode Hybride (HTTP vs Browser)** : 
    *   L'utilisation prioritaire de **HTTPX** (requêtes simples) consomme beaucoup moins d'énergie qu'une instance de navigateur complète.
    *   **Playwright** n'est utilisé que si nécessaire (sites avec rendu JS complexe), limitant la charge CPU et RAM.
*   **Filtrage du contenu** : Chargement partiel des pages quand c'est possible (ex: ne pas charger les images/pubs lors du scraping via Playwright).

### 2. Architecture Logicielle
*   **Asynchronisme (FastAPI/Python)** : Permet de gérer de nombreuses connexions avec un seul processus, optimisant ainsi l'utilisation des ressources matérielles du serveur.
*   **Minimalisme du Backend** : Utilisation de bibliothèques légères et ciblées pour éviter la surcharge de code inutilisé ("bloatware").

### 3. Gestion des Données
*   **Politique de rétention** : Suppression automatique des anciens logs et historiques de checks après une période définie (ex: 30 jours), réduisant l'espace de stockage nécessaire.
*   **Optimisation des requêtes** : Utilisation d'index et de requêtes optimisées pour minimiser la charge sur le processeur de la base de données.

### 4. Interface Utilisateur (Frontend)
*   **Poids des pages** : Utilisation de frameworks CSS utilitaires (Tailwind) pour minimiser la taille des fichiers CSS transférés.
*   **Dark Mode** : Option de mode sombre pour réduire la consommation d'énergie sur les écrans OLED.
*   **Lazy Loading** : Chargement des composants et des données uniquement lorsqu'ils sont visibles à l'écran.
