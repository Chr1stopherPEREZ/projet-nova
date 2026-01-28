# ADR 003 — Modes de scraping (HTTP vs navigateur)

## Contexte
Certains sites nécessitent JS ou bloquent le scraping.

## Décision (V1)
- Mode par défaut : **HTTP** (httpx).
- Mode alternatif : **BROWSER** (Playwright) configurable par `site_profile`.
- Fallback contrôlé : tenter HTTP puis basculer BROWSER uniquement si configuré.

## Justification
- HTTP est plus rapide, moins coûteux, plus stable.
- Playwright uniquement quand nécessaire pour limiter le risque de démo fragile.

## Conséquences
- Concurrency limitée côté Playwright.
- Timeouts et retries stricts.
