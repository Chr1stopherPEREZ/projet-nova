# Nova - MPD (PostgreSQL) - DDL de référence

> Objectif : fournir une base directement traduisible en migrations Alembic.

## Types (ENUM)
```sql
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE watch_status AS ENUM ('ACTIVE', 'PAUSED');
CREATE TYPE stock_state AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'SOLD_OUT', 'UNKNOWN', 'BROKEN');
```

## Tables
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'USER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE site_profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  domain_pattern TEXT NOT NULL,
  fetch_mode TEXT NOT NULL DEFAULT 'HTTP', -- Valeur dénormalisée de rules_json.fetch.mode
  rules_json JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_site_profiles_domain ON site_profiles(domain_pattern);

CREATE TABLE watches (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  site_profile_id UUID NULL REFERENCES site_profiles(id) ON DELETE SET NULL,
  original_url TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  label TEXT NULL,
  watch_status watch_status NOT NULL DEFAULT 'ACTIVE',
  stock_state stock_state NOT NULL DEFAULT 'UNKNOWN',
  last_checked_at TIMESTAMPTZ NULL,
  next_check_at TIMESTAMPTZ NULL,
  fail_count INTEGER NOT NULL DEFAULT 0,
  variant_sku TEXT NULL,
  variant_selector JSONB NULL,
  variant_meta JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, normalized_url, variant_sku)
);
CREATE INDEX idx_watches_due ON watches(watch_status, next_check_at);

CREATE TABLE watch_checks (
  id UUID PRIMARY KEY,
  watch_id UUID NOT NULL REFERENCES watches(id) ON DELETE CASCADE,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stock_state TEXT NOT NULL,
  http_status INTEGER NULL,
  fetch_mode TEXT NOT NULL,
  duration_ms INTEGER NULL,
  error_code TEXT NULL,
  error_message TEXT NULL,
  details JSONB NULL
);
CREATE INDEX idx_watch_checks_watch_time ON watch_checks(watch_id, checked_at DESC);
```

## Remarques
- Les UUID sont intentionnels (facilite les imports/tests).
- `JSONB` est utilisé pour les règles, les sélecteurs et les détails de check pour plus de flexibilité technique.
