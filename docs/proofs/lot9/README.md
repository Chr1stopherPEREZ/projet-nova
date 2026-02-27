# Lot 9 - Pack de tests (Preuve technique)

Ce dossier contient les preuves du Lot 9 : pack de tests "smoke" (15-25 tests) couvrant les flux critiques et test d'intégration "happy path".

## 📸 Captures d'écran

| ID | Fichier | Description |
|----|---------|-------------|
| **s4-08** | [`s4-08-lot9-pytest-smoke.png`](./screens/s4-08-lot9-pytest-smoke.png) | Exécution du pack smoke (23 tests passed). |
| **s4-09** | [`s4-09-lot9-happy-path-named.png`](./screens/s4-09-lot9-happy-path-named.png) | Arborescence `tests/smoke/` avec le happy path bien nommé. |
| **s4-10** | [`s4-10-lot9-pytest-full-suite.png`](./screens/s4-10-lot9-pytest-full-suite.png) | Exécution de la suite complète (107 tests passed). |

## 🛠️ Commandes de test

Pour exécuter les tests en local (dans le dossier `api` avec le venv activé) :

```fish
# Pack Smoke (23 tests)
python -m pytest tests/smoke -q --disable-warnings

# Test d'intégration Happy Path uniquement
python -m pytest tests/smoke/test_integration_happy_path.py -q --disable-warnings

# Suite complète de l'application
python -m pytest -q --disable-warnings
```

## ✅ Résultats attendus
- **Pack Smoke** : 23 passed
- **Happy Path** : 1 passed
- **Suite Complète** : 107 passed

## 📝 Notes techniques
- Les tests utilisent une base de données SQLite en mémoire (`sqlite:///:memory:`) pour garantir l'isolation et la vitesse.
- Aucun appel réseau externe n'est effectué (utilisation de mocks et de fixtures HTML pour Nike/Shopify).
- Les warnings visibles dans les captures sont liés à des dépréciations dans les bibliothèques tierces (Pydantic v1, argon2, starlette) et n'impactent pas la validité des tests.
