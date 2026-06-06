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
1. Se connecter avec `user@nova.dev` / `Demo123456789`.
2. Vérifier la redirection vers le Dashboard.

### Étape B : Création d'un Suivi (Watch) - Scénario Cible
1. Cliquer sur "Ajouter un produit".
2. Saisir une URL Nova (ex: `https://lesprit-belle.fr/products/lampe-halo`).
3. Montrer l'UI de chargement et le choix de variante (UI intégrée).
4. Note : Le branchement API complet pour la création est à finaliser dans ce lot.

### Étape C : Simulation du Check (Backend / Fixtures)
1. Depuis le terminal, déclencher une vérification forcée.
2. Le système interroge la fixture configurée (Mode Fixture pour la stabilité démo).
3. L'état passe à `OUT_OF_STOCK` ou `IN_STOCK` en base de données selon la fixture choisie.

### Étape D : Réception d'Alerte
1. (Si transition vers IN_STOCK) : Ouvrir Mailhog.
2. Vérifier la réception d'un email : "Produit disponible : [Nom du produit]".

## 4. Scénario Administration (Profil Admin)
1. Se déconnecter et se reconnecter avec `christopher@nova.dev` / `Demo123456789`.
2. Accéder au dashboard Admin (`/admin`).
3. Vérifier les statistiques globales : Nombre de comptes, Total de suivis, Domaine le plus surveillé (L’Esprit Belle, Terre de France).

## 5. Checklist Jury (Preuves à avoir prêtes)
- [ ] **Code Source** : Montrer `api/app/core/security.py` (Argon2id + JWT).
- [ ] **Sécurité** : Montrer `api/app/core/csrf.py` et le test d'échec sans token.
- [ ] **Worker** : Montrer `api/app/worker.py` et expliquer la boucle de traitement.
- [ ] **Base de Données** : Montrer l'historique `WatchCheck` en base (via TablePlus ou CLI).
- [ ] **Tests** : Montrer un rapport de test Pytest avec couverture.

---
*Note : Le lot 10 (Finalisation) prévoit la capture de ces derniers écrans de démo pour enrichir les annexes du dossier.*
