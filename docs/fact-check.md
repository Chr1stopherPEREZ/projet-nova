# Fact-Check du Dossier Projet Nova

Ce document liste les corrections apportées au projet en vue de la création du Dossier Projet suite à la vérification factuelle par rapport au code source et aux preuves du dépôt.

## 1. Moteur de Scraping (Nike vs Shopify)
- **Assertion initiale** : Nike présenté comme une fonctionnalité livrée et opérationnelle.
- **Réalité** : Le parser Nike présente des instabilités (problèmes de SKU) et a été rétrogradé au rang de prototype expérimental.
- **Correction** : 
    - Nike est désormais décrit comme un "Prototype expérimental" fonctionnant via des fixtures pour la démonstration.
    - Shopify est mis en avant comme la "Solution de production" utilisant des appels API Live via HTTPX.
- **Source** : `api/app/services/nike_parser.py`, `api/app/services/shopify_parser.py`, `api/app/services/check_engine.py`.

## 2. Sécurité (OWASP & SSRF)
- **Assertion initiale** : Argon2id décrit comme recommandé par l'OWASP.
- **Réalité** : Bien qu'Argon2id soit une recommandation standard de l'industrie (et effectivement recommandée par l'OWASP), aucune source interne au projet ne lie explicitement l'implémentation à une documentation OWASP spécifique.
- **Correction** : Suppression de la mention "recommandé par l'OWASP" pour rester strictement factuel sur l'usage d'Argon2id.
- **Assertion initiale** : Blocage des IP privées pour la mitigation SSRF.
- **Réalité** : Le code de `api/app/api/routes/watches.py` et `api/app/services/check_engine.py` ne contient pas de logique de filtrage d'IP pour les URLs soumises.
- **Correction** : Marqué comme "Prévu / Non implémenté" dans le tableau de gestion des risques.
- **Source** : `api/app/core/security.py`, `api/app/api/routes/watches.py`.

## 3. Qualité et Tests
- **Assertion initiale** : "Plus de 40 tests" et "Coverage > 40".
- **Réalité** : Un comptage automatique via `grep` a révélé **107 tests unitaires et d'intégration** dans `api/tests/`. Le chiffre du coverage n'étant pas facilement prouvable sans outil dédié, il a été retiré.
- **Correction** : Mise à jour du nombre de tests à "> 100". Suppression de la mention du coverage.
- **Source** : `api/tests/` (comptage via `grep -c "def test_"`).

## 4. Timeline et Commits
- **Assertion initiale** : Hashes de commits fournis sans vérification détaillée.
- **Réalité** : Tous les hashes de commits cités ont été vérifiés via `git show` et correspondent aux phases décrites dans la timeline.
- **Source** : `git log`.

## 5. Parcours Utilisateur
- **Assertion initiale** : US-02 basée sur une URL Nike.
- **Réalité** : Shopify étant le parser de production, l'exemple a été basculé sur Shopify pour plus de cohérence.
- **Correction** : US-02 utilise désormais une URL Shopify comme critère d'acceptation.

## 6. Corrections Finales (Jury-safe & Shopify-only)
- **Assertion initiale** : Notification en "moins de 5 minutes".
- **Réalité** : Dépend de la fréquence du worker (cron/manuel).
- **Correction** : Formulation factuelle sur la transition d'état et la dépendance au déclenchement.
- **Assertion initiale** : Mitigations risques affirmées (User-Agent, Throttling, Cleanup).
- **Réalité** : Non implémenté ou partiel (Nike uniquement).
- **Correction** : Marquées comme "Prévu" dans le tableau des risques.
- **Assertion initiale** : Normalisation des prix comme fonctionnalité livrée.
- **Réalité** : Présent dans le parser mais non stocké/utilisé.
- **Correction** : Déplacé en évolution prioritaire (Alertes de prix).
- **Assertion initiale** : Figure 6 montrant le code de hachage.
- **Réalité** : Une figure doit être une preuve visuelle.
- **Correction** : Remplacé par une "Référence Code" textuelle pointant vers le fichier et la fonction.

## 7. Micro-corrections de forme (Jury-safe)
...
## 8. CI/CD et DevOps
- **Ajout** : Mise en place d'une pipeline GitHub Actions (`.github/workflows/ci.yml`).
- **Objectif** : Automatiser le linting (Ruff/ESLint), les tests (Pytest) et le build Docker.
- **Impact** : La compétence CP11 (DevOps) passe du statut "Partiel" à "Implémenté".
- **Source** : `.github/workflows/ci.yml`, `docs/reac-mapping.md`.
- **Assertion initiale** : `/watches/preview` décrit comme faisant de l'extraction de titres/variantes.
- **Réalité** : L'endpoint retourne bien titre et variantes pour Shopify, mais une formulation plus prudente sur l'aperçu des informations est préférable.
- **Assertion initiale** : Email reçu "instantanément".
- **Réalité** : La réception dépend du cycle de check du worker (manuel ou cron).
- **Correction** : Formulation factuelle sur la transition d'état et la dépendance au déclenchement.
- **Assertion initiale** : `watches.variant_meta` et `watch_checks.details` marqués en `JSONB`.
- **Réalité** : Le code utilise `JSON` pour `watches` et `JSONB` pour `watch_checks`.
- **Correction** : Mise à jour du dictionnaire de données avec `JSON (PostgreSQL)` pour la table `watches` et maintien de `JSONB` pour `watch_checks`.
- **Source** : `api/app/models/watch.py`, `api/app/models/watch_check.py`.
