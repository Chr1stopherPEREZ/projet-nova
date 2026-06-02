import { useState, FormEvent, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { authService } from '../api/client'
import { Button, Input, Alert } from '../components/ui'

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
          <h2 className="mt-4 text-2xl font-bold text-text">Connexion</h2>
          <p className="mt-2 text-sm text-gray-600">
            Suivi de retour en stock
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Messages */}
          {error && (
            <Alert variant="danger">{error}</Alert>
          )}
          {success && (
            <Alert variant="success">{success}</Alert>
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            Se connecter
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                S'inscrire gratuitement
              </Link>
            </p>
          </div>
        </form>

      </div>
    </div>
  )
}

export default LoginPage

/* LoginPage.tsx */