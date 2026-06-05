import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronDown, ExternalLink, SquarePen, Inbox } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { StatusBadge } from '../components/ui/DashboardUI';
import { Sparkline } from '../components/ui/Sparkline';

const MOCK_WATCHES = [
  { 
    id: '1', 
    name: 'Lampe chauffe-bougie « Halo »', 
    source: "L'Esprit Belle", 
    status: 'in_stock', 
    price: '49,90 €', 
    last: 'il y a 8 min', 
    freq: '15 min', 
    trend: [2,2,3,2,3,5,7] 
  },
  { 
    id: '2', 
    name: 'Coffret 3 bougies « Solstice »', 
    source: 'Cassiopée Bougie', 
    status: 'out', 
    price: '59,00 €', 
    last: 'il y a 12 min', 
    freq: '30 min', 
    trend: [6,5,5,4,3,3,2] 
  },
  { 
    id: '3', 
    name: 'Bougie artisanale « Figuier »', 
    source: 'Cassiopée Bougie', 
    status: 'in_stock', 
    price: '24,90 €', 
    last: 'il y a 4 min', 
    freq: '1 h', 
    trend: [5,5,6,5,6,6,6] 
  },
  { 
    id: '4', 
    name: 'Montre bois « Horizon »', 
    source: 'Terre de France', 
    status: 'out', 
    price: '129,00 €', 
    last: 'il y a 6 min', 
    freq: '30 min', 
    trend: [3,3,2,2,2,2,2] 
  },
  { 
    id: '5', 
    name: 'Pull mérinos « Brume »', 
    source: 'Terre de France', 
    status: 'sold_out', 
    price: '—', 
    last: 'il y a 22 min', 
    freq: '1 h', 
    trend: [3,3,3,3,3,3,3] 
  },
];

/**
 * WatchesPage - Liste des suivis (V2)
 */
export default function WatchesPage() {
  const [items] = useState(MOCK_WATCHES);
  const [filter, setFilter] = useState('Tous');

  /* Calcul des compteurs pour le segment */
  const counts = {
    Tous: items.length,
    'En stock': items.filter(i => i.status === 'in_stock').length,
    Rupture: items.filter(i => i.status === 'out').length,
    Inconnu: items.filter(i => i.status === 'unknown').length,
  };

  const getThumbInitials = (name: string) => {
    return name.replace(/[^A-Z0-9]/g, '').slice(0, 2);
  };

  const getSparklineColor = (status: string) => {
    if (status === 'out') return '#DC2626';
    if (status === 'unknown') return '#94A3B8';
    return '#16A34A';
  };

  return (
    <DashboardLayout 
      title="Mes suivis"
      topbarAction={
        <Link to="/watches/new" className="btn primary hidden md:flex items-center gap-2">
          <Plus size={16} strokeWidth={2} />
          Nouveau suivi
        </Link>
      }
    >
      {/* Page Header */}
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-ink">Mes suivis</h1>
        <p className="text-[13.5px] text-ink2 mt-1">{items.length} produits surveillés.</p>
      </div>

      {items.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-5 text-center bg-surface border border-border rounded-lg">
          <div className="w-12 h-12 rounded-xl bg-muted grid place-items-center text-ink3 mb-4">
            <Inbox size={20} strokeWidth={1.8} />
          </div>
          <h3 className="text-[15px] font-semibold text-ink mb-1">Aucun suivi pour le moment</h3>
          <p className="text-[13px] text-ink2 mb-6">Ajoutez l'URL d'un produit pour commencer à le surveiller.</p>
          <Link to="/watches/new" className="btn primary flex items-center gap-2">
            <Plus size={16} strokeWidth={2} />
            Créer mon premier suivi
          </Link>
        </div>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <div className="relative flex-1 min-w-[280px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3" size={14} />
              <input 
                className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-4 text-[13.5px] outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all" 
                placeholder="Rechercher un produit..." 
              />
            </div>
            
            <div className="inline-flex bg-surface border border-border rounded-md p-0.5 gap-0.5">
              {Object.entries(counts).map(([label, count]) => (
                <button
                  key={label}
                  onClick={() => setFilter(label)}
                  className={`flex items-center gap-1.5 px-3 py-[5px] rounded text-[12.5px] font-medium transition-colors ${
                    filter === label ? 'bg-muted text-ink' : 'text-ink2 hover:text-ink'
                  }`}
                >
                  {label}
                  <span className="text-ink3 font-normal">{count}</span>
                </button>
              ))}
            </div>

            <div className="flex-1" />
            
            <button className="btn ghost h-9 px-3 flex items-center gap-2 text-ink">
              Trier par : Dernière vérif.
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-surface border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-bg border-b border-border text-left">
                    <th className="w-9 px-4 py-2.5">
                      <input type="checkbox" className="accent-primary" />
                    </th>
                    <th className="px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.04em] text-ink2">Produit</th>
                    <th className="px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.04em] text-ink2">Statut</th>
                    <th className="px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.04em] text-ink2">Prix</th>
                    <th className="px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.04em] text-ink2">Tendance · 7j</th>
                    <th className="px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.04em] text-ink2 hidden md:table-cell">Fréquence</th>
                    <th className="px-4 py-2.5 text-[12px] font-medium uppercase tracking-[0.04em] text-ink2">Dernière vérif.</th>
                    <th className="w-[60px] px-4 py-2.5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((it) => (
                    <tr key={it.id} className="hover:bg-[#FAFCFE] transition-colors group">
                      <td className="px-4 py-3.5">
                        <input type="checkbox" className="accent-primary" />
                      </td>
                      <td className="px-4 py-3.5">
                        <Link to={`/watches/${it.id}`} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-muted border border-border flex items-center justify-center text-[10px] font-semibold text-ink3 shrink-0">
                            {getThumbInitials(it.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-ink truncate max-w-[320px]">{it.name}</div>
                            <div className="text-[12px] text-ink2 truncate">{it.source}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={it.status} />
                      </td>
                      <td className="px-4 py-3.5 font-mono text-ink">
                        {it.price}
                      </td>
                      <td className="px-4 py-3.5">
                        <Sparkline data={it.trend} color={getSparklineColor(it.status)} />
                      </td>
                      <td className="px-4 py-3.5 text-ink2 hidden md:table-cell">
                        {it.freq}
                      </td>
                      <td className="px-4 py-3.5 text-ink2 whitespace-nowrap">
                        {it.last}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-ink2 hover:bg-muted hover:text-ink transition-colors" title="Ouvrir la source">
                            <ExternalLink size={14} strokeWidth={1.8} />
                          </button>
                          <Link to={`/watches/${it.id}`} className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-ink2 hover:bg-muted hover:text-ink transition-colors" title="Modifier">
                            <SquarePen size={14} strokeWidth={1.8} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-[12.5px] text-ink2">Affichage 1 – {items.length} sur {items.length}</span>
              <div className="flex gap-1.5">
                <button className="btn sm ghost disabled opacity-50" disabled>Précédent</button>
                <button className="btn sm ghost disabled opacity-50" disabled>Suivant</button>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

/* WatchesPage.tsx */
