# LOT 6 - Frontend Skeleton + Auth + CSRF Bootstrap

## Objectif
Livrer un frontend fonctionnel avec :
- Écran de login
- Gestion des cookies HttpOnly (`credentials: "include"`)
- CSRF token automatique sur les requêtes mutables
- Route guard (redirection `/login` si non authentifié)

## Exigences → Preuves

| Exigence | Preuve | Fichier/Capture |
|----------|--------|-----------------|
| Écran login fonctionnel | Capture écran login | `./screens/s3-01-lot6-login-page.png` |
| Routing pages principales | Dashboard accessible après login | `./screens/s3-04-lot6-dashboard.png` |
| Guard / redirection si non loggué | Accès `/dashboard` → redirect `/login` | `./screens/s3-06-lot6-redirect.png` |
| Login réussi + cookie JWT | Cookie `access_token` visible après login | `./screens/s3-05-lot6-cookies.png` |
| CSRF bootstrap au démarrage | GET `/_csrf-bootstrap` au start de l'app | `./screens/s3-02-lot6-network-csrf.png` |
| Header X-CSRF-Token sur requête POST | Visible dans Network tab (via requête de login) | `./screens/s3-03-lot6-network-login.png` |
| Build frontend OK | `pnpm build` sans erreur | Voir section "Commandes" |

## Commandes de preuve

### 1. Build du frontend

```bash
cd web && pnpm install && pnpm build
```

**Résultat attendu :**
```
vite v6.2.2 building for production...
✓ 1493 modules transformed.
dist/index.html                    0.46 kB │ gzip:  0.30 kB
dist/assets/index-*.css           28.02 kB │ gzip:  5.93 kB
dist/assets/index-*.js           215.95 kB │ gzip: 71.18 kB
✓ built in 2.35s
```

### 2. Démarrage des services

```bash
# Backend + DB
docker compose up -d api db

# Frontend (dev)
cd web && pnpm dev
# → http://localhost:5173
```

### 3. Vérifier le CSRF bootstrap

1. Ouvrir DevTools (F12) → Network
2. Charger `http://localhost:5173`
3. Observer la requête `GET /_csrf-bootstrap` au démarrage
4. Le cookie `csrf_token` doit être défini

### 4. Vérifier le guard de route

1. Ouvrir une navigation privée
2. Aller sur `http://localhost:5173/dashboard`
3. Redirection automatique vers `/login`

### 5. Test login complet

```bash
# Via curl (preuve API)
curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@nova.dev","password":"Demo12345!"}' \
  -c cookies.txt

# Vérifier les cookies
cat cookies.txt
```

**Cookies attendus :**
- `access_token` (HttpOnly, Secure en prod)
- `csrf_token` (accessible JS)

### 6. Vérifier header CSRF sur POST

1. Se connecter via le frontend
2. Créer un suivi (`/watches/new`)
3. Dans Network, observer la requête `POST /watches`
4. Header `X-CSRF-Token` doit être présent

## Architecture Frontend (Lot 6)

```
web/src/
├── api/
│   └── client.ts          # apiFetch + csrfBootstrap + authService
├── components/
│   ├── layout/
│   │   └── DashboardLayout.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Alert.tsx
│   │   └── ...
│   └── ProtectedRoute.tsx  # Guard de route
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── WatchesPage.tsx
│   ├── SettingsPage.tsx
│   └── HelpPage.tsx
└── App.tsx                 # Routing + CSRF bootstrap
```

## Code clé

### CSRF Bootstrap (App.tsx)

```tsx
useEffect(() => {
  /* CSRF bootstrap au démarrage de l'app (une seule fois) */
  if (bootstrapAttempted.current) return
  bootstrapAttempted.current = true

  const initCsrf = async () => {
    try {
      await csrfBootstrap()
    } catch (error) {
      console.warn('CSRF bootstrap failed:', error)
    } finally {
      setIsBootstrapped(true)
    }
  }
  initCsrf()
}, [])
```

### Route Guard (ProtectedRoute.tsx)

```tsx
export default function ProtectedRoute({ children }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    authService.checkAuth().then(setIsAuthenticated)
  }, [])

  if (isAuthenticated === null) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
```

### apiFetch avec CSRF (client.ts)

```tsx
/* Ajouter le CSRF token sur les requêtes qui modifient les données */
const method = (fetchOptions.method || 'GET').toUpperCase()
if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
  const csrfToken = getCsrfToken()
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken
  }
}
```

## Captures à prendre

1. **`./screens/s3-01-lot6-login-page.png`** — Page de login
2. **`./screens/s3-05-lot6-cookies.png`** — Cookies après login
3. **`./screens/s3-02-lot6-network-csrf.png`** — Network: GET `/_csrf-bootstrap`
4. **`./screens/s3-03-lot6-network-login.png`** — Network: requête de login (headers visibles)
5. **`./screens/s3-06-lot6-redirect.png`** — `/dashboard` redirigé vers `/login`
6. **`./screens/s3-04-lot6-dashboard.png`** — Dashboard après login

## Statut

| Critère | Statut |
|---------|--------|
| Écran login | ✅ |
| Cookie HttpOnly | ✅ |
| CSRF bootstrap | ✅ |
| Route guard | ✅ |
| Build OK | ✅ |

**Lot 6 : CLOS ✅**
