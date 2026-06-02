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
- **Saisie**: Email `user@example.com`, Mot de passe `password123`.
- **Vérification**: Redirection vers `/dashboard`.
- **Preuve**: Voir les KPIs (Suivis actifs, Checks aujourd'hui) et le tableau de performance.

## 00:45 - Gestion des suivis
- **Action**: Cliquer sur "Mes suivis" dans la sidebar.
- **Action**: Créer un nouveau suivi Nike.
- **Action**: Cliquer sur le nouveau suivi pour voir les détails.
- **Action**: Cliquer sur "Run check" (bouton en haut à droite).
- **Vérification**: Une nouvelle ligne apparaît dans l'historique des checks.
- **Action (Optionnel)**: Vérifier dans Mailhog qu'un email a été reçu si l'état a changé.

## 01:30 - Navigation (Pages Non Vides)
- **Action**: Cliquer sur "Paramètres" (Vérifier l'email affiché).
- **Action**: Cliquer sur "Aide" (Vérifier la FAQ).
- **Action**: Cliquer sur "Notifications" (Vérifier l'historique des changements).
- **Action**: Cliquer sur "Confidentialité" dans le support.
- **Preuve**: Chaque page affiche un contenu structuré et cohérent.

## 02:15 - Déconnexion et Connexion Administrateur (ADMIN)
- **Action**: Cliquer sur "Déconnexion".
- **Action**: Se reconnecter avec l'email `admin@example.com` / `adminpassword`.
- **Vérification**: Redirection automatique vers `/admin/dashboard`.
- **Preuve**: Voir les KPIs globaux (Total suivis tous utilisateurs) et le Top Domaines.

## 02:45 - Fin de démo
- **Action**: Montrer les tests qui passent en arrière-plan (`pytest`).
- **Résultat**: Système stable, conforme CDA, prêt pour la release.
