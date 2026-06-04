interface DataPoint {
  label: string;
  checks: number;
  available: number;
}

export function LineChart({ data, height = 220 }: { data: DataPoint[]; height?: number }) {
  const w = 720, h = height, pad = { l: 36, r: 16, t: 12, b: 28 };
  
  /* Si pas de données, on évite le crash */
  if (!data || data.length === 0) return <div style={{ height }} className="flex items-center justify-center text-ink3">Aucune donnée</div>;

  const max = Math.max(...data.map(d => d.checks), 1); // Minimum 1 pour éviter division par 0
  const min = 0;
  const xStep = (w - pad.l - pad.r) / (data.length - 1);
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (h - pad.t - pad.b);
  
  const ptsAvail = data.map((d, i) => `${pad.l + i * xStep},${y(d.available)}`).join(' ');
  const ptsTotal = data.map((d, i) => `${pad.l + i * xStep},${y(d.checks)}`).join(' ');
  
  const area = `M ${pad.l},${y(data[0].available)} ` + 
               data.slice(1).map((d, i) => `L ${pad.l + (i + 1) * xStep},${y(d.available)}`).join(' ') + 
               ` L ${pad.l + (data.length - 1) * xStep},${h - pad.b} L ${pad.l},${h - pad.b} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" className="block">
      <defs>
        <linearGradient id="cgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i} x1={pad.l} x2={w - pad.r} y1={pad.t + t * (h - pad.t - pad.b)} y2={pad.t + t * (h - pad.t - pad.b)} stroke="#E2E8F0" strokeDasharray="2 3" />
      ))}
      
      {/* Y Axis labels */}
      {[0, 0.5, 1].map((t, i) => (
        <text key={i} x={pad.l - 8} y={pad.t + (1 - t) * (h - pad.t - pad.b) + 4} fontSize="10" fill="#94A3B8" textAnchor="end">{Math.round(max * t)}</text>
      ))}
      
      {/* X Axis labels */}
      {data.map((d, i) => i % 2 === 0 && (
        <text key={i} x={pad.l + i * xStep} y={h - 10} fontSize="10" fill="#94A3B8" textAnchor="middle">{d.label}</text>
      ))}
      
      {/* Area under available */}
      <path d={area} fill="url(#cgrad)" />
      
      {/* Total checks line (dashed) */}
      <polyline points={ptsTotal} fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />
      
      {/* Available line */}
      <polyline points={ptsAvail} fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Points for available */}
      {data.map((d, i) => (
        <circle key={i} cx={pad.l + i * xStep} cy={y(d.available)} r="2.5" fill="#fff" stroke="#2563EB" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

/* LineChart.tsx */