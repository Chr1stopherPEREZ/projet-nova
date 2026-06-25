---
theme: seriph
background: https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070
class: text-center
highlighter: shiki
lineNumbers: true
info: |
  ## Présentation Rattrapage CDA - Projet Nova
  Christopher Perez
drawings:
  persist: false
transition: slide-left
title: Nova - Soutenance de rattrapage CDA
---

# Nova
## Application de suivi de disponibilité produit
### Soutenance de rattrapage CDA

<div class="pt-12">
  <span class="px-2 py-1 rounded">
    Christopher Perez
  </span>
</div>

<!--
Notes orateur :
- Bonjour à tous, je m'appelle Christopher Perez.
- Je vous présente Nova V2, une application de veille de stock e-commerce.
- Cette présentation est structurée autour des compétences du titre CDA démontrées par ce projet.
-->

---

# 1. Introduction rapide

*   **Nova** : Solution d'automatisation de veille produit (disponibilité et prix).
*   **Problème** : Ruptures de stock fréquentes, perte de temps à vérifier manuellement.
*   **Objectif V2** : Une version stable, sécurisée et reproductible, prête pour la démonstration.
*   **Parcours central** :
    1. Créer un suivi via une URL.
    2. Analyser la page produit (Preview).
    3. Déclencher des vérifications via le worker.
    4. Historiser et tester une notification via Mailhog.

<!--
Notes orateur :
- L'idée est de passer d'une vérification manuelle frustrante à un dashboard automatisé.
- La V2 se concentre sur la robustesse technique et la fiabilité des données.
-->

---

# 2. Analyser le besoin et cadrer le projet

### Compétence : "Analyser les besoins et maquetter une application"

*   **Réalisé** : Étude du contexte métier (e-commerce), définition du périmètre V2 (fiabilité) vs V3 (scaling).
*   **Preuve** : Dossier projet section "Analyse" et Backlog consolidé.

| Point clé | Détail Nova |
| :--- | :--- |
| **Périmètre V2** | Focus sur le moteur de check déterministe et la sécurité JWT/CSRF. |
| **Backlog** | Gestion agile des US : "En tant qu'utilisateur, je veux être alerté du retour en stock". |
| **Gestion des risques** | Identification des instabilités du web réel -> Solution : Mode Fixture. |

<!--
Notes orateur :
- J'ai cadré le projet pour répondre aux contraintes du titre : sécurité, persistance et architecture propre.
- Le backlog a permis de prioriser les fonctionnalités essentielles pour cette soutenance.
-->

---

# 3. Concevoir l’application

### Compétence : "Concevoir une application et sa base de données"

*   **Réalisé** : Architecture n-tiers, Modélisation relationnelle (MCD/MLD), Diagrammes de flux.
*   **Preuve** : Schémas d'architecture et diagrammes de classes dans le dossier.

*   **Architecture** : Séparation stricte Frontend (React) / Backend (FastAPI) / Worker / DB.
*   **Modélisation** : Structure orientée historisation (Watch -> WatchCheck).
*   **Choix techniques** : PostgreSQL pour la robustesse, Docker pour la portabilité.

<!--
Notes orateur :
- L'architecture est modulaire : le worker peut évoluer sans impacter l'API.
- La base de données est conçue pour garder une trace de chaque changement de prix ou d'état.
-->

---

# 4. Use Case Complet : De l'URL à l'historique

### Objectif : Démontrer la compréhension du trajet de la donnée

*   **Scénario** : Un utilisateur crée un suivi, lance une vérification et consulte le résultat.
*   **Flux** : UI → API → Moteur métier → Base de données → Worker → Notification → Retour UI.

<div class="mt-10 flex justify-center items-center">
  <div class="bg-blue-100 p-4 rounded-lg shadow">
    Utilisateur → React → FastAPI → Moteur → PostgreSQL → Historique → Interface
  </div>
</div>

<!--
Notes orateur :
- Pour prouver ma maîtrise, je vais détailler le cheminement d'une donnée à travers toutes les couches de l'application.
-->

---

# 5. Étape 1 : Interface utilisateur (Frontend)

*   **Action** : L'utilisateur saisit l'URL d'un produit.
*   **Réalisation** : Formulaire React avec validation et appel asynchrone à l'API.

```tsx
// Snippet : Appel à l'API pour créer le suivi
const res = await apiFetch('/watches', {
  method: 'POST',
  body: JSON.stringify({ url, variant_sku: selectedVariantSku })
});
```

*   **Compétence** : Développer une interface utilisateur web dynamique.
*   **Note orateur** : "Ici, le frontend React prépare le payload JSON et gère l'état de chargement pendant l'appel API."

---

# 6. Étape 2 : API et Validation (Backend)

*   **Action** : L'API reçoit la requête et valide les données.
*   **Réalisation** : Route FastAPI avec injection de dépendances et schémas Pydantic.

```python
@router.post("", response_model=WatchOut)
def create_watch(
    watch_data: WatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    watch = Watch(**watch_data.model_dump(), user_id=current_user.id)
    db.add(watch)
    db.commit()
    return watch
```

*   **Compétence** : Développer des composants métier.
*   **Note orateur** : "L'API sécurise l'entrée grâce à Pydantic, garantissant que seule une donnée propre arrive dans le service métier."

---

# 7. Étape 3 : Moteur métier (Check Engine)

*   **Action** : Le backend analyse le contenu de la page (ou fixture).
*   **Réalisation** : Logique de parsing pour déterminer l'état du stock.

```python
def analyze_fixture(content: bytes) -> StockState:
    text = content.decode("utf-8")
    if "ADD_TO_CART" in text:
        return StockState.IN_STOCK
    return StockState.OUT_OF_STOCK
```

*   **Compétence** : Implémenter la logique métier complexe.
*   **Note orateur** : "C'est le coeur de Nova : le moteur extrait l'état réel du produit à partir du code HTML ou d'un flux JSON Shopify."

---

# 8. Étape 4 : Persistance et Historique (DB)

*   **Action** : Enregistrement de l'état et création d'une ligne d'historique.
*   **Réalisation** : Modèle SQLAlchemy avec relations One-to-Many.

```python
class Watch(Base):
    id = Column(Uuid, primary_key=True)
    stock_state = Column(Enum(StockState))
    checks = relationship("WatchCheck", back_populates="watch")

# Un nouveau WatchCheck est créé à chaque vérification
```

*   **Compétence** : Concevoir et exploiter une base de données relationnelle.
*   **Note orateur** : "Chaque vérification est une preuve immuable en base de données, permettant de tracer l'évolution du produit."

---

# 9. Étape 5 : Worker et Notification

*   **Action** : Traitement asynchrone et alerte utilisateur.
*   **Réalisation** : Worker indépendant et service SMTP (Mailhog).

```python
# Worker déclenchant l'envoi
if check.stock_state == "IN_STOCK":
    email_service.send(to=user.email, subject="Produit disponible !")
```

*   **Compétence** : Développer des composants d'accès aux données / services tiers.
*   **Note orateur** : "Le worker représente le traitement en arrière-plan chargé d’exécuter les vérifications. Si l'état change, il utilise le service de notification pour alerter l'utilisateur via Mailhog."

---

# 10. Synthèse du flux de données

1.  **Frontend** : Capture de l'intention (URL).
2.  **API** : Porte d'entrée sécurisée et validation.
3.  **Service** : Intelligence de parsing et détection d'état.
4.  **Database** : Mémoire persistante et historisation.
5.  **Worker** : Automatisation du cycle de vie.
6.  **Notification** : Boucle de retour vers l'utilisateur.

*   **Maîtrise** : Compréhension de la chaîne de valeur technique complète.

<!--
Notes orateur :
- Ce flux démontre que je maîtrise l'intégralité du cycle de vie d'une donnée dans une application moderne.
-->

---

# 11. Développer l’interface utilisateur

### Compétence : "Développer la partie front-end d'une application"

*   **Réalisé** : SPA avec React, Vite, TypeScript et Tailwind CSS.
*   **Preuve** : Code source dans `/web/src` et captures d'écran Dashboard.

*   **Composants** : Découpage atomique (Buttons, Inputs, Layouts).
*   **Gestion d'état** : Hooks React (useState, useEffect) et services API centralisés.
*   **UX/UI** : Interface moderne, responsive et claire (Tailwind).
*   **Protection** : Composant `ProtectedRoute` pour filtrer les accès non-authentifiés.

<!--
Notes orateur :
- J'ai utilisé TypeScript pour sécuriser le développement et éviter les erreurs de type courantes.
- Tailwind m'a permis d'avoir un design cohérent et professionnel très rapidement.
-->

---

# 12. Développer le backend et les composants métier

### Compétence : "Développer la partie back-end d'une application"

*   **Réalisé** : API REST avec FastAPI, services de parsing Shopify et moteur de vérification.
*   **Preuve** : Code source dans `/api/app` et documentation Swagger.

*   **Modularité** : Services séparés pour les parsers, l'email et le moteur de check.
*   **Structure** : API claire, services séparés et typage Python pour faciliter la maintenance.

<!--
Notes orateur :
- FastAPI a été choisi pour sa performance et sa capacité à générer une documentation interactive automatiquement.
- Le code est structuré de manière à pouvoir ajouter de nouveaux sites à surveiller facilement.
-->

---

# 13. Concevoir et exploiter la base de données

### Compétence : "Concevoir et mettre en place une base de données"

*   **Réalisé** : Schéma PostgreSQL, migrations Alembic, requêtes SQLAlchemy.
*   **Preuve** : Fichiers de migration et schéma ERD.

*   **Alembic** : Gestion des versions de la base de données (évolution fluide).
*   **Contraintes** : `UniqueConstraint` sur URL + Variant pour éviter les doublons.
*   **Indexation** : Index sur les IDs et emails pour des recherches rapides.

<!--
Notes orateur :
- La base de données est le socle de l'application.
- L'utilisation d'Alembic permet de déployer les changements de schéma de manière reproductible sur tous les environnements.
-->

---

# 14. Sécuriser l’application

### Compétence : "Sécuriser une application et ses données"

*   **Réalisé** : Authentification JWT, protection CSRF, isolation des données.
*   **Preuve** : Dossier projet section "Sécurité" et tests des routes protégées.

*   **JWT HttpOnly** : Cookie sécurisé pour prévenir les failles XSS.
*   **CSRF** : Double Submit Cookie pour les actions critiques.
*   **Isolation** : Requêtes SQL systématiquement filtrées par `user_id`.
*   **Validation** : Pydantic pour bloquer les injections de données malformées.

<!--
Notes orateur :
- J’ai mis en place plusieurs protections attendues : authentification, cookie HttpOnly, CSRF, validation backend et filtrage par utilisateur.
- L'utilisation de cookies HttpOnly est un standard de l'industrie pour protéger les tokens.
-->

---

# 15. Tester, valider et documenter

### Compétence : "Tester et valider une application avant déploiement"

*   **Réalisé** : Tests unitaires, documentation API, environnement Docker.
*   **Preuve** : Rapport Pytest et Swagger UI.

*   **Pytest** : Suite de tests couvrant le moteur de check et l'authentification.
*   **Swagger** : Documentation interactive pour consulter et tester les routes API.
*   **Mode Fixture** : Fiabilisation de la démo en utilisant des données contrôlées.

<!--
Notes orateur :
- Les tests m’ont permis de vérifier le parcours principal et de sécuriser les corrections apportées en V2.
- Le mode fixture garantit que ma démo fonctionnera même sans connexion internet stable.
-->

---

# 16. Préparer le déploiement

### Compétence : "Préparer et accompagner le déploiement"

*   **Réalisé** : Orchestration multi-services avec Docker Compose.
*   **Preuve** : Fichier `docker-compose.yml` et images Docker.

*   **Conteneurisation** : Images légères et isolées pour chaque service.
*   **Reproductibilité** : Environnement local cohérent grâce à Docker Compose.
*   **Services** : API, Web, Postgres, Worker, Mailhog.

<!--
Notes orateur :
- Docker Compose permet de reproduire l’environnement localement et de préparer une future mise en production.
- Cette approche facilite aussi grandement le travail collaboratif et l'intégration continue.
-->

---

# 17. Démonstration (Plan)

1.  **Connexion** : Espace sécurisé.
2.  **Dashboard** : Vision globale.
3.  **Création** : URL -> Preview -> Validation.
4.  **Vérification** : Déclenchement d'un check sur une fixture.
5.  **Alerte** : Réception du mail dans Mailhog.
6.  **Historique** : Visualisation du changement d'état.
7.  **Swagger** : Un oeil sur les coulisses de l'API.

<!--
Notes orateur :
- Ma démonstration va suivre ce scénario pour illustrer concrètement les compétences listées précédemment.
-->

---

# 18. Conclusion

### Ce que Nova V2 démontre
*   Un parcours complet de développeur CDA : de l'analyse au déploiement.
*   Une maîtrise des stacks modernes (Python/FastAPI, React/Vite).
*   Une rigueur sur la qualité et la sécurité.

### Limites et Perspectives (V3)
*   **Limites** : Pas de déploiement Cloud (AWS/Heroku) dans cette version.
*   **V3** : Administration avancée, notifications in-app, multi-sites robuste.

<!--
Notes orateur :
- Nova V2 n’est plus seulement une preuve de concept : c’est une version structurée, démontrable et techniquement cohérente.
- Merci pour votre attention, je suis prêt pour vos questions.
-->
