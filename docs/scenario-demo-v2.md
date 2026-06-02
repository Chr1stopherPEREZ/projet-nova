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
   - **Email** : `user@example.com`
   - **Mot de passe** : `Test1234!`
3. Arriver sur le Dashboard.
   *Preuve : Interface propre, réactive et sécurisée.*

## Étape 3 : Création d'un suivi (Happy Path)
1. Cliquer sur "Ajouter un produit".
2. Coller une URL Shopify fictive (ex: `https://test-shop.myshopify.com/products/t-shirt`).
3. L'application récupère les informations (via le mock du parser).
4. Sélectionner une variante (ex: Taille M).
5. Valider la création.
   *Preuve : Fluidité de l'UX et gestion des variantes.*

## Étape 4 : Déclenchement d'un changement de stock (Simulation)
1. Aller sur le détail du produit créé.
2. Noter l'état actuel : **IN_STOCK** (car `FIXTURE_NAME` est `in_stock.html` par défaut).
3. Simuler une rupture de stock en modifiant la variable d'environnement ou via un script dédié :
   ```bash
   # Option simple pour la démo: changer la fixture par défaut du container api
   docker exec -e CHECK_MODE=fixture -e FIXTURE_NAME=out_of_stock.html projet-nova-api-1 python -m app.scripts.trigger_check --watch-id <ID>
   ```
   *(Note : Un bouton "Forcer vérification" dans l'UI peut aussi être utilisé si implémenté).*
4. Actualiser la page ou attendre la notification.
5. Constater le passage à l'état **OUT_OF_STOCK**.
   *Preuve : Le moteur de détection fonctionne et réagit aux changements.*

## Étape 5 : Consultation de l'historique et Notifications
1. Aller dans l'onglet "Historique" du produit.
2. Voir la nouvelle ligne de check avec le changement d'état.
3. Ouvrir Mailhog : `http://localhost:8025`.
4. Ouvrir l'email reçu indiquant le changement de stock.
   *Preuve : Traçabilité complète et boucle de notification fonctionnelle.*

## Étape 6 : Administration et Base de Données
1. Accéder à la zone Admin (`/admin` ou via bouton).
2. Montrer la liste globale des suivis.
3. Retourner au terminal pour montrer la maîtrise de PostgreSQL :
   ```bash
   docker exec -it projet-nova-db-1 psql -U nova -d nova
   ```
4. Exécuter une requête simple :
   ```sql
   SELECT label, stock_state FROM watches;
   SELECT checked_at, stock_state FROM watch_checks ORDER BY checked_at DESC LIMIT 5;
   ```
   *Preuve : Maîtrise des outils fondamentaux (SQL, terminal).*

---
