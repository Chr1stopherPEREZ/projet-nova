# ADR 002 — Planification (scheduler/worker)

## Contexte
Le cœur de Nova est le contrôle périodique des suivis.

## Décision (V1)
- Scheduler **dans le worker** (APScheduler) qui :
  1) sélectionne les suivis dus (`next_check_at <= now`, `ACTIVE`)
  2) traite par lots
  3) applique throttling par domaine
- **Hypothèse Single Worker** : Pour la V1, un seul processus worker est exécuté. Il n'y a pas de concurrence multi-instances sur la sélection des tâches.

## Justification
- Plus simple qu’une queue complète en 5 semaines.
- Suffisant pour un MVP défendable.
- Évite la gestion complexe des locks distribués.

## Évolutions futures (V2+)
- Pour passer à l'échelle (multi-workers) :
  - Utilisation de `SELECT ... FOR UPDATE SKIP LOCKED` sur PostgreSQL.
  - Ou migration vers une queue robuste (Redis/Celery/TaskIQ).
