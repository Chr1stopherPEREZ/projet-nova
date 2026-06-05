import { Check, X } from 'lucide-react';

interface PasswordRulesProps {
  value: string;
}

export function PasswordRules({ value }: PasswordRulesProps) {
  const rules = [
    { label: 'Au moins 8 caractères', check: value.length >= 8 },
    { label: 'Contient au moins 1 chiffre', check: /[0-9]/.test(value) },
    { label: "Différent de l'ancien mot de passe", check: null }, /* Neutre car non vérifiable client */
  ];

  /* Calcul du strength (simple simulation) */
  const score = rules.filter(r => r.check === true).length;
  /* On ajoute un point bonus si c'est trop complexe pour arriver à 3/4 comme je l'ai fait dans la maquette */
  const strength = score > 0 ? score + 1 : 0;

  return (
    <div className="flex flex-col gap-4 mt-1.5">
      {/* Strength meter */}
      <div className="flex flex-col gap-1.5">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex-1 h-[3px] rounded-[2px] transition-colors duration-300 ${
                step <= strength ? 'bg-success' : 'bg-border'
              }`}
            />
          ))}
        </div>
        {value && strength >= 3 && (
          <div className="text-[12.5px] text-success">Bon mot de passe.</div>
        )}
      </div>

      {/* Checklist */}
      <div className="flex flex-col gap-2 py-2">
        {rules.map((rule, i) => (
          <div key={i} className="flex items-center gap-2 text-[12.5px]">
            <div
              className={`w-3.5 h-3.5 rounded-full grid place-items-center ${
                rule.check === true
                  ? 'bg-success-soft text-success'
                  : rule.check === false
                  ? 'bg-muted text-ink3'
                  : 'bg-muted text-ink3'
              }`}
            >
              {rule.check === true ? (
                <Check size={10} strokeWidth={2.5} />
              ) : (
                <X size={10} strokeWidth={2.5} />
              )}
            </div>
            <span
              className={
                rule.check === true ? 'text-success' : 'text-ink3'
              }
            >
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* PasswordRules.tsx */