# Worker Nova (LOT 4)

Worker de check déterministe pour Nova. Exécute des vérifications de stock en mode fixture (sans scraping live).

## Mode de fonctionnement

Le worker lit des fixtures HTML locales et analyse le contenu pour déterminer l'état du stock. Règle simple et déterministe :
- Si la fixture contient `ADD_TO_CART` → **IN_STOCK**
- Sinon → **OUT_OF_STOCK**

## Variables d'environnement

| Variable | Valeur par défaut | Description |
|----------|------------------|-------------|
| `CHECK_MODE` | `fixture` | Mode de check. Seul `fixture` est supporté (LOT 4) |
| `FIXTURE_NAME` | `in_stock.html` | Nom du fichier fixture à utiliser |

## Fixtures disponibles

Les fixtures sont dans `api/app/fixtures/checks/` :
- `in_stock.html` - Contient `ADD_TO_CART` → résultat `IN_STOCK`
- `out_of_stock.html` - Ne contient pas `ADD_TO_CART` → résultat `OUT_OF_STOCK`

## Exécution

### Via Docker Compose

```bash
# Run avec fixture in_stock (par défaut)
docker compose run --rm worker

# Run avec fixture out_of_stock
docker compose run --rm -e FIXTURE_NAME=out_of_stock.html worker
```

### Directement (dev)

```bash
cd api
CHECK_MODE=fixture FIXTURE_NAME=in_stock.html python -m app.worker
```

## Prérequis

- Au moins un suivi **ACTIF** doit exister en base de données (créé via `POST /watches`)
- La fixture spécifiée doit exister dans `app/fixtures/checks/`

## Résultat

Chaque exécution crée une ligne dans la table `watch_checks` avec :
- `watch_id` : ID du suivi vérifié
- `checked_at` : Timestamp du check
- `stock_state` : `IN_STOCK` ou `OUT_OF_STOCK`
- `http_status` : `200` (simulé)
- `fetch_mode` : `FIXTURE`

## Preuves de déterminisme

2 runs identiques (même env vars + même fixture) produisent le même résultat fonctionnel.

**Champs déterministes à comparer :**
- `stock_state` (IN_STOCK ou OUT_OF_STOCK)
- `http_status` (200)
- `fetch_mode` (FIXTURE)

> **Note** : Le champ `checked_at` change à chaque exécution (timestamp). Ce n'est pas un problème : la preuve de déterminisme porte uniquement sur le résultat de l'analyse (stock_state, http_status), pas sur les métadonnées d'exécution.

### Vérification

```bash
# Run 1
docker compose run --rm worker
# Run 2
docker compose run --rm worker
# Comparer stock_state, http_status, fetch_mode (ignorer checked_at)
docker compose exec db psql -U nova -d nova -c "SELECT stock_state, http_status, fetch_mode FROM watch_checks ORDER BY checked_at DESC LIMIT 2;"
```

### Requête

```bash
docker compose exec db psql -U nova -d nova -c "
SELECT watch_id, COUNT(*) AS runs,
       COUNT(DISTINCT stock_state) AS distinct_stock,
       COUNT(DISTINCT http_status) AS distinct_http,
       COUNT(DISTINCT fetch_mode) AS distinct_mode
FROM watch_checks
WHERE checked_at >= NOW() - INTERVAL '10 minutes'
GROUP BY watch_id;"
```

**Attendu** : `runs >= 2` et tous les `distinct_*` = 1 (même résultat à chaque run)

## Tests

```bash
docker compose run --rm api python -m pytest tests/test_worker.py -v
```

9 tests couvrent :
- Chargement des fixtures
- Analyse déterministe
- Persistance DB
- Déterminisme (même input → même output)
