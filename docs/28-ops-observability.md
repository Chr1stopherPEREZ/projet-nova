# Nova - Observabilité et exploitation

## Objectif
Documenter la structure des logs, les niveaux de journalisation, les erreurs communes et les procédures d'exploitation pour le projet Nova.

---

## Logs

### Format (JSON structuré)
Nova utilise **structlog** pour produire des logs au format JSON, facilitant l'agrégation et l'analyse.

```json
{
  "timestamp": "2024-01-15T14:30:00.123Z",
  "level": "info",
  "event": "watch_check_completed",
  "watch_id": "uuid-1234",
  "domain": "lesprit-belle.fr",
  "stock_state": "IN_STOCK",
  "duration_ms": 450,
  "fetch_mode": "http"
}
```

### Champs standards
| Champ | Description |
|-------|-------------|
| `timestamp` | Horodatage ISO 8601 (UTC) |
| `level` | Niveau : `debug`, `info`, `warning`, `error`, `critical` |
| `event` | Nom de l'événement (snake_case) |
| `request_id` | ID de corrélation (pour les requêtes API) |
| `user_id` | ID utilisateur (si authentifié) |
| `duration_ms` | Durée de l'opération en millisecondes |

### Niveaux de journalisation

| Niveau | Usage | Exemples |
|--------|-------|----------|
| `DEBUG` | Détails techniques pour le développement | Payload de requête, règles évaluées |
| `INFO` | Événements normaux du cycle de vie | Cycle démarré, watch créé, email envoyé |
| `WARNING` | Situation anormale mais récupérable | Site lent, retry déclenché, rate limit proche |
| `ERROR` | Erreur bloquante pour une opération | Fetch échoué, SMTP indisponible, validation SSRF |
| `CRITICAL` | Erreur système grave | DB inaccessible, worker crash |

### Configuration par environnement
| Environnement | Niveau minimum |
|---------------|----------------|
| `development` | `DEBUG` |
| `production` | `INFO` |

### Exemples de logs

**Exemple 1 : Notification envoyée (INFO)**
```json
{
  "timestamp": "2024-01-15T15:42:18.456Z",
  "level": "info",
  "event": "notification_sent",
  "watch_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "user_id": "user-uuid-123",
  "email": "user@nova.dev",
  "product_url": "https://lesprit-belle.fr/products/lampe-halo",
  "stock_state": "IN_STOCK"
}
```

**Exemple 2 : Protection SSRF déclenchée (ERROR)**
```json
{
  "timestamp": "2024-01-15T15:43:05.789Z",
  "level": "error",
  "event": "ssrf_blocked",
  "request_id": "req-abc-123",
  "user_id": "user-uuid-456",
  "blocked_url": "http://192.168.1.100/internal",
  "reason": "private_ip_blocked",
  "client_ip": "203.0.113.50"
}
```

---

## Événements clés à monitorer

### API
| Événement | Niveau | Description |
|-----------|--------|-------------|
| `user_registered` | INFO | Nouvel utilisateur créé |
| `user_login_success` | INFO | Connexion réussie |
| `user_login_failed` | WARNING | Tentative de connexion échouée |
| `watch_created` | INFO | Nouveau suivi créé |
| `watch_deleted` | INFO | Suivi supprimé |
| `ssrf_blocked` | ERROR | URL bloquée (IP privée, localhost) |
| `rate_limit_exceeded` | WARNING | Quota dépassé |

### Worker
| Événement | Niveau | Description |
|-----------|--------|-------------|
| `cycle_started` | INFO | Début d'un cycle de vérification |
| `cycle_completed` | INFO | Fin du cycle (avec stats) |
| `watch_check_completed` | INFO | Contrôle d'un suivi terminé |
| `watch_check_failed` | ERROR | Échec de contrôle (timeout, 4xx, 5xx) |
| `stock_transition` | INFO | Changement d'état détecté |
| `notification_sent` | INFO | Email envoyé avec succès |
| `notification_failed` | ERROR | Échec d'envoi d'email |

---

## Erreurs communes et résolution

| Code/Événement | Cause probable | Résolution |
|----------------|----------------|------------|
| `ssrf_blocked` | URL vers IP privée/localhost | Vérifier l'URL soumise par l'utilisateur |
| `fetch_timeout` | Site trop lent ou indisponible | Vérifier le site, augmenter timeout si justifié |
| `fetch_http_4xx` | Page supprimée ou URL invalide | Marquer le suivi comme `BROKEN` |
| `fetch_http_5xx` | Erreur côté site cible | Retry automatique, puis `UNKNOWN` |
| `profile_no_match` | Règles de détection obsolètes | Mettre à jour le `site_profile` |
| `smtp_connection_error` | Serveur SMTP inaccessible | Vérifier les variables SMTP |
| `db_connection_error` | PostgreSQL indisponible | Vérifier le container `postgres` |

---

## Variables d'environnement

> **Source de vérité** : [`23-deployment.md`](./23-deployment.md) pour les variables essentielles.

### Obligatoires (alignées sur 23-deployment.md)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:pass@localhost:5432/nova` |
| `JWT_SECRET` | Clé secrète pour signer les JWT | `super-secret-key-change-me` |
| `SMTP_HOST` | Serveur SMTP | `mailhog` (dev) / `smtp.provider.com` |
| `SMTP_PORT` | Port SMTP | `1025` (dev) / `587` |
| `SMTP_USER` | Utilisateur SMTP | `noreply@nova.app` |
| `SMTP_PASS` | Mot de passe SMTP | `***` |
| `SMTP_FROM` | Adresse d'expéditeur | `Nova <noreply@nova.app>` |
| `APP_BASE_URL` | URL de base de l'application (liens reset password) | `http://localhost:3000` |

### Optionnelles (à confirmer lors de l'implémentation)

| Variable | Description | Exemple | Justification |
|----------|-------------|---------|---------------|
| `DB_POOL_SIZE` | Taille du pool de connexions | `5` | Performance multi-connexions |
| `JWT_ALGORITHM` | Algorithme de signature | `HS256` | Configuration avancée JWT |
| `JWT_EXPIRATION_MINUTES` | Durée de validité du token | `60` | Personnalisation sécurité |
| `WORKER_INTERVAL_SECONDS` | Intervalle entre les cycles | `60` | Fréquence de scraping |
| `WORKER_BATCH_SIZE` | Nombre de suivis par lot | `50` | Performance worker |
| `FETCH_TIMEOUT_HTTP` | Timeout HTTPX (secondes) | `10` | Robustesse scraping |
| `FETCH_TIMEOUT_PLAYWRIGHT` | Timeout Playwright (secondes) | `20` | Pages JS lentes |
| `THROTTLE_DELAY_SECONDS` | Délai entre requêtes (même domaine) | `5` | Respect sites cibles |
| `MAX_WATCHES_PER_USER` | Quota de suivis par utilisateur | `20` | Anti-abus |
| `RATE_LIMIT_REQUESTS` | Nombre de requêtes max | `100` | Anti-abus API |
| `RATE_LIMIT_WINDOW_SECONDS` | Fenêtre de temps | `60` | Anti-abus API |
| `ENVIRONMENT` | Mode d'exécution | `development` / `production` | Logs / comportements |
| `LOG_LEVEL` | Niveau de log minimum | `DEBUG` / `INFO` | Verbosité logs |

---

## Runbook de démarrage local (BACK + FRONT)

> **Note :** Ce runbook décrit la **cible d'exécution** une fois l'implémentation réalisée. Les commandes et chemins exacts seront confirmés lors du développement (Semaines 1-2). Certaines commandes peuvent être adaptées selon la structure finale du projet.

### 1. Prérequis
```bash
# Vérifier les versions
docker --version          # >= 20.x
docker compose version    # >= 2.x
node --version            # >= 18.x (pour le front)
python --version          # >= 3.12 (si exécution hors Docker)
```

### 2. Configuration
```bash
# Copier et adapter les fichiers d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (surtout JWT_SECRET)

# (Si front séparé) Configurer le frontend
cd frontend && cp .env.example .env.local
# Éditer l'URL de l'API si nécessaire (VITE_API_URL)
```

### 3. Lancer la base de données
```bash
# Démarrer PostgreSQL seul (utile pour vérifier la connexion)
docker compose up -d db

# Vérifier que la DB est prête
docker compose logs db | grep "ready to accept connections"
```

### 4. Lancer l'API (BACK)
```bash
# Démarrer le service API
docker compose up -d api

# Appliquer les migrations
docker compose exec api alembic upgrade head

# (Optionnel) Charger les données de test
docker compose exec api python -m app.seed

# Vérifier les logs
docker compose logs -f api
```

### 5. Lancer le Worker
```bash
# Démarrer le worker (scheduler + scraping)
docker compose up -d worker

# Vérifier les logs du worker
docker compose logs -f worker
```

### 6. Lancer Mailhog (emails de test)
```bash
# Démarrer Mailhog
docker compose up -d mailhog

# Vérifier l'interface Mailhog
open http://localhost:8025
```

### 7. Lancer le Frontend (FRONT)

**Option A : via Docker Compose**
```bash
docker compose up -d web
```

**Option B : en local (développement)**
```bash
cd web
pnpm install        # Installation des dépendances
pnpm dev            # Démarre sur http://localhost:5173 (Vite)
```
> *Note : les commandes exactes dépendent de l'implémentation. À confirmer lors de l'implémentation.*

### 8. Vérifications

#### 8.1 Vérifier l'API (OpenAPI / Swagger)
```bash
# Accéder à la documentation interactive
open http://localhost:8000/docs    # Swagger UI
open http://localhost:8000/redoc   # ReDoc (alternative)

# Test rapide de santé
curl http://localhost:8000/health
# Réponse attendue : {"status": "ok"}
```

#### 8.2 Vérifier le Frontend
```bash
# Accéder à l'interface
open http://localhost:3000    # ou 5173 si Vite en local

# Vérifier la page de connexion s'affiche
```

#### 8.3 Vérifier un email dans Mailhog
1. Accéder à http://localhost:8025
2. Créer un compte utilisateur via l'interface (ou POST /auth/register)
3. Déclencher un reset password (ou une notification)
4. Vérifier que l'email apparaît dans Mailhog
5. Vérifier le contenu (sujet, corps, liens)

### 9. Arrêt
```bash
# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes (reset complet)
docker compose down -v
```

### 10. Commandes utiles
```bash
# Logs de tous les services
docker compose logs -f

# Redémarrer un service spécifique
docker compose restart api

# Accéder au shell du conteneur API
docker compose exec api bash

# Lancer les tests
docker compose exec api pytest
```

---

## Référence
- Déploiement complet : [`23-deployment.md`](./23-deployment.md)
- Sécurité : [`05-security.md`](./05-security.md)
- Architecture : [`04-architecture-decisions-justification.md`](./04-architecture-decisions-justification.md)
- Plan de démo : [`26-demo-plan.md`](./26-demo-plan.md)
