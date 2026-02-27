# Comportement du Worker Nova

Ce document détaille le comportement du worker de scraping dans différentes situations d'erreur pour garantir la robustesse du système Nova.

## Robustesse et Retries

Le worker est conçu pour être "prévisible" et ne pas échouer silencieusement.

### Stratégie de Retry
- **Tentatives** : En cas d'échec d'un check (erreur réseau, timeout, erreur parser), le worker effectue jusqu'à **2 tentatives supplémentaires** (soit 3 essais au total).
- **Délai** : Un délai de 2 secondes est observé entre chaque tentative.
- **Logs** : Chaque tentative est logguée (`Attempt 1 failed...`).

### Timeouts
- Les appels réseau vers les sites marchands (Nike, Shopify) ont un timeout strict de **10 à 30 secondes** pour éviter de bloquer le worker indéfiniment.

## Gestion des cas d'erreur

### 1. Produit injoignable (404, 500, DNS fail)
- Si le site répond avec une erreur HTTP ou est injoignable après les retries :
  - Un `WatchCheck` est créé avec l'état `UNKNOWN`.
  - Le champ `error_code` est renseigné (ex: `NETWORK_ERROR`, `INTERNAL_ERROR`).
  - Le champ `error_message` contient le détail court de l'erreur.
  - La `Watch` parente est mise à jour avec `stock_state=UNKNOWN`.

### 2. Timeout / Échec critique du Worker
- Si le worker échoue à exécuter le check (crash interne, timeout global) :
  - Un `WatchCheck` de secours est créé avec l'état `UNKNOWN`.
  - `error_code` : `INTERNAL_ERROR`.
  - `fetch_mode` : `WORKER_FALLBACK`.
  - `http_status` par défaut : `500`.
  - La watch passe en `UNKNOWN`.

### 3. Parser fail (Structure de page modifiée)
- Si le parser ne parvient pas à trouver les informations de stock (ex: Nike change sa structure JSON) :
  - Un log `CRITICAL` ou `ERROR` est généré.
  - État : `UNKNOWN` (ou `BROKEN` si identifié comme tel).
  - Détails : L'erreur spécifique du parser est enregistrée dans les `details` du check.

### 4. Watch supprimée pendant le check
- Le worker récupère la liste des watches au début de son cycle.
- Si une watch est supprimée de la DB avant que le worker ne traite son tour, SQLAlchemy lèvera une erreur lors de l'accès à l'objet ou de la sauvegarde, qui sera capturée par le bloc `try/except` de la boucle, permettant au worker de continuer sur les autres produits.

## États de stock (StockState)

- `IN_STOCK` : Produit (ou variante) disponible.
- `OUT_OF_STOCK` : Produit (ou variante) explicitement indisponible.
- `UNKNOWN` : Impossible de déterminer l'état (erreur réseau, timeout, etc.).
- `BROKEN` : Erreur structurelle ou configuration invalide.

En cas d'échec persistant, Nova privilégie le stockage d'un état d'erreur plutôt que le silence, permettant à l'utilisateur de voir sur son tableau de bord que le suivi rencontre un problème (badge orange/rouge).
