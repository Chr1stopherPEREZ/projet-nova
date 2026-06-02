import { useState, useEffect } from 'react'
import { Pin, CheckCircle, Bell, AlertCircle, Clock } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Card, CardContent, LoadingState, Alert } from '../components/ui'
import { authService } from '../api/client'

interface StatCardProps {
  title: string
  value: string | number
  icon: any
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

function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await authService.getAdminStats()
        setStats(data)
      } catch (err) {
        setError("Impossible de charger les statistiques administrateur")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <DashboardLayout title="Administration">
        <LoadingState message="Chargement de la vision globale..." />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Administration">
        <Alert variant="danger">{error}</Alert>
      </DashboardLayout>
    )
  }

  const kpis = stats?.kpis || {}
  const topDomains = stats?.top_domains || []

  return (
    <DashboardLayout
      title="Dashboard Administration"
      subtitle="Vision globale du système"
    >
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          title="Total suivis actifs"
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
          title="Alertes (7j)"
          value={kpis.alerts_sent_7d || 0}
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
          title="Dernière activité"
          value={kpis.last_check_at ? new Date(kpis.last_check_at).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'}) : "N/A"}
          icon={Clock}
          iconBgColor="bg-info-600"
        />
      </div>

      {/* Top Domains Table */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-text mb-4">Top Domaines surveillés</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Domaine</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Checks</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Changements</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Alertes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topDomains.length > 0 ? (
                  topDomains.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-text font-medium">{row.host}</td>
                      <td className="px-6 py-4 text-gray-600">{row.checks}</td>
                      <td className="px-6 py-4 text-gray-600">{row.changes}</td>
                      <td className="px-6 py-4 text-gray-600">{row.alerts_sent}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      Aucun domaine enregistré
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

export default AdminDashboardPage

/* Admin DashboardPage.tsx */