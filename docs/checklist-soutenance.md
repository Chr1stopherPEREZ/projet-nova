# Checklist & Scénario de Soutenance - Projet Nova

Ce document détaille la procédure de démonstration technique du projet Nova pour le jury CDA.

## 1. Préparation de l'Environnement
Exécutez les commandes suivantes pour garantir un environnement propre et fonctionnel :
```bash
# Nettoyage et relancement
docker compose down -v
docker compose up --build -d

# Attendre le démarrage et vérifier les services
docker compose ps
```

## 2. Vérifications de Santé (Avant démonstration)
- **API Swagger** : Accéder à `http://localhost:8000/docs` (Preuve Lot 1).
- **Frontend** : Accéder à `http://localhost:5173`.
- **Mailhog** : Accéder à `http://localhost:8025` pour voir les emails sortants.
- **Tests** : Lancer la suite complète :
  ```bash
  docker compose exec api pytest api/tests
  ```

## 3. Scénario de Démonstration (User Story : "Retour en Stock")

### Étape A : Connexion (Profil User)
1. Se connecter avec `user@example.com` / `password123`.
2. Vérifier la redirection vers le Dashboard.

### Étape B : Création d'un Suivi (Watch)
1. Cliquer sur "Ajouter un produit".
2. Saisir une URL Shopify (ex: `https://boutique-demo.myshopify.com/products/test-product`).
3. Choisir une variante si proposée.
4. Valider. Le produit apparaît dans la liste avec l'état `UNKNOWN`.

### Étape C : Simulation du Check (Scraping)
1. Depuis le détail du produit, cliquer sur "Lancer la vérification".
2. Le système interroge l'API Shopify (Mode Live).
3. L'état passe à `OUT_OF_STOCK` ou `IN_STOCK` selon la disponibilité réelle.

### Étape D : Réception d'Alerte
1. (Si transition vers IN_STOCK) : Ouvrir Mailhog.
2. Vérifier la réception d'un email : "Produit disponible : [Nom du produit]".

## 4. Scénario Administration (Profil Admin)
1. Se déconnecter et se reconnecter avec `admin@example.com` / `adminpassword`.
2. Accéder au dashboard Admin (`/admin`).
3. Vérifier les statistiques globales : Nombre de comptes, Total de suivis, Domaine le plus surveillé (Nike/Shopify).

## 5. Checklist Jury (Preuves à avoir prêtes)
- [ ] **Code Source** : Montrer `api/app/core/security.py` (Argon2id + JWT).
- [ ] **Sécurité** : Montrer `api/app/core/csrf.py` et le test d'échec sans token.
- [ ] **Worker** : Montrer `api/app/worker.py` et expliquer la boucle de traitement.
- [ ] **Base de Données** : Montrer l'historique `WatchCheck` en base (via TablePlus ou CLI).
- [ ] **Tests** : Montrer un rapport de test Pytest avec couverture.

---
*Note : Le lot 10 (Finalisation) prévoit la capture de ces derniers écrans de démo pour enrichir les annexes du dossier.*
