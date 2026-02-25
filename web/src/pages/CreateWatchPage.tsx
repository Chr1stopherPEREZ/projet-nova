import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Alert, PageContainer } from '../components/ui'
import { apiFetch } from '../api/client'
import { Plus, ArrowLeft, Search, Loader2, CheckCircle2 } from 'lucide-react'

/* Types pour le preview des variantes */
/**
 * Variante de produit telle que renvoyée par le backend (Preview).
 * Correspond à `VariantInfo` côté API.
 */
interface VariantInfo {
  variant_sku: string
  color: string | null
  size: string | null
  available: boolean | null
  meta: Record<string, unknown> | null
}

/**
 * Réponse de l'endpoint `POST /watches/preview`.
 * Utilisée pour afficher les options et sélectionner une variante (Shopify/Nike).
 */
interface PreviewResponse {
  title: string | null
  source: string
  variants: VariantInfo[]
  debug_info?: {
    error?: string
    warning?: string
    http_status?: number
    next_data_keys?: string[]
    experimental?: boolean
  } | null
}

/* Étapes du formulaire */
type FormStep = 'url' | 'variants' | 'confirm'

/**
 * Page de création d'un suivi (Lot 7).
 * - Analyse une URL produit (Preview)
 * - Affiche les options de variantes (Shopify) et permet une sélection stricte
 * - Envoie `variant_selector`/`variant_meta` au backend lors de la création
 */
export default function CreateWatchPage() {
  const navigate = useNavigate()
  
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [step, setStep] = useState<FormStep>('url')
  
  const [preview, setPreview] = useState<PreviewResponse | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  
  /* Sélections Shopify */
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  
  /* Sélection de variante */
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<VariantInfo | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [noVariantsWarning, setNoVariantsWarning] = useState(false)
  /* Fallback global quand l'extraction des variantes est impossible (bloqué ou non supporté).
     Prépare l'ajout d'autres sources (warning agnostique de la plateforme). */
  const [confirmGlobalMode, setConfirmGlobalMode] = useState(false)

  /* Extraire les couleurs uniques depuis les variantes */
  const uniqueColors = useMemo(() => {
    if (!preview?.variants) return []
    const colorsMap = new Map<string, { label: string; colorCode: string | null }>()
    
    for (const v of preview.variants) {
      const colorKey = v.color || 'default'
      if (!colorsMap.has(colorKey)) {
        colorsMap.set(colorKey, {
          label: v.color || 'Couleur par défaut',
          colorCode: v.meta?.colorCode as string | null,
        })
      }
    }
    return Array.from(colorsMap.entries()).map(([key, value]) => ({
      key,
      ...value,
    }))
  }, [preview])

  /* Extraire les tailles disponibles pour la couleur sélectionnée */
  const availableSizes = useMemo(() => {
    if (!preview?.variants || !selectedColor) return []
    
    return preview.variants
      .filter(v => (v.color || 'default') === selectedColor && v.size)
      .map(v => ({
        size: v.size!,
        available: v.available,
        variant_sku: v.variant_sku,
      }))
  }, [preview, selectedColor])

  /* Extraire les options Shopify et leurs valeurs */
  const shopifyOptions = useMemo(() => {
    if (preview?.source !== 'shopify' || !preview.variants) return []
    
    const optionsMap: Record<string, Set<string>> = {}
    preview.variants.forEach(v => {
      const vOptions = (v.meta?.options as Record<string, string>) || {}
      Object.entries(vOptions).forEach(([name, value]) => {
        if (!optionsMap[name]) optionsMap[name] = new Set()
        optionsMap[name].add(value)
      })
    })
    
    return Object.entries(optionsMap).map(([name, values]) => ({
      name,
      values: Array.from(values)
    }))
  }, [preview])

  /* Trouver la variante Shopify correspondante aux options sélectionnées */
  const matchedShopifyVariant = useMemo(() => {
    if (preview?.source !== 'shopify' || !preview.variants) return null
    
    return preview.variants.find(v => {
      const vOptions = (v.meta?.options as Record<string, string>) || {}
      return Object.entries(selectedOptions).every(([name, value]) => vOptions[name] === value)
    }) || null
  }, [preview, selectedOptions])

  /* Analyser l'URL pour obtenir les variantes */
  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("L'URL est obligatoire")
      return
    }

    try {
      setAnalyzing(true)
      setError(null)
      setPreview(null)
      setSelectedColor(null)
      setSelectedSize(null)
      setSelectedVariant(null)
      /* Réinitialiser les options Shopify lors d'une nouvelle analyse pour éviter les sélections obsolètes entre produits. */
      setSelectedOptions({})

      const data = await apiFetch<PreviewResponse>('/watches/preview', {
        method: 'POST',
        body: JSON.stringify({ url: url.trim() }),
      })

      setPreview(data)
      
      /* Pré-remplir le label avec le titre si disponible */
      if (data.title && !label) {
        setLabel(data.title)
      }
      
      if (data.variants.length > 0) {
        setStep('variants')
        setNoVariantsWarning(false)
        
        /* Auto-sélection si une seule option par catégorie pour Shopify */
        if (data.source === 'shopify') {
          const initialOptions: Record<string, string> = {}
          const optionsMap: Record<string, Set<string>> = {}
          data.variants.forEach(v => {
            const vOptions = (v.meta?.options as Record<string, string>) || {}
            Object.entries(vOptions).forEach(([name, value]) => {
              if (!optionsMap[name]) optionsMap[name] = new Set()
              optionsMap[name].add(value)
            })
          })
          Object.entries(optionsMap).forEach(([name, values]) => {
            if (values.size === 1) {
              initialOptions[name] = Array.from(values)[0]
            }
          })
          setSelectedOptions(initialOptions)
        }
      } else if (data.source === 'nike' || data.source === 'shopify') {
        /* Fallback source connue mais sans variantes détectées - afficher avertissement */
        setNoVariantsWarning(true)
        setConfirmGlobalMode(false)
        /* Rester sur l'étape URL pour afficher l'avertissement */
      } else {
        /* Site générique sans variantes - passer directement à la confirmation */
        setNoVariantsWarning(false)
        setStep('confirm')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'analyse")
    } finally {
      setAnalyzing(false)
    }
  }

  /* Sélection d'une couleur */
  const handleColorSelect = (colorKey: string) => {
    setSelectedColor(colorKey)
    setSelectedSize(null)
    setSelectedVariant(null)
    
    /* Si pas de tailles pour cette couleur, sélectionner la première variante correspondante */
    const variants = preview?.variants.filter(v => (v.color || 'default') === colorKey) || []
    if (variants.length === 1 || variants.every(v => !v.size)) {
      /* Une seule variante ou variantes sans tailles → sélectionner directement */
      setSelectedVariant(variants[0])
    }
  }

  /* Sélection d'une taille */
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
    
    const variant = preview?.variants.find(
      v => (v.color || 'default') === selectedColor && v.size === size
    )
    setSelectedVariant(variant || null)
  }

  /* Sélection d'une option Shopify */
  const handleOptionSelect = (name: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [name]: value
    }))
  }

  /* Valider la sélection de variante */
  const handleConfirmVariant = () => {
    const isShopify = preview?.source === 'shopify'
    const variant = isShopify ? matchedShopifyVariant : selectedVariant
    
    if (preview?.variants.length && !variant) {
      setError(isShopify ? 'Veuillez sélectionner toutes les options' : 'Veuillez sélectionner une variante')
      return
    }
    setStep('confirm')
  }

  /* Créer le suivi */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      setError("L'URL est obligatoire")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const body: Record<string, unknown> = {
        url: url.trim(),
        label: label.trim() || null,
      }

      /* Ajouter les infos de variante si sélectionnée */
      const isShopify = preview?.source === 'shopify'
      const variant = isShopify ? matchedShopifyVariant : selectedVariant

      if (variant) {
        body.variant_sku = variant.variant_sku
        if (isShopify) {
          body.variant_selector = selectedOptions
          body.variant_meta = {
            title: preview?.title,
            source: 'shopify',
            options: variant.meta?.options
          }
        } else {
          body.variant_meta = {
            color: variant.color,
            size: variant.size,
            colorCode: variant.meta?.colorCode,
            source: preview?.source,
          }
        }
      }

      await apiFetch('/watches', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      navigate('/watches', { state: { success: 'Suivi créé avec succès !' } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  /* Revenir à l'étape précédente */
  const handleBack = () => {
    if (step === 'confirm' && preview?.variants.length) {
      setStep('variants')
    } else {
      setStep('url')
      setPreview(null)
      /* Réinitialiser les états de sélection lors du retour à l'étape URL */
      setSelectedOptions({})
      setSelectedColor(null)
      setSelectedSize(null)
      setSelectedVariant(null)
    }
  }

  return (
    <DashboardLayout>
      <PageContainer
        title="Créer un suivi"
        description="Ajoutez un nouveau produit à surveiller"
      >
        <div className="mb-4">
          <Link to="/watches" className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à la liste
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary-600" />
              Nouveau suivi
              {step !== 'url' && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {step === 'variants' ? '— Sélection de la variante' : '— Confirmation'}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="danger" className="mb-4">
                {error}
              </Alert>
            )}

            {/* Étape 1: URL + Analyser */}
            {step === 'url' && (
              <div className="space-y-4">
                <Input
                  label="URL du produit"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.nike.com/fr/t/..."
                  required
                />

                <Input
                  label="Nom (optionnel)"
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Mon produit préféré"
                />

                {/* Fallback global quand l'extraction des variantes est impossible.
                    Prépare l'ajout d'autres sources (warning agnostique). */}
                {noVariantsWarning && preview && (
                  <Alert variant="warning" className="mb-4">
                    <div className="space-y-3">
                      <p className="font-medium">
                        ⚠️ Impossible d'extraire les variantes
                      </p>
                      <p className="text-sm">
                        La structure de la page ou une protection anti-bot empêche la détection des options (coloris/tailles).
                      </p>
                      <div className="text-xs space-y-1">
                        <p className="text-gray-600 font-medium">Source détectée : {preview.source}</p>
                        {preview.debug_info?.warning && (
                          <p className="text-gray-500">
                            Détail: {preview.debug_info.warning}
                          </p>
                        )}
                      </div>
                      <p className="text-sm">
                        Vous pouvez créer un suivi en <strong>mode global</strong> (moins précis : Nova surveillera tout le produit, pas une variante spécifique).
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id="confirmGlobal"
                          checked={confirmGlobalMode}
                          onChange={(e) => setConfirmGlobalMode(e.target.checked)}
                          className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        />
                        <label htmlFor="confirmGlobal" className="text-sm text-gray-700">
                          Je comprends et je souhaite créer en mode global
                        </label>
                      </div>
                    </div>
                  </Alert>
                )}

                <div className="flex gap-3 pt-4">
                  {/* Bouton Analyser (masqué si l'avertissement de variantes est affiché) */}
                  {!noVariantsWarning && (
                    <Button 
                      type="button" 
                      onClick={handleAnalyze} 
                      isLoading={analyzing}
                      disabled={analyzing || !url.trim()}
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyse en cours...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Analyser le produit
                        </>
                      )}
                    </Button>
                  )}
                  
                  {/* Boutons si avertissement de variantes - propose le mode global ou de réessayer */}
                  {noVariantsWarning && (
                    <>
                      <Button 
                        type="button" 
                        onClick={() => setStep('confirm')}
                        disabled={!confirmGlobalMode}
                      >
                        Créer en mode global
                      </Button>
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={() => {
                          setNoVariantsWarning(false)
                          setConfirmGlobalMode(false)
                          setPreview(null)
                        }}
                      >
                        Réessayer
                      </Button>
                    </>
                  )}
                  
                  <Link to="/watches">
                    <Button type="button" variant="secondary" disabled={analyzing}>
                      Annuler
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Étape 2: Sélection de variante */}
            {step === 'variants' && preview && (
              <div className="space-y-6">
                {preview.title && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900">{preview.title}</h3>
                    <p className="text-sm text-gray-500">Source: {preview.source}</p>
                    {preview.debug_info?.experimental && (
                      <Alert variant="warning" className="mt-2 text-xs py-2">
                        {preview.debug_info.warning || "Mode expérimental"}
                      </Alert>
                    )}
                  </div>
                )}

                {/* UI Shopify: Sélections multiples par options */}
                {preview.source === 'shopify' && shopifyOptions.map((opt) => (
                  <div key={opt.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {opt.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map((val) => {
                        /* Pour indiquer si cette valeur spécifique est dispo (simplifié) */
                        /* On pourrait faire un calcul plus complexe basé sur les autres sélections */
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleOptionSelect(opt.name, val)}
                            className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                              selectedOptions[opt.name] === val
                                ? 'bg-primary-100 border-primary-500 text-primary-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            {val}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {/* UI Nike: Coloris + Tailles (existant) */}
                {preview.source === 'nike' && (
                  <>
                    {/* Sélection couleur */}
                    {uniqueColors.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Coloris
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {uniqueColors.map((color) => (
                            <button
                              key={color.key}
                              type="button"
                              onClick={() => handleColorSelect(color.key)}
                              className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                                selectedColor === color.key
                                  ? 'bg-primary-100 border-primary-500 text-primary-700'
                                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                              }`}
                            >
                              {color.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sélection taille */}
                    {selectedColor && availableSizes.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Taille
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {availableSizes.map((item) => (
                            <button
                              key={item.variant_sku}
                              type="button"
                              onClick={() => handleSizeSelect(item.size)}
                              className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                                selectedSize === item.size
                                  ? 'bg-primary-100 border-primary-500 text-primary-700'
                                  : item.available === false
                                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                              }`}
                              disabled={item.available === false}
                              title={item.available === false ? 'Indisponible' : undefined}
                            >
                              {item.size}
                              {item.available === false && ' (indispo)'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Résumé de la sélection */}
                {(preview.source === 'shopify' ? matchedShopifyVariant : selectedVariant) && (
                  <div className="bg-success-50 p-4 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-success-800">Variante sélectionnée</p>
                      <p className="text-sm text-success-700">
                        {preview.source === 'shopify' ? (
                          Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(' — ')
                        ) : (
                          <>
                            {selectedVariant?.color}
                            {selectedVariant?.size && ` — Taille ${selectedVariant.size}`}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-success-600 mt-1">
                        SKU: {(preview.source === 'shopify' ? matchedShopifyVariant : selectedVariant)?.variant_sku}
                      </p>
                      {(preview.source === 'shopify' ? matchedShopifyVariant : selectedVariant)?.available === false && (
                         <p className="text-xs text-danger-600 font-bold mt-1">
                           Actuellement en rupture de stock
                         </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={handleConfirmVariant}
                    disabled={preview.source === 'shopify' ? !matchedShopifyVariant : !selectedVariant}
                  >
                    Continuer
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleBack}>
                    Retour
                  </Button>
                </div>
              </div>
            )}

            {/* Étape 3: Confirmation */}
            {step === 'confirm' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">URL:</span> {url}
                  </p>
                  {label && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Nom:</span> {label}
                    </p>
                  )}
                  {selectedVariant || matchedShopifyVariant ? (
                    <div className="pt-2 border-t border-gray-200 mt-2">
                      <p className="text-sm font-medium text-gray-700">Variante surveillée:</p>
                      <p className="text-sm text-gray-600">
                        {preview?.source === 'shopify' ? (
                          Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(' — ')
                        ) : (
                          <>
                            {selectedVariant?.color}
                            {selectedVariant?.size && ` — Taille ${selectedVariant.size}`}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        SKU: {(preview?.source === 'shopify' ? matchedShopifyVariant : selectedVariant)?.variant_sku}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-warning-600 pt-2 border-t border-gray-200 mt-2">
                      ⚠️ Mode global: surveillance de tout le produit (moins précis)
                    </p>
                  )}
                </div>

                <Input
                  label="Nom du suivi"
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Mon produit préféré"
                />

                <div className="flex gap-3 pt-4">
                  <Button type="submit" isLoading={loading}>
                    Créer le suivi
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleBack} disabled={loading}>
                    Retour
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </DashboardLayout>
  )
}

/* CreateWatchPage.tsx */
