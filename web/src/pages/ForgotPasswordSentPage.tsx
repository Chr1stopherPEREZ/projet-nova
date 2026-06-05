import { useLocation, Link } from 'react-router-dom';
import { Mail, ExternalLink } from 'lucide-react';
import { AuthShell } from '../components/auth/AuthShell';
import { AuthStatus } from '../components/auth/AuthStatus';

export default function ForgotPasswordSentPage() {
  const location = useLocation();
  const email = location.state?.email || 'votre adresse e-mail';

  return (
    <AuthShell step="sent">
      <AuthStatus
        icon={Mail}
        title="Consultez vos e-mails"
        description={
          <>
            Si un compte existe pour <strong className="text-ink">{email}</strong>,
            vous recevrez un e-mail contenant un lien pour réinitialiser votre mot de passe.
          </>
        }
      >
        {import.meta.env.DEV && (
          <div className="bg-bg border border-border rounded-lg p-4 mb-5">
            <div className="text-[12px] text-ink3 uppercase tracking-[0.06em] font-medium mb-2">
              Environnement de développement
            </div>
            <div className="text-[13px] text-ink2 leading-relaxed">
              L'e-mail a été délivré à <span className="font-mono text-ink">Mailhog</span> sur{' '}
              <a
                href="http://localhost:8025"
                target="_blank"
                rel="noreferrer"
                className="text-primary font-medium inline-flex items-center gap-1 hover:underline"
              >
                localhost:8025 <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}

        <div className="text-[13px] text-ink2 text-center mb-1.5">
          Le lien expire dans <strong className="text-ink">30 minutes</strong>.
        </div>

        <div className="text-[13px] text-ink2 text-center">
          Rien reçu ?{' '}
          <Link to="/forgot-password" className="text-primary font-medium hover:underline">
            Renvoyer
          </Link>
          {' · '}
          <Link to="/login" className="text-ink2 hover:text-ink transition">
            Retour connexion
          </Link>
        </div>
      </AuthStatus>
    </AuthShell>
  );
}

/* ForgotPasswordSentPage.tsx */