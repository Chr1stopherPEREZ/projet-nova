import { useState, useEffect, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { authService } from '../api/client'

interface ProtectedRouteProps {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuthentication = async () => {
      const authenticated = await authService.checkAuth()
      setIsAuthenticated(authenticated)
    }
    checkAuthentication()
  }, [])

  /* État de chargement */
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  /* Non authentifié → redirection vers login */
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  /* Authentifié → afficher le contenu */
  return <>{children}</>
}

export default ProtectedRoute

/* ProtectedRoute.tsx */