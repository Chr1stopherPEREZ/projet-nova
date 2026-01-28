# Nova - Étude du Public Cible et Personas

## Public Cible
L'application Nova s'adresse à deux types d'utilisateurs principaux : les particuliers cherchant des produits rares ou en rupture, et les administrateurs chargés de maintenir la fiabilité du système de détection.

---

## 1. Persona : Quentin (Utilisateur "Chasseur de stocks")

| Attribut | Détails |
| :--- | :--- |
| **Profil** | Particulier, passionné de tech/gaming ou parent cherchant un jouet spécifique. |
| **Objectifs** | Être notifié dès qu'un produit (ex: carte graphique, console, édition collector) est de nouveau disponible pour l'acheter avant la nouvelle rupture. |
| **Besoin central** | **Rapidité et fiabilité**. Il ne veut pas rater l'occasion, mais ne veut pas non plus de fausses alertes (spam). |
| **Frustrations** | Devoir rafraîchir manuellement les pages 20 fois par jour. Recevoir un mail quand le produit est déjà de nouveau épuisé. |
| **Utilisation** | Utilise principalement son smartphone pour recevoir les notifications et passer commande rapidement. |

---

## 2. Persona : Florent (Administrateur "Data Guardian")

| Attribut | Détails                                                                                                                        |
| :--- |:-------------------------------------------------------------------------------------------------------------------------------|
| **Profil** | Développeur ou profil technique en charge du support de l'application.                                                         |
| **Objectifs** | S'assurer que les "Profils de sites" sont toujours à jour par rapport aux changements de structure HTML des sites marchands.   |
| **Besoin central** | **Outils de diagnostic**. Il doit pouvoir tester une règle de détection en un clic sans attendre le cycle du worker.           |
| **Frustrations** | Les sites qui changent leur DOM sans prévenir. Les blocages anti-bot qui rendent le scraping instable.                         |
| **Utilisation** | Utilise le dashboard d'administration sur ordinateur pour configurer les sélecteurs CSS et surveiller les métriques de succès. |

---

## Synthèse des besoins métier
L'analyse de ces personas a conduit aux choix suivants :
1.  **Notification Email** : Canal le plus universel pour Quentin.
2.  **Moteur de Règles (JSON)** : Permet à Florent de réagir vite sans redéployer le code.
3.  **Throttling** : Assure un comportement éthique pour éviter le bannissement par les sites marchands, garantissant la pérennité du service pour Quentin.
