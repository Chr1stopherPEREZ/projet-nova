# LOT 5 - Orchestration + notification email (Mailhog)

## Commandes de preuve

### 1. Démarrage des services

```bash
docker compose up -d --build
```

### 2. Login et récupération des tokens

```bash
# Login
curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@nova.dev","password":"Demo12345!"}' \
  -c cookies.txt

# Récupérer le CSRF token
cat cookies.txt | grep csrf_token | awk '{print $7}'
```

### 3. Créer une watch (si nécessaire)

```bash
CSRF="<votre_csrf_token>"
curl -s -X POST http://localhost:8000/watches \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -b cookies.txt \
  -d '{"url":"https://example.com/product/test","label":"Test Product"}'
```

### 4. Run A - Premier check (pas de changement)

```bash
CSRF="<votre_csrf_token>"
curl -s -X POST http://localhost:8000/jobs/run \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -b cookies.txt \
  -d '{"run_all": true}'
```

**Résultat attendu :**
```json
{
  "message": "1 check(s) exécuté(s)",
  "checks_executed": 1,
  "changes_detected": 0,
  "emails_sent": 0,
  "results": [...]
}
```

### 5. Changer la fixture et Run B (changement détecté)

Relancer l'API avec une fixture différente :

```bash
docker compose stop api
docker compose run --rm -d -p 8000:8000 -e FIXTURE_NAME=out_of_stock.html api
```

Puis exécuter le job :

```bash
CSRF="<votre_csrf_token>"
curl -s -X POST http://localhost:8000/jobs/run \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -b cookies.txt \
  -d '{"run_all": true}'
```

**Résultat attendu :**
```json
{
  "message": "1 check(s) exécuté(s), 1 changement(s) détecté(s), 1 email(s) envoyé(s)",
  "checks_executed": 1,
  "changes_detected": 1,
  "emails_sent": 1,
  "results": [{
    "watch_id": "...",
    "stock_state": "OUT_OF_STOCK",
    "changed": true,
    "previous_state": "IN_STOCK"
  }]
}
```

### 6. Vérifier l'email dans Mailhog

```bash
# Via API Mailhog
curl -s http://localhost:8025/api/v2/messages | jq '.items[0].Content.Headers.Subject'

# Via interface web
# Ouvrir http://localhost:8025
```

**Résultat attendu :**
- Subject : `[Nova] Changement de stock détecté`
- To : `demo@nova.dev`
- Corps : Ancien état IN_STOCK → Nouvel état OUT_OF_STOCK

### 7. Vérifier la DB

```bash
docker compose exec db psql -U nova -d nova -c \
  "SELECT watch_id, stock_state, http_status, checked_at FROM watch_checks ORDER BY checked_at DESC LIMIT 5;"
```

### 8. Tests

```bash
docker compose run --rm api python -m pytest tests/test_jobs.py -v
```

**Résultat :** 8 tests passés

## Exigences LOT 5 couvertes

| Exigence | Statut |
|----------|--------|
| Endpoint POST /jobs/run (protégé auth + CSRF) | ✓ |
| Body: watch_id ou run_all=true | ✓ |
| Détection de changement (stock_state) | ✓ |
| Envoi email si changement (Mailhog) | ✓ |
| Tests (8 tests) | ✓ |

## Captures à prendre

1. Swagger `/jobs/run` endpoint
2. Réponse Run A (pas de changement, pas d'email)
3. Réponse Run B (changement, email envoyé)
4. Mailhog avec l'email reçu
5. Tests passés (38 total)
