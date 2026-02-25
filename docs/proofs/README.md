# Preuves visuelles — Semaines 1 à 3 (Lots 1–7)

> Ce dossier contient les captures d'écran prouvant le bon fonctionnement du projet Nova.

---

## Semaine 1 — Lots 1–3 (Fondations + Auth + Watches)

| Fichier | Commande / Action | Description |
|---------|-------------------|-------------|
| `s1-01-compose-up.png` | `docker compose up --build` | Build et démarrage des 4 services (api, db, mailhog, worker) |
| `s1-02-compose-ps.png` | `docker compose ps` | État des conteneurs (tous "Up") |
| `s1-03-mailhog.png` | http://localhost:8025 | Interface Mailhog accessible |
| `s1-04-swagger.png` | http://localhost:8000/docs | Documentation OpenAPI/Swagger accessible |
| `s1-05-pytest.png` | `docker compose exec api pytest -v` | 21 tests passent (11 auth + 10 watches) |

### Correspondance avec le planning (S1)

**Lot 1 — Skeleton + Docker**
- ✅ `docker compose ps` → 4 services UP
- ✅ Swagger accessible
- ✅ Mailhog accessible

**Lot 2 — DB + Auth + CSRF**
- ✅ Migrations appliquées (visible dans compose-up)
- ✅ Tests auth passent (visible dans pytest)

**Lot 3 — Routes /watches**
- ✅ Tests watches passent (visible dans pytest)

---

## Semaine 2 — Lots 4–5 (Worker + Jobs + Notifications)

| Fichier | Commande / Action | Description |
|---------|-------------------|-------------|
| `s2-01-pytest-40tests.png` | `docker compose exec api pytest -q` | 40 tests passent (11 auth + 10 watches + 9 worker + 10 jobs) |
| `s2-02-compose-ps.png` | `docker compose ps` | État des conteneurs (api, db, mailhog en "Up") |
| `s2-03-db-watch-checks.png` | `SELECT ... FROM watch_checks` | Table `watch_checks` avec lignes créées (IN_STOCK, OUT_OF_STOCK) |
| `s2-04-worker-logs.png` | `python -m app.worker` | Logs du worker : CHECK_MODE=fixture, analyse fixture, WatchCheck créé |
| `s2-05-jobs-401-noauth.png` | `curl POST /jobs/run` (sans auth) | Endpoint protégé → 401 Unauthorized |
| `s2-06-auth-login.png` | `curl POST /auth/login` | Login réussi avec cookies (access_token, csrf_token) |
| `s2-07-jobs-run-success.png` | `curl POST /jobs/run` (avec auth) | Job exécuté : `checks_executed=1`, `changes_detected=0` |

### Correspondance avec le planning (S2)

**Lot 4 — Worker check déterministe (fixtures)**
- ✅ Worker exécute check via fixtures HTML (`s2-04-worker-logs.png`)
- ✅ Mode déterministe : CHECK_MODE=fixture, FIXTURE_NAME visible dans logs
- ✅ Persistance : lignes créées dans `watch_checks` (`s2-03-db-watch-checks.png`)
- ✅ Logs lisibles niveau INFO
- ✅ 9 tests worker passent (`s2-01-pytest-40tests.png`)

**Lot 5 — Orchestration + notifications email**
- ✅ Endpoint `POST /jobs/run` protégé (`s2-05-jobs-401-noauth.png`)
- ✅ Auth + CSRF fonctionnels (`s2-06-auth-login.png`)
- ✅ Job exécuté avec succès (`s2-07-jobs-run-success.png`)
- ✅ 10 tests jobs passent (`s2-01-pytest-40tests.png`)

---

## Semaine 3 — Lots 6–7 (Front + Watches UI)

| Fichier | Action | Description |
|---------|--------|-------------|
| `s3-01-lot6-login-page.png` | Login | Écran de connexion (Lot 6) |
| `s3-02-lot6-network-csrf.png` | Réseau | CSRF/cookies OK (Lot 6) |
| `s3-03-lot6-network-login.png` | Réseau | Requête de login (Lot 6) |
| `s3-04-lot6-dashboard.png` | UI | Dashboard après login (Lot 6) |
| `s3-05-lot6-cookies.png` | Réseau | Cookies en place (Lot 6) |
| `s3-06-lot6-redirect.png` | UI | Redirection guard (Lot 6) |
| `s3-07-lot6-signup.png` | UI | Écran d'inscription (Lot 6) |
| `s3-08-lot7-watches-empty.png` | UI | État vide "Aucun suivi" (Lot 7) |
| `s3-09-lot7-create-watch-filled.png` | UI | Création d'un suivi (Lot 7) |
| `s3-10-lot7-preview-shopify-variant.png` | UI | Preview Shopify (sélection variantes) (Lot 7) |
| `s3-11-lot7-watches-list.png` | UI | Liste des suivis (Lot 7) |
| `s3-12-lot7-watch-detail.png` | UI | Détail du suivi (Lot 7) |
| `s3-13-lot7-run-check-success.png` | Action | Run check (succès) (Lot 7) |
| `s3-14-lot7-run-check-history.png` | UI | Historique avec nouveau check (Lot 7) |
| `s3-15-lot7-delete-success.png` | Action | Suppression du suivi (Lot 7) |

<!-- Notes
Mise à jour: ajout d'une section Lot 7 et harmonisation des noms de fichiers avec le préfixe s3-XX-lot7-…
Les anciennes références vers l'ancien dossier de captures Lot 7 sont obsolètes et ont été retirées des documents.
-->

## Reproduction

### Semaine 1 (Lots 1–3)

```bash
# Build et démarrage (s1-01)
docker compose up --build

# Vérifier les conteneurs (s1-02)
docker compose ps

# Ouvrir Mailhog (s1-03)
# http://localhost:8025

# Ouvrir Swagger (s1-04)
# http://localhost:8000/docs

# Lancer les tests (s1-05)
docker compose exec api pytest tests/ -v
```

### Semaine 2 (Lots 4–5)

```bash
# Lancer les tests (s2-01)
docker compose exec api pytest -q

# Vérifier les conteneurs (s2-02)
docker compose ps

# Vérifier la table watch_checks (s2-03)
docker compose exec db psql -U nova -d nova -c \
  "SELECT watch_id, stock_state, http_status, checked_at FROM watch_checks ORDER BY checked_at DESC LIMIT 10;"

# Exécuter le worker (s2-04)
docker compose run --rm worker

# Tester l'endpoint protégé sans auth (s2-05)
curl -i -X POST http://localhost:8000/jobs/run \
  -H "Content-Type: application/json" \
  -d '{"run_all": true}'

# Login (s2-06)
curl -i -c cookies.txt -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@nova.dev","password":"Demo12345!"}'

# Exécuter un job avec auth (s2-07)
CSRF=$(cat cookies.txt | grep csrf_token | awk '{print $7}')
curl -i -b cookies.txt -X POST http://localhost:8000/jobs/run \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -d '{"run_all": true}'
```

---

## Voir aussi

- [`evidence/lot1/`](../../evidence/lot1/) — Commandes et sorties texte Lot 1
- [`evidence/lot2/`](../../evidence/lot2/) — Commandes et sorties texte Lot 2
- [`evidence/lot3/`](../../evidence/lot3/) — Commandes et sorties texte Lot 3
- [`evidence/lot4/`](../../evidence/lot4/) — Commandes et sorties texte Lot 4
- [`evidence/lot5/`](../../evidence/lot5/) — Commandes et sorties texte Lot 5
- [`evidence/lot6/`](../../evidence/lot6/) — Commandes et sorties texte Lot 6
- [`evidence/lot7/`](../../evidence/lot7/) — Commandes et sorties texte Lot 7
