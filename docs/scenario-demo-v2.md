# Scénario de Démonstration Nova V2

Ce document décrit le déroulement idéal de la démonstration lors de la soutenance de rattrapage. Le scénario est conçu pour être stable, reproductible et sécurisé grâce au mode "Fixture".

## Prérequis
- Docker et Docker Compose installés.
- Projet cloné et configuré avec le fichier `.env` par défaut.

## Étape 1 : Lancement de l'environnement (Infrastructure)
1. Ouvrir un terminal à la racine du projet.
2. Lancer les containers :
   ```bash
   docker-compose up -d
   ```
3. Vérifier que tout est OK :
   ```bash
   docker-compose ps
   ```
   *Preuve : Montrer au jury que l'infrastructure est isolée et automatisée.*

## Étape 2 : Accès à l'application et Connexion
1. Ouvrir le navigateur sur `http://localhost:3000`.
2. Se connecter avec le compte de démonstration (seedé par défaut) :
   - **Email** : `user@nova.dev`
   - **Mot de passe** : `Demo123456789`
3. Arriver sur le Dashboard, puis aller sur "Mes suivis" pour voir les données réelles issues de PostgreSQL.
   *Preuve : Interface propre, réactive et sécurisée, branchée sur l'API.*

## Étape 3 : Consultation des suivis (Données réelles)
1. Aller sur "Mes suivis".
2. Montrer les 5 produits Nova V2 issus de PostgreSQL.
3. Montrer les boutiques réelles (L’Esprit Belle, Cassiopée Bougie, Terre de France).
4. Utiliser la recherche (ex: taper "halo") pour filtrer la liste.
5. Utiliser les filtres d'état (ex: cliquer sur "Épuisé" pour voir le Pull Brume en `SOLD_OUT`).
6. Utiliser le tri et la pagination locale.
   *Preuve : Liste fonctionnelle, performante et branchée sur la base de données.*

## Étape 4 : Scénario cible à finaliser (Extensions prévues)
Les fonctionnalités suivantes sont intégrées visuellement (Design Nova V2) mais le branchement complet à l'API est à finaliser :

### 4.1 Création d'un suivi
1. Cliquer sur "Ajouter un produit".
2. Coller une URL Nova V2 (ex: `https://lesprit-belle.fr/products/lampe-halo`).
3. L'UI montre le chargement (Simulation d'analyse).
4. Sélectionner une variante si proposée.
5. Valider la création (Action mockée côté front).

### 4.2 Détail et Historique
1. Cliquer sur un produit dans la liste pour accéder à `/watches/:id`.
2. L'écran de détail Nova V2 s'affiche avec les graphiques de prix et l'historique (Données de démonstration).
3. Montrer l'onglet "Historique" avec les lignes de check simulées.
   *Preuve : Cohérence visuelle et préparation du terrain pour le branchement API final.*

## Étape 5 : Déclenchement d'un changement de stock (Backend)
Pour montrer la puissance du moteur Nova, déclencher un check depuis le terminal :
1. Noter l'état actuel en base : **IN_STOCK** (car `FIXTURE_NAME` est `in_stock.html`).
2. Simuler une rupture de stock via le script dédié :
   ```bash
   docker exec -e CHECK_MODE=fixture -e FIXTURE_NAME=out_of_stock.html projet-nova-api-1 python -m app.scripts.trigger_check --watch-id <ID>
   ```
3. Vérifier les logs du worker : `docker compose logs worker`.
4. Constater le passage à l'état **OUT_OF_STOCK** en base de données.
5. Ouvrir Mailhog (`http://localhost:8025`) pour voir l'email de notification.
   *Preuve : Le moteur de détection et la notification peuvent être démontrés côté backend en mode fixture.*

## Étape 6 : Administration et Base de Données
1. Accéder à la zone Admin (`/admin/dashboard`).
2. Montrer les KPIs globaux (Mockés en V2).
3. Retourner au terminal pour montrer la maîtrise de PostgreSQL :
   ```bash
   docker exec -it projet-nova-db-1 psql -U nova -d nova
   ```
4. Exécuter une requête simple :
   ```sql
   SELECT label, stock_state FROM watches;
   SELECT checked_at, stock_state FROM watch_checks ORDER BY checked_at DESC LIMIT 5;
   ```
   *Preuve : Maîtrise des outils fondamentaux (SQL, terminal) et intégrité des données.*

---
