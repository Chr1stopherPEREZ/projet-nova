import React from 'react';

/**
 * StatCard - Composant pour les indicateurs clés (KPI)
 */
export const StatCard = ({ label, value, delta }: { label: string; value: React.ReactNode; delta: string }) => (
  <div className="bg-surface border border-border rounded-lg p-5 px-5 py-[18px] shadow-sm">
    <div className="text-[12.5px] font-medium text-ink2 mb-2.5">{label}</div>
    <div className="text-[26px] font-semibold -tracking-[0.025em] leading-[1.1] text-ink">{value}</div>
    <div className="text-xs text-ink2 mt-1.5">{delta}</div>
  </div>
);

/**
 * StatusBadge - Badge d'état pour les produits et suivis
 */
const BADGE: Record<string, { cls: string; label: string; dot: string }> = {
  in_stock: { cls: 'bg-success-soft text-[#166534]', label: 'En stock', dot: 'bg-success' },
  out: { cls: 'bg-error-soft text-[#991B1B]', label: 'Rupture', dot: 'bg-error' },
  sold_out: { cls: 'bg-muted text-ink2', label: 'Épuisé', dot: 'bg-ink3' },
  error: { cls: 'bg-warning-soft text-[#92400E]', label: 'Erreur', dot: 'bg-warning' },
  unknown: { cls: 'bg-muted text-ink2', label: 'Inconnu', dot: 'bg-ink3' },
  paused: { cls: 'bg-muted text-ink2', label: 'En pause', dot: 'bg-ink3' },
};

export const StatusBadge = ({ status }: { status: string }) => {
  const b = BADGE[status] ?? BADGE.unknown;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${b.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`} />
      {b.label}
    </span>
  );
};

/**
 * Segment - Sélecteur de période (24h, 7j, 30j)
 */
export function Segment({ options, active, onChange }: { options: string[]; active: string; onChange?: (val: string) => void }) {
  return (
    <div className="inline-flex bg-surface border border-border rounded-md p-0.5 gap-0.5">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange?.(o)}
          className={`px-2.5 py-[5px] rounded text-[12.5px] font-medium transition-colors ${
            o === active ? 'bg-muted text-ink' : 'text-ink2 hover:text-ink'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/**
 * DashboardCard - Conteneur standard pour les blocs du dashboard
 */
interface DashboardCardProps {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const DashboardCard = ({ title, right, children, className = '', noPadding = false }: DashboardCardProps) => (
  <div className={`bg-surface border border-border rounded-lg shadow-sm ${className}`}>
    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      {right}
    </div>
    <div className={noPadding ? '' : 'p-5'}>
      {children}
    </div>
  </div>
);

/* DashboardUI.tsx */