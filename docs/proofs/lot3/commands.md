# Commandes LOT 3 - Routes /watches

## Lancer les services
```bash
docker compose up -d --build
```

## Appliquer les migrations
```bash
docker compose exec api alembic upgrade head
```

## Lancer les tests
```bash
docker compose exec api pytest tests/ -v
```

## Démo API (curl)

### 1. Register
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demopass123"}' \
  -c cookies.txt
```

### 2. Login (récupère les cookies access_token + csrf_token)
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demopass123"}' \
  -c cookies.txt
```

### 3. Récupérer le CSRF token
```bash
# Format Netscape cookie jar : la colonne 6 contient le nom du cookie
CSRF=$(awk '$6=="csrf_token"{print $7}' cookies.txt)
echo "CSRF Token: $CSRF"
```

### 4. POST /watches (créer une watch)
```bash
curl -X POST http://localhost:8000/watches \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -b cookies.txt \
  -d '{"url":"https://www.ldlc.com/fiche/PB00589057.html","label":"RTX 4090"}'
```

Réponse attendue (201):
```json
{
  "id": "uuid",
  "url": "https://www.ldlc.com/fiche/PB00589057.html",
  "label": "RTX 4090",
  "status": "ACTIVE",
  "stock_state": "UNKNOWN",
  "last_checked_at": null
}
```

### 5. GET /watches (lister mes watches)
```bash
curl -X GET http://localhost:8000/watches \
  -b cookies.txt
```

Réponse attendue (200):
```json
[
  {
    "id": "uuid",
    "url": "https://www.ldlc.com/fiche/PB00589057.html",
    "label": "RTX 4090",
    "status": "ACTIVE",
    "stock_state": "UNKNOWN",
    "last_checked_at": null
  }
]
```

### 6. GET /watches/{id} (détail d'une watch)
```bash
WATCH_ID="<uuid de la watch créée>"
curl -X GET http://localhost:8000/watches/$WATCH_ID \
  -b cookies.txt
```

### 7. PATCH /watches/{id} (mettre en pause)
```bash
curl -X PATCH http://localhost:8000/watches/$WATCH_ID \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -b cookies.txt \
  -d '{"status":"PAUSED"}'
```

### 8. DELETE /watches/{id}
```bash
curl -X DELETE http://localhost:8000/watches/$WATCH_ID \
  -H "X-CSRF-Token: $CSRF" \
  -b cookies.txt
```

## Tests de sécurité

### Sans auth → 401
```bash
curl -X POST http://localhost:8000/watches \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/product"}'
# → 401 Unauthorized
```

### Sans CSRF → 403
```bash
curl -X POST http://localhost:8000/watches \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"url":"https://example.com/product"}'
# → 403 Forbidden (CSRF token missing)
```
