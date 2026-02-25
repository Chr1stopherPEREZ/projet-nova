import { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, Button, Alert, LoadingState, EmptyState, PageContainer } from '../components/ui'
import { apiFetch } from '../api/client'
import { ArrowLeft, Play, RefreshCw, Clock, ExternalLink, Pause, Power, Trash2 } from 'lucide-react'

interface Watch {
  id: string
  url: string
  label: string | null
  status: string
  stock_state: string
  last_checked_at: string | null
  variant_sku: string | null
  variant_selector: Record<string, string> | null
  variant_meta: {
    color?: string
    size?: string
    colorCode?: string
    source?: string
    options?: Record<string, string>
  } | null
}

interface Check {
  id: string
  checked_at: string | null
  stock_state: string
  http_status: number | null
  error_message: string | null
  details: {
    variant_sku?: string
    color?: string
    size?: string
    available_sizes?: { size: string; available: boolean }[]
    mode?: string
    found?: boolean
    error?: string
  } | null
}

/**
 * Page de détail d'un suivi (Lot 7).
 * - Affiche les informations du suivi et l'historique des checks
 * - Permet de lancer un check manuellement et de gérer le statut/suppression
 */
export default function WatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [watch, setWatch] = useState<Watch | null>(null)
  const [checks, setChecks] = useState<Check[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [runningCheck, setRunningCheck] = useState(false)
  const [runCheckResult, setRunCheckResult] = useState<string | null>(null)
  /* Booléen pour savoir si le résultat du run check est une erreur (true) ou un succès (false) */
  const [runCheckIsError, setRunCheckIsError] = useState(false)
  /* État d'erreur spécifique au chargement de l'historique des checks */
  const [checksError, setChecksError] = useState<string | null>(null)
  /* État de chargement lors du refresh de l'historique */
  const [checksLoading, setChecksLoading] = useState(false)
  /* États pour les actions toggle et delete */
  const [togglingStatus, setTogglingStatus] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchWatch = useCallback(async () => {
    try {
      setError(null)
      const data = await apiFetch<Watch>(`/watches/${id}`)
      setWatch(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    }
  }, [id])

  /* Récupère l'historique des checks pour cette watch */
  const fetchChecks = useCallback(async () => {
    try {
      setChecksLoading(true)
      setChecksError(null)
      const data = await apiFetch<Check[]>(`/watches/${id}/checks`)
      setChecks(data)
    } catch (err) {
      /* En cas d'échec, on stocke l'erreur pour l'afficher à l'utilisateur */
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setChecksError(errorMessage)
      console.error('Erreur lors du chargement des checks:', err)
    } finally {
      setChecksLoading(false)
    }
  }, [id])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchWatch()
      await fetchChecks()
      setLoading(false)
    }
    loadData()
  }, [fetchWatch, fetchChecks])

  /* Lance un check manuellement pour cette watch */
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
      /* Succès : on affiche le message en vert */
      setRunCheckResult('Check exécuté avec succès')
      setRunCheckIsError(false)
      /* Refresh des données après le check */
      await fetchWatch()
      await fetchChecks()
    } catch (err) {
      /* Erreur : on affiche le message en rouge */
      setRunCheckResult(err instanceof Error ? err.message : 'Erreur lors du check')
      setRunCheckIsError(true)
    } finally {
      setRunningCheck(false)
    }
  }

  /* Toggle le statut ACTIVE/PAUSED de la watch */
  const handleToggleStatus = async () => {
    if (!watch || !id) return
    
    const newStatus = watch.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    try {
      setTogglingStatus(true)
      await apiFetch(`/watches/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      })
      /* Refresh pour afficher le nouveau statut */
      await fetchWatch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du changement de statut')
    } finally {
      setTogglingStatus(false)
    }
  }

  /* Supprime la watch après confirmation utilisateur */
  const handleDelete = async () => {
    if (!id) return
    
    /* Confirmation avant suppression */
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce suivi ? Cette action est irréversible.')) {
      return
    }
    
    try {
      setDeleting(true)
      await apiFetch(`/watches/${id}`, {
        method: 'DELETE',
      })
      /* Redirection vers la liste avec message de succès */
      navigate('/watches', { state: { success: 'Suivi supprimé avec succès' } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
      setDeleting(false)
    }
  }

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
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState message="Chargement du suivi..." />
      </DashboardLayout>
    )
  }

  if (error || !watch) {
    return (
      <DashboardLayout>
        <PageContainer title="Erreur">
          <Alert variant="danger">
            {error || 'Suivi non trouvé'}
          </Alert>
          <div className="mt-4">
            <Link to="/watches">
              <Button variant="secondary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la liste
              </Button>
            </Link>
          </div>
        </PageContainer>
      </DashboardLayout>
    )
  }

  const stockState = getStockStateLabel(watch.stock_state)

  return (
    <DashboardLayout>
      <PageContainer
        title={watch.label || 'Détail du suivi'}
        description="Informations et historique des vérifications"
      >
        <div className="mb-4">
          <Link to="/watches" className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à la liste
          </Link>
        </div>

        {/* Watch Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">URL</label>
                <p className="flex items-center gap-2">
                  <a 
                    href={watch.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline flex items-center gap-1"
                  >
                    {watch.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
              
              <div className="flex flex-wrap gap-8">
                <div>
                  <label className="text-sm font-medium text-gray-500">État actuel</label>
                  <p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${stockState.color}`}>
                      {stockState.label}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Statut</label>
                  <p className="text-text">{watch.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Dernière vérification</label>
                  <p className="text-text">{formatDate(watch.last_checked_at)}</p>
                </div>
              </div>

              {/* Informations de variante surveillée */}
              {watch.variant_sku && (
                <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <label className="text-sm font-medium text-primary-700 block mb-2">
                    Variante surveillée
                  </label>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {watch.variant_selector ? (
                      Object.entries(watch.variant_selector).map(([name, value]) => (
                        <div key={name}>
                          <span className="text-primary-600 font-medium">{name}:</span>{' '}
                          <span className="text-primary-800">{value}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        {watch.variant_meta?.color && (
                          <div>
                            <span className="text-primary-600 font-medium">Coloris:</span>{' '}
                            <span className="text-primary-800">{watch.variant_meta.color}</span>
                          </div>
                        )}
                        {watch.variant_meta?.size && (
                          <div>
                            <span className="text-primary-600 font-medium">Taille:</span>{' '}
                            <span className="text-primary-800">{watch.variant_meta.size}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-xs text-primary-500">
                      SKU: {watch.variant_sku}
                    </p>
                    {watch.variant_meta?.source && (
                      <p className="text-xs text-primary-400 font-italic">
                        Source: {watch.variant_meta.source}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Avertissement si pas de variante */}
              {!watch.variant_sku && (
                <div className="mt-4 p-3 bg-warning-50 rounded-lg border border-warning-200">
                  <p className="text-sm text-warning-700">
                    ⚠️ Mode global: surveillance de tout le produit (moins précis)
                  </p>
                </div>
              )}

              {/* Actions sur la watch */}
              <div className="pt-4 border-t flex flex-wrap gap-3">
                <Button onClick={handleRunCheck} isLoading={runningCheck}>
                  <Play className="h-4 w-4 mr-2" />
                  Lancer un check
                </Button>
                
                {/* Bouton toggle activer/désactiver */}
                <Button 
                  variant={watch.status === 'ACTIVE' ? 'secondary' : 'primary'}
                  onClick={handleToggleStatus} 
                  isLoading={togglingStatus}
                >
                  {watch.status === 'ACTIVE' ? (
                    <><Pause className="h-4 w-4 mr-2" />Mettre en pause</>
                  ) : (
                    <><Power className="h-4 w-4 mr-2" />Activer</>
                  )}
                </Button>
                
                {/* Bouton supprimer */}
                <Button 
                  variant="danger" 
                  onClick={handleDelete} 
                  isLoading={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
              
              {/* Affichage du résultat du run check avec couleur basée sur runCheckIsError */}
              {runCheckResult && (
                <div className="mt-3">
                  <span className={`text-sm ${runCheckIsError ? 'text-danger-500' : 'text-success-600'}`}>
                    {runCheckResult}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Checks History Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-600" />
                Historique des vérifications
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={fetchChecks}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Affichage de l'erreur si le chargement de l'historique a échoué */}
            {checksError && (
              <Alert variant="danger" className="mb-4">
                Impossible de charger l'historique des vérifications.
              </Alert>
            )}
            {/* Affichage du loader pendant le refresh de l'historique */}
            {checksLoading && (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-5 w-5 animate-spin text-primary-600" />
                <span className="ml-2 text-sm text-gray-600">Chargement...</span>
              </div>
            )}
            {!checksLoading && !checksError && checks.length === 0 ? (
              <EmptyState
                title="Aucune vérification"
                description="Lancez un check pour voir l'historique des vérifications."
              />
            ) : !checksLoading && !checksError && checks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Date</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">État</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Détails</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">HTTP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checks.map((check) => {
                      const checkState = getStockStateLabel(check.stock_state)
                      const hasDetails = check.details && (check.details.variant_sku || check.details.available_sizes)
                      return (
                        <tr key={check.id} className="border-b last:border-0">
                          <td className="py-2 px-3 text-text">{formatDate(check.checked_at)}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${checkState.color}`}>
                              {checkState.label}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            {hasDetails ? (
                              <div className="text-xs">
                                {check.details?.color && check.details?.size && (
                                  <span className="text-gray-600">
                                    {check.details.color} / {check.details.size}
                                  </span>
                                )}
                                {check.details?.available_sizes && check.details.available_sizes.length > 0 && (
                                  <div className="mt-1">
                                    <span className="text-gray-500">Tailles dispo: </span>
                                    <span className="text-success-600">
                                      {check.details.available_sizes.map(s => s.size).join(', ')}
                                    </span>
                                  </div>
                                )}
                                {check.details?.mode === 'COLOR_ONLY' && (
                                  <span className="text-primary-500 text-xs">(mode coloris)</span>
                                )}
                                {check.details?.error && (
                                  <span className="text-danger-500">{check.details.error}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                {check.error_message || '-'}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-text">{check.http_status || '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </PageContainer>
    </DashboardLayout>
  )
}

/* WatchDetailPage.tsx */
