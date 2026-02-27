# Preuves visuelles — Lots 1 à 8

> Ce dossier contient les captures d'écran et les commandes prouvant le bon fonctionnement du projet Nova, organisés par lot.

---

## 📂 Structure des preuves

Chaque lot dispose de son propre dossier contenant :
- `screens/` : Captures d'écran (UI, Terminal, Logs)
- `commands.md` : Commandes exécutées et sorties texte (quand applicable)

| Lot | Thème | Dossier |
|-----|-------|---------|
| **Lot 1** | Skeleton + Docker | [`lot1/`](./lot1/) |
| **Lot 2** | DB + Auth + CSRF | [`lot2/`](./lot2/) |
| **Lot 3** | Routes /watches | [`lot3/`](./lot3/) |
| **Lot 4** | Worker check déterministe | [`lot4/`](./lot4/) |
| **Lot 5** | Orchestration + Notifications | [`lot5/`](./lot5/) |
| **Lot 6** | Frontend Skeleton + Auth | [`lot6/`](./lot6/) |
| **Lot 7** | Watches UI + Run Check | [`lot7/`](./lot7/) |
| **Lot 8** | Robustesse API + UX | [`lot8/`](./lot8/) |

---

## 🚀 Résumé des Lots

### Semaine 1 — Fondations (Lots 1–3)
- ✅ **Lot 1** : Docker Compose (4 services UP), Swagger accessible, Mailhog accessible.
- ✅ **Lot 2** : Authentification JWT, protection CSRF (Double Submit Cookie), migrations BDD.
- ✅ **Lot 3** : CRUD Watches (Suivis), isolation des données utilisateur.

### Semaine 2 — Worker & Jobs (Lots 4–5)
- ✅ **Lot 4** : Worker de scraping déterministe via fixtures HTML, persistance des checks.
- ✅ **Lot 5** : Déclenchement manuel des checks via API, notifications par email en cas de changement.

### Semaine 3 — Frontend (Lots 6–7)
- ✅ **Lot 6** : Interface de login/signup, gestion automatique du CSRF bootstrap, route guards.
- ✅ **Lot 7** : Tableau de bord, création de suivis, prévisualisation Shopify, historique des vérifications.

### Semaine 4 — Robustesse (Lot 8)
- ✅ **Lot 8** : Uniformisation des erreurs API, robustesse du worker (retries), UX des états vides, sécurité durcie (secrets en env, CSRF actif par défaut).

---

## 🛠️ Reproduction rapide

### Démarrage global
```bash
docker compose up --build
```

### Exécution des tests
```bash
docker compose exec api pytest tests/ -v
```

### Vérification des erreurs API (Lot 8)
Voir [`lot8/api_errors.md`](./lot8/api_errors.md) pour les commandes curl réelles.
