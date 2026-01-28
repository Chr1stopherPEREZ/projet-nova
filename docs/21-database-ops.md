# Nova - Opérations Base de données

## Stratégie de Sauvegarde (Backup)
Afin de garantir la pérennité des données utilisateur et de configuration, Nova met en œuvre une stratégie de sauvegarde automatisée.

*   **Type de sauvegarde** : Dump SQL complet (via `pg_dump`).
*   **Fréquence** :
    *   **Quotidienne** : Sauvegarde complète à 3h du matin.
    *   **Hebdomadaire** : Archivage d'une sauvegarde complète chaque dimanche.
*   **Rétention** :
    *   Sauvegardes quotidiennes gardées pendant 7 jours.
    *   Sauvegardes hebdomadaires gardées pendant 4 semaines.
*   **Stockage** : Les dumps sont compressés (`.gz`) et stockés sur un volume distant ou un stockage objet sécurisé (S3/Object Storage), isolé du serveur d'application.

## Rétention et Nettoyage (Green IT)
Conformément à notre stratégie d'éco-conception, les données à forte croissance sont purgées régulièrement :
*   **Historique des checks (`watch_checks`)** : Les enregistrements de plus de 30 jours sont supprimés automatiquement.
*   **Logs techniques** : Rotation quotidienne et suppression après 7 jours.
*   **Notifications** : Archivage ou suppression après 90 jours (si non requis pour audit).

## Sécurité et Droits d'accès
Le principe de moindre privilège est appliqué pour la base de données.

*   **Utilisateur `app_user`** : Utilisé par l'API FastAPI et le Worker.
    *   Droits : `SELECT`, `INSERT`, `UPDATE`, `DELETE` sur les tables métier.
    *   Interdiction de modifier la structure (`ALTER`, `DROP`).
*   **Utilisateur `admin_user`** : Utilisé uniquement pour les migrations Alembic et les tâches de maintenance.
*   **Isolation réseau** : La base de données n'est accessible que depuis le réseau interne Docker, elle n'est pas exposée sur l'IP publique.

## Jeu de données de test (Seed)
Un script de "seed" est disponible pour initialiser l'environnement de développement avec des données réalistes.

### Exemple de données initiales (SQL)
```sql
-- Création d'un admin par défaut
INSERT INTO users (id, email, password_hash, role) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'admin@nova.tld', '$2b$12$HASH...', 'ADMIN');

-- Profil de site de démonstration
INSERT INTO site_profiles (id, name, domain_pattern, fetch_mode, rules_json)
VALUES (
    gen_random_uuid(), 
    'LDLC', 
    'ldlc.com', 
    'HTTP', -- Doit être identique à rules_json.fetch.mode
    '{
        "version": 1,
        "fetch": {"mode": "HTTP", "timeout_ms": 10000},
        "signals": {
            "in_stock": [{"type": "css_exists", "selector": ".web-stock-green"}],
            "out_of_stock": [{"type": "css_exists", "selector": ".web-stock-red"}]
        },
        "resolution": {"strategy": "priority", "priority": ["out_of_stock", "in_stock"]}
    }'
);
```

## Exemple d'implémentation CRUD (SQLAlchemy)
L'accès aux données se fait via l'ORM SQLAlchemy 2.0.

```python
# Create (Ajout d'un suivi)
new_watch = Watch(
    user_id=current_user.id,
    original_url="https://...",
    normalized_url="https://...",
    label="Ma carte graphique"
)
db.add(new_watch)
await db.commit()

# Read (Lecture)
watches = await db.execute(select(Watch).where(Watch.user_id == user_id))

# Update (Mise à jour)
watch.stock_state = StockState.IN_STOCK
await db.commit()

# Delete (Suppression)
await db.execute(delete(Watch).where(Watch.id == watch_id))
await db.commit()
```
