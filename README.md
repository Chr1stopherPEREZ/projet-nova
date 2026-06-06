# Nova - Plateforme de suivi de retour en stock

Nova est une application web conçue pour surveiller la disponibilité de produits sur des sites marchands et notifier les utilisateurs dès qu'un retour en stock est détecté. Ce projet est réalisé sur un cycle court de **4 semaines**, avec un suivi de projet rigoureux assuré via **Jira (Kanban)**.

## 🚀 Quickstart (1 commande)

**Prérequis** : Docker Desktop (ou Docker Engine + Docker Compose v2 avec plugin buildx)

```bash
cp .env.example .env && cp web/.env.example web/.env && docker compose up --build
```

C'est tout ! Les migrations et le seed user sont appliqués automatiquement au démarrage.

### Configuration
Le projet utilise des variables d'environnement pour la configuration :
- **Backend (`.env`)** : Contient les secrets (JWT), la config DB et SMTP. Ce fichier est utilisé par Docker Compose pour injecter les variables dans les conteneurs.
- **Frontend (`web/.env`)** : Contient `VITE_API_URL` qui doit pointer vers l'API (défaut: `http://localhost:8000`).

En mode **production** (`APP_ENV=production`), l'API refuse de démarrer si `JWT_SECRET_KEY` n'est pas modifié.

### Accès

| Service | URL |
|---------|-----|
| **Web UI** | http://localhost:3000 |
| **Swagger API** | http://localhost:8000/docs |
| **Health check** | http://localhost:8000/health |
| **Mailhog** | http://localhost:8025 |

Pour la démo jury, utiliser l’UI Docker (:3000). Pour dev front en live, utiliser `pnpm dev` (:5173).

### Stabilité de la démo (Mode Fixture)
Pour garantir une démonstration sans faille devant le jury (indépendante de la connexion internet ou des changements sur les sites cibles), le projet propose un **mode Fixture**.

- **Activation** : Assurez-vous que `CHECK_MODE=fixture` est défini dans votre `.env`.
- **Contrôle du résultat** : Utilisez le script de déclenchement pour simuler un changement d'état sans redémarrer les containers (voir `docs/scenario-demo-v2.md`).
- **Vérification** : Les logs de l'API afficheront explicitement l'utilisation des fixtures.

Consultez le [Scénario de démo V2](./docs/scenario-demo-v2.md) pour le déroulement pas à pas.

### Utilisateurs de démonstration

| Rôle | Email | Mot de passe | Dashboard |
|------|-------|--------------|-----------|
| **Utilisateur** | `user@nova.dev` | `Demo123456789` | `/dashboard` |
| **Administrateur** | `christopher@nova.dev` | `Demo123456789` | `/admin/dashboard` |

### Expérience par rôle

Nova propose deux expériences distinctes selon le rôle de l'utilisateur :

#### 👤 Utilisateur Standard
Menu complet pour gérer ses propres surveillances :
- **Tableau de bord** : KPIs personnels et performance des suivis.
- **Mes suivis** : Gestion (liste réelle branchée API + PostgreSQL) des produits surveillés. Recherche, filtres, tri et pagination implémentés.
- **Paramètres** : Préférences de compte et informations sur les alertes e-mail (Mailhog). UI intégrée, branchement complet à finaliser.

#### 🛡️ Administrateur
Vision globale du système :
- **Dashboard Admin** : KPIs globaux (tous utilisateurs) et top domaines.
- **Profils de site (V2)** : Gestion des profils de détection (Masqué pour la V1).

> **Note** : Les fonctionnalités d'édition avancées (CRUD profils, testeur d'URL) sont prévues pour une version ultérieure (V2). L'interface actuelle permet la consultation des données réelles.

> **Note** : Les URLs `/admin/*` sont protégées par un `RoleGuard` et redirigent vers le dashboard utilisateur avec un message d'alerte si un utilisateur standard tente d'y accéder.

> **Note** : Les tests s'exécutent via `docker compose exec api pytest tests/ -v`

## Objectifs du projet
Nova vise à surveiller des pages produit et notifier les utilisateurs en cas de changement de disponibilité.

**État d'avancement (Certification CDA) :**

| Lot | Description | Statut |
|-----|-------------|--------|
| **Lot 1** | Skeleton + Docker + preuve "ça tourne" | ✅ Clos |
| **Lot 2** | DB + migrations + auth | ✅ Clos |
| **Lot 3** | Routes business (watches CRUD) | ✅ Clos |
| **Lot 4** | Worker check déterministe (fixtures) | ✅ Clos |
| **Lot 5** | Orchestration + notification email (Mailhog) | ✅ Clos |
| **Lot 6** | Frontend skeleton + Auth + CSRF bootstrap | ✅ Clos |
| **Lot 7** | `/watches` : liste réelle branchée API + PostgreSQL. Recherche/filtres/tri/pagination implémentés. `/watches/new` et `/watches/:id` : écrans présents, branchement complet à finaliser. | ✅ Clos |
| **Lot 8** | Robustesse API + UX | ✅ Clos |
| **Lot 9** | Pack tests + intégration | ✅ Clos |
| **Lot 10** | Docs jury + release | 🚧 Finalisation |

## Structure de la documentation
Le projet est entièrement documenté pour garantir une implémentation fluide et cohérente :

- **[`Nova_cahier_des_charges.md`](./Nova_cahier_des_charges.md)** : Le document de référence définissant le périmètre, les contraintes et les critères de validation.
- **[`docs/`](./docs/)** : Spécifications détaillées (MVP, User Stories, Modèles de données, UML, API, Sécurité, etc.).
    - [`01-methodology-tools.md`](./docs/01-methodology-tools.md) : Méthodologie et outils.
    - [`02-seo-responsive.md`](./docs/02-seo-responsive.md) : SEO et Design adaptatif.
    - [`03-accessibility.md`](./docs/03-accessibility.md) : Accessibilité.
    - [`04-architecture-decisions-justification.md`](./docs/04-architecture-decisions-justification.md) : Architecture et justifications.
    - [`05-security.md`](./docs/05-security.md) : Sécurité baseline.
    - [`06-test-strategy.md`](./docs/06-test-strategy.md) : Stratégie de tests.
    - [`07-api-spec.md`](./docs/07-api-spec.md) : Spécification API.
    - [`08-site-profiles-spec.md`](./docs/08-site-profiles-spec.md) : Profils de sites.
    - [`09-target-audience-personas.md`](./docs/09-target-audience-personas.md) : Public cible et Personas.
    - [`10-graphic-charter.md`](./docs/10-graphic-charter.md) : Charte graphique et UX.
    - [`11-mvp.md`](./docs/11-mvp.md) : Cadrage MVP.
    - [`12-user-flow-activity.md`](./docs/12-user-flow-activity.md) : Flux utilisateur et activités.
    - [`13-user-stories.md`](./docs/13-user-stories.md) : Backlog détaillé.
    - [`14-uml-use-cases.md`](./docs/14-uml-use-cases.md) : Cas d'utilisation.
    - [`15-uml-sequence.md`](./docs/15-uml-sequence.md) : Diagrammes de séquence.
    - [`16-uml-classes.md`](./docs/16-uml-classes.md) : Diagramme de classes.
    - [`17-mld.md`](./docs/17-mld.md) : Modèle Logique de Données.
    - [`18-mpd.md`](./docs/18-mpd.md) : Modèle Physique de Données.
    - [`19-mcd.md`](./docs/19-mcd.md) : Modèle Conceptuel de Données.
    - [`20-green-it.md`](./docs/20-green-it.md) : Éco-conception.
    - [`21-database-ops.md`](./docs/21-database-ops.md) : Opérations BDD.
    - [`22-compliance.md`](./docs/22-compliance.md) : Conformité et RGPD.
    - [`23-deployment.md`](./docs/23-deployment.md) : Déploiement et DevOps.
    - [`24-glossary.md`](./docs/24-glossary.md) : Glossaire technique.
    - [`25-traceability-matrix.md`](./docs/25-traceability-matrix.md) : Matrice de traçabilité complète.
    - [`26-demo-plan.md`](./docs/26-demo-plan.md) : Plan de démonstration.
    - [`27-definition-of-done.md`](./docs/27-definition-of-done.md) : Definition of Done.
    - [`28-ops-observability.md`](./docs/28-ops-observability.md) : Observabilité et exploitation.
    - [`29-rgpd.md`](./docs/29-rgpd.md) : RGPD et gestion des données.
- **[`docs/adr/`](./docs/adr/)** : Architecture Decision Records traçant les choix techniques structurants (Auth, Scheduling, Scraping).

## Structure du projet

```
projet-nova/
├── api/                 # Backend FastAPI (Python 3.12+)
│   ├── app/             # Code applicatif
│   │   ├── api/routes/  # Endpoints REST
│   │   ├── core/        # Config, DB, CSRF, JWT
│   │   ├── models/      # Modèles SQLAlchemy
│   │   ├── schemas/     # Schémas Pydantic
│   │   ├── services/    # Logique métier
│   │   └── worker.py    # Worker de check
│   └── tests/           # Tests pytest
├── web/                 # Frontend React + Vite + Tailwind
│   └── src/
│       ├── api/         # Client API (apiFetch, CSRF)
│       ├── components/  # Composants UI réutilisables
│       └── pages/       # Pages de l'application
├── worker/              # Documentation du worker (voir worker/README.md)
├── docs/                # Documentation technique complète
│   └── proofs/          # Preuves par lot (captures, commandes)
└── docker-compose.yml   # Orchestration des services
```

> **Note** : Le worker s'exécute depuis le code dans `api/app/worker.py` via Docker Compose. Le dossier `worker/` à la racine contient uniquement la documentation.

## Stack Technique (Prévisionnelle)
- **Backend** : Python 3.12+, FastAPI
- **Base de données** : PostgreSQL
- **Worker / Scraping** : APScheduler, HTTPX, Playwright
- **Frontend** : Dashboard minimaliste (3-4 écrans clés). Stack : React / Tailwind.
- **Déploiement** : Docker & Docker Compose

## 🎬 Démonstration

### Démo complète (FRONT + BACK)
Le plan de démonstration complet (~40 min) est documenté dans [`docs/26-demo-plan.md`](./docs/26-demo-plan.md).

**Parcours principal :**
1. Login via le Frontend
2. Accéder à “Mes suivis”
3. Montrer les 5 suivis issus de PostgreSQL
4. Tester recherche, filtres, tri et pagination
5. Montrer l’état `SOLD_OUT` avec le filtre “Épuisé”

### Extensions / fallback backend
Pour démontrer la profondeur technique au-delà de l'UI :
- **Création de watch** : via Swagger API (`/docs`) ou curl.
- **Déclenchement d'un check** : via script backend (mode fixture).
- **Vérification Mailhog** : consultation de l'email généré.

### Fallback : BACK uniquement
En cas de problème avec le frontend, la démo peut être réalisée via **Swagger** (`/docs`) ou **curl**.
Voir la section "Fallback : BACK uniquement" dans [`docs/26-demo-plan.md`](./docs/26-demo-plan.md#fallback--back-uniquement-si-le-front-bug).

### Démarrage local

```bash
# Lancer tous les services (migrations appliquées automatiquement via start.sh)
docker compose up -d --build

# Vérifier l'API (health check)
curl http://localhost:8000/health
# → {"status":"ok","environment":"development"}

# Swagger (OpenAPI)
# http://localhost:8000/docs

# Mailhog (emails)
# http://localhost:8025
```

> **Debug migrations** : Si besoin de réappliquer manuellement les migrations, voir [`docs/21-database-ops.md`](./docs/21-database-ops.md).

### Authentification

```bash
# Inscription
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@nova.dev","password":"Demo123456789"}' \
  -c cookies.txt

# Connexion (retourne cookies access_token + csrf_token)
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@nova.dev","password":"Demo123456789"}' \
  -c cookies.txt
```

### Watches (Suivis) — Lot 3

Les routes `/watches` permettent de créer et gérer des suivis de produits. Toutes les routes mutables (POST/PATCH/DELETE) requièrent l'authentification **et** le header CSRF.

```bash
# Récupérer le token CSRF depuis le cookie (format Netscape cookie jar)
CSRF=$(awk '$6=="csrf_token"{print $7}' cookies.txt)

# Créer une watch
curl -X POST http://localhost:8000/watches \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -b cookies.txt \
  -d '{"url":"https://lesprit-belle.fr/products/lampe-halo","label":"Lampe Halo"}'
# → {"id":"uuid","url":"...","label":"Lampe Halo","status":"ACTIVE","stock_state":"UNKNOWN","last_checked_at":null}

# Lister mes watches
curl http://localhost:8000/watches -b cookies.txt

# Détail d'une watch
curl http://localhost:8000/watches/{watch_id} -b cookies.txt

# Mettre en pause
curl -X PATCH http://localhost:8000/watches/{watch_id} \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -b cookies.txt \
  -d '{"status":"PAUSED"}'

# Supprimer
curl -X DELETE http://localhost:8000/watches/{watch_id} \
  -H "X-CSRF-Token: $CSRF" \
  -b cookies.txt
```

**Routes implémentées (Lot 3) :**

| Route | Méthode | Auth | CSRF | Description |
|-------|---------|------|------|-------------|
| `/watches` | POST | ✓ | ✓ | Créer une watch |
| `/watches` | GET | ✓ | - | Lister mes watches |
| `/watches/{id}` | GET | ✓ | - | Détail d'une watch |
| `/watches/{id}` | PATCH | ✓ | ✓ | Modifier (pause/active) |
| `/watches/{id}` | DELETE | ✓ | ✓ | Supprimer |

**Notes :**
- L'isolation des données est garantie : un utilisateur ne voit que ses propres watches (404 sinon).
- L'URL est normalisée (suppression des query params) pour éviter les doublons.
- La table `watch_checks` stocke l'historique des vérifications (Lot 4).

### Tests

```bash
# Exécuter les tests backend
docker compose exec api pytest tests/ -v
```

Suite de tests backend automatisés couvrant l’authentification, les suivis, les jobs et le worker.

### Jobs — Orchestration (Lot 5)

L'endpoint `POST /jobs/run` permet de déclencher des checks de stock via l'API et d'envoyer des notifications par email si un changement est détecté.

```bash
# Récupérer le CSRF token depuis les cookies
CSRF=$(cat cookies.txt | grep csrf_token | awk '{print $7}')

# Run sur une watch spécifique
curl -X POST http://localhost:8000/jobs/run \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -b cookies.txt \
  -d '{"watch_id":"<uuid>"}'

# Run sur toutes les watches ACTIVE
curl -X POST http://localhost:8000/jobs/run \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -b cookies.txt \
  -d '{"run_all": true}'
```

**Comportement :**
- Si changement détecté (stock_state différent) → email envoyé via Mailhog
- Premier check = pas d'email (pas de référence pour comparer)
- Email visible sur http://localhost:8025

Pour plus de détails : [`docs/proofs/lot5/commands.md`](./docs/proofs/lot5/commands.md)

### Worker (Lot 4)

Le worker exécute des checks de stock en mode déterministe (fixtures HTML).

> **Note** : Le dossier `worker/` à la racine est un placeholder. L'implémentation actuelle est dans `api/app/worker.py`. La documentation du worker est dans [`worker/README.md`](./worker/README.md).

```bash
# Exécuter le worker (mode fixture par défaut)
docker compose run --rm worker

# Avec une autre fixture
docker compose run --rm -e FIXTURE_NAME=out_of_stock.html worker

# Vérifier les résultats en DB
docker compose exec db psql -U nova -d nova -c "SELECT stock_state, http_status, fetch_mode FROM watch_checks ORDER BY checked_at DESC LIMIT 5;"
```

**Variables d'environnement :**
| Variable | Valeur par défaut | Description |
|----------|------------------|-------------|
| `CHECK_MODE` | `fixture` | Mode de check (seul `fixture` supporté pour Lot 4) |
| `FIXTURE_NAME` | `in_stock.html` | Fichier fixture à utiliser |

### Frontend (Lot 6-7)

Le frontend React est disponible :

```bash
# Démarrage du frontend (dev)
cd web && pnpm install && pnpm dev
# → http://localhost:5173
```

**Pages implémentées :**
- `/register` — Création de compte
- `/login` — Écran de connexion
- `/dashboard` — Tableau de bord
- `/watches` — Liste des suivis (Réelle)
- `/watches/new` — Créer un suivi (UI)
- `/watches/:id` — Détail d'un suivi + historique checks (UI)
- `/settings` — Paramètres
- `/help` — Aide

**Fonctionnalités Lot 7 :**
- Inscription et Connexion fonctionnelles
- CSRF bootstrap automatique au démarrage
- Route guard (redirection `/login` si non authentifié)
- `/watches` : Liste réelle branchée sur `GET /api/watches` avec recherche, filtres (dont Épuisé), tri et pagination locale.
- `/watches/new` et `/watches/:id` : Écrans intégrés (Nova V2), branchement API à finaliser pour la création, le détail réel et l'historique réel.
- États UI : loading, empty state, error state sur la liste des suivis.

Voir le runbook complet dans [`docs/28-ops-observability.md`](./docs/28-ops-observability.md#runbook-de-démarrage-local-back--front).

---

## 📂 Preuves et Validation (Lot par Lot)

Toutes les preuves de fonctionnement (captures d'écran et commandes curl réelles) sont centralisées dans le dossier :
👉 **[`docs/proofs/`](./docs/proofs/)**

## 📖 Guide de démarrage (Plan 4 semaines)
1. **Semaine 1 : Setup & Fondations** - Initialiser l'environnement Docker, implémenter le modèle de données (`18-mpd.md`), développer l'authentification (register/login/JWT) et les endpoints de base (`07-api-spec.md`). En parallèle : finalisation de la **charte graphique** et des **wireframes** (Figma).
2. **Semaine 2 : API Core & Worker** - Implémenter le CRUD Suivis et Profils de sites. Développer le cœur du worker (scheduler, scraping HTTPX/Playwright, détection stock) à partir de `docs/08-site-profiles-spec.md` et de l'ADR 003.
3. **Semaine 3 : Frontend & Notifications** - Intégration de l'interface utilisateur (dashboard, admin) basée sur les maquettes Figma. Mise en place des alertes e-mail et tests d'intégration.
4. **Semaine 4 : QA & Déploiement** - Exécuter la stratégie de tests (`06-test-strategy.md`), finaliser le déploiement Docker/CI et préparer la démo (`26-demo-plan.md`).
