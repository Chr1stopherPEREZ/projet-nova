# LOT 7 - Watches UI + Run Check

## Objectif
Livrer les écrans de gestion des suivis (watches) avec actions fonctionnelles :
- Dashboard "My Watches" (liste)
- Create Watch (form)
- Watch Detail (infos + historique checks)
- Bouton "Run check" → `POST /jobs/run`
- Actions : toggle activer/désactiver, supprimer
- États UI : loading, empty state, error state

## Exigences → Preuves

| Exigence | Preuve | Fichier/Capture |
|----------|--------|-----------------|
| Liste des watches | Page `/watches` avec liste | `../../docs/proofs/s3-11-lot7-watches-list.png` |
| Empty state (0 watch) | Message "Aucun suivi" | `../../docs/proofs/s3-08-lot7-watches-empty.png` |
| Créer un watch | Form `/watches/new` | `../../docs/proofs/s3-09-lot7-create-watch-filled.png` |
| Preview Shopify | Preview des variantes | `../../docs/proofs/s3-10-lot7-preview-shopify-variant.png` |
| Détail watch + historique | Page `/watches/:id` | `../../docs/proofs/s3-12-lot7-watch-detail.png` |
| Bouton Run check | Appel `POST /jobs/run` + refresh | `../../docs/proofs/s3-13-lot7-run-check-success.png` |
| Historique / Rupture | État rupture détecté | `../../docs/proofs/s3-14-lot7-run-check-history.png` |
| Supprimer un watch | `DELETE /watches/:id` + confirmation | `../../docs/proofs/s3-15-lot7-delete-success.png` |

## Commandes de preuve

### 1. Démarrage complet

```bash
# Tous les services
docker compose up -d --build

# Frontend
cd web && pnpm dev
# → http://localhost:5173
```

### 2. Flux complet de démo

```bash
# 1. Login
# → http://localhost:5173/login
# Email: demo@nova.dev / Password: Demo12345!

# 2. Créer un watch
# → http://localhost:5173/watches/new
# URL: https://example.com/product/test
# Label: Test Product

# 3. Voir la liste
# → http://localhost:5173/watches

# 4. Ouvrir le détail
# → Cliquer sur "Voir"

# 5. Lancer un check
# → Cliquer sur "Lancer un check"

# 6. Voir le nouveau check dans l'historique
```

### 3. Test API directe

```bash
# Login
curl -s -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@nova.dev","password":"Demo12345!"}' \
  -c cookies.txt

CSRF=$(awk '$6=="csrf_token"{print $7}' cookies.txt)

# Créer une watch
curl -s -X POST http://localhost:8000/watches \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -b cookies.txt \
  -d '{"url":"https://example.com/product/demo","label":"Demo Product"}'

# Lister les watches
curl -s http://localhost:8000/watches -b cookies.txt | jq

# Run check
WATCH_ID="<uuid>"
curl -s -X POST http://localhost:8000/jobs/run \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -b cookies.txt \
  -d "{\"watch_id\":\"$WATCH_ID\"}"

# Toggle status (pause)
curl -s -X PATCH "http://localhost:8000/watches/$WATCH_ID" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF" \
  -b cookies.txt \
  -d '{"status":"PAUSED"}'

# Supprimer
curl -s -X DELETE "http://localhost:8000/watches/$WATCH_ID" \
  -H "X-CSRF-Token: $CSRF" \
  -b cookies.txt
```

### 4. Tests backend

```bash
docker compose exec api pytest tests/ -v
```

**Résultat attendu :** 38+ tests passés

## Pages implémentées

### WatchesPage (`/watches`)

- Liste des watches de l'utilisateur
- Badge coloré pour l'état du stock (En stock, Rupture, Inconnu, Erreur)
- Boutons : "Créer un suivi", "Voir"
- États : loading, empty, error
- Message de succès après création (via navigation state)

### CreateWatchPage (`/watches/new`)

- Formulaire : URL (obligatoire), Nom/Label (optionnel)
- Validation côté client
- Redirection vers `/watches` après création
- Gestion des erreurs avec Alert

### WatchDetailPage (`/watches/:id`)

- Informations du suivi (URL, état, statut, dernière vérification)
- Historique des checks (tableau avec date, état, HTTP status, erreur)
- Bouton "Lancer un check" → `POST /jobs/run`
- Bouton "Retour à la liste"
- États : loading historique, empty historique, error historique
- Message de résultat du check (vert si succès, rouge si erreur)

## Composants UI réutilisables

| Composant | Description |
|-----------|-------------|
| `PageContainer` | Conteneur de page avec titre, description, action |
| `Card` | Carte avec header et contenu |
| `Button` | Bouton avec variants (primary, secondary, outline, danger, ghost) |
| `Input` | Champ de saisie avec label et erreur |
| `Alert` | Message d'alerte (success, warning, danger, info) |
| `LoadingState` | Spinner avec message de chargement |
| `EmptyState` | État vide avec icône, titre, description, action |

## Code clé

### Run Check (WatchDetailPage.tsx)

```tsx
const handleRunCheck = async () => {
  if (!id) return
  
  try {
    setRunningCheck(true)
    setRunCheckResult(null)
    setRunCheckIsError(false)
    await apiFetch('/jobs/run', {
      method: 'POST',
      body: JSON.stringify({ watch_id: id }),
    })
    // Succès : message vert
    setRunCheckResult('Check exécuté avec succès')
    setRunCheckIsError(false)
    // Refresh des données
    await fetchWatch()
    await fetchChecks()
  } catch (err) {
    // Erreur : message rouge
    setRunCheckResult(err instanceof Error ? err.message : 'Erreur lors du check')
    setRunCheckIsError(true)
  } finally {
    setRunningCheck(false)
  }
}
```

### Toggle Watch Status

```tsx
const handleToggleStatus = async () => {
  const newStatus = watch.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
  await apiFetch(`/watches/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus }),
  })
  // Refresh watch
  await fetchWatch()
}
```

### Delete Watch avec confirmation

```tsx
const handleDelete = async () => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce suivi ?')) return
  
  await apiFetch(`/watches/${id}`, {
    method: 'DELETE',
  })
  navigate('/watches', { state: { success: 'Suivi supprimé avec succès' } })
}
```

## Captures à prendre

1. **`../../docs/proofs/s3-09-lot7-create-watch-filled.png`** — Création du suivi
2. **`../../docs/proofs/s3-10-lot7-preview-shopify-variant.png`** — Preview des variantes Shopify
3. **`../../docs/proofs/s3-11-lot7-watches-list.png`** — Liste des suivis
4. **`../../docs/proofs/s3-12-lot7-watch-detail.png`** — Détail du suivi
5. **`../../docs/proofs/s3-13-lot7-run-check-success.png`** — Run check (succès)
6. **`../../docs/proofs/s3-14-lot7-run-check-history.png`** — Historique avec nouvel enregistrement
7. **`../../docs/proofs/s3-15-lot7-delete-success.png`** — Suppression du suivi

<!-- Notes
Mise à jour des liens vers les preuves : les captures du Lot 7 sont centralisées et renommées dans docs/proofs/ avec le préfixe s3-XX-lot7-… (alignement Semaine 3).
Les anciennes références vers l'ancien dossier de captures Lot 7 ont été retirées.
-->

## Statut

| Critère | Statut |
|---------|--------|
| Liste watches | ✅ |
| Empty state | ✅ |
| Create watch | ✅ |
| Watch detail | ✅ |
| Historique checks | ✅ |
| Run check | ✅ |
| Toggle status | ✅ |
| Delete watch | ✅ |
| États loading/error | ✅ |
| Message succès | ✅ |

**Lot 7 : TERMINÉ ✅**
