# Preuves visuelles — Semaine 1 (Lots 1–3)

> Ce dossier contient les captures d'écran prouvant le bon fonctionnement du projet Nova à la fin de la Semaine 1.

## Fichiers

| Fichier | Commande / Action | Description |
|---------|-------------------|-------------|
| `s1-01-compose-up.png` | `docker compose up --build` | Build et démarrage des 4 services (api, db, mailhog, worker) |
| `s1-02-compose-ps.png` | `docker compose ps` | État des conteneurs (tous "Up") |
| `s1-03-mailhog.png` | http://localhost:8025 | Interface Mailhog accessible |
| `s1-04-swagger.png` | http://localhost:8000/docs | Documentation OpenAPI/Swagger accessible |
| `s1-05-pytest.png` | `docker compose exec api pytest -v` | 21 tests passent (11 auth + 10 watches) |

## Correspondance avec le planning

Ces preuves valident les critères de fin de lot définis dans [`docs/nova-planning.md`](../nova-planning.md) :

### Lot 1 — Skeleton + Docker
- ✅ `docker compose ps` → 4 services UP
- ✅ Swagger accessible
- ✅ Mailhog accessible

### Lot 2 — DB + Auth + CSRF
- ✅ Migrations appliquées (visible dans compose-up)
- ✅ Tests auth passent (visible dans pytest)

### Lot 3 — Routes /watches
- ✅ Tests watches passent (visible dans pytest)

## Reproduction

Pour reproduire ces captures :

```bash
# 1. Build et démarrage (s1-01)
docker compose up --build

# 2. Vérifier les conteneurs (s1-02)
docker compose ps

# 3. Ouvrir Mailhog (s1-03)
# http://localhost:8025

# 4. Ouvrir Swagger (s1-04)
# http://localhost:8000/docs

# 5. Lancer les tests (s1-05)
docker compose exec api pytest tests/ -v
```

## Voir aussi

- [`evidence/lot1/`](../../evidence/lot1/) — Commandes et sorties texte Lot 1
- [`evidence/lot2/`](../../evidence/lot2/) — Commandes et sorties texte Lot 2
- [`evidence/lot3/`](../../evidence/lot3/) — Commandes et sorties texte Lot 3
