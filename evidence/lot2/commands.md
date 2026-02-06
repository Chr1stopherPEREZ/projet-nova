# Commandes LOT 2

## Lancer les services
```bash
docker compose up -d --build
```

## Appliquer les migrations
```bash
docker compose exec api alembic upgrade head
```

## Utilisateur de démonstration
```bash
# L'utilisateur demo est créé automatiquement au démarrage (via start.sh)
# Email: demo@nova.dev
# Password: Demo12345!

# Pour désactiver le seed automatique :
# SEED_DEMO_USER=0 dans les variables d'environnement
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
