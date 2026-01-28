# Nova - MPD (PostgreSQL) - DDL de référence

> Objectif : fournir une base directement traduisible en migrations Alembic.

## Types (ENUM)
```sql
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE watch_status AS ENUM ('ACTIVE', 'PAUSED');
CREATE TYPE stock_state AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'UNKNOWN', 'BROKEN');
CREATE TYPE notification_channel AS ENUM ('EMAIL');
CREATE TYPE notification_status AS ENUM ('SENT', 'FAILED');
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, normalized_url)
);
CREATE INDEX idx_watches_due ON watches(watch_status, next_check_at);

CREATE TABLE watch_checks (
  id UUID PRIMARY KEY,
  watch_id UUID NOT NULL REFERENCES watches(id) ON DELETE CASCADE,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  stock_state stock_state NOT NULL,
  http_status INTEGER NULL,
  fetch_mode TEXT NOT NULL,
  duration_ms INTEGER NULL,
  error_code TEXT NULL,
  error_message TEXT NULL
);
CREATE INDEX idx_watch_checks_watch_time ON watch_checks(watch_id, checked_at DESC);

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  watch_id UUID NOT NULL REFERENCES watches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel notification_channel NOT NULL DEFAULT 'EMAIL',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status notification_status NOT NULL DEFAULT 'SENT',
  provider_message_id TEXT NULL
);
CREATE INDEX idx_notifications_watch_time ON notifications(watch_id, sent_at DESC);

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  actor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NULL,
  target_id UUID NULL,
  metadata_json JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_actor_time ON audit_logs(actor_user_id, created_at DESC);
```

## Remarques
- Les UUID sont intentionnels (facilite les imports/tests). Il est possible de passer en BIGSERIAL si nécessaire.
- `rules_json` est en JSONB pour permettre une spec stable des profils.
