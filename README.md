# Nova — Plateforme de suivi de retour en stock

Nova est une application web conçue pour surveiller la disponibilité de produits sur des sites marchands et notifier les utilisateurs dès qu'un retour en stock est détecté. Ce projet est réalisé sur un cycle court de **4 semaines**, avec un suivi de projet rigoureux assuré via **Jira (Kanban)**.

## 🚀 Quickstart

```bash
# 1. Lancer les services
docker compose up -d --build

# 2. Appliquer les migrations
docker compose exec api alembic upgrade head

# 3. Vérifier que tout fonctionne
curl http://localhost:8000/health
# → {"status":"ok","environment":"development"}

# 4. Accéder aux interfaces
# Swagger API : http://localhost:8000/docs
# Mailhog     : http://localhost:8025
```

> **Note** : Les tests s'exécutent via `docker compose exec api pytest tests/ -v`

## Objectifs du projet
Nova vise à surveiller des pages produit et notifier les utilisateurs en cas de changement de disponibilité. Le **MVP actuel** (Lot 3) couvre l'authentification et la gestion des watches (suivis). Le moteur de checks automatiques et les notifications arrivent au lot suivant.

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

## Stack Technique (Prévisionnelle)
- **Backend** : Python 3.12+, FastAPI
- **Base de données** : PostgreSQL
- **Worker / Scraping** : APScheduler, HTTPX, Playwright
- **Frontend** : Dashboard minimaliste (3-4 écrans clés). La stack technique est flexible (React/Tailwind ou HTML/CSS/JS natif) et sera validée à l'issue de la phase de prototypage Figma.
- **Déploiement** : Docker & Docker Compose

## 🎬 Démonstration

### Démo complète (FRONT + BACK)
Le plan de démonstration complet (~40 min) est documenté dans [`docs/26-demo-plan.md`](./docs/26-demo-plan.md).

**Parcours principal :**
1. Login via le Frontend
2. Créer une watch (URL produit)
3. Lister / consulter les suivis
4. Déclencher un check (ou attendre le cycle)
5. Vérifier la notification dans Mailhog

### Fallback : BACK uniquement
En cas de problème avec le frontend, la démo peut être réalisée via **Swagger** (`/docs`) ou **curl**.
Voir la section "Fallback : BACK uniquement" dans [`docs/26-demo-plan.md`](./docs/26-demo-plan.md#fallback--back-uniquement-si-le-front-bug).

### Démarrage local — Lot 3 (actuel)

```bash
# Lancer tous les services
docker compose up -d --build

# Appliquer les migrations
docker compose exec api alembic upgrade head

# Vérifier l'API (health check)
curl http://localhost:8000/health
# → {"status":"ok","environment":"development"}

# Swagger (OpenAPI)
# http://localhost:8000/docs

# Mailhog (emails)
# http://localhost:8025
```

### Authentification

```bash
# Inscription
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456789"}' \
  -c cookies.txt

# Connexion (retourne cookies access_token + csrf_token)
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456789"}' \
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
  -d '{"url":"https://www.ldlc.com/fiche/PB00589057.html","label":"RTX 4090"}'
# → {"id":"uuid","url":"...","label":"RTX 4090","status":"ACTIVE","stock_state":"UNKNOWN","last_checked_at":null}

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
- Les routes `/watches/{id}/checks` et `/watches/{id}/notifications` sont prévues pour le Lot 4 (worker).

### Tests

```bash
# Exécuter tous les tests (21 tests : 11 auth + 10 watches)
docker compose exec api pytest tests/ -v
```

### Lot 4+ (à venir)

> *Les fonctionnalités ci-dessous seront disponibles après implémentation des lots suivants.*

- **Worker / Checks** : Vérification automatique des stocks (APScheduler)
- **Notifications** : Alertes email via Mailhog/SMTP
- **Frontend** : Dashboard utilisateur (http://localhost:3000)

Voir le runbook complet dans [`docs/28-ops-observability.md`](./docs/28-ops-observability.md#runbook-de-démarrage-local-back--front).

---

## 📖 Guide de démarrage (Plan 4 semaines)
1. **Semaine 1 : Setup & Fondations** - Initialiser l'environnement Docker, implémenter le modèle de données (`18-mpd.md`), développer l'authentification (register/login/JWT) et les endpoints de base (`07-api-spec.md`). En parallèle : finalisation de la **charte graphique** et des **wireframes** (Figma).
2. **Semaine 2 : API Core & Worker** - Implémenter le CRUD Suivis et Profils de sites. Développer le cœur du worker (scheduler, scraping HTTPX/Playwright, détection stock) à partir de `docs/08-site-profiles-spec.md` et de l'ADR 003.
3. **Semaine 3 : Frontend & Notifications** - Intégration de l'interface utilisateur (dashboard, admin) basée sur les maquettes Figma. Mise en place des alertes e-mail et tests d'intégration.
4. **Semaine 4 : QA & Déploiement** - Exécuter la stratégie de tests (`06-test-strategy.md`), finaliser le déploiement Docker/CI et préparer la démo (`26-demo-plan.md`).
