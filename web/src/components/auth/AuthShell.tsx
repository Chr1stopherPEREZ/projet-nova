import { ReactNode } from 'react';
import { Mail, List, RefreshCw } from 'lucide-react';

interface AuthShellProps {
  children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-[100dvh] min-h-[100dvh] overflow-hidden bg-surface font-sans text-ink antialiased">
      {/* Colonne gauche */}
      <div className="auth-column flex flex-col min-h-0 overflow-hidden p-8 lg:p-12">
        <div className="flex items-center gap-2.5">
          <div className="grid place-items-center w-7 h-7 rounded-md bg-ink text-white text-sm font-semibold -tracking-[0.02em]">N</div>
          <div className="text-[15px] font-semibold -tracking-[0.01em]">Nova</div>
        </div>

        <div className="w-full max-w-[380px] my-auto mx-auto">
          {children}
        </div>

        <div className="text-xs text-ink3">© 2026 Nova - Christopher PEREZ</div>
      </div>

      {/* Colonne droite */}
      <div className="auth-column relative hidden lg:flex flex-col min-h-0 overflow-hidden p-12 bg-ink text-white">
        {/* grille filigrane */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at top right, black, transparent 70%)',
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="grid place-items-center w-7 h-7 rounded-md bg-white text-ink text-sm font-semibold">N</div>
          <div className="text-[15px] font-semibold text-white">Nova</div>
        </div>

        <div className="auth-marketing relative max-w-[460px]" style={{ marginTop: 'clamp(40px,8vh,80px)' }}>
          <h2 className="text-[28px] font-semibold -tracking-[0.02em] leading-[1.25] mb-3.5">
            Surveillez la disponibilité de vos produits.
          </h2>
          <p className="text-[15px] leading-[1.55] text-white/60">
            Nova vérifie les pages produit que vous suivez et vous alerte par e-mail dès qu’un article revient en stock.
          </p>
        </div>

        <div className="relative mt-auto flex flex-col gap-3.5">
          {[
            { Icon: List,      label: 'Ajoutez l’URL d’un produit à suivre' },
            { Icon: RefreshCw, label: 'Nova vérifie sa disponibilité régulièrement' },
            { Icon: Mail,      label: 'Vous recevez un e-mail au retour en stock' },
          ].map(({ Icon, label }, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="grid place-items-center w-8 h-8 rounded-md bg-white/[0.08] border border-white/10 text-white/85">
                <Icon size={16} strokeWidth={1.8} />
              </div>
              <div className="text-sm text-white/85">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Champ réutilisable */
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  right?: ReactNode;
  icon?: any;
}

export function Field({ label, right, icon: Icon, className = '', ...props }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between">
        <label className="text-[13px] font-medium text-ink">{label}</label>
        {right}
      </div>
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink3 pointer-events-none">
            <Icon size={14} strokeWidth={1.8} />
          </span>
        )}
        <input
          {...props}
          className={`h-[38px] w-full rounded-md border border-border bg-surface text-[13.5px] text-ink
            placeholder:text-ink3 outline-none transition
            focus:border-primary focus:ring-[3px] focus:ring-primary/15
            ${Icon ? 'pl-9 pr-3' : 'px-3'} ${className}`}
        />
      </div>
    </div>
  );
}

/* AuthShell.tsx */