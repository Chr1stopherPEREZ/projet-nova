import DashboardLayout from '../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Eye } from 'lucide-react'

export default function WatchesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Mes suivis</h1>
          <p className="text-gray-600">Gérez vos produits en surveillance</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary-600" />
              Page en cours de développement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Cette page sera disponible dans un prochain lot. Vous pourrez y gérer
              tous vos suivis de produits et consulter leur historique de disponibilité.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

/* WatchesPage.tsx */
