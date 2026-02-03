# Nova - Definition of Done (DoD)

## Objectif
Définir les critères de validation à chaque niveau (User Story, Pull Request, Release) pour garantir la qualité et la cohérence du projet.

---

## DoD — User Story

Une User Story est considérée comme **Done** lorsque :

### Code
- [ ] Le code est écrit et respecte les conventions (`snake_case`, type hints)
- [ ] Le code passe le linter (`ruff check`)
- [ ] Le code est formaté (`ruff format` ou `black`)
- [ ] Les docstrings sont présentes (fonctions publiques, classes)

### Tests
- [ ] Les tests unitaires couvrent la logique métier ajoutée
- [ ] Les tests d'intégration couvrent les endpoints concernés
- [ ] Tous les tests passent localement (`pytest`)
- [ ] Pas de régression sur les tests existants

### Fonctionnel
- [ ] Les critères d'acceptation de la US sont validés
- [ ] Le comportement est conforme à la spécification (`07-api-spec.md`, `11-mvp.md`)
- [ ] Les cas d'erreur sont gérés (validation, messages explicites)

### Documentation
- [ ] La documentation technique est à jour si nécessaire
- [ ] Les commentaires de code sont ajoutés si la logique est complexe

---

## DoD — Pull Request (PR)

Une PR est prête à être mergée lorsque :

### Qualité du code
- [ ] La PR a un titre clair suivant Conventional Commits (`feat:`, `fix:`, `refactor:`)
- [ ] La PR est liée au ticket Jira correspondant
- [ ] Le code est relu (self-review ou peer-review)
- [ ] Pas de code commenté ou de `TODO` non justifié

### CI/CD
- [ ] Le pipeline CI passe (lint + tests)
- [ ] Pas de nouvelles alertes de sécurité (si `bandit` activé)
- [ ] Le build Docker réussit (si applicable)

### Tests
- [ ] Les nouveaux tests sont inclus dans la PR
- [ ] La couverture de test ne diminue pas significativement

### Documentation
- [ ] Le `CHANGELOG` est mis à jour si c'est une feature visible
- [ ] La documentation utilisateur est mise à jour si nécessaire

---

## DoD — Release / MVP

Une release est prête pour déploiement lorsque :

### Fonctionnel
- [ ] Toutes les US du scope de la release sont **Done**
- [ ] Le scénario de démo fonctionne de bout en bout (`26-demo-plan.md`)
- [ ] Les parcours utilisateur et admin sont testés manuellement

### Qualité
- [ ] Tous les tests passent en CI
- [ ] Pas de bugs critiques connus
- [ ] Les logs sont exploitables (pas de stack traces en production)

### Déploiement
- [ ] `docker compose up` démarre l'application sans erreur
- [ ] Les migrations sont appliquées automatiquement
- [ ] Les variables d'environnement sont documentées (`.env.example`)
- [ ] La procédure de démarrage est documentée dans le `README.md`

### Documentation
- [ ] Documentation à jour : MVP, API, profils, sécurité, déploiement
- [ ] Matrice de traçabilité à jour (`25-traceability-matrix.md`)
- [ ] Glossaire technique complété (`24-glossary.md`)

### Sécurité
- [ ] Protection SSRF validée
- [ ] Endpoints admin protégés par RBAC
- [ ] Secrets non exposés dans le code ou les logs

---

## Référence
- MVP et périmètre : [`11-mvp.md`](./11-mvp.md)
- Stratégie de tests : [`06-test-strategy.md`](./06-test-strategy.md)
- Méthodologie : [`01-methodology-tools.md`](./01-methodology-tools.md)
