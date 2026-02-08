# Nova — Planning S1 → S4 (Lots)

> Objectif global : **preuve > perfection**.  
> Chaque lot se termine par des **preuves** (captures, commandes, tests) pour le jury.

---

## Semaine 1 — Fondations + vertical slice minimale (back-first)

### Lot 1 — Skeleton + Docker + preuve “ça tourne”
**Objectif :** `docker compose up` fonctionne.

- Arborescence : `/api /web /worker /docs`
- `docker-compose.yml` : **db + api + mailhog + worker (idle)**
- Endpoint healthcheck : `GET /health`
- OpenAPI accessible (Swagger)

**Preuves fin lot :**
- Capture `docker compose ps`
- Capture Mailhog (UI ouverte : `http://localhost:8025`)
- Capture Swagger : `http://localhost:8000/docs`

---

### Lot 2 — DB + migrations + auth (conforme doc)
**Objectif :** auth utilisable + DB propre.

- Modèles + migrations : `users`, `watches`, `watch_checks`
- Seed : 1 user de test (ou commande de création)
- Auth : **login/logout** (register si prévu)
- Cookies + CSRF double submit en place
- Tests auth (au moins **2–3**)

**Preuves fin lot :**
- Migration appliquée en **1 commande**
- Tests auth OK (capture sortie)

---

### Lot 3 — “1 route business” + tests
**Objectif :** vertical slice minimale existe.

- `POST /watches` (protégé auth + CSRF)
- `GET /watches`
- `GET /watches/{id}` (recommandé : utile en démo et quasi gratuit)
- Tests create/list (+ un test **401/403**)

**Preuves fin lot :**
- Swagger ou curl : create watch → list watch → detail watch
- Tests passent (capture sortie)

---

## Semaine 2 — Worker + checks + notification (cœur du projet)

### Lot 4 — Worker “check” déterministe (fixtures)
**Objectif :** exécuter un check **reproductible** et écrire le résultat en DB.

- Worker exécute un check via **fixtures** (HTML/JSON), pas de scraping live
- Mode déterministe activable :
  - env `CHECK_MODE=fixture`
  - option `FIXTURE_NAME=...` (ou scénario figé)
- Persistance : 1 exécution = 1 ligne dans `watch_checks`
- Logs lisibles (niveau info)

**Preuves fin lot :**
- Capture DB (`watch_checks` : au moins quelques lignes)
- Capture logs worker d’un run
- 2 runs identiques → même résultat (preuve déterminisme)

---

### Lot 5 — Orchestration + notification email (Mailhog)
**Objectif :** déclencher un check via l’API et envoyer un email **si changement**.

- Endpoint `POST /jobs/run` (protégé auth)
  - body : `watch_id` (ou `run_all=true`)
- Détection de changement : compare avec le dernier check (hash/snapshot)
- Si changement → envoi email (Mailhog)
- Tests (au moins **3–5**) :
  - run sans changement → pas d’email
  - run avec changement → email envoyé
  - 401/403 si non-auth

**Preuves fin lot :**
- Démo : run A (pas de changement) puis run B (changement) → **1 mail** dans Mailhog
- Capture Mailhog (email) + capture Swagger sur `/jobs/run`
- Tests “jobs” OK

> **Note démo :** prévois un scénario A→B contrôlé (env var ou fixture fixe), sinon tu galères à prouver le changement en live.

---

## Semaine 3 — Front MVP + intégration (front = démo, pas produit)

### Lot 6 — Front skeleton + Auth
**Objectif :** login fonctionnel côté front.

- Écran Login
- Gestion cookie HttpOnly :
  - `credentials: "include"`
  - gestion CSRF (header/token selon ton implémentation)
- Route guard simple : non loggé → redirect login

**Preuves fin lot :**
- Capture écran login
- Capture réseau : cookie/CSRF OK
- Login → redirection dashboard

---

### Lot 7 — Watches UI + “Run check”
**Objectif :** écrans minimum de démo.

- Dashboard “My Watches” (liste)
- Create Watch (form)
- Watch Detail (détails + historique checks)
- Bouton “Run check” → appelle `POST /jobs/run`
- États UI minimum :
  - loading
  - empty state (0 watch)
  - error state (message clair)

**Preuves fin lot :**
- Démo : login → create → list → detail → run check → voir un nouveau check
- Capture des écrans clés

---

## Semaine 4 — Durcissement + preuves jury

### Lot 8 — Robustesse API + UX “CDA-proof”
**Objectif :** rendre l’app défendable (erreurs, validations, états).

- Gestion d’erreurs cohérente (codes + messages)
- Validations Pydantic propres (422/400 lisibles)
- CORS (front) + CSRF bien documenté
- Worker robuste (timeouts / comportement expliqué)

**Preuves fin lot :**
- Démo d’un cas erreur (watch inexistante / non-auth) → réponse propre
- Capture états vides côté front

---

### Lot 9 — Pack tests crédible + 1 test intégration happy path
**Objectif :** preuve technique.

- **15–25 tests** back (unit + API)
- 1 test intégration happy path :
  - seed user
  - login
  - create watch
  - run job
  - assert check créé (+ email si scénario changement)

**Preuves fin lot :**
- `pytest` green (capture)
- Test intégration clairement nommé (capture)

---

### Lot 10 — Docs jury + release “1 commande”
**Objectif :** livrer proprement.

- Traceability matrix (exigences → routes/tests/docs)
- Demo plan (script minute par minute)
- Runbook final (dev + démo + troubleshooting)
- Tag release (`v1.0.0-cda`) + README “1 commande”
  - `docker compose up --build`
  - + commandes de test

**Preuves fin lot :**
- Capture README “1 commande”
- Tag Git + changelog court

---

## Checklist “démo express” (2 minutes)
1. `docker compose up --build`
2. `docker compose ps` (preuve)
3. Ouvrir Swagger `/docs`
4. Ouvrir Mailhog
5. Login → create watch → list → detail
6. `POST /jobs/run` → check créé
7. Scénario changement A→B → email Mailhog
8. `pytest -q` (preuve tests)
