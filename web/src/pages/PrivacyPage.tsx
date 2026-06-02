import DashboardLayout from '../components/layout/DashboardLayout'
import { Card, CardContent } from '../components/ui'

function PrivacyPage() {
  return (
    <DashboardLayout
      title="Politique de Confidentialité"
      subtitle="Vos données chez Nova"
    >
      <Card>
        <CardContent className="py-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-text mb-2">Collecte des données</h2>
            <p className="text-gray-600">
              Nova collecte uniquement les données nécessaires au service de surveillance : 
              votre adresse email pour le compte et les notifications, et les URLs des produits que vous surveillez.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-text mb-2">Finalité</h2>
            <p className="text-gray-600">
              Vos données sont utilisées exclusivement pour vous informer des changements de stock et gérer votre compte.
              Aucune donnée n'est vendue ou cédée à des tiers.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-text mb-2">Sécurité</h2>
            <p className="text-gray-600">
              Vos mots de passe sont hachés et vos sessions sont sécurisées par des jetons JWT et des protections CSRF.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-text mb-2">Contact</h2>
            <p className="text-gray-600">
              Pour toute question, contactez-nous à privacy@nova-app.com.
            </p>
          </section>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

export default PrivacyPage

/* PrivacyPage.tsx */