# Nova - MLD (modèle logique)

## Tables (logique)
- `users(id, email, password_hash, role, created_at, updated_at)`
- `site_profiles(id, name, domain_pattern, fetch_mode, rules_json, is_active, created_at, updated_at)`  
  *(Note: fetch_mode est une valeur dénormalisée de rules_json.fetch.mode)*
- `watches(id, user_id, site_profile_id, original_url, normalized_url, label, watch_status, stock_state, last_checked_at, next_check_at, fail_count, created_at, updated_at)`
- `watch_checks(id, watch_id, checked_at, stock_state, http_status, fetch_mode, duration_ms, error_code, error_message)`
- `notifications(id, watch_id, user_id, channel, sent_at, status, provider_message_id)`
- `password_reset_tokens(id, user_id, token_hash, expires_at, used_at, created_at)`
- `audit_logs(id, actor_user_id, action, target_type, target_id, metadata_json, created_at)`

## Contraintes logiques
- Unicité : `(user_id, normalized_url)` sur `watches`
- FK : `watches.user_id -> users.id`
- FK : `watches.site_profile_id -> site_profiles.id` (nullable si domaine inconnu)
- FK : `watch_checks.watch_id -> watches.id`
- FK : `notifications.watch_id -> watches.id`, `notifications.user_id -> users.id`
- FK : `password_reset_tokens.user_id -> users.id`
- FK : `audit_logs.actor_user_id -> users.id`

## Index logiques
- `watches(watch_status, next_check_at)`
- `site_profiles(domain_pattern)`
- `watch_checks(watch_id, checked_at desc)`
- `password_reset_tokens(token_hash)`
