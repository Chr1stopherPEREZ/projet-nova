import { ExternalLink, RefreshCw, SquarePen, Trash2, FileText } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { StatusBadge, StatCard } from '../components/ui/DashboardUI';
import { PriceChart } from '../components/ui/PriceChart';
import { AvailabilityCalendar } from '../components/ui/AvailabilityCalendar';

/**
 * WatchDetailPage - Détail d'un suivi (V2)
 */
export default function WatchDetailPage() {
  /* Note: La récupération réelle via apiFetch(`/watches/${id}`)
  est mise de côté pour l'intégration visuelle V2. */
  const watch = {
    name: 'Lampe chauffe-bougie « Halo »',
    source: 'lesprit-belle.fr/products/lampe-halo',
    status: 'in_stock',
    created_at: '12 mai 2026',
    freq: '30 min',
    thumb: 'EB'
  };

  const priceData = [49.90, 49.90, 49.90, 49.90, 47.90, 47.90, 49.90, 49.90, 49.90, 49.90, 44.90, 44.90, 49.90, 49.90, 49.90];

  const history = [
    { time: "Aujourd'hui · 14:32", status: 'in_stock', price: '49,90 €', note: 'Retour en stock détecté · E-mail envoyé à christopher@example.test', dot: 'success' },
    { time: "Aujourd'hui · 14:02", status: 'out', price: '49,90 €', note: 'Vérification réussie', dot: 'error' },
    { time: "Aujourd'hui · 13:32", status: 'out', price: '49,90 €', note: 'Vérification réussie', dot: 'error' },
    { time: "Aujourd'hui · 13:02", status: 'out', price: '49,90 €', note: 'Vérification réussie', dot: 'error' },
    { time: "Aujourd'hui · 12:32", status: 'error', price: '—', note: 'Échec : code HTTP 502 · réessai planifié', dot: 'warning' },
    { time: "Aujourd'hui · 12:02", status: 'out', price: '49,90 €', note: 'Vérification réussie', dot: 'error' },
    { time: "Hier · 23:32", status: 'in_stock', price: '44,90 €', note: 'Retour en stock · prix en baisse', dot: 'success' },
    { time: "Hier · 23:02", status: 'out', price: '49,90 €', note: 'Vérification réussie', dot: 'error' },
  ];

  const getDotColor = (dot: string) => {
    if (dot === 'success') return 'bg-success';
    if (dot === 'error') return 'bg-error';
    if (dot === 'warning') return 'bg-warning';
    return 'bg-ink3';
  };

  return (
    <DashboardLayout breadcrumb={["Mes suivis", watch.name]}>
      {/* Header Produit */}
      <div className="flex flex-col md:flex-row items-start gap-4 mb-7">
        <div className="w-14 h-14 rounded-lg bg-muted border border-border flex items-center justify-center text-[13px] font-semibold text-ink3 shrink-0">
          {watch.thumb}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2.5 mb-1.5">
            <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-ink">{watch.name}</h1>
            <StatusBadge status={watch.status} />
          </div>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[13px] text-ink2">
            <a href={`https://${watch.source}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <ExternalLink size={14} />
              {watch.source}
            </a>
            <span className="text-border-strong">•</span>
            <span>Créé le {watch.created_at}</span>
            <span className="text-border-strong">•</span>
            <span>Vérifié toutes les {watch.freq}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="btn border-border flex items-center gap-2">
            <RefreshCw size={14} strokeWidth={1.8} />
            Vérifier maintenant
          </button>
          <button className="btn border-border flex items-center gap-2">
            <SquarePen size={14} strokeWidth={1.8} />
            Modifier
          </button>
          <button className="btn border-border text-error hover:bg-error-soft flex items-center justify-center w-9 p-0">
            <Trash2 size={14} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          label="Prix actuel" 
          value={<span className="font-mono">{watch.status === 'in_stock' ? '49,90 €' : '—'}</span>} 
          delta="Min 30 j : 44,90 €" 
        />
        <StatCard 
          label="Disponibilité · 30 j" 
          value={<>37<span className="text-[16px] text-ink2 font-medium ml-1">%</span></>} 
          delta="11 jours en stock" 
        />
        <StatCard 
          label="Vérifications · 30 j" 
          value="182" 
          delta="180 réussies · 2 en erreur" 
        />
        <StatCard 
          label="Alertes envoyées" 
          value="2" 
          delta="Dernière à 14:32" 
        />
      </div>

      {/* Chart + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 mb-4">
        {/* Évolution du prix */}
        <div className="bg-surface border border-border rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-[14px] font-semibold text-ink">Évolution du prix</h2>
              <div className="text-[12.5px] text-ink2 mt-0.5">30 derniers jours</div>
            </div>
            <div className="inline-flex bg-bg border border-border rounded-md p-0.5 gap-0.5">
              <button className="px-2.5 py-1 rounded text-[12px] font-medium text-ink2 hover:text-ink">7 j</button>
              <button className="px-2.5 py-1 rounded text-[12px] font-medium bg-muted text-ink">30 j</button>
            </div>
          </div>
          <div className="p-4">
            <PriceChart data={priceData} />
          </div>
        </div>

        {/* Disponibilité */}
        <div className="bg-surface border border-border rounded-lg shadow-sm">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-[14px] font-semibold text-ink">Disponibilité · 30 j</h2>
          </div>
          <div className="p-5">
            <AvailabilityCalendar />
          </div>
        </div>
      </div>

      {/* Historique */}
      <div className="bg-surface border border-border rounded-lg shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-[14px] font-semibold text-ink">Historique des vérifications</h2>
          <button className="btn sm ghost flex items-center gap-2">
            <FileText size={14} />
            Exporter CSV
          </button>
        </div>
        <div className="divide-y divide-border">
          {history.map((row, idx) => (
            <div key={idx} className="grid grid-cols-[14px_110px_90px_1fr_80px] gap-3.5 px-5 py-3 items-center text-[13px]">
              <div className={`w-2 h-2 rounded-full ${getDotColor(row.dot)}`} />
              <div className="text-[12.5px] text-ink2 whitespace-nowrap">{row.time}</div>
              <div>
                <StatusBadge status={row.status} />
              </div>
              <div className="text-ink2 truncate">{row.note}</div>
              <div className="font-mono text-ink text-right">{row.price}</div>
            </div>
          ))}
        </div>
        <div className="p-3.5 text-center border-top border-border">
          <button className="btn sm ghost w-full text-ink2 font-medium">Voir les vérifications plus anciennes</button>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* WatchDetailPage.tsx */
