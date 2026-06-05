
/**
 * AvailabilityCalendar - Calendrier de disponibilité sur 30 jours
 * Reproduit la grille de cases de la maquette
 */
export function AvailabilityCalendar() {
  /* Données de démo (30 jours) : 1=in_stock, 0=out */
  const raw = "001000110100110010001100010011".split("");
  
  /* États : in_stock, out, error, unknown */
  const days = raw.map((char, i) => {
    if (i === 14) return 'error';
    if (i === 22) return 'unknown';
    return char === '1' ? 'in_stock' : 'out';
  });

  const getStyle = (state: string) => {
    switch (state) {
      case 'in_stock':
        return 'bg-success/85';
      case 'out':
        return 'bg-error-soft border border-[#FECACA]';
      case 'error':
        return 'bg-warning';
      case 'unknown':
        return 'bg-muted';
      default:
        return 'bg-muted';
    }
  };

  const LegendItem = ({ colorClass, label, border }: { colorClass: string; label: string; border?: string }) => (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-[2px] ${colorClass} ${border}`} />
      <span>{label}</span>
    </div>
  );

  return (
    <div>
      <div className="grid grid-cols-[repeat(15,1fr)] gap-1">
        {days.map((state, i) => (
          <div 
            key={i} 
            className={`aspect-square rounded-[4px] ${getStyle(state)}`}
            title={`Jour ${i + 1}: ${state}`}
          />
        ))}
      </div>
      
      {/* Légende */}
      <div className="flex flex-wrap gap-x-3.5 gap-y-2 mt-4 text-[11.5px] text-ink2">
        <LegendItem colorClass="bg-success/85" label="En stock" />
        <LegendItem colorClass="bg-error-soft" label="Rupture" border="border border-[#FECACA]" />
        <LegendItem colorClass="bg-warning" label="Erreur" />
        <LegendItem colorClass="bg-muted" label="Inconnu" />
      </div>
    </div>
  );
}

/* AvailabilityCalendar.tsx */