import { Pin, CheckCircle, Bell, TrendingUp, TrendingDown } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Card, CardContent } from '../components/ui'

interface StatCardProps {
  title: string
  value: string | number
  icon: typeof Pin
  iconBgColor: string
  trend?: { value: string; isPositive: boolean }
}

function StatCard({ title, value, icon: Icon, iconBgColor, trend }: StatCardProps) {
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
        {trend && (
          <div className="mt-4 flex items-center gap-1 text-sm">
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-success-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-danger-500" />
            )}
            <span className={trend.isPositive ? 'text-success-500' : 'text-danger-500'}>
              {trend.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DashboardPage() {
  return (
    <DashboardLayout
      title="Bonjour, Utilisateur !"
      subtitle="Voici un aperçu de l'activité du jour"
    >
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Suivis actifs"
          value={759}
          icon={Pin}
          iconBgColor="bg-primary-600"
          trend={{ value: '2%', isPositive: false }}
        />

        <StatCard
          title="Checks aujourd'hui"
          value="1.102"
          icon={CheckCircle}
          iconBgColor="bg-primary-600"
          trend={{ value: '91%', isPositive: true }}
        />

        <StatCard
          title="Alertes envoyées"
          value={26}
          icon={Bell}
          iconBgColor="bg-primary-600"
          trend={{ value: '4%', isPositive: false }}
        />
      </div>

      {/* Additional stats row */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="py-6">
            <p className="text-sm font-medium text-gray-600">Dernier check</p>
            <p className="text-3xl font-bold text-text mt-2">637</p>
            <div className="mt-4 flex items-center gap-1 text-sm">
              <TrendingDown className="h-4 w-4 text-danger-500" />
              <span className="text-danger-500">23%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <p className="text-sm font-medium text-gray-600">Erreurs (7 jours)</p>
            <p className="text-3xl font-bold text-text mt-2">24</p>
            <div className="mt-4 flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-success-500" />
              <span className="text-success-500">82%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default DashboardPage

/* DashboardPage.tsx */