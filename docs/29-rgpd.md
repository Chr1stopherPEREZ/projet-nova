# Nova - RGPD et gestion des données personnelles

## Objectif
Documenter la conformité RGPD du projet Nova : données collectées, finalités, durées de rétention, droits des utilisateurs et procédures associées.

---

## Données collectées

### Données utilisateurs
| Donnée | Type | Finalité | Base légale |
|--------|------|----------|-------------|
| Email | Identifiant | Authentification, notifications | Contrat (fourniture du service) |
| Mot de passe (hashé) | Sécurité | Authentification | Contrat |
| Date d'inscription | Métadonnée | Audit, support | Intérêt légitime |
| Rôle (USER/ADMIN) | Métadonnée | Contrôle d'accès | Contrat |

### Données de suivi (watches)
| Donnée | Type | Finalité | Base légale |
|--------|------|----------|-------------|
| URL du produit | Fonctionnel | Surveillance du stock | Contrat |
| État du stock | Fonctionnel | Alerte utilisateur | Contrat |
| Historique des contrôles | Fonctionnel | Traçabilité, debug | Intérêt légitime |
| Label personnalisé (optionnel) | Confort | UX | Consentement implicite |

### Données de notification
| Donnée | Type | Finalité | Base légale |
|--------|------|----------|-------------|
| Date d'envoi | Métadonnée | Anti-doublon, audit | Intérêt légitime |
| Canal (email) | Métadonnée | Traçabilité | Contrat |
| Statut (envoyé/échoué) | Métadonnée | Support technique | Intérêt légitime |

### Logs techniques
| Donnée | Type | Finalité | Base légale |
|--------|------|----------|-------------|
| Adresse IP | Sécurité | Détection d'abus, debug | Intérêt légitime |
| User-Agent | Sécurité | Statistiques, debug | Intérêt légitime |
| Horodatage | Métadonnée | Audit | Intérêt légitime |

---

## Durées de rétention

| Catégorie | Durée | Justification |
|-----------|-------|---------------|
| Compte utilisateur | Jusqu'à suppression par l'utilisateur | Service actif |
| Suivis (watches) | Jusqu'à suppression par l'utilisateur | Service actif |
| Historique des contrôles (`watch_checks`) | **90 jours** | Diagnostic et historique récent |
| Notifications | **1 an** | Preuve d'envoi, support |
| Logs techniques | **30 jours** | Sécurité, debugging |
| Tokens de réinitialisation | **24 heures** | Sécurité (expiration automatique) |
| Audit logs (admin) | **1 an** | Traçabilité des actions sensibles |

### Purge automatique
- Un job planifié supprime les données au-delà des durées de rétention.
- Les `watch_checks` de plus de 90 jours sont supprimés automatiquement.
- Les logs techniques sont purgés après 30 jours.

---

## Droits des utilisateurs

### Droit d'accès (Art. 15)
L'utilisateur peut consulter ses données personnelles via :
- Le dashboard (suivis, historique des notifications)
- (Optionnel V2) Un export JSON via `GET /users/me/export`

### Droit de rectification (Art. 16)
L'utilisateur peut modifier :
- Son adresse email (avec revalidation)
- Son mot de passe
- Les labels de ses suivis

### Droit à l'effacement (Art. 17)
L'utilisateur peut supprimer son compte via `DELETE /users/me`, ce qui entraîne :
- Suppression du compte utilisateur
- Suppression de tous les suivis associés
- Suppression de l'historique des contrôles
- Suppression des notifications
- Conservation anonymisée des logs techniques (IP masquée)

### Droit à la portabilité (Art. 20)
- (Optionnel V2) Export des données au format JSON
- Données exportables : email, liste des suivis (URLs, statuts)

### Droit d'opposition (Art. 21)
L'utilisateur peut :
- Mettre en pause un suivi (arrêt des contrôles)
- Supprimer un suivi (suppression des données associées)
- Supprimer son compte (suppression complète)

---

## Procédures

### Suppression de compte
```
1. L'utilisateur clique "Supprimer mon compte" dans les paramètres
2. Confirmation requise (modal de validation)
3. L'API exécute DELETE /users/me
4. Cascade en base : users → watches → watch_checks → notifications
5. Invalidation des tokens JWT
6. Email de confirmation de suppression (optionnel)
```

### Demande d'export (V2)
```
1. L'utilisateur clique "Exporter mes données"
2. L'API génère un fichier JSON
3. Le fichier est envoyé par email ou téléchargé directement
```

### Signalement d'une fuite de données
En cas de fuite de données personnelles :
1. Notification à la CNIL sous 72h (si applicable)
2. Information des utilisateurs concernés
3. Documentation de l'incident dans les audit logs

---

## Mentions légales (à intégrer)

### Responsable du traitement
- Nom : [À compléter]
- Email de contact : [À compléter]

### Finalité du traitement
Nova collecte et traite des données personnelles dans le seul but de fournir un service d'alerte de retour en stock de produits.

### Destinataires des données
- Aucun transfert à des tiers
- Aucune revente de données
- Hébergement : [À compléter - ex: OVH, Scaleway, auto-hébergé]

### Transfert hors UE
- Aucun transfert hors UE prévu
- (Si applicable) Conformité aux clauses contractuelles types

---

## Sécurité des données

### Mesures techniques
- Mots de passe hashés avec **Argon2id** (ou bcrypt)
- Communications chiffrées (HTTPS/TLS)
- Tokens JWT avec expiration courte
- Protection SSRF sur les URLs soumises
- Rate limiting sur les endpoints sensibles

### Mesures organisationnelles
- Accès admin restreint (RBAC)
- Audit logs des actions sensibles
- Revue de code sur les PR touchant aux données

---

## Référence
- Conformité générale : [`22-compliance.md`](./22-compliance.md)
- Sécurité : [`05-security.md`](./05-security.md)
- Opérations BDD : [`21-database-ops.md`](./21-database-ops.md)
