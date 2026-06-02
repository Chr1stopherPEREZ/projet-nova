# Matrice des retours jury - Nova V2

Cette matrice répertorie les critiques formulées par le jury lors de la première soutenance et les actions correctives mises en œuvre pour le rattrapage.

| Critique Jury | Problème constaté en V1                                         | Correction prévue en V2 | Preuve à montrer au jury |
| :--- |:----------------------------------------------------------------| :--- | :--- |
| **Design amateur / scolaire** | UI peu travaillée, manque de cohérence visuelle.                | Refonte de la charte graphique et des composants UI (Tailwind CSS + Shadcn UI). | Captures d'écran avant/après, démonstration de l'interface fluide. |
| **Maquettes Figma peu convaincantes** | Maquettes incomplètes.                                          | Mise à jour complète du Figma alignée sur le code final. | Lien Figma + comparaison directe avec l'app. |
| **Défense MCD/MLD/MPD laborieuse** | Incohérences entre les schémas et la base réelle.               | Mise en conformité des documents avec les modèles SQLAlchemy et les migrations Alembic. | Schémas à jour + explications claires des relations. |
| **PostgreSQL mal maîtrisé** | Difficultés à manipuler `psql` au terminal.                     | Préparation d'un "cheat sheet" de commandes SQL essentielles pour la démo. | Utilisation fluide de `psql` dans le terminal pendant la démo. |
| **Code difficile à expliquer** | Fonctions trop longues ou complexes.                            | Refactoring des services (notamment le `check_engine`) et isolation des responsabilités. | Présentation de 5 extraits de code "propres" et maîtrisés. |
| **Scénario de démo fragile** | Dépendance à un site externe (Nike/Shopify) qui change souvent. | Implémentation d'un mode "Fixture" utilisant des fichiers HTML locaux. | Déclenchement d'un changement de stock via fixture pendant la démo. |
| **Périmètre V1/V2 flou** | Difficulté à dire ce qui est fait ou ce qui reste à faire.      | Création d'un document de périmètre explicite (V1/V2/V3). | Document `docs/perimetre-v2-v3.md`. |
| **Qualité front perfectible** | Scores Lighthouse faibles, manque de tests.                     | Optimisation des performances et ajout de tests E2E/Unitaires. | Rapports Lighthouse + passage des tests au terminal. |
| **Build / Déploiement** | Processus de lancement complexe ou mal documenté.               | Automatisation complète via Docker Compose et documentation simplifiée. | Lancement du projet en une commande `docker-compose up`. |
| **Notification email non visible** | Difficile de prouver l'envoi d'emails.                          | Utilisation systématique de Mailhog pour intercepter et visualiser les emails. | Interface Mailhog sur le port 8025 montrant l'alerte reçue. |

---
