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
- CORS strict (origins connues).
- Security headers (X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security).
- **Protection CSRF** : Mécanisme de **Double Submit Cookie**.
    - Le serveur génère un cookie `csrf_token` (non HttpOnly, accessible au JS).
    - Le client doit renvoyer cette valeur dans un header personnalisé `X-CSRF-Token` lors des requêtes mutatives (POST, PATCH, DELETE).
    - Le serveur valide que la valeur du header correspond à celle du cookie.

### Secrets
- Secrets en env vars.
- `.env.example` fourni, `.env` ignoré.

## Preuves attendues
- Tests unitaires SSRF.
- Tests rate limit sur endpoints sensibles (au minimum un test).
- Checklist OWASP (mini) dans la soutenance.
