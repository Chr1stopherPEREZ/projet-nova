# Nova - User Flow & Diagrammes d'activités

## User Flow (Enchaînement logique des écrans)
Le flux suivant décrit le parcours type d'un utilisateur sur l'application Nova :

```mermaid
graph TD
    A[Page d'accueil] -->|S'inscrire| B(Formulaire d'inscription)
    A -->|Se connecter| C(Formulaire de connexion)
    B --> C
    C -->|Succès| D[Dashboard Utilisateur]
    D -->|Ajouter URL| E[Modale : Création de Suivi]
    E -->|Validation| D
    D -->|Cliquer sur un Suivi| F[Détails du Suivi + Historique]
    D -->|Cliquer Profil| G[Paramètres du compte]
```

## Diagrammes d'activités

### 1. Processus de vérification de stock (Worker)
Ce diagramme détaille la logique interne du worker lors d'un cycle de vérification.

```mermaid
stateDiagram-v2
    [*] --> Recuperation
    Recuperation --> Identification : Suivis trouvés
    Recuperation --> [*] : Aucun suivi
    
    state Identification {
        [*] --> Fetch
        Fetch --> Analyse : Succès
        Fetch --> LogErreur : Échec
        Analyse --> Notification : Transition IN_STOCK
        Analyse --> Update : Pas de changement
        Notification --> Update
        Update --> [*]
    }
    
    Identification --> Recuperation : Suivant
```

### 2. Ajout d'un suivi par l'utilisateur
```mermaid
graph TD
    Start((Début)) --> Input[Saisie de l'URL par l'utilisateur]
    Input --> Valid[Validation du format et SSRF]
    Valid -->|Invalide| Error[Message d'erreur]
    Valid -->|Valide| Match[Recherche d'un profil correspondant]
    Match -->|Aucun profil| Suggest[Informer : Analyse manuelle requise]
    Match -->|Profil trouvé| Save[Enregistrer en base de données]
    Save --> End((Fin))
```
