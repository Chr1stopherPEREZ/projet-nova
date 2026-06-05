# Nova - MLD (modèle logique)

## Tables (logique)
- `users(id, email, password_hash, role, created_at, updated_at)`
- `site_profiles(id, name, domain_pattern, fetch_mode, rules_json, is_active, created_at, updated_at)`  
- `watches(id, user_id, site_profile_id, original_url, normalized_url, label, watch_status, stock_state, last_checked_at, next_check_at, fail_count, variant_sku, variant_selector, variant_meta, created_at, updated_at)`
- `watch_checks(id, watch_id, checked_at, stock_state, http_status, fetch_mode, duration_ms, error_code, error_message, details)`

## Contraintes logiques
- Unicité : `(user_id, normalized_url, variant_sku)` sur `watches`
- FK : `watches.user_id -> users.id`
- FK : `watches.site_profile_id -> site_profiles.id` (nullable)
- FK : `watch_checks.watch_id -> watches.id`

## Index logiques
- `watches(watch_status, next_check_at)`
- `site_profiles(domain_pattern)`
- `watch_checks(watch_id, checked_at desc)`

## Domaines et Énumérations
- **stock_state** : {IN_STOCK, OUT_OF_STOCK, SOLD_OUT, UNKNOWN, BROKEN}
- **watch_status** : {ACTIVE, PAUSED}
- **user_role** : {USER, ADMIN}
