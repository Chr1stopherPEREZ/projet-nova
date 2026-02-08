# LOT 4 - Worker check déterministe (fixtures)

## Commandes de preuve

### 1. Exécution du worker (in_stock)

```bash
docker compose run --rm worker
```

**Logs attendus:**
- `CHECK_MODE=fixture`
- `FIXTURE_NAME=in_stock.html`
- `stock_state=IN_STOCK, http_status=200`
- `WatchCheck créé`

### 2. Exécution du worker (out_of_stock)

```bash
docker compose run --rm -e FIXTURE_NAME=out_of_stock.html worker
```

**Logs attendus:**
- `stock_state=OUT_OF_STOCK, http_status=200`

### 3. Vérification DB

```bash
docker compose exec db psql -U nova -d nova -c "SELECT * FROM watch_checks ORDER BY checked_at;"
```

### 4. Preuve de déterminisme

> **Important** : Le champ `checked_at` change à chaque exécution (timestamp).
> La preuve de déterminisme porte uniquement sur les **champs fonctionnels** :
> - `stock_state` (même résultat d'analyse)
> - `http_status` (même code simulé)
> - `fetch_mode` (même mode d'exécution)

```bash
# Run 1
docker compose run --rm worker
# Run 2
docker compose run --rm worker
# Comparer uniquement stock_state, http_status, fetch_mode (ignorer checked_at/id)
docker compose exec db psql -U nova -d nova -c "SELECT stock_state, http_status, fetch_mode FROM watch_checks ORDER BY checked_at DESC LIMIT 2;"
```

**Résultat attendu** : Les 2 lignes ont des valeurs identiques pour stock_state, http_status, fetch_mode.

#### Requête

```bash
docker compose exec db psql -U nova -d nova -c "
SELECT
  watch_id,
  COUNT(*) AS runs,
  COUNT(DISTINCT stock_state) AS distinct_stock_state,
  COUNT(DISTINCT http_status) AS distinct_http_status,
  COUNT(DISTINCT fetch_mode) AS distinct_fetch_mode
FROM watch_checks
WHERE checked_at >= NOW() - INTERVAL '10 minutes'
GROUP BY watch_id;
"
```

**Résultat attendu** :
- `runs` = 2 (ou plus)
- `distinct_stock_state` = 1
- `distinct_http_status` = 1
- `distinct_fetch_mode` = 1

Si tous les `distinct_*` valent 1, cela prouve que tous les runs produisent le même résultat fonctionnel.

### 5. Tests

```bash
docker compose run --rm api python -m pytest tests/test_worker.py -v
```

**Résultat:** 9 tests passés

### 6. Refus mode live

```bash
docker compose run --rm -e CHECK_MODE=live worker
```

**Logs attendus:**
- `CHECK_MODE='live' non supporté. Seul 'fixture' est implémenté.`

## Captures à prendre

1. Logs worker run 1 (in_stock.html)
2. Logs worker run 2 (même fixture = même résultat)
3. SELECT * FROM watch_checks (montrant les lignes créées)
4. pytest output (9 tests passés)
