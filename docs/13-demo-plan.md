# Plan de Démo Nova (Minute par Minute) — Lot 10

Ce script de démonstration permet de valider le fonctionnement complet de Nova en moins de 3 minutes.

## Pré-requis
- Système démarré : `docker compose up --build -d`
- Accès aux URLs :
  - Frontend : `http://localhost:5173`
  - Mailhog : `http://localhost:8025`
  - API : `http://localhost:8000/docs`

---

## 00:00 - Connexion Utilisateur (USER)
- **Action**: Ouvrir `http://localhost:5173/login`.
- **Saisie**: Email `user@nova.dev`, Mot de passe `Demo123456789`.
- **Vérification**: Redirection vers `/dashboard` (puis aller sur "Mes suivis").
- **Preuve**: Voir les KPIs et les produits réels PostgreSQL.

## 00:45 - Consultation des suivis (Réel)
- **Action**: Cliquer sur "Mes suivis" dans la sidebar.
- **Action**: Montrer les 5 produits Nova V2 issus de PostgreSQL.
- **Action**: Utiliser la recherche ("halo") et les filtres ("Épuisé").
- **Vérification**: La liste se met à jour instantanément.

## 01:30 - Scénario Cible : Création et Détail
- **Action**: Cliquer sur "Ajouter un produit" et montrer l'UI d'analyse.
- **Action**: Cliquer sur un produit pour voir l'écran de détail Nova V2.
- **Note**: "Design intégré, branchement API complet en cours de finalisation."

## 02:00 - Simulation Backend (Optionnel)
- **Action**: Déclencher un check via script terminal si le temps le permet.
- **Vérification**: Notification visible dans Mailhog.

## 02:15 - Déconnexion et Connexion Administrateur (ADMIN)
- **Action**: Cliquer sur "Déconnexion".
- **Action**: Se reconnecter avec l'email `christopher@nova.dev` / `Demo123456789`.
- **Vérification**: Redirection automatique vers `/admin/dashboard`.
- **Preuve**: Voir les KPIs globaux (Total suivis tous utilisateurs) et le Top Domaines.

## 02:45 - Fin de démo
- **Action**: Montrer les tests qui passent en arrière-plan (`pytest`).
- **Résultat**: Système stable, conforme CDA, prêt pour la release.
