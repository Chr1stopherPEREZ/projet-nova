# Nova - Sécurité (baseline)

## Modèle de menaces (simple)
1. **SSRF** : URL fournie par l’utilisateur → accès réseau interne.
2. **Abus / DoS** : spam de suivis / fréquence trop élevée.
3. **Takeover compte** : mot de passe faible / brute-force.
4. **Fuite secrets** : clés SMTP/JWT commitées.
5. **XSS/Injection** : entrées non validées.

## Mesures (V1)
### Auth & comptes
- Hash mdp : Argon2id (ou bcrypt).
- Politique mdp : longueur min + refus mots de passe trop communs.
- Rate limit login.

### RBAC
- Rôles : USER / ADMIN.
- Endpoints `/admin/*` protégés côté serveur.

### SSRF & scraping
- Autoriser seulement http/https.
- Bloquer IP privées/locales, DNS rebinding, redirections limitées.
- Timeouts stricts + taille max réponse.
- Throttling par domaine + quotas user.
- Logs “refus SSRF” (sans données sensibles inutiles).

### Sécurité web
- Validation serveur de toutes les entrées.
- **CORS (Cross-Origin Resource Sharing)** : 
    - Configuré via `CORSMiddleware` de FastAPI.
    - Les origines autorisées sont définies par la variable d'environnement `CORS_ORIGINS` (liste séparée par des virgules).
    - En développement, `http://localhost:3000` est autorisé par défaut.
    - Les credentials (cookies) sont autorisés pour permettre l'authentification par cookie JWT.
- Security headers (X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security).
- **Protection CSRF** : Mécanisme de **Double Submit Cookie**.
    - Le serveur génère un cookie `csrf_token` lors du bootstrap ou du login.
    - Ce cookie est utilisé comme preuve d'origine.
    - Le client (Front React) lit ce cookie et le renvoie dans le header `X-CSRF-Token` pour toutes les requêtes mutatives (**POST, PUT, PATCH, DELETE**).
    - Le serveur compare les deux valeurs. Si le token est absent ou invalide, l'API renvoie une erreur **403 CSRF_INVALID**.
    - **Activation** : Actif par défaut sur toutes les méthodes mutables.
    - **Bypass (Dev/Debug)** : Possible via le header `X-Skip-CSRF: 1` (utilisé par Swagger) ou via `CSRF_DISABLED=true`.
    - Documentation technique : `app/core/csrf.py`.
- **Cookies Sécurisés** :
    - Les cookies `access_token` et `csrf_token` utilisent les flags `HttpOnly` (pour le JWT), `SameSite=Lax` et `Path=/`.
    - Le flag `Secure` est contrôlé par la variable `COOKIE_SECURE`. Par défaut, il est à `true` si `APP_ENV=production`.

### Secrets
- Secrets configurés via variables d'environnement :
    - `JWT_SECRET_KEY` : Clé secrète pour la signature des tokens JWT.
- **Sécurité Critique** : En mode `APP_ENV=production`, l'application refuse de démarrer si ces secrets ont leurs valeurs par défaut.
- `.env.example` fourni, `.env` ignoré par Git.

## Preuves attendues
- Tests unitaires SSRF.
- Tests rate limit sur endpoints sensibles (au minimum un test).
- Checklist OWASP (mini) dans la soutenance.
