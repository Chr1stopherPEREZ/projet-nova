import { useState, useEffect, ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { authService } from '../api/client'

interface ProtectedRouteProps {
  children: ReactNode
  adminOnly?: boolean
}

function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const [user, setUser] = useState<any | null>(undefined)

  useEffect(() => {
    const checkAuthentication = async () => {
      const u = await authService.checkAuth()
      setUser(u)
    }
    checkAuthentication()
  }, [])

  /* État de chargement */
  if (user === undefined) {
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
  if (!user) {
    return <Navigate to="/login" replace />
  }

  /* Admin only check */
  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" state={{ error: "Accès réservé administrateur" }} replace />
  }

  /* Authentifié → afficher le contenu */
  return <>{children}</>
}

export default ProtectedRoute

/* ProtectedRoute.tsx */