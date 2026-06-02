# Matrice de Traçabilité (Exigences -> Réalisation -> Preuves)

Ce document assure la traçabilité complète entre les besoins initiaux du projet Nova et les éléments de preuve concrets (code, tests, captures).

| ID Exigence | Description | Endpoints / Services | Modèle DB | Tests (Pytest) | Preuves (Lot) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-01** | Inscription / Connexion sécurisée | `POST /auth/login`, `security.py` | `User` | `test_auth.py` | `lot2`, `lot6` |
| **REQ-02** | Création de suivi (Watch) | `POST /watches`, `nike_parser.py` | `Watch` | `test_watches.py` | `lot3`, `lot7` |
| **REQ-03** | Détection automatique (Worker) | `api/app/worker.py`, `check_engine.py` | `WatchCheck` | `test_worker.py` | `lot4`, `lot5` |
| **REQ-04** | Exception Shopify Live | `shopify_parser.py` (HTTPX) | N/A | `test_shopify.py` | `lot7` (S3-10) |
| **REQ-05** | Notification Email | `EmailService` (SMTP) | N/A (Virtual) | `test_worker.py` | `lot1` (S1-03) |
| **REQ-06** | Dashboard Admin (KPIs) | `GET /admin/stats/dashboard` | N/A | `test_stats.py` | `lot5` (S2-07) |
| **REQ-07** | Protection CSRF | `csrf.py` (Middleware) | N/A | `test_csrf.sh` | `lot6` (S3-02) |
| **REQ-08** | Gestion d'erreurs UI | `web/src/pages/ErrorPage.tsx` | N/A | N/A | `lot8` (S4-03) |
