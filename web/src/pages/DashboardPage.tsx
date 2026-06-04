import { Plus, ArrowRight } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { StatCard, DashboardCard, StatusBadge, Segment } from '../components/ui/DashboardUI'
import { LineChart } from '../components/ui/LineChart'
import { Sparkline } from '../components/ui/Sparkline'

const STATS = [
  { label: 'Suivis actifs', value: '5', delta: '2 en stock · 3 en rupture' },
  { label: 'Vérifications · 7 j', value: '106', delta: '~ 15 par jour' },
  { label: 'Retours en stock', value: '3', delta: 'Dernier il y a 8 min' },
  { label: 'Alertes envoyées', value: '3', delta: 'Par e-mail' },
];

const CHART_DATA = [
  { label: 'Lun', checks: 14, available: 2 },
  { label: 'Mar', checks: 16, available: 3 },
  { label: 'Mer', checks: 15, available: 1 },
  { label: 'Jeu', checks: 18, available: 4 },
  { label: 'Ven', checks: 17, available: 2 },
  { label: 'Sam', checks: 12, available: 0 },
  { label: 'Dim', checks: 14, available: 3 },
];

const TRACKINGS = [
  { id: 1, name: 'Lampe « Halo »', source: "L'Esprit Belle", status: 'in_stock', trend: [2, 2, 3, 2, 3, 5, 7] },
  { id: 2, name: 'Coffret « Solstice »', source: 'Cassiopée Bougie', status: 'out', trend: [6, 5, 5, 4, 3, 3, 2] },
  { id: 3, name: 'Bougie « Figuier »', source: 'Cassiopée Bougie', status: 'in_stock', trend: [5, 5, 6, 5, 6, 6, 6] },
  { id: 4, name: 'Montre « Horizon »', source: 'Terre de France', status: 'out', trend: [3, 3, 2, 2, 2, 2, 2] },
  { id: 5, name: 'Pull « Brume »', source: 'Terre de France', status: 'sold_out', trend: [3, 3, 3, 3, 3, 3, 3] },
];

const RECENT_ACTIVITY = [
  { id: 1, time: 'il y a 8 min', product: 'Lampe chauffe-bougie « Halo »', source: "L'Esprit Belle", from: 'out', to: 'in_stock', price: '49,90 €' },
  { id: 2, time: 'il y a 38 min', product: 'Coffret 3 bougies « Solstice »', source: 'Cassiopée Bougie', from: 'in_stock', to: 'out', price: '59,00 €' },
  { id: 3, time: 'il y a 2 h', product: 'Bougie artisanale « Figuier »', source: 'Cassiopée Bougie', from: 'in_stock', to: 'in_stock', price: '24,90 €' },
  { id: 4, time: 'il y a 3 h', product: 'Pull mérinos « Brume »', source: 'Terre de France', from: 'out', to: 'sold_out', price: '—' },
];

function DashboardPage() {
  return (
    <DashboardLayout 
      title="Tableau de bord"
      topbarAction={
        <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors shadow-sm">
          <Plus size={16} strokeWidth={2} />
          <span>Nouveau suivi</span>
        </button>
      }
    >
      <header className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold -tracking-[0.015em] text-ink">Bonjour Christopher</h1>
          <p className="text-[13.5px] text-ink2 mt-1">Aperçu de vos suivis sur les 7 derniers jours.</p>
        </div>
        <Segment options={['24h', '7 jours', '30 jours']} active="7 jours" />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map(s => (
          <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        {/* Graphique d'activité */}
        <DashboardCard 
          title="Activité" 
          className="overflow-hidden"
          noPadding
        >
          <div className="px-5 py-4 border-b border-border bg-bg/30">
            <div className="flex gap-4 text-[12.5px] text-ink2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Disponibilités détectées</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-ink3 border-t border-dashed border-ink3" />
                <span>Vérifications totales</span>
              </div>
            </div>
          </div>
          <div className="p-3">
            <LineChart data={CHART_DATA} />
          </div>
        </DashboardCard>

        {/* Mes suivis */}
        <DashboardCard 
          title="Mes suivis" 
          right={<button className="text-[12.5px] font-medium text-primary hover:underline">Tout voir</button>}
          noPadding
        >
          <div className="divide-y divide-border">
            {TRACKINGS.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 px-4 hover:bg-bg/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center font-semibold text-xs shrink-0">
                  {t.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-ink truncate">{t.name}</div>
                  <div className="text-[11.5px] text-ink2 truncate">{t.source}</div>
                </div>
                <div className="shrink-0 px-2">
                  <Sparkline 
                    data={t.trend} 
                    color={t.status === 'in_stock' ? '#16A34A' : t.status === 'out' ? '#DC2626' : '#94A3B8'} 
                  />
                </div>
                <div className="shrink-0 w-20 flex justify-end">
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      {/* Activité récente */}
      <DashboardCard 
        title="Activité récente" 
        className="mt-4"
        right={
          <button className="inline-flex items-center gap-1 text-[12.5px] text-ink2 hover:text-ink transition-colors">
            <span>Voir l'historique</span>
            <ArrowRight size={14} />
          </button>
        }
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-bg/30">
                <th className="px-5 py-3 text-[12px] font-medium text-ink2 uppercase tracking-wider">Quand</th>
                <th className="px-5 py-3 text-[12px] font-medium text-ink2 uppercase tracking-wider">Produit</th>
                <th className="px-5 py-3 text-[12px] font-medium text-ink2 uppercase tracking-wider">Source</th>
                <th className="px-5 py-3 text-[12px] font-medium text-ink2 uppercase tracking-wider">Changement</th>
                <th className="px-5 py-3 text-[12px] font-medium text-ink2 uppercase tracking-wider">Prix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {RECENT_ACTIVITY.map(a => (
                <tr key={a.id} className="hover:bg-bg/50 transition-colors">
                  <td className="px-5 py-3 text-[13px] text-ink3 whitespace-nowrap">{a.time}</td>
                  <td className="px-5 py-3 text-[13px] font-medium text-ink">{a.product}</td>
                  <td className="px-5 py-3 text-[13px] text-ink2">{a.source}</td>
                  <td className="px-5 py-3 text-[13px]">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={a.from} />
                      <ArrowRight size={12} className="text-ink3" />
                      <StatusBadge status={a.to} />
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px] font-mono text-ink text-right">{a.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </DashboardLayout>
  )
}

export default DashboardPage

/* DashboardPage.tsx */