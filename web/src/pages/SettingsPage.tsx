import { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui'
import { User, Bell, LogOut } from 'lucide-react'
import { authService, User as UserType } from '../api/client'
import { useNavigate } from 'react-router-dom'

export default function SettingsPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      const u = await authService.checkAuth()
      setUser(u)
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      navigate('/login')
    }
  }

  return (
    <DashboardLayout
      title="Paramètres"
      subtitle="Gérez votre compte et vos préférences"
    >
      <div className="max-w-4xl space-y-6">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary-600" />
              Profil Utilisateur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-gray-500">Adresse email</p>
              <p className="text-lg font-bold text-text">{user?.email || 'Chargement...'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-text">Notifications Email</p>
                <p className="text-sm text-gray-600">Recevoir une alerte lors d'un changement de stock (Activé par défaut)</p>
                <p className="text-xs text-primary-600 italic mt-1">Note : L'option est simulée pour la démo, la gestion réelle est prévue pour la V2.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-danger-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-danger-600">
              <LogOut className="h-5 w-5" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="text-danger-600 border-danger-600 hover:bg-danger-50"
              onClick={handleLogout}
            >
              Se déconnecter de Nova
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

/* SettingsPage.tsx */
