import { Search, ChevronRight } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { StatCard, DashboardCard, Segment } from '../components/ui/DashboardUI'
import { LineChart } from '../components/ui/LineChart'

const KPI = [
  { label: 'Utilisateurs', value: '5', delta: '1 admin · 4 actifs' },
  { label: 'Suivis actifs', value: '9', delta: '~2 par utilisateur' },
  { label: 'Vérifications · 7 j', value: '312', delta: '~ 45 par jour' },
  { label: 'Taux de réussite', value: <span className="flex items-baseline gap-1">99,0<span className="text-base text-ink2 font-medium"> %</span></span>, delta: '3 vérifs en erreur' },
];

const CHART_DATA = [
  { label: 'Lun', checks: 142, available: 28 },
  { label: 'Mar', checks: 156, available: 31 },
  { label: 'Mer', checks: 148, available: 22 },
  { label: 'Jeu', checks: 162, available: 35 },
  { label: 'Ven', checks: 158, available: 30 },
  { label: 'Sam', checks: 124, available: 19 },
  { label: 'Dim', checks: 138, available: 24 },
];

const SYSTEM = [
  { label: 'API FastAPI', detail: 'Port 8000 · réponses < 200 ms', status: 'ok' },
  { label: 'PostgreSQL', detail: 'Port 5432 · 6 tables', status: 'ok' },
  { label: 'Scheduler', detail: 'Cron interne · dernier passage il y a 1 min', status: 'ok' },
  { label: 'Mailhog (SMTP)', detail: 'Port 1025 · interface web 8025', status: 'ok' },
];

const USERS = [
  { id: 1, name: 'Christopher', email: 'christopher@example.test', role: 'Admin', count: 3, status: 'active', joined: '01 avr. 2026' },
  { id: 2, name: 'Florent', email: 'florent@example.test', role: 'Utilisateur', count: 2, status: 'active', joined: '02 mai 2026' },
  { id: 3, name: 'Quentin', email: 'quentin@example.test', role: 'Utilisateur', count: 2, status: 'active', joined: '08 mai 2026' },
  { id: 4, name: 'Mathis', email: 'mathis@example.test', role: 'Utilisateur', count: 1, status: 'active', joined: '12 mai 2026' },
  { id: 5, name: 'Estelle', email: 'estelle@example.test', role: 'Utilisateur', count: 1, status: 'active', joined: 'Hier' },
];

function AdminDashboardPage() {
  return (
    <DashboardLayout 
      title="Administration"
      topbarAction={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-2 py-0.5 text-xs font-medium text-ink transition-colors shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span>Système opérationnel</span>
        </span>
      }
    >
      <header className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold -tracking-[0.015em] text-ink">Vue d'ensemble</h1>
          <p className="text-[13.5px] text-ink2 mt-1">Données issues de la base PostgreSQL.</p>
        </div>
        <Segment options={['24h', '7 jours', '30 jours']} active="7 jours" />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {KPI.map(k => (
          <StatCard key={k.label} label={k.label} value={k.value} delta={k.delta} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        {/* Activité globale */}
        <DashboardCard 
          title="Activité globale" 
          noPadding
        >
          <div className="px-5 py-4 border-b border-border bg-bg/30">
            <p className="text-[12.5px] text-ink2">Vérifications exécutées par le scheduler</p>
          </div>
          <div className="p-3">
            <LineChart data={CHART_DATA} />
          </div>
        </DashboardCard>

        {/* État du système */}
        <DashboardCard 
          title="État du système" 
          noPadding
        >
          <div className="divide-y divide-border">
            {SYSTEM.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-bg/50 transition-colors">
                <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-ink truncate">{s.label}</div>
                  <div className="text-[12px] text-ink2 truncate">{s.detail}</div>
                </div>
                <span className="text-[12px] font-medium text-success">OK</span>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      {/* Utilisateurs */}
      <DashboardCard 
        title="Utilisateurs" 
        className="mt-4"
        noPadding
        right={
          <div className="flex items-center gap-3">
            <p className="text-[12.5px] text-ink2 hidden sm:block">Tous les comptes (5)</p>
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink3" size={14} />
              <input 
                className="h-8 w-full rounded-md border border-border bg-bg/50 pl-8 pr-3 text-[12.5px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" 
                placeholder="Rechercher..." 
              />
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-bg/30 text-[12px] font-medium text-ink2 uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Utilisateur</th>
                <th className="px-5 py-3 font-medium">Rôle</th>
                <th className="px-5 py-3 font-medium">Suivis</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Inscription</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-[13px]">
              {USERS.map(u => (
                <tr key={u.id} className="hover:bg-bg/50 transition-colors group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center font-semibold text-[12px] shrink-0">
                        {u.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-ink truncate">{u.name}</div>
                        <div className="text-[12px] text-ink2 truncate">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[12px] font-medium ${
                      u.role === 'Admin' ? 'bg-primary-soft text-primary' : 'bg-muted text-ink2'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-ink2">{u.count}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 text-success font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      Actif
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink3">{u.joined}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="p-1.5 rounded-md text-ink3 hover:bg-muted hover:text-ink transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </DashboardLayout>
  )
}

export default AdminDashboardPage

/* Admin DashboardPage.tsx */