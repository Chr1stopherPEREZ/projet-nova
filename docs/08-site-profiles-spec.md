# Nova - Spécification des profils de sites (site_profiles)

## Objectif
Permettre à l’ADMIN d’ajuster la détection du stock **sans modifier le code**, tout en gardant un socle robuste (normalisation, SSRF, throttling, transitions) dans le worker.

## Modèle (JSON)
Stocké en DB dans `site_profiles.rules_json`.

### Schéma minimal
```json
{
  "version": 1,
  "fetch": {
    "mode": "HTTP",
    "timeout_ms": 10000,
    "max_redirects": 3
  },
  "signals": {
    "in_stock": [
      {"type": "css_exists", "selector": "button.add-to-cart"},
      {"type": "keyword_contains", "value": "en stock"}
    ],
    "out_of_stock": [
      {"type": "css_exists", "selector": ".sold-out"},
      {"type": "keyword_contains", "value": "rupture"}
    ]
  },
  "resolution": {
    "strategy": "priority",
    "priority": ["out_of_stock", "in_stock"],
    "unknown_when": "no_match"
  },
  "extract": {
    "product_title": {"type": "css_text", "selector": "h1"}
  }
}
```

## Types de règles (V1)
- `keyword_contains` : match si `value` présent dans le texte (case-insensitive).
- `css_exists` : match si au moins 1 élément.
- `css_not_exists` : match si aucun élément.
- `css_text_contains` : texte d’un selector contient une valeur.
- `css_attr_equals` : attribut d’un selector = valeur.

## Résolution du statut
- On calcule 2 booléens : `has_in_stock_signal`, `has_out_of_stock_signal`.
- Stratégie V1 : **priority** (définie dans `resolution.priority`).
  - si `out_of_stock` match → `OUT_OF_STOCK`
  - sinon si `in_stock` match → `IN_STOCK`
  - sinon → `UNKNOWN` (échec de détection sur page valide, souvent car les sélecteurs ne correspondent plus).

## Gestion des erreurs et état BROKEN
Le statut `BROKEN` est déclenché par le worker (et non par les règles JSON) dans les cas suivants :
- **Échec technique durable** : 3 échecs consécutifs de récupération (Timeout, 404, 5xx, SSL Error).
- **Incohérence majeure** : Si le sélecteur obligatoire pour l'extraction du titre n'est plus présent alors que la page charge (indique une refonte du site).

Un passage à `BROKEN` désactive temporairement les notifications pour éviter le spam d'erreurs techniques.

## Règle de Notification (Anti-doublon)
Pour éviter le spam, le worker applique une règle de transition stricte :
- **Condition d'envoi** : Une notification est déclenchée uniquement lors de la transition `(OUT_OF_STOCK | UNKNOWN) -> IN_STOCK`.
- **Mécanique** : Le worker compare l'état détecté avec le champ `stock_state` actuellement en base de données. 
- **Persistance** : Tant que l'état reste `IN_STOCK` lors des cycles suivants, aucune nouvelle notification n'est envoyée.

## Fetch mode
Le `fetch_mode` définit la méthode technique pour récupérer le contenu de la page.
*   **Source de vérité** : Le champ `rules_json.fetch.mode` est la source de vérité absolue pour le worker.
*   **Dénormalisation** : La colonne SQL `site_profiles.fetch_mode` est une valeur dénormalisée maintenue égale à `rules_json.fetch.mode` pour permettre un filtrage rapide côté administration.

Valeurs possibles :
- `HTTP` (httpx) par défaut.
- `BROWSER` (Playwright) si le site nécessite JS.

## Exemples de profils
*Note : Les exemples ci-dessous présentent soit une représentation simplifiée (UI), soit la structure JSON réelle stockée en base de données.*

### Exemple 1 — Profil “Site A” (Vue simplifiée)
- **domain_pattern** : `example.com`
- **fetch_mode** : `HTTP`
- **in_stock (CSS)** : `button.add-to-cart`
- **out_of_stock (CSS)** : `.sold-out`

### Exemple 2 — Profil “Site B (JS)” (Structure JSON complète)
Voici la représentation réelle du champ `rules_json` pour un site nécessitant un rendu Javascript :
```json
{
  "version": 1,
  "fetch": {
    "mode": "BROWSER",
    "timeout_ms": 20000
  },
  "signals": {
    "in_stock": [
      {"type": "css_exists", "selector": "button[data-testid='add']"}
    ],
    "out_of_stock": [
      {"type": "keyword_contains", "value": "Indisponible"}
    ]
  },
  "resolution": {
    "strategy": "priority",
    "priority": ["out_of_stock", "in_stock"]
  }
}
```
