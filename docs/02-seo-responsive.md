# Nova - SEO et Responsive Design

## SEO (Search Engine Optimization)
Bien que Nova soit une application avec une partie "Dashboard" privée, l'optimisation pour les moteurs de recherche est appliquée sur la page d'accueil (Landing Page) et les pages publiques.

*   **Balises Sémantiques :** Utilisation stricte des balises HTML5 (`<header>`, `<main>`, `<footer>`, `<h1>` à `<h6>`) pour structurer le contenu.
*   **Meta-données :** 
    *   `title` unique et descriptif par page.
    *   `description` pour le résumé dans les résultats de recherche.
    *   Open Graph (OG) pour le partage sur les réseaux sociaux.
*   **Performance (Web Vitals) :** Temps de chargement optimisé pour favoriser le référencement (images compressées, minification JS/CSS).
*   **Accessibilité :** Le SEO et l'accessibilité sont liés (attributs `alt` sur les images, structure logique).

## Responsive Design
L'interface est conçue pour être consultée aussi bien sur ordinateur que sur mobile.

*   **Framework CSS :** Utilisation de **Tailwind CSS** (ou équivalent) pour sa grille flexible et ses utilitaires responsive.
*   **Media Queries :** 
    *   Mobile : < 640px (Navigation simplifiée, listes verticales).
    *   Tablette : 640px - 1024px (Grilles à 2 colonnes).
    *   Desktop : > 1024px (Dashboard complet, menu latéral).
*   **Éléments Adaptatifs :** 
    *   Menus "Hamburger" sur mobile.
    *   Tableaux transformés en listes de cartes (cards) sur petits écrans.
    *   Images fluides (`max-width: 100%`).
*   **Tests :** Validation via les outils de développement (Chrome DevTools) et sur appareils réels.
