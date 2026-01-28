# Nova - Charte Graphique et Guide de Style

## Identité Visuelle
L'identité de Nova repose sur la clarté, la réactivité et la confiance. Le nom "Nova" évoque une lumière soudaine dans l'obscurité, symbolisant la notification qui surgit.

## Palette de Couleurs

| Usage | Couleur | Code Hex | Signification |
| :--- | :--- | :--- | :--- |
| **Primaire** | Blue Spruce | `#0F766E` | Identité principale de la marque. |
| **Primaire (Hover)** | Stormy Teal | `#0B5F59` | État au survol des éléments interactifs. |
| **Texte** | Onyx | `#111111` | Lisibilité maximale pour le contenu. |
| **Fond** | Bright Snow | `#FAFAFA` | Interface claire et moderne. |
| **Bordure** | Platinum | `#E5E7EB` | Séparation douce des composants UI. |
| **Succès** | Shamrock | `#16A16A` | Produit **En Stock**, confirmation. |
| **Warning** | Sandy Brown | `#F59F59` | Attention, action réversible. |
| **Danger** | Primary Scarlet | `#DC2626` | Produit **En Rupture**, erreur critique. |
| **Info** | Regal Navy | `#0F3675` | Informations complémentaires, badges neutres. |

## Typographie
*   **Police principale** : `Lexend` (Sans-serif).
    *   Choisie pour sa clarté et son aspect moderne.
*   **Nom de l'application** : Poids `ExtraBold` (800).
*   **Titres** : Poids `Bold` (700).
*   **Corps de texte** : Poids `Semi-Bold` (600).

## Composants UI (Design System)
L'application utilise des composants simples et standardisés (inspirés de **Tailwind UI** par exemple pour la structure) :
- **Badges de statut** : Arrondis avec fond coloré léger et texte contrasté pour les états de stock.
- **Cartes (Cards)** : Utilisation d'ombres légères (`shadow-sm`) pour séparer les éléments du dashboard.
- **Boutons** : Coins légèrement arrondis (`rounded-md`), transitions fluides au survol.

## Iconographie
Utilisation d'icônes SVG simples (type **Lucide**) :
*   `Bell` : Notifications.
*   `Search` : Recherche/Scraping.
*   `Settings` : Administration.
*   `CheckCircle` : En stock.
*   `XCircle` : En rupture.

## Principes UX
1.  **Feedback Immédiat** : Toute action (ajout de suivi, test de profil) doit afficher un loader ou une notification de succès/erreur.
2.  **Sobriété** : Pas de fioritures inutiles ; l'information centrale (le stock) doit sauter aux yeux.
3.  **Accessibilité** : Respect des contrastes (WCAG AA) intégré dès le choix de la palette.
