import { useEffect, useState, useRef } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import WatchesPage from './pages/WatchesPage'
import CreateWatchPage from './pages/CreateWatchPage'
import WatchDetailPage from './pages/WatchDetailPage'
import SettingsPage from './pages/SettingsPage'
import HelpPage from './pages/HelpPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminWatchesPage from './pages/AdminWatchesPage'
import AdminTestProfilePage from './pages/AdminTestProfilePage'
import AdminSiteProfilesPage from './pages/AdminSiteProfilesPage'
import NotificationsPage from './pages/NotificationsPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ProtectedRoute from './components/ProtectedRoute'
import { csrfBootstrap } from './api/client'

function App() {
  const [isBootstrapped, setIsBootstrapped] = useState(false)
  const bootstrapAttempted = useRef(false)

  useEffect(() => {
    /* CSRF bootstrap au démarrage de l'app (une seule fois) */
    if (bootstrapAttempted.current) return
    bootstrapAttempted.current = true

    const initCsrf = async () => {
      try {
        await csrfBootstrap()
      } catch (error) {
        console.warn('CSRF bootstrap failed:', error)
      } finally {
        setIsBootstrapped(true)
      }
    }

    initCsrf()
  }, [])

  /* Afficher un loader pendant le bootstrap CSRF */
  if (!isBootstrapped) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <svg 
            className="animate-spin h-8 w-8 text-primary-600 mx-auto" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm text-gray-600">Initialisation...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/watches"
        element={
          <ProtectedRoute adminOnly>
            <AdminWatchesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/test-profile"
        element={
          <ProtectedRoute adminOnly>
            <AdminTestProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/site-profiles"
        element={
          <ProtectedRoute adminOnly>
            <AdminSiteProfilesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/privacy"
        element={
          <ProtectedRoute>
            <PrivacyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/terms"
        element={
          <ProtectedRoute>
            <TermsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/watches"
        element={
          <ProtectedRoute>
            <WatchesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/watches/new"
        element={
          <ProtectedRoute>
            <CreateWatchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/watches/:id"
        element={
          <ProtectedRoute>
            <WatchDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/help"
        element={
          <ProtectedRoute>
            <HelpPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App

/* App.tsx */