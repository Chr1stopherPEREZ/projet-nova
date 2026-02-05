# Commandes LOT 2

## Lancer les services
```bash
docker compose up -d --build
```

## Appliquer les migrations
```bash
docker compose exec api alembic upgrade head
```

## Créer un utilisateur de test
```bash
docker compose exec api python -m app.scripts.seed_user
# Avec options:
docker compose exec api python -m app.scripts.seed_user --email user@test.com --password secret123
docker compose exec api python -m app.scripts.seed_user --admin
```

## Lancer les tests
```bash
docker compose exec api pytest tests/ -v
```

## Tester l'API manuellement
```bash
# Health check
curl http://localhost:8000/health

# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456789"}' \
  -c cookies.txt

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456789"}' \
  -c cookies.txt

# CSRF check (sans header = 403)
curl -X POST http://localhost:8000/auth/_csrf-check \
  -b cookies.txt

# CSRF check (avec header = 204)
CSRF=$(awk '$6=="csrf_token"{print $7}' cookies.txt)
curl -X POST http://localhost:8000/auth/_csrf-check \
  -b cookies.txt \
  -H "X-CSRF-Token: $CSRF"

# Logout
curl -X POST http://localhost:8000/auth/logout \
  -b cookies.txt
```
