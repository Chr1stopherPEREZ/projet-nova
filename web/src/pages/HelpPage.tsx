import DashboardLayout from '../components/layout/DashboardLayout'
import { Card, CardContent } from '../components/ui/Card'
import { HelpCircle, Info, Rocket, Mail } from 'lucide-react'

export default function HelpPage() {
  const faqs = [
    {
      q: "Comment ajouter un produit ?",
      a: "Allez dans 'Mes suivis' et cliquez sur 'Ajouter un suivi'. Collez l'URL de la page produit (Nike ou site Shopify) et validez."
    },
    {
      q: "Quels sites sont supportés ?",
      a: "Actuellement, Nova supporte Nike et la plupart des sites basés sur Shopify. Nous ajoutons régulièrement de nouveaux profils."
    },
    {
      q: "À quelle fréquence les stocks sont-ils vérifiés ?",
      a: "La fréquence dépend de la configuration globale, généralement toutes les 15 à 60 minutes."
    },
    {
      q: "Comment suis-je notifié ?",
      a: "Vous recevrez un email dès qu'un changement d'état du stock (ex: Rupture -> En stock) est détecté."
    }
  ]

  return (
    <DashboardLayout
      title="Centre d'Aide"
      subtitle="Tout ce qu'il faut savoir sur Nova"
    >
      <div className="max-w-4xl space-y-8">
        {/* Comment ça marche */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Rocket className="h-10 w-10 text-primary-600 mx-auto mb-4" />
              <h3 className="font-bold text-text mb-2">1. Ajoutez</h3>
              <p className="text-sm text-gray-600">Copiez l'URL de votre produit préféré.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Info className="h-10 w-10 text-primary-600 mx-auto mb-4" />
              <h3 className="font-bold text-text mb-2">2. Nova surveille</h3>
              <p className="text-sm text-gray-600">Nous vérifions le stock en arrière-plan.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Mail className="h-10 w-10 text-primary-600 mx-auto mb-4" />
              <h3 className="font-bold text-text mb-2">3. Soyez alerté</h3>
              <p className="text-sm text-gray-600">Recevez un email dès que c'est disponible !</p>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary-600" />
            Questions Fréquentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <Card key={idx}>
                <CardContent className="py-4">
                  <p className="font-bold text-text mb-1">{faq.q}</p>
                  <p className="text-gray-600 text-sm">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

/* HelpPage.tsx */
