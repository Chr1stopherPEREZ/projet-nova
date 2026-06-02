# Runbook Final — Nova (Lot 10)

## 1. Installation de développement
```bash
# 1. Cloner le projet
git clone <repo-url>
cd projet-nova

# 2. Lancer l'environnement Docker
docker compose up --build -d

# 3. Accéder aux services
# Frontend : http://localhost:5173
# Mailhog : http://localhost:8025
# API Docs : http://localhost:8000/docs
```

## 2. Configuration & Seed (Comptes de démo)
Par défaut, le système propose :
- **Utilisateur Standard**: `user@example.com` / `password123`
- **Administrateur**: `admin@example.com` / `adminpassword`

Si la base est vide, utilisez les migrations Alembic ou le script de seed (si fourni) :
```bash
docker compose exec api alembic upgrade head
```

## 3. Déclenchement de la démo (Mode FIXTURE)
Pour une démo 100% stable, Nova utilise un mode "FIXTURE" (activé par défaut en dev).

### 3.1. Configurer l'état souhaité
Dans le fichier `.env` à la racine :
```env
CHECK_MODE=fixture
# Pour simuler un produit ÉPUISÉ
FIXTURE_NAME=out_of_stock.html 
# Pour simuler un produit EN STOCK
# FIXTURE_NAME=in_stock.html
```

### 3.2. Scénario de transition (Restock)
1. Réglez `FIXTURE_NAME=out_of_stock.html` et redémarrez (`docker compose restart api worker`).
2. Créez un suivi (ex: Nike ou Shopify). Lancez un "Run check" -> Le statut reste "Épuisé".
3. Changez `FIXTURE_NAME=in_stock.html` dans le `.env`.
4. Lancez à nouveau "Run check" (sans redémarrer si l'API recharge l'env, sinon `docker compose restart api`).
5. Observez le passage à "En stock" et vérifiez Mailhog.

## 4. Troubleshooting
- **Logs de check** : `docker compose logs -f api` ou `worker`. Recherchez "Check watch_id=... avec fixture '...'".
- **Ports occupés** : Vérifiez que les ports 5173, 8000 et 8025 sont libres.
- **Base de données corrompue** : `docker compose down -v` puis `docker compose up`.
- **Emails non reçus** : Vérifiez que `SMTP_HOST=mailhog` dans le fichier `.env`.

## 5. Tests de validation
```bash
# Lancer tous les tests backend
docker compose exec api pytest

# Lancer un test d'intégration spécifique
docker compose exec api pytest tests/integration/test_happy_path.py
```
