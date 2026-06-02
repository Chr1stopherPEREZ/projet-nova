# TODO Preuves - Lot 10 (Finalisation Dossier CDA)

Ce document liste les captures d'écran et logs recommandés pour finaliser le dossier de projet Nova et le rendre "Jury-Proof" avant la soutenance.

## 1. Moteur de Scraping (Shopify Live)
Puisque le focus est désormais sur Shopify (Live), il est crucial de prouver son fonctionnement réel.
- **Capture Dashboard Shopify** : Ajouter un produit Shopify (ex: un produit sur `https://www.alltricks.fr/...` ou n'importe quel site Shopify connu).
- **Log Worker Live** : Capturer les logs de `docker compose logs -f worker` montrant la transition d'état d'un produit Shopify en mode live.
- **Commande recommandée** :
  ```bash
  docker compose logs -f worker
  ```
  *Chercher la ligne : "Chemin SHOPIFY_LIVE emprunté pour watch_id=..."*

## 2. Notification Email (Mailhog)
Prouver que le mail est bien reçu après un changement d'état.
- **Capture Mailhog** : Screenshot de l'interface Mailhog (`http://localhost:8025`) avec un email d'alerte Nova.
- **Détail Email** : Screenshot de l'email ouvert montrant le lien vers le produit et le message de retour en stock.

## 3. Sécurité (CSRF)
Prouver que la protection CSRF est active.
- **Capture Console Réseau** : Faire une requête `POST /watches` dans le dashboard et capturer le header `X-CSRF-Token` envoyé par le client React.
- **Capture Log 403** : Capturer une erreur 403 Forbidden en tentant une action mutative sans token (via le script `test_csrf.sh` ou Swagger).

## 4. Tests et Qualité
Prouver l'exhaustivité de la suite de tests (> 100 tests).
- **Capture Pytest Green** : Screenshot du terminal montrant `107 passed`.
- **Commande** :
  ```bash
  docker compose exec api pytest api/tests
  ```

## 5. Administration
- **Capture Dashboard Admin** : Screenshot de l'onglet Statistiques Globales montrant les KPIs (Nombre de suivis, Erreurs de scraping, etc.).
- **Lien Swagger** : Screenshot de la documentation `/docs` montrant tous les endpoints, notamment les routes `/admin/*`.

---
*Ces preuves viendront alimenter les Figures 4, 5 et 7 du dossier principal.*
