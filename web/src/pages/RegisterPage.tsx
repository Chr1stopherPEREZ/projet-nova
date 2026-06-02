import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../api/client'
import { Button, Input, Alert } from '../components/ui'

function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    /* Validation front */
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

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
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/Logo_Nova.png" 
              alt="Nova Logo" 
              className="h-20 w-auto"
            />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-text">Créer un compte</h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez Nova pour suivre vos produits favoris
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error message */}
          {error && (
            <Alert variant="danger">{error}</Alert>
          )}

          <div className="space-y-4">
            {/* Email */}
            <Input
              label="Adresse email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
            />

            {/* Password */}
            <Input
              label="Mot de passe"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {/* Confirm Password */}
            <Input
              label="Confirmer le mot de passe"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            S'inscrire
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage

/* RegisterPage.tsx */
