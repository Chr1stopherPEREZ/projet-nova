# Périmètre Nova V1 / V2 / V3

Ce document définit clairement le périmètre fonctionnel de l'application Nova selon les versions présentées ou prévues. Ce découpage permet de sécuriser la soutenance de rattrapage (V2) tout en montrant une vision produit à long terme (V3).

## Nova V1 : La version initiale (Passage 1)
Présentée lors du premier jury, cette version a servi de preuve de concept mais présentait des instabilités.
- Authentification de base.
- Création de suivis dépendant de sites externes réels (Shopify/Nike).
- Dashboard minimaliste.
- Pas de gestion robuste des erreurs de parsing.
- Démo fragile car dépendante du web réel.

## Nova V2 : La version du rattrapage (Objectif 29 juin)
L'objectif de la V2 est la **fiabilité**, la **clarté** et la **maîtrise technique**. Elle corrige les faiblesses relevées par le jury.

### Fonctionnalités incluses :
- **Authentification sécurisée** : Login, inscription, protection des routes.
- **Dashboard utilisateur** : Vue d'ensemble des suivis et statistiques simples.
- **Gestion des suivis (Watches)** :
  - Création d'un suivi produit (avec support des variantes Shopify).
  - Liste des suivis avec état du stock en temps réel.
  - Détail d'un suivi et suppression.
- **Historique des vérifications** : Liste chronologique des checks effectués pour chaque produit.
- **Moteur de vérification (Check Engine)** :
  - **Mode Fixture (Priorité démo)** : Utilisation de fichiers locaux pour garantir une démo stable.
  - Simulation de changement d'état (In Stock <-> Out of Stock).
- **Notifications** : Envoi d'emails via Mailhog lors d'un changement d'état détecté.
- **Administration** : Interface simple pour gérer les utilisateurs et voir tous les suivis.
- **Qualité et Preuves** :
  - Tests automatisés (Pytest).
  - Documentation technique complète (MCD, MLD, MPD, API Spec).
  - Scénario de démo reproductible via Docker.

### Pourquoi ce découpage :
- Il sécurise la démo.
- Il démontre la maîtrise de la stack technique (PostgreSQL, FastAPI, React, Docker).
- Il prouve une démarche de qualité (tests, documentation).
- Il montre que je sais prioriser et gérer les risques (utilisation de fixtures pour pallier l'instabilité du web).

## Nova V3 : Évolutions futures (Hors périmètre soutenance)
Tout ce qui apporte de la valeur mais n'est pas critique pour valider les compétences CDA ou qui risquerait de fragiliser la démo.

- **Scraping multi-sites robuste** : Gestion avancée des anti-bots, proxies.
- **Centre de notifications complet** : Notifications in-app, SMS, Push, Slack/Discord.
- **Gestion avancée du compte** : Reset password, modification de profil, suppression de compte.
- **Audit Logs** : Historique des actions utilisateur pour la sécurité.
- **Profils de sites avancés** : Interface admin pour créer de nouveaux parseurs sans coder.
- **Mise en production réelle** : Déploiement Cloud (AWS/GCP), HTTPS, monitoring complet (Sentry, Prometheus).
- **Extension navigateur** : Pour ajouter des produits en un clic.
- **Monétisation** : Comptes premium, limitations, paiements (Stripe).

---
