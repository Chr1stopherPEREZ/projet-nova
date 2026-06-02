# Nova - UML - Séquences

## Séquence 1 — Contrôle stock + notification
```mermaid
sequenceDiagram
  participant S as Scheduler (worker)
  participant DB as PostgreSQL
  participant W as ScraperService
  participant F as Fetcher (httpx/playwright)
  participant P as ProfileEngine
  participant N as NotificationService
  participant M as Mail (SMTP)

  S->>DB: SELECT watches due (ACTIVE, next_check_at <= now)
  DB-->>S: batch watches

  loop for each watch
    S->>W: process(watch)
    W->>F: fetch(url, mode)
    alt fetch OK
      F-->>W: html + http_status
      W->>P: evaluate(profile, html)
      P-->>W: new_stock_state
      W-->>S: result (stock_state, http_status, etc.)
      
      S->>DB: INSERT watch_checks
      S->>DB: UPDATE watches(stock_state, last_checked_at, next_check_at)

      alt transition to IN_STOCK
        S->>N: sendBackInStockEmail(user, watch)
        N->>M: SMTP send
        M-->>N: message_id
        N->>DB: INSERT notifications
      end

    else fetch FAIL
      F-->>W: error_code
      W-->>S: error (code, message)
      S->>DB: INSERT watch_checks(error)
      S->>DB: UPDATE watches(stock_state=UNKNOWN/BROKEN, fail_count, next_check_at)
    end
  end
```

## Séquence 2 — Admin “Test profil sur URL”
```mermaid
sequenceDiagram
  participant A as Admin UI
  participant API as FastAPI
  participant W as Worker/Scraper
  participant DB as PostgreSQL

  A->>API: POST /admin/site-profiles/{id}/test {url}
  API->>DB: Load site_profile
  DB-->>API: profile
  API->>W: run test(profile, url)
  W-->>API: result (fetch_mode, matched_rules, stock_state, errors)
  API-->>A: 200 + result
```

## Séquence 3 — Flux complet (Action utilisateur → Notification)
Ce diagramme synthétise le parcours complet, de la création d'un suivi par l'utilisateur à la réception de l'alerte email par le worker.

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend (React)
    participant A as API (FastAPI)
    participant W as Worker
    participant D as Base de Données
    participant M as Mailhog

    U->>F: Soumet URL Produit
    F->>A: POST /watches (with CSRF)
    A->>D: Enregistre Watch (State: UNKNOWN)
    A-->>F: Retourne 201 Created
    
    Note over W,D: Cycle de check (Cron ou manuel)
    W->>D: Récupère Watches actives
    W->>A: Exécute Scraping (Check Engine)
    A->>D: Enregistre WatchCheck (State: IN_STOCK)
    Note over A,D: Détection de changement (State != previous)
    A->>M: Envoie Email
    M-->>U: Reçoit l'alerte
```
