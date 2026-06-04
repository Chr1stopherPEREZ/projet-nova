import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../api/client'
import { Alert } from '../components/ui'
import { Mail, Lock } from 'lucide-react'
import { AuthShell, Field } from '../components/auth/AuthShell'

function RegisterPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    /* Validation front */
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setIsLoading(true)

    try {
      await authService.register(email, password)
      /* Redirection vers login après inscription réussie avec message de succès */
      navigate('/login', { 
        state: { success: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.' } 
      })
    } catch (err: any) {
      if (err.message && err.message.includes('déjà enregistré')) {
        setError('Cet email est déjà enregistré')
      } else {
        setError(err.message || "Une erreur est survenue lors de l'inscription")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold -tracking-[0.02em] mb-1.5">Créer un compte</h1>
      <p className="auth-lead text-sm text-ink2 mb-7">Aucune carte bancaire requise.</p>

      {/* Error message */}
      {error && (
        <div className="mb-4">
          <Alert variant="danger">{error}</Alert>
        </div>
      )}

      <form className="auth-form flex flex-col gap-3.5" onSubmit={handleSubmit}>
        <Field 
          label="Nom d’utilisateur" 
          placeholder="Christopher" 
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Field 
          label="Adresse e-mail" 
          icon={Mail} 
          type="email" 
          placeholder="vous@exemple.fr"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <div className="flex flex-col gap-1.5">
          <Field 
            label="Mot de passe" 
            icon={Lock} 
            type="password" 
            placeholder="8 caractères minimum"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-[12.5px] text-ink2">Au moins 8 caractères, dont 1 chiffre.</div>
        </div>

        <label className="flex items-start gap-2 mt-1 leading-[1.5] cursor-pointer">
          <input type="checkbox" required defaultChecked className="mt-0.5 w-3.5 h-3.5 accent-primary" />
          <span className="text-[12.5px] text-ink2">
            J’accepte les <a href="#" className="text-primary">conditions d’utilisation</a>.
          </span>
        </label>

        <button 
          disabled={isLoading}
          className={`h-10 mt-1 rounded-md bg-primary text-white text-[13px] font-medium hover:bg-primary-hover transition flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Création en cours...' : 'Créer mon compte'}
        </button>
      </form>

      <p className="text-[13px] text-ink2 text-center mt-7">
        Déjà inscrit ?{' '}
        <Link to="/login" className="text-primary font-medium">Se connecter</Link>
      </p>
    </AuthShell>
  )
}

export default RegisterPage

/* RegisterPage.tsx */
