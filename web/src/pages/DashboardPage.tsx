import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Pin, CheckCircle, Bell, AlertCircle, Clock, Search, Globe, Plus } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Card, CardContent, LoadingState, Alert, Input, EmptyState, Button } from '../components/ui'
import { authService } from '../api/client'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  iconBgColor: string
}

function StatCard({ title, value, icon: Icon, iconBgColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-text mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${iconBgColor}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardStats {
  kpis: {
    active_watches: number
    checks_today: number
    changes_7d: number
    errors_7d: number
    last_check_at: string | null
  }
  table: Array<{
    host: string
    checks: number
    changes: number
    alerts_sent: number
  }>
}

function DashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [navAlert] = useState<string | null>(location.state?.error || null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await authService.getStats()
        setStats(data)
      } catch (err: unknown) {
        let msg = "Erreur lors du calcul des statistiques. Réessayez."
        const error = err as Error
        if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
          msg = "Session expirée, veuillez vous reconnecter."
        } else if (error.message && error.message.includes('500')) {
          msg = "Erreur serveur (500) lors de la récupération des statistiques."
        } else if (error.message) {
          msg = error.message
        }
        setError(msg)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <DashboardLayout title="Tableau de bord">
        <LoadingState message="Chargement de vos statistiques..." />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Tableau de bord">
        <div className="max-w-2xl mx-auto mt-12 space-y-6 text-center">
          <Alert variant="danger">{error}</Alert>
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
            <Button 
              onClick={() => navigate('/login')}
            >
              Se reconnecter
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const kpis = stats?.kpis || {
    active_watches: 0,
    checks_today: 0,
    changes_7d: 0,
    errors_7d: 0,
    last_check_at: null
  }
  const table = stats?.table || []
  const hasNoWatches = kpis.active_watches === 0 && table.length === 0
  
  const filteredTable = table.filter((row) => 
    row.host.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (hasNoWatches) {
    return (
      <DashboardLayout
        title="Mon Tableau de bord"
        subtitle="Aperçu de vos surveillances"
      >
        {navAlert && (
          <Alert variant="danger" className="mb-6">{navAlert}</Alert>
        )}
        <div className="mt-12">
          <EmptyState
            icon={<Pin className="h-12 w-12" />}
            title="Aucun suivi pour le moment"
            description="Commencez par créer un suivi pour voir vos statistiques (checks, disponibilité, etc.)."
            action={
              <Button 
                onClick={() => navigate('/watches/new')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Créer un suivi
              </Button>
            }
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Mon Tableau de bord"
      subtitle="Aperçu de vos surveillances"
    >
      {navAlert && (
        <Alert variant="danger" className="mb-6">{navAlert}</Alert>
      )}
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          title="Suivis actifs"
          value={kpis.active_watches || 0}
          icon={Pin}
          iconBgColor="bg-primary-600"
        />
        <StatCard
          title="Checks aujourd'hui"
          value={kpis.checks_today || 0}
          icon={CheckCircle}
          iconBgColor="bg-success-600"
        />
        <StatCard
          title="Changements (7j)"
          value={kpis.changes_7d || 0}
          icon={Bell}
          iconBgColor="bg-warning-600"
        />
        <StatCard
          title="Erreurs (7j)"
          value={kpis.errors_7d || 0}
          icon={AlertCircle}
          iconBgColor="bg-danger-600"
        />
        <StatCard
          title="Dernier check"
          value={kpis.last_check_at ? new Date(kpis.last_check_at).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}) : "N/A"}
          icon={Clock}
          iconBgColor="bg-info-600"
        />
      </div>

      {/* Performance Table */}
      <div className="mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <h2 className="text-xl font-bold text-text">Performance des surveillances</h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un site..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Site surveillé</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Checks</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Changements</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Alertes envoyées</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTable.length > 0 ? (
                  filteredTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-text">{row.host}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{row.checks}</td>
                      <td className="px-6 py-4 text-gray-600">{row.changes}</td>
                      <td className="px-6 py-4 text-gray-600">{row.alerts_sent}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Aucune donnée disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage

/* DashboardPage.tsx */