import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { AuthShell, Field } from '../components/auth/AuthShell';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('christopher@example.test');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    /* Simulation d'envoi (mocké car pas d'API) */
    setTimeout(() => {
      setIsLoading(false);
      navigate('/forgot-password/sent', { state: { email } });
    }, 800);
  };

  return (
    <AuthShell step="request">
      <h1 className="text-2xl font-semibold -tracking-[0.02em] mb-1.5">Mot de passe oublié ?</h1>
      <p className="text-sm text-ink2 mb-7">
        Saisissez l'adresse e-mail associée à votre compte. Si elle existe,
        nous vous enverrons un lien pour réinitialiser votre mot de passe.
      </p>

      <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
        <Field
          label="Adresse e-mail"
          icon={Mail}
          type="email"
          placeholder="vous@exemple.fr"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          disabled={isLoading}
          className={`h-10 mt-1 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition flex items-center justify-center ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
        </button>
        <Link
          to="/login"
          className="text-[13px] text-ink2 text-center mt-2 hover:text-ink transition"
        >
          ← Retour à la connexion
        </Link>
      </form>
    </AuthShell>
  );
}

/* ForgotPasswordPage.tsx */