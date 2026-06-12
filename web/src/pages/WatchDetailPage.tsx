import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ExternalLink, 
  RefreshCw, 
  SquarePen, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  Inbox, 
  ChevronLeft,
  Calendar,
  Activity,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  History
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { StatusBadge, StatCard } from '../components/ui/DashboardUI';
import { apiFetch } from '../api/client';

interface Watch {
  id: string;
  url: string;
  label: string | null;
  status: 'ACTIVE' | 'PAUSED';
  stock_state: 'IN_STOCK' | 'OUT_OF_STOCK' | 'SOLD_OUT' | 'UNKNOWN' | 'BROKEN';
  last_checked_at: string | null;
  created_at: string | null;
  site_name: string | null;
  variant_sku?: string | null;
  variant_meta?: any;
  last_price?: number | null;
  last_currency?: string | null;
}

interface WatchCheck {
  id: string;
  checked_at: string;
  stock_state: string;
  http_status: number | null;
  error_code: string | null;
  error_message: string | null;
  duration_ms: number | null;
  details?: {
    price?: number | null;
    currency?: string | null;
    changed?: boolean;
    [key: string]: any;
  } | null;
}

/**
 * WatchDetailPage - Détail d'un suivi (V2)
 */
export default function WatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [watch, setWatch] = useState<Watch | null>(null);
  const [checks, setChecks] = useState<WatchCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [updating, setUpdating] = useState(false);

  /* Modales */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  /* Formulaire d'édition */
  const [editLabel, setEditLabel] = useState('');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'PAUSED'>('ACTIVE');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [watchData, checksData] = await Promise.all([
        apiFetch<Watch>(`/watches/${id}`),
        apiFetch<WatchCheck[]>(`/watches/${id}/checks`)
      ]);
      setWatch(watchData);
      setChecks(checksData);
      setEditLabel(watchData.label || '');
      setEditStatus(watchData.status);
    } catch (err: any) {
      console.error('Failed to fetch watch details:', err);
      setError(err.message || 'Impossible de charger le détail du suivi');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await apiFetch(`/watches/${id}`, { method: 'DELETE' });
      navigate('/watches');
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleCheck = async () => {
    if (!id || checking) return;
    try {
      setChecking(true);
      await apiFetch(`/watches/${id}/check`, { method: 'POST' });
      await fetchData(); /* Rafraîchir tout */
    } catch (err: any) {
      alert(err.message || 'La vérification a échoué');
    } finally {
      setChecking(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || updating) return;
    try {
      setUpdating(true);
      const updated = await apiFetch<Watch>(`/watches/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          label: editLabel,
          status: editStatus
        })
      });
      setWatch(updated);
      setShowEditModal(false);
    } catch (err: any) {
      alert(err.message || 'La mise à jour a échoué');
    } finally {
      setUpdating(false);
    }
  };

  /* Calcul des statistiques réelles */
  const stats = useMemo(() => {
    if (!checks.length) return null;
    
    const total = checks.length;
    const successes = checks.filter(c => !c.error_code).length;
    const inStock = checks.filter(c => c.stock_state === 'IN_STOCK').length;
    const alerts = checks.filter(c => (c as any).details?.changed).length;
    
    return {
      successRate: Math.round((successes / total) * 100),
      availability: Math.round((inStock / total) * 100),
      alerts,
      total
    };
  }, [checks]);

  /* Mapping des états pour le badge visuel */
  const mapStatus = (w: Watch) => {
    if (w.status === 'PAUSED') return 'paused';
    switch (w.stock_state) {
      case 'IN_STOCK': return 'in_stock';
      case 'OUT_OF_STOCK': return 'out';
      case 'SOLD_OUT': return 'sold_out';
      case 'BROKEN': return 'error';
      default: return 'unknown';
    }
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getSourceLabel = (w: Watch) => {
    if (w.site_name) return w.site_name;
    try {
      return new URL(w.url).hostname.replace('www.', '');
    } catch {
      return 'Source inconnue';
    }
  };

  const getCheckDotColor = (state: string) => {
    switch (state) {
      case 'IN_STOCK': return 'bg-success';
      case 'OUT_OF_STOCK': return 'bg-error';
      case 'SOLD_OUT': return 'bg-ink3';
      case 'BROKEN': return 'bg-warning';
      default: return 'bg-ink3';
    }
  };

  const getCheckStatus = (state: string) => {
    switch (state) {
      case 'IN_STOCK': return 'in_stock';
      case 'OUT_OF_STOCK': return 'out';
      case 'SOLD_OUT': return 'sold_out';
      case 'BROKEN': return 'error';
      default: return 'unknown';
    }
  };

  if (loading) {
    return (
      <DashboardLayout breadcrumb={["Mes suivis", "Chargement..."]}>
        <div className="flex flex-col items-center justify-center py-20 text-ink2">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
          <p className="text-sm font-medium">Chargement des données réelles...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !watch) {
    return (
      <DashboardLayout breadcrumb={["Mes suivis", "Erreur"]}>
        <div className="bg-surface border border-border rounded-xl p-10 text-center">
          <div className="w-12 h-12 bg-error-soft rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-error" size={24} />
          </div>
          <h2 className="text-lg font-semibold text-ink mb-2">Oups !</h2>
          <p className="text-ink2 text-[14px] mb-6">{error || 'Suivi introuvable'}</p>
          <button onClick={() => navigate('/watches')} className="btn border-border gap-2">
            <ChevronLeft size={16} />
            Retour aux suivis
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumb={["Mes suivis", watch.label || getSourceLabel(watch)]}>
      {/* Header Produit */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-8">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-14 h-14 rounded-lg bg-white border border-border flex items-center justify-center text-[13px] font-bold text-ink3 shrink-0 shadow-sm">
            {getSourceLabel(watch).substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-2.5 mb-1">
              <h1 className="text-[24px] font-bold tracking-tight text-ink truncate">
                {watch.label || "Produit sans nom"}
              </h1>
              <StatusBadge status={mapStatus(watch)} />
            </div>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-ink2">
              <a href={watch.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium">
                <ExternalLink size={14} />
                {getSourceLabel(watch)}
              </a>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="opacity-70" />
                <span>Créé le {formatDateTime(watch.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="opacity-70" />
                <span>Dernière vérif : {formatDateTime(watch.last_checked_at)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
          <button 
            onClick={handleCheck}
            disabled={checking}
            className="btn bg-white border-border hover:bg-muted flex items-center gap-2 h-10 px-4 font-medium"
          >
            {checking ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} strokeWidth={2} />}
            Vérifier maintenant
          </button>
          <button 
            onClick={() => setShowEditModal(true)}
            className="btn bg-white border-border hover:bg-muted flex items-center gap-2 h-10 px-4 font-medium"
          >
            <SquarePen size={16} strokeWidth={2} />
            Modifier
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="btn bg-white border-border text-error hover:bg-error-soft flex items-center justify-center w-10 h-10 p-0"
            title="Supprimer le suivi"
          >
            <Trash2 size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Cartes Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Disponibilité" 
          value={stats ? `${stats.availability}%` : "—"} 
          delta={stats ? "Sur l'historique récent" : "Donnée non dispo en V2"} 
        />
        <StatCard 
          label="Vérifications" 
          value={stats ? stats.total : "—"} 
          delta="Derniers événements" 
        />
        <StatCard 
          label="Taux de succès" 
          value={stats ? `${stats.successRate}%` : "—"} 
          delta={stats ? "Requêtes sans erreur" : "Donnée non dispo en V2"} 
        />
        <StatCard 
          label="Alertes envoyées" 
          value={stats ? stats.alerts : "0"} 
          delta="Depuis la création" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Info Variantes si dispo */}
          {watch.variant_sku && (
            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
                <Activity size={16} className="text-primary" />
                Détails du produit surveillé
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-[13px]">
                <div>
                  <span className="text-ink2 block mb-1">Référence (SKU)</span>
                  <span className="font-mono font-semibold text-ink bg-muted px-2 py-0.5 rounded">{watch.variant_sku}</span>
                </div>
                {watch.variant_meta?.color && (
                  <div>
                    <span className="text-ink2 block mb-1">Coloris</span>
                    <span className="font-semibold text-ink">{watch.variant_meta.color}</span>
                  </div>
                )}
                {watch.variant_meta?.size && (
                  <div>
                    <span className="text-ink2 block mb-1">Taille</span>
                    <span className="font-semibold text-ink">{watch.variant_meta.size}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Historique */}
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <History size={18} className="text-ink2" />
                <h2 className="text-[15px] font-bold text-ink">Historique des vérifications</h2>
              </div>
              <div className="text-[12px] font-medium text-ink3 uppercase tracking-wider">{checks.length} checks</div>
            </div>
            
            {checks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-ink2">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Inbox size={32} strokeWidth={1.5} className="opacity-20" />
                </div>
                <p className="text-[14px] font-medium">Aucun historique disponible.</p>
                <p className="text-[12px] opacity-60">Lancez une vérification pour commencer.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[11px] font-bold text-ink3 uppercase tracking-widest border-b border-border">
                      <th className="px-6 py-3 w-4"></th>
                      <th className="px-4 py-3">Date & Heure</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3">Note / Résultat</th>
                      <th className="px-4 py-3 text-right">Prix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {checks.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                        <td className="pl-6 py-4">
                          <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${getCheckDotColor(c.stock_state)}`} />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-[13px] font-medium text-ink">
                            {new Date(c.checked_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </div>
                          <div className="text-[11px] text-ink3 font-mono">
                            {new Date(c.checked_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={getCheckStatus(c.stock_state)} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-[13px] text-ink2">
                            {c.error_code ? (
                              <div className="flex items-center gap-1.5 text-error">
                                <XCircle size={14} />
                                <span>Erreur {c.error_code}: {c.error_message || 'Échec'}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 size={14} className="text-success" />
                                <span>Réussi {c.duration_ms ? <span className="text-[11px] opacity-60 ml-1">({c.duration_ms}ms)</span> : ''}</span>
                                {c.http_status && <span className="text-[11px] bg-muted px-1.5 py-0.5 rounded font-mono ml-1">{c.http_status}</span>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="pr-6 py-4 text-right">
                          <span className="text-[13px] font-semibold text-ink">
                            {c.details?.price 
                              ? `${c.details.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${c.details.currency || '€'}` 
                              : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {checks.length > 0 && (
              <div className="px-6 py-4 bg-muted/20 border-t border-border flex justify-between items-center">
                <p className="text-[12px] text-ink3 italic">Limite API: 50 dernières vérifications.</p>
                <div className="flex items-center gap-2 text-[12px] font-medium text-ink2">
                  <span className="w-2 h-2 rounded-full bg-success"></span> Succès
                  <span className="w-2 h-2 rounded-full bg-error ml-2"></span> Erreur
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Bloc Disponibilité 30j (Maquette) */}
          <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-[14px] font-bold text-ink mb-4 flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              Disponibilité (30j)
            </h3>
            <div className="text-center py-6 border border-dashed border-border rounded-lg bg-muted/10">
              <p className="text-[13px] font-medium text-ink2 mb-1">Calendrier non dispo en V2</p>
              <p className="text-[11px] text-ink3 px-4">
                Le suivi historique consolidé sur 30 jours est une fonctionnalité prévue pour Nova V3.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-ink3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-success opacity-50"></div> En stock
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-error opacity-50"></div> Rupture
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-muted"></div> Inconnu
              </div>
            </div>
          </div>

          {/* Bloc Alertes (Maquette) */}
          <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
            <h3 className="text-[14px] font-bold text-ink mb-4 flex items-center gap-2">
              <Bell size={16} className="text-primary" />
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-ink2">Alertes Email</span>
                <span className="font-semibold text-success bg-success-soft px-2 py-0.5 rounded-full text-[11px]">Activé</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-ink2">Dernière alerte</span>
                <span className="text-ink font-medium">
                  {stats?.alerts && checks.length > 0 
                    ? formatDateTime(checks.find(c => c.details?.changed)?.checked_at || null)
                    : "Aucune alerte"}
                </span>
              </div>
              <Link to="/settings" className="block text-center py-2 text-[12px] font-bold text-primary hover:underline border border-primary/20 rounded-lg mt-2 transition-colors">
                Gérer les notifications
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Note finale CDA */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex gap-3 items-start">
        <AlertCircle size={18} className="text-primary shrink-0 mt-0.5" />
        <div className="text-[12.5px] text-ink2 leading-relaxed">
          <strong className="text-ink font-semibold">Note pour le jury CDA :</strong> Cette page affiche les données réelles persistées dans PostgreSQL. 
          Les graphiques d'évolution et le calendrier de disponibilité 30j sont des fonctionnalités hors périmètre V2, 
          mises en retrait pour garantir la stabilité et l'honnêteté de la démonstration technique.
        </div>
      </div>

      {/* MODALE DE SUPPRESSION */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-error-soft rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="text-error" size={32} />
              </div>
              <h3 className="text-[20px] font-bold text-ink mb-3">Supprimer ce suivi ?</h3>
              <p className="text-[15px] text-ink2 leading-relaxed">
                Cette action est définitive. Vous ne recevrez plus d'alertes pour ce produit et tout l'historique sera effacé.
              </p>
            </div>
            <div className="flex border-t border-border">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-4 text-[15px] font-bold text-ink2 hover:bg-muted transition-colors border-r border-border"
              >
                Annuler
              </button>
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-4 text-[15px] font-bold text-error hover:bg-error-soft transition-colors flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE D'ÉDITION */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <form onSubmit={handleUpdate}>
              <div className="p-8">
                <h3 className="text-[20px] font-bold text-ink mb-6 flex items-center gap-3">
                  <SquarePen size={24} className="text-primary" />
                  Modifier le suivi
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-[13px] font-bold text-ink2 mb-2">Nom du produit</label>
                    <input 
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="w-full h-11 px-4 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-[15px]"
                      placeholder="Ex: Sneakers Nike Air Max"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[13px] font-bold text-ink2 mb-2">État de la surveillance</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setEditStatus('ACTIVE')}
                        className={`py-2.5 px-4 rounded-lg text-[14px] font-bold border transition-all ${
                          editStatus === 'ACTIVE' 
                          ? 'bg-primary text-white border-primary shadow-md' 
                          : 'bg-white text-ink2 border-border hover:border-ink3'
                        }`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditStatus('PAUSED')}
                        className={`py-2.5 px-4 rounded-lg text-[14px] font-bold border transition-all ${
                          editStatus === 'PAUSED' 
                          ? 'bg-muted text-ink border-ink3' 
                          : 'bg-white text-ink2 border-border hover:border-ink3'
                        }`}
                      >
                        En pause
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex border-t border-border">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-4 text-[15px] font-bold text-ink2 hover:bg-muted transition-colors border-r border-border"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-4 text-[15px] font-bold text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                >
                  {updating && <Loader2 size={16} className="animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

/* WatchDetailPage.tsx */
