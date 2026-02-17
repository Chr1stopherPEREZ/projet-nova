# Nova Frontend

Frontend React + TypeScript + Tailwind pour l'application Nova de suivi de retour en stock.

---

## Lot 6 — Front skeleton + Auth

### Installation et lancement

```bash
cd web
pnpm install
pnpm dev
```

Le frontend sera accessible sur **http://localhost:3000**.

### Configuration

Créer un fichier `.env` (ou copier `.env.example`) :

```env
VITE_API_URL=http://localhost:8000
```

| Variable       | Description                      | Défaut                  |
|----------------|----------------------------------|-------------------------|
| `VITE_API_URL` | URL de l'API backend             | `http://localhost:8000` |

### Structure du projet

```
web/
├── src/
│   ├── api/
│   │   └── client.ts              # ApiClient central (fetch, CSRF, credentials)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx # Layout dashboard (sidebar + content + footer)
│   │   │   ├── Sidebar.tsx         # Navigation latérale avec icônes Lucide
│   │   │   └── Footer.tsx          # Pied de page
│   │   ├── ui/
│   │   │   ├── Button.tsx          # Bouton réutilisable (variants, sizes)
│   │   │   ├── Input.tsx           # Champ de formulaire
│   │   │   ├── Card.tsx            # Carte avec header/content
│   │   │   ├── Alert.tsx           # Message d'alerte (success/warning/danger/info)
│   │   │   └── index.ts            # Exports
│   │   └── ProtectedRoute.tsx      # Route guard pour pages protégées
│   ├── pages/
│   │   ├── LoginPage.tsx           # Page de connexion
│   │   └── DashboardPage.tsx       # Dashboard protégé
│   ├── App.tsx                     # Composant racine avec routing + CSRF bootstrap
│   ├── main.tsx                    # Point d'entrée
│   ├── index.css                   # Styles Tailwind
│   └── vite-env.d.ts               # Types TypeScript
├── .env.example                    # Exemple de configuration
├── package.json
├── vite.config.ts
├── tailwind.config.js              # Configuration Tailwind (charte graphique)
├── postcss.config.js
└── tsconfig.json
```

### Fonctionnalités implémentées

#### Routes
- `/login` — Page de connexion (publique)
- `/dashboard` — Dashboard protégé (nécessite authentification)
- `/` — Redirige vers `/dashboard`

#### Authentification
- **Login** : `POST /auth/login` avec `credentials: "include"`
- **Logout** : `POST /auth/logout` avec header `X-CSRF-Token`
- **Cookies HttpOnly** : Le frontend n'accède pas au `access_token`
- **CSRF** : Le `csrf_token` est lu depuis les cookies et envoyé via header `X-CSRF-Token`

#### CSRF Bootstrap (au démarrage)
- Au chargement de l'app, `GET /auth/_csrf-bootstrap` est appelé
- Garantit que le cookie `csrf_token` est posé/valide avant toute interaction
- Évite les erreurs 403/CSRF sur les premières requêtes

#### ApiClient (`src/api/client.ts`)
- `baseURL` configuré via `VITE_API_URL`
- `credentials: "include"` sur toutes les requêtes
- Ajout automatique du header `X-CSRF-Token` sur POST/PUT/DELETE
- Gestion erreur 401 → redirection vers `/login`

#### Route Guard (`src/components/ProtectedRoute.tsx`)
- Vérifie l'authentification via **`GET /auth/me`** (endpoint dédié)
- Fonctionne au refresh (pas seulement après login)
- Affiche un loader pendant la vérification
- Redirige vers `/login` si non authentifié

#### Charte graphique
- **Couleurs** : Primary teal (#0F766E), hover (#0B5F59), success/warning/danger/info
- **Typographie** : Lexend (Google Fonts)
- **Icônes** : lucide-react (Home, Eye, Settings, Bell, LogOut...)

#### Composants réutilisables
- `Button` : Variants (primary, outline, danger, ghost), tailles (sm, md, lg), état loading
- `Input` : Label, placeholder, états d'erreur
- `Card` : Container avec CardHeader, CardContent, CardTitle
- `Alert` : Variantes success/warning/danger/info avec icônes
- `DashboardLayout` : Wrapper avec Sidebar + Header + Footer
- `Sidebar` : Navigation avec sections (Général, Support), icônes Lucide
- `Footer` : Liens et copyright

### CORS / CSRF — Notes

#### CORS (côté backend)
Le backend doit autoriser l'origine du frontend :

```python
# api/app/core/config.py
cors_origins: str = "http://localhost:3000"
```

Et dans `main.py` :
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,  # IMPORTANT pour les cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### CSRF
- **Bootstrap** : `GET /auth/_csrf-bootstrap` appelé au démarrage de l'app
- Le `csrf_token` est posé par le backend (cookie non-HttpOnly)
- Le frontend le lit via `document.cookie` et l'envoie en header `X-CSRF-Token`
- Le backend vérifie que header == cookie (Double Submit Cookie pattern)

### Check-list des preuves (Lot 6)

- [ ] **A) Capture écran de la page /login**
  - Formulaire avec logo Nova, email, password, bouton "Se connecter"
  - Charte graphique respectée (couleur teal, typo Lexend)

- [ ] **B) Capture réseau (DevTools)**
  - Requête `GET /auth/_csrf-bootstrap` au démarrage
  - Requête login avec `credentials: "include"`
  - Cookie de session (`access_token`) visible dans Response Headers
  - Cookie `csrf_token` visible
  - Header `X-CSRF-Token` envoyé sur `/auth/logout`

- [ ] **C) Démo fonctionnelle**
  - Login réussi → redirection `/dashboard`
  - Accès `/dashboard` sans login → redirection `/login`
  - Bouton logout → déconnexion et retour `/login`
  - Guard fonctionne au refresh

### Commandes utiles

```bash
# Développement
pnpm dev

# Build production
pnpm build

# Preview du build
pnpm preview
```

---

## Stack technique

- **React 18** — Framework frontend
- **TypeScript** — Typage statique
- **Vite** — Build tool
- **Tailwind CSS** — Framework CSS utilitaire (charte graphique Nova)
- **lucide-react** — Icônes SVG
- **React Router** — Routing avec guards
