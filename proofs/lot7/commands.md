# Commandes Lot 7 - Shopify Pivot & Variants

Ce document regroupe les commandes nécessaires pour tester et valider l'implémentation du Lot 7 (Shopify Pivot).

## Backend (API)

### Installation des dépendances
```bash
cd api
pip install -r requirements.txt
```

### Lancement des tests
```bash
# Tests Shopify Parser
python3 -m pytest tests/test_shopify_parser.py

# Tous les tests
python3 -m pytest
```

### Lancement du serveur
```bash
cd api
uvicorn app.main:app --reload --port 8000
```

## Frontend (Web)

### Installation
```bash
cd web
pnpm install
```

### Lancement
```bash
cd web
pnpm dev
```

## Docker

Si vous utilisez Docker Compose :
```bash
docker compose up --build
```

## Preuves de fonctionnement
Les captures d'écran se trouvent désormais dans `docs/proofs/` (centralisation des preuves).
Références Lot 7 (ordre du scénario) :
1. `docs/proofs/s3-09-lot7-create-watch-filled.png` — Création du suivi
2. `docs/proofs/s3-10-lot7-preview-shopify-variant.png` — Preview Shopify (sélection variantes)
3. `docs/proofs/s3-11-lot7-watches-list.png` — Liste des suivis
4. `docs/proofs/s3-12-lot7-watch-detail.png` — Détail du suivi (variant_selector visible)
5. `docs/proofs/s3-13-lot7-run-check-success.png` — Run check (succès)
6. `docs/proofs/s3-14-lot7-run-check-history.png` — Historique (nouveau check)
7. `docs/proofs/s3-15-lot7-delete-success.png` — Suppression du suivi
