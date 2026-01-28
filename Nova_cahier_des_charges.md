# Cahier des charges — **Nova** — Application de suivi de retour en stock (V1+)

> **Nom de code : Nova**  
> Une application de suivi de retour en stock permet à un utilisateur de surveiller des produits en rupture sur des sites marchands. L’utilisateur saisit l’URL d’un produit et reçoit une notification dès que ce produit **revient en stock**.

---

## 0. Résumé
Ce document définit le besoin fonctionnel, les contraintes et les attendus de soutenance. Il décrit aussi l’architecture cible, la sécurité, la qualité, le déploiement, ainsi que les livrables d’analyse/conception (Figma, UML, MCD/MLD/MPD) pour que le projet soit complet.

**Positionnement technique (important) :** la valeur centrale de **Nova** repose sur le **scraping/monitoring** (worker), l’API et l’UI servent à l’orchestration, au stockage, au pilotage (dashboard) et à l’expérience utilisateur. Cela guide les choix d’architecture et de stack décrits plus loin, tout en conservant le périmètre fonctionnel initial.

---

## 1. Contexte

Une **application de suivi de retour en stock** sert aux utilisateurs qui surveillent des produits en rupture sur des sites marchands.  
Aujourd’hui, ils doivent vérifier manuellement, plusieurs fois par jour, si un produit est redevenu disponible.

L'objectif : permettre à un utilisateur d’entrer l’URL d’un produit, puis de recevoir une notification dès que ce produit **revient en stock**.

Ce document définit le besoin fonctionnel, les contraintes et les attendus de soutenance. Il décrit aussi l’architecture cible, la sécurité et le déploiement pour que le projet soit complet et défendable.

---

## 2. Objectifs du projet

### 2.1 Objectif principal

Permettre à un utilisateur de :

- Suivre la disponibilité d’un produit à partir de son URL.
- Être notifié automatiquement lorsque le produit repasse en stock.
- Gérer ses suivis depuis un espace dédié (dashboard).

### 2.2 Objectifs secondaires

- Proposer une interface simple et compréhensible.
- Permettre la gestion multi-sites (plusieurs boutiques en ligne).
- Permettre à un administrateur d’ajuster les règles de détection du stock par site.
- Mettre en avant une démarche structurée, maintenable et argumentée (architecture, qualité, limites).
- 
---

## 3. Périmètre fonctionnel

### 3.1 Inclus dans le périmètre

- Création et gestion de compte utilisateur.
- Ajout d’URLs de produits à surveiller.
- Vérification automatique et périodique de la disponibilité des produits.
- Envoi d’une notification (e-mail) en cas de retour en stock.
- Dashboard utilisateur :
  - liste des produits surveillés,
  - statut de chaque suivi,
  - dernier contrôle,
  - historique minimal des notifications.
- Espace administrateur :
  - gestion des "profils de sites” (règles de détection),
  - consultation de l’état global du système.
- Gestion basique des erreurs (site inaccessible, page modifiée, etc.).

### 3.2 Hors périmètre (version initiale)

- Paiement ou offre commerciale.
- Extension navigateur.
- Application mobile native.
- Intégration directe avec des API privées de marchands.
- Monitoring avancé (graphes complexes, alerting SRE).
- Gestion multi-langues (optionnelle, non prioritaire).

---

## 4. Utilisateurs et rôles

### 4.1 Utilisateur

- Créer un compte et se connecter.
- Ajouter une URL de produit à surveiller.
- Voir la liste de ses produits suivis.
- Activer / désactiver un suivi.
- Supprimer un suivi.
- Être notifié lorsque le produit surveillé repasse en stock.

### 4.2 Administrateur

- Accéder à un espace d’administration sécurisé.
- Gérer les profils de sites :
  - déclarer un site (nom, domaine),
  - définir ou modifier les règles de détection du stock,
  - tester une règle sur une URL donnée.
- Consulter :
  - le nombre de suivis actifs,
  - des informations simples sur l’activité (ex. nombre de notifications envoyées).
- Marquer un suivi comme “cassé” si nécessaire (ex. produit supprimé).
- (Optionnel) Désactiver temporairement la surveillance d’un site problématique.

---

## 4.3 Personas et parcours (livrables d’analyse)

### 4.3.1 Personas (à produire)
- Persona **USER** (objectif : “je veux être notifié sans spam”, contexte, frustrations, critères de réussite).
- Persona **ADMIN** (objectif : “je veux ajuster une règle vite”, contexte, contraintes, critères de réussite).

### 4.3.2 Parcours (user flows à produire)
On fournit 2 à 4 parcours illustrés (diagrammes ou prototype Figma) :
1) Créer un suivi (URL → validation → watch créé)  
2) Recevoir une notification (transition rupture → stock → e-mail)  
3) Gérer un suivi (pause / suppression)  
4) Admin : créer un profil + tester une règle sur une URL

---

## 5. Description fonctionnelle détaillée

### 5.1 Gestion des comptes

- Inscription avec au minimum :
  - adresse e-mail valide,
  - mot de passe.
- Connexion / déconnexion.
- Réinitialisation de mot de passe par e-mail.
- Isolation des données : un utilisateur ne voit que ses propres suivis.

### 5.2 Gestion des suivis (“watches”)

**Création :**

- Formulaire permettant de saisir l’URL du produit.
- Vérifications côté serveur :
  - format valide,
  - URL normalisée,
  - domaine identifié (connu / inconnu).
- Association automatique à un “profil site” si le domaine est connu.
- Enregistrement du suivi avec :
  - un statut de surveillance (`active` / `paused`),
  - un état de stock initial `unknown` si non déterminable.

**Consultation :**

Pour chaque suivi, l’utilisateur voit :

- l’URL (et le nom du produit si récupérable),
- le site concerné,
- le statut actuel : `Disponible` / `En rupture` / `Inconnu` / `Cassé`,
- la date/heure du dernier contrôle,
- l’information si une notification a déjà été envoyée.

**Actions utilisateur :**

- Activer / désactiver la surveillance d’un produit.
- Supprimer un suivi.
- (Optionnel) Renommer un suivi avec un label personnalisé.

### 5.3 Vérification automatique des stocks

- Le système exécute périodiquement un processus de contrôle des suivis actifs.
- Pour chaque suivi :
  - récupération de la page produit (HTTP),
  - analyse du contenu selon les règles du profil de site,
  - détermination d’un état :
    - `en stock`,
    - `en rupture`,
    - `inconnu` (si doute),
    - `cassé` (erreur durable : 404, redirections anormales, blocage).
- La fréquence de vérification doit rester raisonnable pour :
  - ne pas surcharger les sites distants,
  - rester défendable d’un point de vue éthique.

Les changements d’état sont enregistrés pour déclencher des notifications.

**Note de robustesse (scraping) :** pour les pages dynamiques ou protégées (contenu chargé en JS, popups, etc.), la récupération de page peut nécessiter un navigateur headless (ex. Playwright). Dans ce cas, le système doit rester raisonnable (limites de concurrence, timeouts, retries contrôlés) et expliciter ses limites en soutenance.

### 5.4 Notifications

- Une notification est envoyée lorsqu’un suivi passe de `en rupture` / `inconnu` à `en stock`.
- Canal minimum : e-mail à l’adresse de l’utilisateur.
- Le contenu précise :
  - le produit concerné,
  - le site,
  - le lien vers la page.
- Les notifications envoyées sont journalisées (date, type, suivi concerné).
- Le système évite l’envoi répété de notifications tant que le produit reste en stock.

### 5.5 Profils de sites (règles de détection)

Un “profil de site” contient :

- le domaine (ou motif),
- les règles de détection “en stock” / “rupture” (ex. mots-clés, sélecteurs, présence/absence d’un bloc),
- des remarques / contraintes spécifiques (ex. pages lentes, anti-bot simple).

Fonctionnalités attendues :

- Créer, modifier, supprimer un profil.
- Associer un profil aux suivis d’un domaine.
- Tester un profil sur une URL donnée depuis l’interface admin (exécution manuelle + affichage du résultat).

Ce mécanisme :

- permet d’ajuster la logique sans modifier le code,
- rend le projet robuste face aux changements d’HTML.

**Précision importante :** les profils de sites permettent d’ajuster *une partie* de la logique (signaux/indices). Le projet doit néanmoins conserver un **socle de code** versionné et testé (normalisation, transitions, anti-abus, SSRF, throttling) pour éviter que la logique métier ne se disperse hors du code.

---

## 5.6 Exigences “analyse” : User stories + critères d’acceptation (à produire)
On fournit une liste de 10 à 20 user stories.  
Chaque story inclut :
- une priorité (Must/Should/Could),
- des critères d’acceptation (Given/When/Then).

Exemples (format attendu) :
- **US-01** En tant que USER, je peux créer un compte.  
  - Given je suis non connecté, When je soumets email+mdp valides, Then le compte est créé et je peux me connecter.
- **US-05** En tant que USER, je reçois un e-mail quand un produit repasse en stock.  
  - Given mon watch est OUT_OF_STOCK, When le worker détecte IN_STOCK, Then je reçois 1 e-mail et une trace est enregistrée.

---

## 6. Architecture cible

### 6.1 Séparation des composants

L’application de suivi de retour en stock se découpe en 3 briques :

- **UI (dashboard)** : pages utilisateur + admin.
- **API** : authentification, gestion des comptes, suivis, profils de sites, historique.
- **Worker (scheduler + scraping)** : exécute les contrôles planifiés, applique les règles, met à jour la base, déclenche les notifications.

**Principe directeur :** le **worker** est le cœur du produit (scraping + décision). L’API et l’UI servent au pilotage, à la configuration, à l’historique et à l’expérience utilisateur.

### 6.2 Planification et exécution

- Un planificateur déclenche le worker à intervalle régulier (cron).
- Le worker traite les suivis par lots, avec :
  - limitation de débit par domaine (throttling),
  - stratégie de retry (exponentiel, max tentatives),
  - mise en quarantaine d’un site en cas d’erreurs répétées (optionnel).
- Objectif : éviter un “pic” de requêtes et réduire le risque de blocage.

**Orchestration :**
**MVP propre :** scheduler type cron dans le worker (ex. APScheduler) + gestion de concurrence basique.

### 6.3 Flux principaux

**Flux 1 — création d’un suivi :**
1. L'utilisateur ajoute une URL.
2. L’API valide et enregistre.
3. Le worker prendra ce suivi lors du prochain cycle.

**Flux 2 — contrôle + notification :**
1. Le worker récupère la page.
2. Il détecte l’état avec le profil.
3. Il écrit l’état en base.
4. Si état = “en stock” (avec transition), il envoie l’e-mail et journalise l’envoi.

### 6.3.1 Option n8n (orchestration en surcouche)
**Objectif :** utiliser n8n pour déclencher/chaîner/notifier, sans déplacer la logique de scraping hors du code.

n8n peut servir à :
- Déclencher des exécutions (cron, webhooks).
- Chaîner des étapes (check → décision → notif → log).
- Notifier (email, Discord/Telegram, webhook).
- Tracer facilement (historique des runs, erreurs, reruns manuels).

Mais n8n n’est pas fait pour :
- du scraping “dur” et robuste (gestion fine anti-bot, parsing complexe, retries intelligents, rotation proxies, etc.).
- de la logique métier qui doit rester testée/versionnée comme du code.

**Intégration propre (schéma) :**
- n8n lance un workflow (cron) → appelle l’API (ex. `POST /jobs/run` ou `POST /jobs/run?site=...`). *Note : cet endpoint est cité à titre d'exemple et est considéré hors périmètre V1.*
- L’API déclenche un run (ou poste une tâche) → le worker exécute → écrit en DB.
- n8n lit le résultat (succès/échec, volume traité) → envoie alertes/ops (Discord/Slack) si nécessaire.

**Règle :** toute logique de décision (détection stock, normalisation, transitions, SSRF, throttling) reste dans le worker/API et demeure testée et versionnée.

---

## 6.4 Modélisation (UML + données) — livrables attendus

### 6.4.1 UML (à produire)
On fournit au minimum :
- Diagramme de **cas d’utilisation** (USER / ADMIN).
- Diagramme de **classes** (modèle métier).
- Diagramme(s) de **séquence** :
  - "Contrôle stock + mise à jour + notification”
  - “Admin test profil sur URL” (optionnel)
- (Optionnel) Diagramme d’**activité** pour le worker.

### 6.4.2 Données (MCD / MLD / MPD)
On fournit :
- **MCD** (conceptuel),
- **MLD** (logique),
- **MPD** (physique) + types, contraintes, index.

Entités minimales recommandées :
- `users`
- `watches`
- `site_profiles`
- `watch_checks` (historique contrôles)
- `notifications`
- `audit_logs` (actions admin / sécurité)

Contraintes minimales recommandées :
- unicité : `(user_id, normalized_url)`
- FK : watches → users, watches → site_profiles
- index : `watches(status, next_check_at)`, `site_profiles(domain)`
- timestamps partout (created_at, updated_at)

---

## 6.5 Stack de référence (Python-first) — cadrage technique
Cette section donne une **stack de référence** cohérente avec l’objectif du projet (scraping). Le cahier des charges reste fonctionnellement valide, mais cette stack rend les choix défendables et alignés sur la “valeur” du produit.

### 6.5.1 Worker / scraping (cœur)
- **Python 3.12**
- HTTP statique : **httpx** + **BeautifulSoup4 (bs4)** et/ou **lxml**
- Pages dynamiques / JS : **Playwright (Python)**  
  (Selenium possible, mais Playwright est plus moderne et plus stable en headless)
- Parsing & normalisation : **pydantic**
- Observabilité : **structlog** (ou `logging` standard) + logs JSON

### 6.5.2 API
- **FastAPI (Python)** pour exposer : auth, dashboard, watches, historiques, profils de sites, endpoints de jobs
- Serveur : **uvicorn** (prod : **gunicorn + uvicorn workers**)

### 6.5.3 Base de données
- **PostgreSQL**
- ORM : **SQLAlchemy 2.0** (ou SQLModel)
- Migrations : **Alembic**

### 6.5.4 Notifications
- Email : **SMTP** (simple) ou provider (Mailjet/SendGrid) si on veut industrialiser
- (Optionnel) Webhooks / Discord / Telegram ensuite

### 6.5.5 Front (dashboard)
- **React + TypeScript** (Vite) ou Next.js
- UI : **Tailwind**
- Appels API : fetch/axios

### 6.5.6 Infra
- **Docker Compose** : api + worker + postgres (+ redis si queue)
- **CI GitHub Actions** : lint, tests, build (et éventuellement image Docker)

---

## 7. Exigences UX / UI

- Interface claire, sobre, lisible.
- Navigation simple :
  - accès rapide au dashboard,
  - accès clair à la création d’un nouveau suivi,
  - séparation visible entre espace utilisateur et espace admin.
- Affichage des statuts avec codes visuels simples (labels / couleurs).
- Responsive : utilisable sur ordinateur + mobile.

Le design n’a pas besoin d’être “marketé”. L'interface doit être compréhensible, cohérente et propre à présenter en soutenance.

---

## 7.1 Maquettage et prototype (Figma) — livrables attendus
On produit dans Figma :
- **Charte graphique** (couleurs, typographies, composants).
- **Wireframes** (low-fi).
- **Maquettes** (hi-fi).
- **Prototype cliquable** couvrant les parcours clés (voir 4.3.2).

Écrans minimum attendus :
- Auth : login, register, forgot/reset password
- Dashboard : liste suivis, ajout URL, détail suivi (optionnel)
- Admin : liste profils, édition profil, test sur URL

États UX obligatoires (anti “démo fragile”) :
- loading / disabled
- success feedback
- error message clair (URL invalide, site inconnu, blocage, etc.)
- empty state (aucun suivi)

---

## 7.2 Accessibilité (niveau minimal attendu)
Sans viser un audit complet, on respecte a minima :
- navigation clavier (tab, enter, escape),
- focus visible,
- labels explicites et messages d’erreur lisibles,
- contrastes suffisants,
- structure sémantique des pages (titres, zones).

---

## 8. Exigences non fonctionnelles

### 8.1 Sécurité

**Authentification et mots de passe**
- Politique de mot de passe (exemple) :
  - longueur minimale,
  - complexité raisonnable,
  - refus des mots de passe trop courants.
- Stockage sécurisé :
  - hash avec sel via un algorithme adapté (ex. Argon2id/bcrypt),
  - jamais de mot de passe en clair.

**Autorisation (RBAC)**
- Rôles au minimum : `USER`, `ADMIN`.
- Endpoints admin protégés (contrôle d’accès côté serveur).

**Jetons (si API stateless)**
- Authentification via **JWT** (ou sessions), avec expiration.
- (Optionnel) refresh token et rotation.

**Validation / sanitisation**
- Validation serveur de toutes les entrées (pas seulement l’URL) :
  - paramètres de requête,
  - payload JSON/form,
  - champs admin (règles de détection).
- Protection contre :
  - injections SQL (requêtes préparées / ORM),
  - XSS (encodage sortie, CSP si applicable),
  - CSRF si sessions/cookies.

**Protection anti-abus**
- Rate limiting sur l’API (ex. login, création de suivi).
- Limite de suivis par utilisateur (configurable).
- Limite de fréquence de contrôle par suivi (configurable).

**Gestion des secrets**
- Secrets en variables d’environnement (SMTP, clés JWT, DB).
- Aucun secret en dur dans le code.
- Fichier `.env.example` fourni, `.env` ignoré.

### 8.1.1 Sécurité scraping (SSRF et abus) — exigences spécifiques
Comme l’utilisateur fournit des URLs, on applique :
- autoriser uniquement `http`/`https`,
- interdire IP privées/locales (127.0.0.1, 10/8, 192.168/16, 172.16/12, link-local, etc.),
- limiter les redirections (ex. max 3),
- timeouts stricts, taille max de réponse,
- user-agent explicite,
- throttling par domaine + quotas par utilisateur,
- journaliser les refus SSRF (sans stocker de données sensibles inutiles).

**Précision stack :** si on utilise Python, on peut implémenter ces garde-fous via validation d’URL (schéma/hôte), résolution DNS contrôlée, filtrage d’IP, et politiques strictes de redirections/timeouts/taille réponse dans `httpx`, ainsi que des protections similaires côté Playwright (timeouts, navigation strictes, concurrency limitée).

### 8.2 Performance

- Traitement des suivis de manière asynchrone / planifiée.
- Répartition dans le temps (pas tout d’un coup sur un volume important).
- Temps de réponse UI confortable :
  - opérations longues déportées au worker.

### 8.3 Fiabilité

- Gestion des erreurs réseau/HTTP :
  - état `inconnu` ou `cassé` plutôt que données fausses.
- Journalisation minimale des erreurs techniques (diagnostic).
- Stratégie retry avec limites (pas de boucle infinie).
- Transparence : pas de promesse de fiabilité absolue (HTML changeant, protections anti-bot, etc.).

### 8.4 Respect légal et éthique

- Fréquence raisonnable des requêtes.
- Respect des conditions d’utilisation autant que possible.
- Aucune collecte de données sensibles inutiles.
- Transparence : le service repose sur l’analyse de pages publiques.

### 8.4.1 RGPD (minimal mais explicite)
On documente :
- données collectées : email, URLs suivies, logs techniques (minimisés),
- finalité : fournir l’alerte de retour en stock,
- durées de conservation (logs techniques courts ; historique/notifications justifiés),
- droits : suppression compte + suppression données associées (export minimal optionnel),
- pages : mentions légales + politique de confidentialité (format simple).

### 8.5 Déploiement et exploitation

- Le projet doit être lançable via **Docker / Docker Compose** :
  - API,
  - worker,
  - base de données,
  - (optionnel) service de mail de test.
- Stratégie de mise en production documentée :
  - variables d’environnement,
  - migrations DB,
  - configuration SMTP,
  - procédure de démarrage/arrêt.
- Logs accessibles pour diagnostic (API + worker).
- (Optionnel) sauvegarde/restauration DB décrite.
- (Recommandé) procédure de rollback documentée (au moins niveau migrations).

### 8.6 Qualité, tests et CI/CD

- Tests unitaires (règles de détection, transitions de statut, notifications).
- Tests d’intégration (API ↔ DB, worker ↔ DB, scénario “retour en stock”).
- Analyse statique et conventions :
  - lint/format (selon stack),
  - analyse type/qualité (ex. PHPStan / équivalent).
- Pipeline CI/CD minimum :
  - exécuter lint + tests à chaque push,
  - produire un build (et éventuellement une image Docker).

**Précision stack (exemples concrets en Python) :**
- Tests : **pytest** (unitaires + intégration)
- Lint/format : **ruff** + **black** (ou ruff seul selon configuration)
- Types (optionnel mais valorisant) : **mypy**
- Sécurité (optionnel) : **bandit**
- CI (GitHub Actions) : `ruff` + `pytest` + build Docker

### 8.6.1 Traçabilité : matrice Exigences → Tests (à produire)
On fournit un tableau qui relie :
- user stories / exigences,
- tests associés (nom du test + type),
- statut (OK/KO).

---

## 8.7 Gestion de projet et environnement (preuves CDA)

### 8.7.1 Organisation
- backlog (user stories),
- jalons (MVP, bêta, soutenance),
- Definition of Done (DoD) minimale :
  - tests passent,
  - lint OK,
  - build Docker OK,
  - doc mise à jour.

### 8.7.2 Environnement
- prérequis (versions),
- scripts (lint, test, start, migrate),
- conventions (naming, branches, commits),
- README “run en local” clair.

---

## 9. Livrables attendus

- Application fonctionnelle :
  - espace utilisateur,
  - espace administrateur,
  - vérification automatique,
  - envoi des notifications.
- Code source structuré et documenté.
- Schéma de données (ERD simple).
- Description des flux principaux (création de suivi, vérification, notification).
- Tests (unitaires + intégration) et rapport d’exécution (ex. commande + résultat).
- Déploiement :
  - `docker-compose.yml`,
  - `.env.example`,
  - documentation “run en local”.
- Documentation :
  - guide utilisateur simple,
  - note expliquant les limites (techniques et légales),
  - note expliquant les choix d’architecture et de sécurité.

### 9.1 Livrables ajoutés (analyse / conception)
- Figma : charte, wireframes, maquettes, prototype, user flows.
- UML : cas d’utilisation, classes, séquences (activité optionnelle).
- Données : MCD, MLD, MPD (+ contraintes/index).
- Matrice Exigences → Tests.

---

## 10. Critères de validation

Le projet est considéré comme validé si :

1. Un utilisateur peut :
   - créer un compte,
   - ajouter un produit,
   - voir le statut de ses suivis,
   - recevoir au moins une notification lors d’un retour en stock (réel ou simulé).

2. Un administrateur peut :
   - créer / modifier un profil de site,
   - ajuster la détection sans modifier le code,
   - consulter des métriques simples (suivis actifs, notifications envoyées),
   - marquer un suivi “cassé” si nécessaire.

3. Le système :
   - exécute des vérifications automatisées (planifiées),
   - gère les erreurs de manière contrôlée,
   - ne spam pas les utilisateurs (anti-doublon + limites),
   - applique les garde-fous scraping (throttling, quotas, SSRF).

4. La sécurité est démontrable :
   - politique de mot de passe,
   - endpoints admin protégés par rôle,
   - secrets gérés via variables d’environnement.

5. Le déploiement est reproductible :
   - démarrage via Docker Compose,
   - documentation d’exécution.

6. La démarche qualité est visible :
   - tests unitaires et intégration présents,
   - pipeline CI qui exécute au minimum lint + tests.

7. En soutenance, on doit savoir expliquer :
   - la problématique et les contraintes,
   - les choix d’architecture,
   - les limites du scraping (vs API/ERP),
   - la démarche qualité et sécurité,
   - les décisions d’analyse/conception (Figma, UML, MCD/MLD/MPD) et la traçabilité exigences→tests.

---

## 11. Évolutions possibles (post-projet)

- Ajout d’un canal de notification (push/Discord/Telegram).
- Connecteurs “API stock” (ERP/marketplaces) au lieu du scraping.
- Gestion avancée des règles (templates, versioning).
- Monitoring (tableaux, alertes, métriques).
- Application mobile/PWA.

**Évolutions d’orchestration (optionnel) :**
- n8n : enrichir les workflows (alerting ops, reruns, intégrations) en restant en surcouche.
- Passage progressif vers une queue robuste (si MVP en cron) : Celery/Redis, planification plus fine, retries natifs.
