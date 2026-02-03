# Nova - Plan de présentation projet (~40 min)

> **Référence** : Durée alignée sur le référentiel RNCP37873 — présentation du projet réalisé en amont (~40 min).

## Objectif
Présenter le projet Nova au jury CDA en démontrant les compétences techniques, la démarche de conception et le produit fonctionnel (BACK + FRONT).

---

## Pré-requis démo
- [ ] Application lancée via `docker compose up`
- [ ] Base de données initialisée (migrations appliquées)
- [ ] Compte utilisateur de test créé
- [ ] Compte administrateur de test créé
- [ ] 1-2 profils de sites configurés
- [ ] Service mail (Mailhog) accessible sur http://localhost:8025
- [ ] Page de test HTML (fixture "en rupture" → "en stock")
- [ ] Slides de présentation prêts
- [ ] Code source ouvert dans l'IDE
- [ ] Frontend accessible sur http://localhost:3000 (ou 5173)
- [ ] API accessible sur http://localhost:8000/docs

---

## Découpage chronométré (~40 min)

| Section | Durée | Contenu |
|---------|-------|---------|
| 1. Pitch | 3 min | Problématique, public cible, valeur ajoutée |
| 2. Démo end-to-end (FRONT + BACK) | 12-15 min | Parcours complet utilisateur + admin |
| 3. Architecture + ADR | 8-10 min | Schéma, composants, décisions techniques |
| 4. Données (MCD/MLD/MPD + migrations) | 5-7 min | Modélisation, contraintes, Alembic |
| 5. Sécurité + RGPD | 4-6 min | SSRF, JWT, RBAC, conformité |
| 6. Qualité (tests + CI) | 3-5 min | Stratégie tests, pipeline CI |
| 7. Conclusion | 1-2 min | Bilan, limites, évolutions |

---

## Script détaillé

### 1. Pitch (3 min)

**Problématique :**
> "Surveiller un produit en rupture sans rafraîchir manuellement"

**Public cible :**
- Utilisateurs e-commerce (sneakers, collectors, gaming)
- Personas : USER (notifié sans spam) / ADMIN (ajuster vite)

**Valeur ajoutée :**
- Gain de temps, ne plus rater un restockage
- Système automatisé, configurable par site

---

### 2. Démo end-to-end - FRONT + BACK (12-15 min)

#### 2.1 Login (2 min)
1. Ouvrir le **Frontend** (http://localhost:3000)
2. Se connecter avec le compte utilisateur de test
3. Montrer le dashboard vide ou avec des suivis existants
4. Expliquer brièvement : "JWT stocké, cookie HttpOnly" (sécurité)

#### 2.2 Créer une watch (3 min)
1. Cliquer "Ajouter un produit" / "Nouveau suivi"
2. Coller l'URL de la **page de test** (produit en rupture)
3. Montrer :
   - Validation de l'URL côté front (UX)
   - Validation côté API (format, SSRF)
   - Association automatique au profil de site
4. Voir le suivi créé avec statut `OUT_OF_STOCK`

#### 2.3 Lister / consulter les suivis (2 min)
1. Montrer la liste des suivis avec :
   - URL / nom du produit
   - Statut actuel (icône/couleur)
   - Date du dernier contrôle
   - Site associé
2. Montrer les actions : pause / reprise / suppression
3. Mentionner le quota utilisateur

#### 2.4 Déclencher un check (4 min)
1. **Modifier la fixture HTML** : passer le produit "en stock"
2. **Forcer un cycle du worker** :
   - Via endpoint `POST /jobs/run` (Swagger, accès admin requis)
   - Ou attendre le prochain cycle (montrer les logs)
3. **Montrer les résultats :**
   - Statut passe à `IN_STOCK` dans le dashboard
   - Logs du worker (transition détectée)
   - Historique des contrôles (si visible dans l'UI)

#### 2.5 Montrer la notification (3 min)
1. Ouvrir **Mailhog** (http://localhost:8025)
2. Montrer l'email reçu :
   - Sujet : "Produit de nouveau en stock"
   - Corps : nom, URL, lien direct
3. **Démontrer l'anti-doublon** : relancer un cycle → pas de nouvel email
4. Expliquer le throttling par domaine

---

### 3. Architecture + ADR (8-10 min)

#### 3.1 Schéma global (3 min)
Montrer le schéma d'architecture :
```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Frontend │────▶│   API    │────▶│   DB     │
│ (React)  │     │ (FastAPI)│     │(Postgres)│
└──────────┘     └────┬─────┘     └──────────┘
                      │
                ┌─────▼─────┐
                │  Worker   │────▶ SMTP
                │(Scheduler)│     (Mailhog)
                └───────────┘
```

**Expliquer les 3 composants :**
- **Frontend** : Dashboard utilisateur/admin (React + Vite)
- **API** : Orchestration, auth, CRUD (FastAPI)
- **Worker** : Cœur métier - scraping + détection (APScheduler)

#### 3.2 Justifier les choix (3 min)
- **Python pour le scraping** : écosystème mature (HTTPX, Playwright)
- **FastAPI** : moderne, async, OpenAPI auto
- **PostgreSQL** : relationnel, contraintes, SQL standard

#### 3.3 ADR clés (3 min)
Présenter 2-3 ADR :
- **001-auth** : JWT vs sessions → choix JWT (stateless API)
- **002-scheduling** : APScheduler vs queue → choix APScheduler (MVP simple)
- **003-scraping-modes** : HTTPX (rapide) + Playwright (JS/anti-bot)

---

### 4. Données - MCD/MLD/MPD + Migrations (5-7 min)

#### 4.1 Modélisation (3 min)
Montrer les diagrammes :
- **MCD** : entités et associations conceptuelles
- **MLD** : tables, clés, relations
- **MPD** : DDL PostgreSQL avec types, contraintes

**Entités clés :**
- `users`, `watches`, `site_profiles`, `watch_checks`, `notifications`

#### 4.2 Contraintes et index (2 min)
- Unicité : `(user_id, normalized_url)`
- FK cascade : `watches → users`, `watches → site_profiles`
- Index : `watches(status, next_check_at)`
- Timestamps : `created_at`, `updated_at` partout

#### 4.3 Migrations Alembic (2 min)
```bash
# Montrer une migration
docker compose exec api alembic history
docker compose exec api alembic upgrade head
```
- Expliquer le versioning des schémas
- Mentionner la stratégie de rollback

---

### 5. Sécurité + RGPD (4-6 min)

#### 5.1 Protection SSRF (2 min)
Montrer dans le code ou démo :
- Validation schéma (http/https uniquement)
- Blocage IPs privées/localhost
- Limite redirections, timeouts stricts
- Log `ssrf_blocked` (montrer un exemple si possible)

#### 5.2 Authentification (2 min)
- Hash Argon2 (mentionner bcrypt comme alternative)
- JWT avec expiration
- RBAC : USER / ADMIN (endpoints protégés)

#### 5.3 RGPD (1 min)
- Données minimisées
- Rétention documentée (logs 30j, checks 90j, notifs 1 an)
- Droit à la suppression → cascade
- Renvoi vers `29-rgpd.md` pour les détails

---

### 6. Qualité - Tests + CI (3-5 min)

#### 6.1 Stratégie de tests (2 min)
- **Unitaires** : validation URL, détection stock, anti-doublon
- **Intégration** : API ↔ DB, Worker ↔ DB
- **E2E** (si implémenté) : scénario complet

Montrer la matrice de traçabilité (`25-traceability-matrix.md`) :
> US → Endpoint → Table → Test

#### 6.2 CI GitHub Actions (1-2 min)
```yaml
# Montrer le workflow
- Linting (Ruff)
- Tests (pytest)
- Build Docker
```

#### 6.3 Exécuter un test (1 min)
```bash
docker compose exec api pytest tests/test_url_validator.py -v
```

---

### 7. Conclusion (1-2 min)

**Bilan :**
- MVP fonctionnel : auth, watches, scraping, notifications
- Architecture défendable et maintenable
- Sécurité documentée et testée

**Limites assumées :**
- Single worker (pas de scaling horizontal en V1)
- Anti-bot limité (HTML statique OK, JS complexe = Playwright)
- Pas de garantie 100% (HTML changeant des sites)

**Évolutions futures :**
- Multi-workers (SELECT FOR UPDATE SKIP LOCKED)
- Notifications alternatives (Discord, Telegram, Push)
- Connecteurs API (ERP/marketplaces)

---

## Fallback : BACK uniquement (si le front bug)

> En cas de problème avec le frontend, dérouler la démo via Swagger et curl.

### Scénario Swagger / curl

> **Note :** Conformément à la spec API (`07-api-spec.md`), l'authentification utilise des **cookies HttpOnly** (pas de header Authorization Bearer). Les exemples curl ci-dessous utilisent un cookie jar pour stocker et réutiliser le token JWT.

#### 1. Login (utilisateur)
```bash
# Via Swagger : POST /auth/login (le cookie est posé automatiquement)
# Ou curl avec cookie jar :
curl -i -c cookies.txt -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@test.com", "password": "password123"}'
# → Le cookie access_token (HttpOnly) est stocké dans cookies.txt
```

#### 2. Créer une watch
```bash
# POST /watches en réutilisant le cookie
curl -b cookies.txt -X POST http://localhost:8000/watches \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/product/123"}'
```

#### 3. Lister les watches
```bash
# GET /watches
curl -b cookies.txt http://localhost:8000/watches
```

#### 4. Déclencher un cycle (admin)
```bash
# Se connecter en admin d'abord
curl -i -c cookies-admin.txt -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "adminpass123"}'

# POST /jobs/run (endpoint Ops/Jobs - voir 07-api-spec.md)
curl -b cookies-admin.txt -X POST http://localhost:8000/jobs/run
```

#### 5. Vérifier la notification
1. Ouvrir Mailhog : http://localhost:8025
2. Montrer l'email reçu
3. Montrer les logs du worker : `docker compose logs worker`

---

## Approfondissement si questions

### Architecture
- Pourquoi pas Django ? → FastAPI plus léger, async natif
- Pourquoi pas Node.js pour le scraping ? → écosystème Python plus mature
- Comment scaler ? → Multi-workers + queue (Celery/Redis)

### Sécurité
- Comment gérer les anti-bots ? → Playwright, rotation user-agents, limites
- Comment éviter le SSRF ? → Validation stricte, résolution DNS contrôlée

### Données
- Pourquoi PostgreSQL vs MongoDB ? → Relations fortes, contraintes, SQL standard
- Comment optimiser les requêtes ? → Index composites, EXPLAIN ANALYZE

### Tests
- Couverture de code ? → pytest-cov, objectif 70-80%
- Tests de charge ? → Hors scope MVP, mais envisageable (Locust)

---

## Checklist post-démo

- [ ] Tous les écrans montrés sans erreur
- [ ] Notification visible dans Mailhog
- [ ] Au moins 1 test exécuté
- [ ] Schémas UML/Merise montrés
- [ ] ADR mentionnés
- [ ] Sécurité (SSRF, JWT) expliquée
- [ ] Limites assumées et évolutions mentionnées

---

## Référence
- MVP : [`11-mvp.md`](./11-mvp.md)
- User Stories : [`13-user-stories.md`](./13-user-stories.md)
- API : [`07-api-spec.md`](./07-api-spec.md)
- Runbook démarrage : [`28-ops-observability.md`](./28-ops-observability.md)
- Matrice traçabilité : [`25-traceability-matrix.md`](./25-traceability-matrix.md)
