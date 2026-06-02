# Nova - MCD (modèle conceptuel)

## Entités (conceptuel)
- **User** : Compte utilisateur identifié par son email.
- **Watch (Suivi)** : Produit surveillé par un utilisateur (URL, statut, dernier état connu).
- **SiteProfile** : Configuration de détection (sélecteurs CSS/JSON) associée à un domaine.
- **WatchCheck** : Historique technique d'une vérification effectuée.

## Relations & cardinalités
- Un **User** possède 0 à n **Watch**.
- Une **Watch** appartient à un seul **User**.
- Un **SiteProfile** peut s'appliquer à 0 à n **Watch**.
- Une **Watch** génère 0 à n **WatchCheck** au cours du temps.

## Diagramme (Mermaid ERD)
```mermaid
erDiagram
  USER ||--o{ WATCH : possède
  SITE_PROFILE ||--o{ WATCH : configure
  WATCH ||--o{ WATCH_CHECK : génère
```

## Diagramme de Classes (Aligné sur Nova V2)
```mermaid
classDiagram
    class User {
        UUID id
        String email
        Enum role
    }
    class Watch {
        UUID id
        String original_url
        String normalized_url
        String label
        Enum stock_state
        Enum watch_status
        DateTime last_checked_at
        String variant_sku
    }
    class WatchCheck {
        UUID id
        DateTime checked_at
        Integer http_status
        String stock_state
        JSON details
    }
    class SiteProfile {
        UUID id
        String name
        String domain_pattern
        JSON rules
    }
    User "1" -- "0..*" Watch : possède
    Watch "1" -- "0..*" WatchCheck : historique
    SiteProfile "1" -- "0..*" Watch : définit
```
