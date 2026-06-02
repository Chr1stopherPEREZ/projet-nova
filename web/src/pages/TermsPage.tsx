import DashboardLayout from '../components/layout/DashboardLayout'
import { Card, CardContent } from '../components/ui'

function TermsPage() {
  return (
    <DashboardLayout
      title="Conditions Générales d'Utilisation"
      subtitle="Utilisation du service Nova"
    >
      <Card>
        <CardContent className="py-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-text mb-2">Objet du service</h2>
            <p className="text-gray-600">
              Nova est un service de surveillance de stock de produits en ligne.
              L'utilisateur fournit des URLs que Nova analyse périodiquement.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-text mb-2">Responsabilité</h2>
            <p className="text-gray-600">
              Nova s'efforce de fournir des informations précises mais ne peut être tenu responsable
              des erreurs de détection ou des modifications sur les sites tiers.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-text mb-2">Utilisation Acceptable</h2>
            <p className="text-gray-600">
              L'utilisateur s'engage à ne pas utiliser le service pour surcharger les sites cibles (spam).
              Nova se réserve le droit de suspendre tout compte abusif.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-bold text-text mb-2">Propriété Intellectuelle</h2>
            <p className="text-gray-600">
              Le logiciel et son code source sont la propriété de leurs auteurs respectifs (Projet Nova).
            </p>
          </section>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}

export default TermsPage

/* TermsPage.tsx */