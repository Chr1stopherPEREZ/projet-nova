# Dossier de Preuves - Lot 10 : Finalisation & Release

Ce dossier contient les preuves de finalisation du projet Nova, la validation de la release "1 commande" et la cohérence globale du système pour la certification CDA.

## Liste des preuves réelles (Captures)

### 1. Parcours Utilisateur & Auth
- `01-login-user.png` : Écran de connexion (Frontend). Le système supporte également l'inscription via `/register`.
- `02-dashboard-user.png` : Tableau de bord utilisateur affichant les KPIs personnels et ses performances de suivi.
- `03-variant-selection.png` : Interface de création d'un suivi (Watches).
- `04-watch-confirmation.png` : Notification de succès après ajout d'un produit.
- `05-watch-detail.png` : Vue détaillée d'un suivi avec historique des contrôles (Watch Checks).

### 2. Administration & API
- `06-dashboard-admin.png` : Tableau de bord administrateur affichant les KPIs globaux et les top domaines surveillés.
- `08-swagger-ui-overview.png` & `08b-swagger-ui-endpoints.png` : Documentation interactive de l'API (OpenAPI/Swagger) montrant les routes documentées et sécurisées (JWT + CSRF).

### 3. Validation Technique
- `07-docker-compose-ps.png` : État des services Docker (api, db, worker, web, mailhog) tous "Up".
- `09-mailhog-alert.png` : Preuve de réception d'une notification email réelle dans Mailhog suite à un changement de stock détecté par le worker.
- `10-pytest-success.png` : Résultat de la suite de tests backend (`pytest`) montrant 100% de succès (38 tests).

## Procédure de reproduction (Release "1 commande")

Pour valider l'état final du projet, exécuter la séquence suivante à la racine du projet :

```bash
# 1. Préparation de l'environnement (idempotent)
cp .env.example .env && cp web/.env.example web/.env

# 2. Construction et démarrage de la stack complète
docker compose up -d --build

# 3. Vérification des logs de démarrage et migrations auto
docker compose logs -f api

# 4. Exécution des tests de non-régression (38 tests)
docker compose exec api pytest
```

## État des lieux final (MVP CDA)
- **Frontend** : Application React responsive. Parcours Inscription -> Connexion -> Dashboard -> Création Suivi -> Détails -> Notification 100% fonctionnel.
- **Backend** : API FastAPI robuste. Authentification JWT via cookies HttpOnly et protection CSRF (Double Submit Cookie).
- **Worker** : Cœur métier opérationnel. Détection de stock déterministe (fixtures) et live (Shopify/LDLC).
- **Documentation** : Matrice de traçabilité, specs API et plan de démo alignés avec le code réel livré.
