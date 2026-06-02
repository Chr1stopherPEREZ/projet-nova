# Nova - Déploiement (local + prod)

## Virtualisation et Conteneurisation (Docker)
Le projet est conçu pour s'appuyer sur **Docker** pour la virtualisation légère (conteneurisation), garantissant ainsi la cohérence entre les environnements de développement, de test et de production.

## Local (Docker Compose)
Services :
- `api` (FastAPI)
- `worker` (scheduler + scraping)
- `db` (PostgreSQL)
- (optionnel) `mailhog` (SMTP test)

## Variables d’environnement (exemple)
- `DATABASE_URL`
- `JWT_SECRET` (Clé secrète pour la signature des tokens)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `APP_BASE_URL` (liens reset password)

## Stratégie CI/CD et DevOps (GitHub Actions)
L'application dispose d'une chaîne d'intégration continue (CI) automatisée via GitHub Actions (Source : `.github/workflows/ci.yml`).

### Pipeline d'Intégration Continue (CI)
Déclenché à chaque `push` ou `pull_request` sur la branche `main` :
1.  **Linting (Backend)** : Vérification de la conformité du code avec `Ruff`.
2.  **Linting (Frontend)** : Vérification avec `ESLint`.
3.  **Tests Unitaires & Intégration** : Exécution de la suite `pytest` (Backend).
4.  **Build Frontend** : Validation de la compilation Vite/TypeScript.
5.  **Build Docker** : Vérification de la validité de la stack `docker-compose.yml`.

### Pipeline de Déploiement Continu (CD)
Une fois les tests validés :
1.  **Push Docker Hub** : Publication de l'image tagguée.
2.  **Déploiement Staging/Prod** : Mise à jour automatique des conteneurs sur le serveur via SSH ou Webhook.

## Commandes d'exploitation prévues (Docker)
- `docker compose up --build` : Démarrage complet de la stack.
- `docker compose exec api alembic upgrade head` : Application des migrations.
- `docker compose exec api pytest` : Lancement manuel des tests dans le conteneur.
- `docker compose logs -f api` : Consultation des logs en temps réel.

## Prod (stratégie simple)
- Reverse proxy (Caddy/Nginx) + TLS.
- Secrets via env (CI/CD, vault si dispo).
- Migrations à chaque release.
- Logs centralisés (au minimum stdout JSON).

## Rollback (minimum)
- Stratégie migrations réversibles (si possible).
- Tag git + release notes.
