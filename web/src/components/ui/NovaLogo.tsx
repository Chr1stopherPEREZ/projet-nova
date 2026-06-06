interface NovaLogoProps {
  className?: string;
  isDark?: boolean;
}

export function NovaLogo({ className = "", isDark = false }: NovaLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Petit logo simple */}
      <div className="bg-primary-600 rounded-xl w-10 h-10 flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-white font-bold text-2xl">N</span>
      </div>
      {/* Texte Nova */}
      <span className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-text-primary'}`}>
        Nova
      </span>
    </div>
  );
}

/* NovaLogo.tsx */