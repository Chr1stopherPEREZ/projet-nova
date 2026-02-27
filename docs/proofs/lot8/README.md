# Lot 8 - Robustesse API + UX (Preuves)

Ce dossier contient les preuves du Lot 8 : uniformisation des erreurs, robustesse du worker et UX des états vides.

## 📸 Captures d'écran

| ID | Fichier | Description |
|----|---------|-------------|
| **s4-01** | [`ui-empty-list.png`](./screens/s4-01-ui-empty-list.png) | État vide de la liste des suivis avec CTA. |
| **s4-02** | [`ui-empty-history.png`](./screens/s4-02-ui-empty-history.png) | État vide de l'historique d'un suivi (nouveau produit). |
| **s4-03** | [`ui-error-404.png`](./screens/s4-03-ui-error-404.png) | Affichage d'une erreur 404 (Suivi introuvable) dans l'UI. |
| **s4-04** | [`ui-error-422.png`](./screens/s4-04-ui-error-422.png) | Affichage d'une erreur de validation 422 (URL invalide). |
| **s4-05** | [`api-401.png`](./screens/s4-05-api-401.png) | Réponse API 401 (Format standard). |
| **s4-06** | [`api-403.png`](./screens/s4-06-api-403.png) | Réponse API 403 CSRF_INVALID (Format standard). |
| **s4-07** | [`api-404.png`](./screens/s4-07-api-404.png) | Réponse API 404 WATCH_NOT_FOUND (Format standard). |

## 📜 Preuves API (Sorties réelles)

Le fichier [`api_errors.md`](./api_errors.md) contient les commandes `curl` réelles et les réponses JSON correspondantes capturées en mode production.

## 🛠️ Vérifications de sécurité

### 1. Secrets requis en production
Si `APP_ENV=production` et que `JWT_SECRET_KEY` n'est pas définie (ou égale à la valeur par défaut), l'application refuse de démarrer avec une `ValueError`.

### 2. CSRF actif par défaut
La protection CSRF est désormais active même en mode développement. Elle peut être contournée via :
- Header `X-Skip-CSRF: 1` (pour Swagger)
- Env var `CSRF_DISABLED=true` (non recommandé)
