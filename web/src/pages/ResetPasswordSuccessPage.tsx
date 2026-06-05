import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { AuthShell } from '../components/auth/AuthShell';
import { AuthStatus } from '../components/auth/AuthStatus';

export default function ResetPasswordSuccessPage() {
  const navigate = useNavigate();

  return (
    <AuthShell step="done">
      <AuthStatus
        icon={Check}
        variant="success"
        title="Mot de passe modifié"
        description="Votre mot de passe a bien été mis à jour. Vous pouvez maintenant vous connecter avec vos nouveaux identifiants."
      >
        <button
          onClick={() => navigate('/login')}
          className="h-10 mt-2 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition flex items-center justify-center w-full"
        >
          Se connecter
        </button>
      </AuthStatus>
    </AuthShell>
  );
}

/* ResetPasswordSuccessPage.tsx */