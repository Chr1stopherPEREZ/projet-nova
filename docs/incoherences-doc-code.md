# Analyse des incohérences Documentation / Code - Nova V2

Ce document répertorie les points de friction, les promesses non tenues et les erreurs techniques identifiées dans la documentation actuelle.

## 1. Phrases "dangereuses" et promesses non tenues

| Emplacement | Phrase / Élément | Problème | Correction proposée                                                        |
| :--- | :--- | :--- |:---------------------------------------------------------------------------|
| `README.md` | Tableau des utilisateurs de démo | Mots de passe incohérents avec `seed.py`. | Utiliser le même mot de passe partout.                                     |
| `README.md` | "Profils de site (V2) ... Masqué pour la V1" | Flou sur ce qui est vraiment disponible. | Préciser que l'interface est en lecture seule pour la démo V2.             |
| `docs/14-runbook.md` | "redémarrez (`docker compose restart api worker`)" | Trop lourd pour une démo fluide. | Utiliser le script `trigger_check.py` qui ne nécessite pas de redémarrage. |
| `docs/05-security.md` | Mentions de HTTPS et SSL | Le projet est une démo locale sans certificats. | Préciser que c'est une recommandation pour la V3/Prod.                     |
| `docs/07-api-spec.md` | Endpoints de notifications | Tables et endpoints inexistants. | Classer en "Future évolutions (V3)".                                       |

## 2. Écarts techniques

- **Modèles de données** : Le MLD/MPD incluait des tables pour les notifications, les audits et le reset password qui n'existent pas dans le code SQLAlchemy.
  - *Statut : Corrigé (Documents mis à jour).*
- **Gestion des variantes** : Le code gère les `variant_sku` et `variant_meta` pour Shopify, mais ce n'était pas documenté dans le MCD initial.
  - *Statut : Corrigé (MCD/MLD/MPD mis à jour).*
- **Ports Docker** :
  - Web : Port 3000 exposé.
  - API : Port 8000 exposé.
  - Mailhog : Port 8025 exposé.
  - *Cohérence vérifiée dans `docker-compose.yml`.*

## 3. Fichiers manquants ou mal nommés

- Le Runbook mentionnait un mode fixture piloté par `.env`, ce qui est fonctionnel mais peu pratique.
- Ajout du script `api/app/scripts/trigger_check.py` pour sécuriser le scénario de démo.

---
