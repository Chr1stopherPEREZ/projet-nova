import DashboardLayout from '../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { HelpCircle } from 'lucide-react'

export default function HelpPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Aide</h1>
          <p className="text-gray-600">Centre d'aide et documentation</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary-600" />
              Page en cours de développement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Cette page sera disponible dans un prochain lot. Vous y trouverez
              la documentation, les FAQ et les informations de contact du support.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

/* HelpPage.tsx */
