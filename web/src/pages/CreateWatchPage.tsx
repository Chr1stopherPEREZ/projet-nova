import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Mail, Loader2, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { StatusBadge } from '../components/ui/DashboardUI';
import { apiFetch, authService } from '../api/client';

interface VariantInfo {
  variant_sku: string;
  color: string | null;
  size: string | null;
  available: boolean | null;
  meta: any;
}

interface PreviewResponse {
  title: string | null;
  source: string;
  variants: VariantInfo[];
  debug_info?: any;
}

interface WatchResponse {
  id: string;
  [key: string]: any;
}

/**
 * CreateWatchPage - Nouveau suivi (V2)
 */
export default function CreateWatchPage() {
  const navigate = useNavigate();
  
  /* States formulaire */
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [freq, setFreq] = useState('30 min');
  
  /* States techniques */
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  /* States preview */
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VariantInfo | null>(null);

  /* Charger l'email au montage */
  useEffect(() => {
    authService.checkAuth().then(user => {
      if (user) setUserEmail(user.email);
    });
  }, []);

  const handleAnalyze = async () => {
    if (!url) return;
    
    setIsAnalyzing(true);
    setError(null);
    setPreview(null);
    setSelectedVariant(null);
    
    try {
      const data = await apiFetch<PreviewResponse>('/watches/preview', {
        method: 'POST',
        body: JSON.stringify({ url })
      });
      
      setPreview(data);
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setError(err.message || "Impossible d'analyser cette URL.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreate = async () => {
    if (!url || isCreating) return;

    setIsCreating(true);
    setError(null);

    try {
      const payload = {
        url,
        label: name || preview?.title || null,
        variant_sku: selectedVariant?.variant_sku || null,
        variant_selector: selectedVariant
          ? {
              color: selectedVariant.color,
              size: selectedVariant.size
            }
          : null,
        variant_meta: selectedVariant?.meta || null
      };

      const res = await apiFetch<WatchResponse>('/watches', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.id) {
        navigate(`/watches/${res.id}`);
      } else {
        navigate('/watches');
      }
    } catch (err: any) {
      console.error('Creation failed:', err);
      if (err.message?.includes('WATCH_ALREADY_EXISTS')) {
        setError("Un suivi existe déjà pour cette URL et cette variante.");
      } else {
        setError(err.message || "Impossible de créer le suivi.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardLayout breadcrumb={["Mes suivis", "Nouveau suivi"]}>
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-ink">Nouveau suivi</h1>
        <p className="text-[13.5px] text-ink2 mt-1">Collez l'URL d'un produit. Nova vérifiera régulièrement sa disponibilité et vous alertera par e-mail.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-soft border border-error/20 rounded-lg flex items-start gap-3 text-error">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <div className="text-[13.5px] font-medium">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 max-w-[1000px]">
        {/* Formulaire (Gauche) */}
        <div className="space-y-5">
          {/* 1. URL */}
          <div className="bg-surface border border-border rounded-lg p-5">
            <h3 className="text-[14px] font-semibold text-ink mb-1">1. URL du produit</h3>
            <p className="text-[12.5px] text-ink2 mb-4">Saisissez l'adresse complète de la page produit.</p>
            <div className="space-y-3.5">
              <div>
                <label className="block text-[13px] font-medium text-ink mb-1.5">URL</label>
                <div className="flex gap-2">
                  <input 
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="h-[38px] flex-1 rounded-md border border-border bg-surface px-3 text-[13.5px] outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all"
                    placeholder="https://..."
                    disabled={isAnalyzing || isCreating}
                  />
                  <button 
                    onClick={handleAnalyze} 
                    disabled={!url || isAnalyzing || isCreating}
                    className="btn ghost border-border min-w-[100px]"
                  >
                    {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : 'Analyser'}
                  </button>
                </div>
              </div>

              {/* Aperçu après analyse */}
              {preview && (
                <div className="flex items-center gap-3.5 p-3.5 bg-bg border border-border rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="w-12 h-12 rounded-md bg-surface border border-border flex items-center justify-center text-[11px] font-semibold text-ink3 shrink-0">
                    {preview.title?.substring(0, 2).toUpperCase() || '??'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-ink text-[13.5px] truncate">{preview.title || "Produit détecté"}</span>
                      {selectedVariant && (
                        <StatusBadge status={selectedVariant.available ? 'in_stock' : 'out_of_stock'} />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[12.5px] text-ink2">
                      <span>{preview.source}</span>
                      {selectedVariant?.meta?.price && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-border-strong" />
                          <span className="font-mono text-ink">
                            {(selectedVariant.meta.price / 100).toFixed(2)}{selectedVariant.meta.currency ? ` ${selectedVariant.meta.currency}` : ''}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 1b. Variantes (Si présentes) */}
          {preview && preview.variants && preview.variants.length > 0 && (
            <div className="bg-surface border border-border rounded-lg p-5 animate-in fade-in slide-in-from-top-2 duration-300">
              <h3 className="text-[14px] font-semibold text-ink mb-1">Choix de la variante</h3>
              <p className="text-[12.5px] text-ink2 mb-4">Ce produit propose plusieurs options. Laquelle voulez-vous suivre ?</p>
              
              <div className="grid grid-cols-1 gap-3">
                <select 
                  className="h-[38px] w-full rounded-md border border-border bg-surface px-3 text-[13.5px] outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all"
                  value={selectedVariant?.variant_sku || ''}
                  onChange={(e) => {
                    const variant = preview.variants.find(v => v.variant_sku === e.target.value);
                    if (variant) setSelectedVariant(variant);
                  }}
                >
                  {preview.variants.map((v) => (
                    <option key={v.variant_sku} value={v.variant_sku}>
                      {v.color || ''} {v.size || ''} {!(v.color || v.size) ? `Variante ${v.variant_sku}` : ''} ({v.available ? 'En stock' : 'Épuisé'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* 2. Détails */}
          <div className="bg-surface border border-border rounded-lg p-5">
            <h3 className="text-[14px] font-semibold text-ink mb-1">2. Détails</h3>
            <p className="text-[12.5px] text-ink2 mb-4">Personnalisez l'affichage de ce suivi.</p>
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">
                Nom personnalisé <span className="text-ink3 font-normal ml-1">(optionnel)</span>
              </label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-[38px] w-full rounded-md border border-border bg-surface px-3 text-[13.5px] outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all"
                placeholder={preview?.title ? `ex. ${preview.title}` : "ex. Coffret Solstice — Cadeau Noël"}
              />
              <p className="text-[12.5px] text-ink2 mt-1.5">Laissez vide pour utiliser le nom détecté automatiquement.</p>
            </div>
          </div>

          {/* 3. Fréquence */}
          <div className="bg-surface border border-border rounded-lg p-5">
            <h3 className="text-[14px] font-semibold text-ink mb-1">3. Fréquence de vérification</h3>
            <p className="text-[12.5px] text-ink2 mb-4">À quel rythme Nova doit-il vérifier ce produit ?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { val: '15 min', desc: 'Vérification fréquente' },
                { val: '30 min', desc: 'Recommandé' },
                { val: '1 h', desc: 'Vérification légère' },
              ].map((opt) => (
                <label 
                  key={opt.val}
                  className={`relative flex flex-col p-3 rounded-lg border cursor-pointer transition-all ${
                    freq === opt.val ? 'border-primary bg-primary-soft' : 'border-border bg-surface hover:border-border-strong'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="freq" 
                    className="sr-only" 
                    checked={freq === opt.val} 
                    onChange={() => setFreq(opt.val)}
                  />
                  <span className={`text-[14px] font-semibold ${freq === opt.val ? 'text-primary' : 'text-ink'}`}>{opt.val}</span>
                  <span className="text-[11.5px] text-ink2">{opt.desc}</span>
                  {freq === opt.val && (
                    <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center text-white">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </label>
              ))}
            </div>
            <p className="text-[11.5px] text-ink3 mt-3 italic">Note: Le réglage de fréquence sera activé dans une prochaine mise à jour.</p>
          </div>

          {/* 4. Notification */}
          <div className="bg-surface border border-border rounded-lg p-5">
            <h3 className="text-[14px] font-semibold text-ink mb-1">4. Notification</h3>
            <p className="text-[12.5px] text-ink2 mb-4">Vous serez prévenu par e-mail dès qu'un changement de disponibilité est détecté.</p>
            <div className="flex items-center gap-3 p-3 bg-bg border border-border rounded-lg">
              <div className="w-8 h-8 rounded-md bg-surface border border-border flex items-center justify-center text-ink2">
                <Mail size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium text-ink">E-mail</div>
                <div className="text-[12.5px] text-ink2 truncate">{userEmail || 'chargement...'}</div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success-soft text-success text-[12px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Activé
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-2">
            <button 
              onClick={() => navigate('/watches')} 
              disabled={isCreating}
              className="btn ghost px-6"
            >
              Annuler
            </button>
            <button 
              onClick={handleCreate} 
              disabled={!url || isCreating || isAnalyzing}
              className="btn primary px-8 min-w-[160px]"
            >
              {isCreating ? <Loader2 className="animate-spin" size={18} /> : 'Créer le suivi'}
            </button>
          </div>
        </div>

        {/* Aside Aperçu (Droite) */}
        <aside className="hidden lg:block">
          <div className="bg-surface border border-border rounded-lg p-5 sticky top-7">
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink3 mb-3">Aperçu</div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-md bg-muted border border-border flex items-center justify-center text-[10px] font-semibold text-ink3">
                {preview ? (preview.title?.substring(0, 2).toUpperCase() || '??') : '??'}
              </div>
              <div className="min-w-0">
                <div className="text-[13.5px] font-medium text-ink truncate">
                  {name || preview?.title || 'En attente...'}
                </div>
                <div className="text-[12px] text-ink2">{preview?.source || '---'}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[12.5px]">
              <div>
                <div className="text-ink2 mb-1">Statut détecté</div>
                <StatusBadge status={selectedVariant ? (selectedVariant.available ? 'in_stock' : 'out_of_stock') : 'unknown'} />
              </div>
              <div>
                <div className="text-ink2 mb-1">Prix</div>
                <div className="font-mono font-medium text-ink">
                  {selectedVariant?.meta?.price 
                    ? `${(selectedVariant.meta.price / 100).toFixed(2)}${selectedVariant.meta.currency ? ` ${selectedVariant.meta.currency}` : ''}`
                    : '---'}
                </div>
              </div>
              <div>
                <div className="text-ink2 mb-1">Fréquence</div>
                <div className="text-ink">{freq}</div>
              </div>
              <div>
                <div className="text-ink2 mb-1">Alerte</div>
                <div className="text-ink">E-mail</div>
              </div>
            </div>

            <hr className="my-4 border-border" />
            
            <p className="text-[12px] text-ink2 leading-relaxed">
              Nova vérifiera ce produit toutes les {freq.replace(' ', '')}. Vous recevrez un e-mail dès qu'il sera détecté comme disponible.
            </p>
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
}

/* CreateWatchPage.tsx */
