import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { AuthShell, Field } from '../components/auth/AuthShell';
import { PasswordRules } from '../components/auth/PasswordRules';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  /* Le token sera extrait ici pour de futures intégrations API */
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    /* Simulation de réinitialisation (mocké car pas d'API)
    password === confirmPassword */
    setTimeout(() => {
      setIsLoading(false);
      navigate('/reset-password/success');
    }, 1000);
  };

  return (
    <AuthShell step="reset">
      <h1 className="text-2xl font-semibold -tracking-[0.02em] mb-1.5">Nouveau mot de passe</h1>
      <p className="text-sm text-ink2 mb-7">
        Choisissez un nouveau mot de passe pour le compte <strong className="text-ink">christopher@nova.dev</strong>.
      </p>

      <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
        <Field
          label="Nouveau mot de passe"
          icon={Lock}
          type="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordRules value={password} />
        
        <Field
          label="Confirmer le mot de passe"
          icon={Lock}
          type="password"
          placeholder="••••••••"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          disabled={isLoading || password !== confirmPassword || password.length < 8 || !/\d/.test(password)}
          className={`h-10 mt-1 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition flex items-center justify-center ${
            isLoading || password !== confirmPassword || password.length < 8 || !/\d/.test(password) ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
        </button>
      </form>
    </AuthShell>
  );
}

/* ResetPasswordPage.tsx */