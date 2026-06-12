import { useState, useEffect, useCallback } from 'react'
import { Plus, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import { StatCard, DashboardCard, StatusBadge, Segment } from '../components/ui/DashboardUI'
import { LineChart } from '../components/ui/LineChart'
import { Sparkline } from '../components/ui/Sparkline'
import { apiFetch } from '../api/client'

interface DashboardStats {
  kpis: {
    active_watches: number;
    in_stock_count: number;
    out_of_stock_count: number;
    checks_today: number;
    checks_7d: number;
    changes_7d: number;
    last_check_at: string | null;
    errors_7d: number;
    alerts_sent_7d: number;
    unread_notifications_count: number;
  };
  table: any[];
  recent_activity: any[];
}

interface Watch {
  id: string;
  label: string | null;
  site_name: string | null;
  stock_state: string;
}

function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, watchesRes] = await Promise.all([
        apiFetch<DashboardStats>('/stats/dashboard'),
        apiFetch<Watch[]>('/watches')
      ]);
      setData(statsRes);
      setWatches(watchesRes);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Impossible de charger les données du tableau de bord');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <DashboardLayout title="Tableau de bord">
        <div className="flex flex-col items-center justify-center py-20 text-ink2">
          <Loader2 size={32} className="animate-spin mb-4 text-primary" />
          <p className="text-[14px]">Chargement de vos statistiques...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout title="Tableau de bord">
        <div className="max-w-md mx-auto mt-20 p-6 bg-white border border-border rounded-xl text-center shadow-sm">
          <div className="w-12 h-12 bg-error-soft text-error rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-[16px] font-bold text-ink mb-2">Une erreur est survenue</h2>
          <p className="text-[13px] text-ink2 mb-6">{error}</p>
          <button 
            onClick={() => fetchData()}
            className="btn bg-primary text-white w-full h-10"
          >
            Réessayer
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const kpis = data.kpis;

  const STATS_CARDS = [
    { 
      label: 'Suivis actifs', 
      value: kpis.active_watches.toString(), 
      delta: `${kpis.in_stock_count} en stock · ${kpis.out_of_stock_count} en rupture` 
    },
    { 
      label: 'Vérifications · 7 j', 
      value: kpis.checks_7d.toString(), 
      delta: `Aujourd'hui : ${kpis.checks_today}` 
    },
    { 
      label: 'Retours en stock', 
      value: kpis.changes_7d.toString(), 
      delta: kpis.changes_7d > 0 ? 'Sur les 7 derniers jours' : 'Aucun récemment' 
    },
    { 
      label: 'Alertes envoyées', 
      value: kpis.alerts_sent_7d.toString(), 
      delta: 'Par e-mail' 
    },
  ];

  /* Simulation CHART_DATA simplifiée */
  const CHART_DATA = [
    { label: 'Lun', checks: Math.floor(kpis.checks_7d / 7), available: Math.floor(kpis.changes_7d / 7) },
    { label: 'Mar', checks: Math.floor(kpis.checks_7d / 6.5), available: 0 },
    { label: 'Mer', checks: Math.floor(kpis.checks_7d / 7.2), available: kpis.changes_7d },
    { label: 'Jeu', checks: Math.floor(kpis.checks_7d / 6.8), available: 0 },
    { label: 'Ven', checks: Math.floor(kpis.checks_7d / 7.5), available: 0 },
    { label: 'Sam', checks: Math.floor(kpis.checks_7d / 8), available: 0 },
    { label: 'Dim', checks: kpis.checks_today, available: 0 },
  ];

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    
    if (diffMin < 1) return 'à l\'instant';
    if (diffMin < 60) return `il y a ${diffMin} min`;
    if (diffH < 24) return `il y a ${diffH} h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const mapStatus = (status: string) => {
    switch (status) {
      case 'IN_STOCK': return 'in_stock';
      case 'OUT_OF_STOCK': return 'out';
      case 'SOLD_OUT': return 'sold_out';
      default: return 'unknown';
    }
  };

  return (
    <DashboardLayout 
      title="Tableau de bord"
      topbarAction={
        <Link to="/watches/new" className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition-colors shadow-sm">
          <Plus size={16} strokeWidth={2} />
          <span>Nouveau suivi</span>
        </Link>
      }
    >
      <header className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-semibold -tracking-[0.015em] text-ink">Tableau de bord</h1>
          <p className="text-[13.5px] text-ink2 mt-1">Aperçu de vos suivis sur les 7 derniers jours.</p>
        </div>
        <Segment options={['24h', '7 jours', '30 jours']} active="7 jours" />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS_CARDS.map(s => (
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
          right={<Link to="/watches" className="text-[12.5px] font-medium text-primary hover:underline">Tout voir</Link>}
          noPadding
        >
          <div className="divide-y divide-border">
            {watches.length === 0 ? (
              <div className="p-8 text-center text-ink3 text-[13px]">
                Aucun suivi en cours.
              </div>
            ) : (
              watches.slice(0, 5).map(t => (
                <div 
                  key={t.id} 
                  onClick={() => navigate(`/watches/${t.id}`)}
                  className="flex items-center gap-3 p-3 px-4 hover:bg-bg/50 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center font-semibold text-xs shrink-0">
                    {(t.label || 'P')[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-ink truncate">{t.label || "Produit sans nom"}</div>
                    <div className="text-[11.5px] text-ink2 truncate">{t.site_name || "Boutique"}</div>
                  </div>
                  <div className="shrink-0 px-2">
                    <Sparkline 
                      data={[2, 2, 3, 2, 3, 5, 7]} 
                      color={mapStatus(t.stock_state) === 'in_stock' ? '#16A34A' : mapStatus(t.stock_state) === 'out' ? '#DC2626' : '#94A3B8'} 
                    />
                  </div>
                  <div className="shrink-0 w-20 flex justify-end">
                    <StatusBadge status={mapStatus(t.stock_state)} />
                  </div>
                </div>
              ))
            )}
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
                <th className="px-5 py-3 text-[12px] font-medium text-ink2 uppercase tracking-wider">État</th>
                <th className="px-5 py-3 text-[12px] font-medium text-ink2 uppercase tracking-wider">Prix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.recent_activity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-ink3 text-[13px]">
                    Aucune activité récente.
                  </td>
                </tr>
              ) : (
                data.recent_activity.map(a => (
                  <tr 
                    key={a.id} 
                    onClick={() => navigate(`/watches/${a.watch_id}`)}
                    className="hover:bg-bg/50 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3 text-[13px] text-ink3 whitespace-nowrap">{formatRelativeTime(a.checked_at)}</td>
                    <td className="px-5 py-3 text-[13px] font-medium text-ink">{a.product_name}</td>
                    <td className="px-5 py-3 text-[13px] text-ink2">{a.site_name}</td>
                    <td className="px-5 py-3 text-[13px]">
                      <StatusBadge status={mapStatus(a.to_state)} />
                    </td>
                    <td className="px-5 py-3 text-[13px] font-mono text-ink text-right">
                      {a.price ? `${a.price} ${a.currency || '€'}` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </DashboardLayout>
  )
}

export default DashboardPage

/* DashboardPage.tsx */