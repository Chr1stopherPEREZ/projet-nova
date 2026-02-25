import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Card, CardContent, Button, LoadingState, EmptyState, PageContainer, Alert } from '../components/ui'
import { apiFetch } from '../api/client'
import { Eye, Plus, ExternalLink } from 'lucide-react'

interface Watch {
  id: string
  url: string
  label: string | null
  status: string
  stock_state: string
  last_checked_at: string | null
}

/**
 * Page liste des suivis (Lot 7).
 * - Affiche tous les suivis de l'utilisateur connecté
 * - Gère les états loading/empty/error et un message de succès après création
 */
export default function WatchesPage() {
  const location = useLocation()
  const [watches, setWatches] = useState<Watch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  /* Message de succès passé via navigation state (ex: après création d'un suivi) */
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as { success?: string })?.success || null
  )

  /* Efface le message de succès après 5 secondes */
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      /* Nettoie le state de navigation pour éviter réaffichage au refresh */
      window.history.replaceState({}, document.title)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    const fetchWatches = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiFetch<Watch[]>('/watches')
        setWatches(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchWatches()
  }, [])

  const getStockStateLabel = (state: string) => {
    const states: Record<string, { label: string; color: string }> = {
      IN_STOCK: { label: 'En stock', color: 'text-success-600 bg-success-50' },
      OUT_OF_STOCK: { label: 'Rupture', color: 'text-danger-500 bg-danger-50' },
      UNKNOWN: { label: 'Inconnu', color: 'text-gray-600 bg-gray-100' },
      BROKEN: { label: 'Erreur', color: 'text-warning-600 bg-warning-50' },
    }
    return states[state] || { label: state, color: 'text-gray-600 bg-gray-100' }
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Jamais vérifié'
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <DashboardLayout>
      <PageContainer
        title="Mes suivis"
        description="Gérez vos produits en surveillance"
        action={
          <Link to="/watches/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Créer un suivi
            </Button>
          </Link>
        }
      >
        {/* Message de succès après création */}
        {successMessage && (
          <Alert variant="success" className="mb-4">
            {successMessage}
          </Alert>
        )}

        {loading && <LoadingState message="Chargement des suivis..." />}

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        {!loading && !error && watches.length === 0 && (
          <Card>
            <CardContent>
              <EmptyState
                icon={<Eye className="h-12 w-12" />}
                title="Aucun suivi pour le moment"
                description="Créez votre premier suivi pour commencer à surveiller la disponibilité d'un produit."
                action={
                  <Link to="/watches/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un suivi
                    </Button>
                  </Link>
                }
              />
            </CardContent>
          </Card>
        )}

        {!loading && !error && watches.length > 0 && (
          <div className="space-y-4">
            {watches.map((watch) => {
              const stockState = getStockStateLabel(watch.stock_state)
              return (
                <Card key={watch.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-text truncate">
                          {watch.label || watch.url}
                        </h3>
                        <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          {watch.url}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Dernière vérification : {formatDate(watch.last_checked_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockState.color}`}>
                          {stockState.label}
                        </span>
                        <Link to={`/watches/${watch.id}`}>
                          <Button variant="outline" size="sm">
                            Voir
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </PageContainer>
    </DashboardLayout>
  )
}

/* WatchesPage.tsx */
