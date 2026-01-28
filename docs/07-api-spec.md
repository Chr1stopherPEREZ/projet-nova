# Nova - Spécification API (FastAPI)

> Convention : JSON, erreurs normalisées, RBAC USER/ADMIN.

## Authentification & Sécurité
L'authentification repose sur des **JWT (JSON Web Tokens)**.
- **Stockage :** Le token est transmis via un **cookie HttpOnly** (`access_token`) pour limiter les risques XSS.
- **CSRF :** Une protection contre les attaques CSRF est requise pour toutes les méthodes mutables (POST, PATCH, DELETE), utilisant le mécanisme **Double Submit Cookie**.
    - Le serveur pose un cookie `csrf_token` (non HttpOnly, accessible au JS).
    - Le client (front-end) doit lire ce cookie et renvoyer sa valeur dans le header `X-CSRF-Token` pour chaque requête mutable.
    - Le serveur valide que la valeur du header correspond strictement à celle du cookie.
- **Autorisation :** Le rôle de l'utilisateur (`USER` ou `ADMIN`) est extrait du JWT et vérifié pour chaque endpoint.

## Auth
### POST `/auth/register`
Request
```json
{"email":"user@example.com","password":"..."}
```
Response 201
```json
{"id":"uuid","email":"user@example.com"}
```

### POST `/auth/login`
Request
```json
{"email":"user@example.com","password":"..."}
```
Response 200
*Note : Le JWT est transmis via un header `Set-Cookie` (HttpOnly). Le corps de la réponse contient les informations de l'utilisateur.*
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "USER"
}
```

### POST `/auth/logout`
Response 204

### POST `/auth/forgot-password`
Request
```json
{"email":"user@example.com"}
```
Response 202

### POST `/auth/reset-password`
Request
```json
{"token":"...","new_password":"..."}
```
Response 204

## Suivis (USER)
### GET `/watches`
Response 200
```json
[{"id":"uuid","url":"...","status":"ACTIVE","stock_state":"UNKNOWN","last_checked_at":null}]
```

### POST `/watches`
Request
```json
{"url":"https://shop.tld/product/123","label":"Optionnel"}
```
Response 201

### PATCH `/watches/{id}`
Request
```json
{"status":"PAUSED"}
```
Response 200

### DELETE `/watches/{id}`
Response 204

### GET `/watches/{id}/checks`
Response 200 (paginated)
```json
{
  "items": [{"checked_at": "...", "stock_state": "IN_STOCK", "http_status": 200, "duration_ms": 450}],
  "total": 1, "limit": 20, "offset": 0
}
```

### GET `/watches/{id}/notifications`
Response 200 (paginated)
```json
{
  "items": [{"sent_at": "...", "status": "SENT", "channel": "EMAIL"}],
  "total": 1, "limit": 20, "offset": 0
}
```

## Admin — site profiles
### GET `/admin/site-profiles`
### POST `/admin/site-profiles`
### PATCH `/admin/site-profiles/{id}`
### DELETE `/admin/site-profiles/{id}`

### POST `/admin/site-profiles/{id}/test`
Request
```json
{"url":"https://shop.tld/product/123"}
```
Response 200
```json
{
  "url":"...",
  "fetch_mode":"HTTP",
  "http_status":200,
  "matched": {"in_stock": ["css_exists:button.add-to-cart"], "out_of_stock": []},
  "result_stock_state":"IN_STOCK",
  "extracted": {"product_title":"..."},
  "errors": []
}
```

## Admin — métriques
### GET `/admin/metrics`
Response 200
```json
{"active_watches":12,"notifications_sent_24h":3,"broken_watches":1}
```

## Ops/Jobs (hors V1)
### POST `/jobs/run`
Déclenche un cycle de vérification manuel ou via un orchestrateur externe (ex: n8n).
*Note : Cet endpoint est documenté à titre d'exemple d'intégration et n'est pas inclus dans le périmètre fonctionnel de la V1.*

**Query Parameters :**
- `site` (string, optionnel) : Domaine spécifique à traiter (ex: `ldlc.com`).

**Response 202**
```json
{"status": "job_started", "job_id": "uuid"}
```

## Schémas (résumé)

### Watch (Suivi)
| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Identifiant unique. |
| `url` | string | URL originale du produit. Note : l'unicité du suivi est basée sur une `normalized_url` gérée en interne. |
| `label` | string | Nom personnalisé (optionnel). |
| `status` | enum | Statut de surveillance : `ACTIVE`, `PAUSED`. |
| `stock_state`| enum | État du stock détecté : `IN_STOCK`, `OUT_OF_STOCK`, `UNKNOWN`, `BROKEN`. |
| `last_checked_at`| datetime | Date du dernier contrôle effectué par le worker. |

### WatchCheck (Historique de contrôle)
| Champ | Type | Description |
| :--- | :--- | :--- |
| `checked_at` | datetime | Date et heure du contrôle. |
| `stock_state`| enum | État détecté lors de ce contrôle. |
| `http_status` | int | Code HTTP retourné par le site. |
| `duration_ms` | int | Durée de la requête en millisecondes. |
| `error_code`  | string | Code d'erreur technique (si échec). |

### Notification (Alerte envoyée)
| Champ | Type | Description |
| :--- | :--- | :--- |
| `sent_at` | datetime | Date et heure de l'envoi. |
| `status`  | enum | État de l'envoi : `SENT`, `FAILED`. |
| `channel` | enum | Canal utilisé (ex: `EMAIL`). |

*Note : La base de données stocke également une `normalized_url` en interne pour éviter les doublons techniques (ex: suppression des paramètres de tracking).*

### Énumérations
- **WatchStatus** (API `status`) :
    - `ACTIVE` : Le worker surveille ce produit.
    - `PAUSED` : Surveillance suspendue par l'utilisateur.
- **StockState** :
    - `IN_STOCK` : Produit disponible à l'achat.
    - `OUT_OF_STOCK` : Produit en rupture.
    - `UNKNOWN` : Impossible de déterminer l'état (ex: aucune règle n'a matché).
    - `BROKEN` : État critique déclenché après **3 échecs consécutifs** de récupération (404, timeout, 5xx) ou en cas d'incohérence structurelle majeure.
- **NotificationStatus** :
    - `SENT` : Notification transmise avec succès au fournisseur.
    - `FAILED` : Échec de l'envoi.

## Erreurs (format)
- 400 : validation
- 401 : non authentifié
- 403 : interdit (RBAC)
- 404 : ressource inexistante
- 429 : rate limited
- 500 : interne

## Pagination
Les endpoints listés comme "(paginated)" acceptent les paramètres `limit` (défaut 20, max 100) et `offset` (défaut 0).
La réponse suit ce format :
```json
{
  "items": [],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

Format d'erreur recommandé
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "URL invalide",
    "details": [{"field":"url","message":"must be http(s)"}]
  }
}
```
