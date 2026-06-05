
/**
 * PriceChart - Graphique SVG pour l'évolution du prix
 * Reproduction mocker de la maquette pour le moment.
 */
interface PriceChartProps {
  data: number[];
}

export function PriceChart({ data }: PriceChartProps) {
  if (!data || data.length < 2) return null;

  const w = 680, h = 200, pad = { l: 44, r: 12, t: 14, b: 24 };
  const max = Math.max(...data);
  const min = Math.min(...data);
  
  /* Marge pour que la courbe ne touche pas les bords */
  const yRange = (max - min) * 1.6 || 1;
  const yMin = min - (max - min) * 0.3;
  
  const xStep = (w - pad.l - pad.r) / (data.length - 1);
  const y = (v: number) => pad.t + (1 - (v - yMin) / yRange) * (h - pad.t - pad.b);
  
  const line = data.map((v, i) => `${pad.l + i * xStep},${y(v)}`).join(" ");
  const area = `M ${pad.l},${y(data[0])} ` + 
    data.slice(1).map((v, i) => `L ${pad.l + (i + 1) * xStep},${y(v)}`).join(" ") +
    ` L ${pad.l + (data.length - 1) * xStep},${h - pad.b} L ${pad.l},${h - pad.b} Z`;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" className="block">
        <defs>
          <linearGradient id="pgrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.16"/>
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        {/* Gridlines & Labels */}
        {[0, 0.5, 1].map((t, i) => {
          const yy = pad.t + t * (h - pad.t - pad.b);
          const val = yMin + (1 - t) * yRange;
          return (
            <g key={i}>
              <line x1={pad.l} x2={w - pad.r} y1={yy} y2={yy} stroke="#E2E8F0" strokeDasharray="2 3"/>
              <text x={pad.l - 8} y={yy + 4} fontSize="10" fill="#94A3B8" textAnchor="end" className="font-sans">
                {val.toFixed(0)} €
              </text>
            </g>
          );
        })}
        
        {/* Area & Line */}
        <path d={area} fill="url(#pgrad2)"/>
        <polyline points={line} fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

/* PriceChart.tsx */