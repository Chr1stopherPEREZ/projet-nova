import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ChevronDown, ExternalLink, SquarePen, Inbox, AlertCircle, Loader2 } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { StatusBadge } from '../components/ui/DashboardUI';
import { Sparkline } from '../components/ui/Sparkline';
import { apiFetch } from '../api/client';

interface Watch {
  id: string;
  url: string;
  label: string | null;
  status: 'ACTIVE' | 'PAUSED';
  stock_state: 'IN_STOCK' | 'OUT_OF_STOCK' | 'SOLD_OUT' | 'UNKNOWN' | 'BROKEN';
  last_checked_at: string | null;
  site_name: string | null;
  variant_sku?: string | null;
  last_price?: number | null;
  last_currency?: string | null;
}

/**
 * WatchesPage - Liste des suivis (V2)
 */
export default function WatchesPage() {
  const [items, setItems] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('Tous');
  const [search, setSearch] = useState('');
  
  /* États pour le tri et la pagination */
  const [sortBy, setSortBy] = useState('date');
  const [isSortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  useEffect(() => {
    fetchWatches();
  }, []);

  /* Reset de la pagination quand les filtres changent */
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search, sortBy]);

  const fetchWatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<Watch[]>('/watches');
      setItems(data);
    } catch (err: any) {
      console.error('Failed to fetch watches:', err);
      setError(err.message || 'Impossible de charger les suivis');
    } finally {
      setLoading(false);
    }
  };

  /* Mapping des états pour le badge visuel */
  const mapStatus = (watch: Watch) => {
    if (watch.status === 'PAUSED') return 'paused';
    
    switch (watch.stock_state) {
      case 'IN_STOCK': return 'in_stock';
      case 'OUT_OF_STOCK': return 'out';
      case 'SOLD_OUT': return 'sold_out';
      case 'BROKEN': return 'error';
      default: return 'unknown';
    }
  };

  /* Formattage de la date relative (simplifié pour la V2 démo) */
  const formatLastChecked = (dateStr: string | null) => {
    if (!dateStr) return 'Jamais';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMin < 1) return 'À l\'instant';
    if (diffMin < 60) return `il y a ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `il y a ${diffHours} h`;
    return date.toLocaleDateString('fr-FR');
  };

  /* Extraction du nom du site ou domaine */
  const getSourceLabel = (watch: Watch) => {
    if (watch.site_name) return watch.site_name;
    try {
      return new URL(watch.url).hostname.replace('www.', '');
    } catch {
      return 'Source inconnue';
    }
  };

  /* Calcul des compteurs pour le segment */
  const counts = {
    Tous: items.length,
    'En stock': items.filter(i => i.stock_state === 'IN_STOCK').length,
    Rupture: items.filter(i => i.stock_state === 'OUT_OF_STOCK').length,
    'Épuisé': items.filter(i => i.stock_state === 'SOLD_OUT').length,
    Inconnu: items.filter(i => i.stock_state === 'UNKNOWN' || i.stock_state === 'BROKEN').length,
  };

  /* --- Filtrage des items --- */
  const filteredItems = items.filter(it => {
    /* 1. Filtre par état */
    let matchesFilter = true;
    if (filter === 'En stock') matchesFilter = it.stock_state === 'IN_STOCK';
    else if (filter === 'Rupture') matchesFilter = it.stock_state === 'OUT_OF_STOCK';
    else if (filter === 'Épuisé') matchesFilter = it.stock_state === 'SOLD_OUT';
    else if (filter === 'Inconnu') matchesFilter = it.stock_state === 'UNKNOWN' || it.stock_state === 'BROKEN';

    if (!matchesFilter) return false;

    /* 2. Filtre par recherche */
    if (!search.trim()) return true;

    const query = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const label = (it.label || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const site = (it.site_name || getSourceLabel(it)).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const url = it.url.toLowerCase();
    const sku = (it.variant_sku || '').toLowerCase();

    return label.includes(query) || site.includes(query) || url.includes(query) || sku.includes(query);
  });

  /* --- Tri des items --- */
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'date') {
      const da = a.last_checked_at ? new Date(a.last_checked_at).getTime() : 0;
      const db = b.last_checked_at ? new Date(b.last_checked_at).getTime() : 0;
      return db - da; /* Du plus récent au plus ancien */
    }
    if (sortBy === 'name') {
      return (a.label || '').localeCompare(b.label || '', 'fr');
    }
    if (sortBy === 'shop') {
      const siteA = a.site_name || getSourceLabel(a);
      const siteB = b.site_name || getSourceLabel(b);
      return siteA.localeCompare(siteB, 'fr');
    }
    if (sortBy === 'status') {
      const priority: Record<string, number> = { 
        IN_STOCK: 0, 
        OUT_OF_STOCK: 1, 
        SOLD_OUT: 2, 
        UNKNOWN: 3, 
        BROKEN: 4 
      };
      return (priority[a.stock_state] ?? 99) - (priority[b.stock_state] ?? 99);
    }
    return 0;
  });

  /* --- Pagination locale --- */
  const totalPages = Math.ceil(sortedItems.length / PAGE_SIZE);
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const startIdx = sortedItems.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(currentPage * PAGE_SIZE, sortedItems.length);

  const sortOptions = [
    { id: 'date', label: 'Dernière vérif.' },
    { id: 'name', label: 'Nom produit' },
    { id: 'shop', label: 'Boutique' },
    { id: 'status', label: 'Statut' },
  ];

  const getThumbInitials = (name: string) => {
    return name.replace(/[^A-Z0-9]/g, '').slice(0, 2) || 'PR';
  };

  const getSparklineColor = (status: string) => {
    if (status === 'out') return '#DC2626';
    if (status === 'unknown') return '#94A3B8';
    if (status === 'sold_out') return '#64748B';
    return '#16A34A';
  };

  if (loading) {
    return (
      <DashboardLayout title="Mes suivis">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-ink2 text-sm">Chargement de vos suivis...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Mes suivis">
        <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-error-soft grid place-items-center text-error mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-[15px] font-semibold text-ink mb-1">Erreur de chargement</h3>
          <p className="text-[13px] text-ink2 mb-6">{error}</p>
          <button onClick={fetchWatches} className="btn ghost border-border">Réessayer</button>
        </div>
      </DashboardLayout>
    );
  }

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
        <p className="text-[13.5px] text-ink2 mt-1">{filteredItems.length} produits affichés sur {items.length}.</p>
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
            
            <div className="relative">
              <button 
                onClick={() => setSortOpen(!isSortOpen)}
                className="btn ghost h-9 px-3 flex items-center gap-2 text-ink hover:bg-muted transition-colors border border-transparent hover:border-border"
              >
                Trier par : {sortOptions.find(o => o.id === sortBy)?.label}
                <ChevronDown size={14} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-48 bg-surface border border-border rounded-lg shadow-lg z-20 py-1 overflow-hidden">
                    {sortOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortBy(opt.id);
                          setSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[13px] hover:bg-muted transition-colors ${
                          sortBy === opt.id ? 'text-primary font-medium bg-primary/5' : 'text-ink2'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
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
                  {paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 px-4 text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted text-ink3 mb-3">
                          <Search size={18} />
                        </div>
                        <p className="text-[14px] font-medium text-ink">Aucun suivi ne correspond à cette recherche.</p>
                        <p className="text-[12.5px] text-ink2 mt-1">Essayez un autre mot-clé ou changez de filtre.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((it) => {
                      const mappedStatus = mapStatus(it);
                      return (
                        <tr key={it.id} className="hover:bg-[#FAFCFE] transition-colors group">
                          <td className="px-4 py-3.5">
                            <input type="checkbox" className="accent-primary" />
                          </td>
                          <td className="px-4 py-3.5">
                            <Link to={`/watches/${it.id}`} className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-md bg-muted border border-border flex items-center justify-center text-[10px] font-semibold text-ink3 shrink-0">
                                {getThumbInitials(it.label || 'Produit')}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-ink truncate max-w-[320px]">{it.label || 'Sans nom'}</div>
                                <div className="text-[12px] text-ink2 truncate">{getSourceLabel(it)}</div>
                              </div>
                            </Link>
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={mappedStatus} />
                          </td>
                          <td className="px-4 py-3.5 font-mono text-ink">
                            {it.last_price != null ? (
                              `${it.last_price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${it.last_currency || '€'}`
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            {/* Note: La tendance reste mockée pour l'instant */}
                            <Sparkline data={[5,5,5,5,5,5,5]} color={getSparklineColor(mappedStatus)} />
                          </td>
                          <td className="px-4 py-3.5 text-ink2 hidden md:table-cell">
                            {/* Fréquence n'est pas encore dans le schéma WatchOut, on laisse 30m par défaut */}
                            30 min
                          </td>
                          <td className="px-4 py-3.5 text-ink2 whitespace-nowrap">
                            {formatLastChecked(it.last_checked_at)}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a href={it.url} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-ink2 hover:bg-muted hover:text-ink transition-colors" title="Ouvrir la source">
                                <ExternalLink size={14} strokeWidth={1.8} />
                              </a>
                              <Link to={`/watches/${it.id}`} className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-ink2 hover:bg-muted hover:text-ink transition-colors" title="Modifier">
                                <SquarePen size={14} strokeWidth={1.8} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-bg/30">
              <span className="text-[12.5px] text-ink2 font-medium">
                Affichage {startIdx} – {endIdx} sur {sortedItems.length}
              </span>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={`btn sm ghost border border-border h-8 px-3 text-[12.5px] transition-all ${
                    currentPage === 1 
                      ? 'opacity-40 cursor-not-allowed' 
                      : 'text-ink hover:bg-surface hover:shadow-sm'
                  }`}
                  disabled={currentPage === 1}
                >
                  Précédent
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={`btn sm ghost border border-border h-8 px-3 text-[12.5px] transition-all ${
                    currentPage === totalPages || totalPages === 0
                      ? 'opacity-40 cursor-not-allowed' 
                      : 'text-ink hover:bg-surface hover:shadow-sm'
                  }`}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

/* WatchesPage.tsx */
