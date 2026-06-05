import { useState, FormEvent, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { authService } from '../api/client'
import { Alert } from '../components/ui'
import { Mail, Lock } from 'lucide-react'
import { AuthShell, Field } from '../components/auth/AuthShell'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(location.state?.success || null)
  const [isLoading, setIsLoading] = useState(false)

  /* Effacer le message de succès s'il y a une erreur */
  useEffect(() => {
    if (error) setSuccess(null)
  }, [error])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const user = await authService.login(email, password)
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Invalid') || err.message.includes('401')) {
          setError('Email ou mot de passe incorrect')
        } else {
          setError(err.message || 'Erreur de connexion')
        }
      } else {
        setError('Erreur de connexion')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold -tracking-[0.02em] mb-1.5">Connexion</h1>
      <p className="auth-lead text-sm text-ink2 mb-7">Accédez à vos suivis Nova.</p>

      {/* Messages */}
      {error && (
        <div className="mb-4">
          <Alert variant="danger">{error}</Alert>
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert variant="success">{success}</Alert>
        </div>
      )}

      <form className="auth-form flex flex-col gap-3.5" onSubmit={handleSubmit}>
        <Field 
          label="Adresse e-mail" 
          icon={Mail} 
          type="email" 
          placeholder="vous@exemple.fr"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Mot de passe"
          icon={Lock}
          type="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          right={<Link to="/forgot-password" className="text-[12.5px] font-medium text-primary">Mot de passe oublié ?</Link>}
        />
        <button 
          disabled={isLoading}
          className={`h-10 mt-1 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </button>
      </form>

      <p className="text-[13px] text-ink2 text-center mt-7">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-primary font-medium">Créer un compte</Link>
      </p>
    </AuthShell>
  )
}

export default LoginPage

/* LoginPage.tsx */