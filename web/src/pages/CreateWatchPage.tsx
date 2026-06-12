import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Mail } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { StatusBadge } from '../components/ui/DashboardUI';

/**
 * CreateWatchPage - Nouveau suivi (V2)
 */
export default function CreateWatchPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('https://lesprit-belle.fr/sv/products/lampe-chauffe-bougie-twenow');
  const [name, setName] = useState('');
  const [freq, setFreq] = useState('30 min');
  
  /* Note: La logique de preview réelle (apiFetch('/watches/preview'))
  est mise de côté pour l'intégration visuelle V2. */
  const mockPreview = {
    name: 'Lampe Chauffe-Bougie TWENOW',
    source: 'L’Esprit Belle',
    status: 'in_stock',
    price: '35,00 €',
    thumb: 'LT'
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    /* Simulation POST /watches */
    navigate('/watches');
  };

  return (
    <DashboardLayout breadcrumb={["Mes suivis", "Nouveau suivi"]}>
      <div className="mb-7">
        <h1 className="text-[22px] font-semibold tracking-[-0.015em] text-ink">Nouveau suivi</h1>
        <p className="text-[13.5px] text-ink2 mt-1">Collez l'URL d'un produit. Nova vérifiera régulièrement sa disponibilité et vous alertera par e-mail.</p>
      </div>

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
                  />
                  <button className="btn ghost border-border">Analyser</button>
                </div>
              </div>

              {/* Aperçu après analyse (Mock) */}
              <div className="flex items-center gap-3.5 p-3.5 bg-bg border border-border rounded-lg">
                <div className="w-12 h-12 rounded-md bg-surface border border-border flex items-center justify-center text-[11px] font-semibold text-ink3 shrink-0">
                  {mockPreview.thumb}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-ink text-[13.5px] truncate">{mockPreview.name}</span>
                    <StatusBadge status={mockPreview.status} />
                  </div>
                  <div className="flex items-center gap-3 text-[12.5px] text-ink2">
                    <span>{mockPreview.source}</span>
                    <span className="w-1 h-1 rounded-full bg-border-strong" />
                    <span className="font-mono text-ink">{mockPreview.price}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                placeholder="ex. Coffret Solstice — Cadeau Noël"
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
                <div className="text-[12.5px] text-ink2 truncate">christopher@nova.dev</div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success-soft text-success text-[12px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Activé
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-2">
            <button onClick={() => navigate('/watches')} className="btn ghost px-6">Annuler</button>
            <button onClick={handleCreate} className="btn primary px-8">Créer le suivi</button>
          </div>
        </div>

        {/* Aside Aperçu (Droite) */}
        <aside className="hidden lg:block">
          <div className="bg-surface border border-border rounded-lg p-5 sticky top-7">
            <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink3 mb-3">Aperçu</div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-md bg-muted border border-border flex items-center justify-center text-[10px] font-semibold text-ink3">
                {mockPreview.thumb}
              </div>
              <div className="min-w-0">
                <div className="text-[13.5px] font-medium text-ink truncate">{name || mockPreview.name}</div>
                <div className="text-[12px] text-ink2">{mockPreview.source}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[12.5px]">
              <div>
                <div className="text-ink2 mb-1">Statut détecté</div>
                <StatusBadge status={mockPreview.status} />
              </div>
              <div>
                <div className="text-ink2 mb-1">Prix</div>
                <div className="font-mono font-medium text-ink">{mockPreview.price}</div>
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
