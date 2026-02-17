import DashboardLayout from '../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Paramètres</h1>
          <p className="text-gray-600">Configurez votre compte et vos préférences</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary-600" />
              Page en cours de développement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Cette page sera disponible dans un prochain lot. Vous pourrez y modifier
              vos informations personnelles, vos préférences de notification et les
              paramètres de votre compte.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

/* SettingsPage.tsx */
