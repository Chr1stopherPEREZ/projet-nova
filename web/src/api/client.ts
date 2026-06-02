/**
 * ApiClient central pour Nova Frontend
 * - baseURL via VITE_API_URL
 * - credentials: "include" sur toutes les requêtes
 * - Ajout automatique header X-CSRF-Token sur POST/PUT/DELETE
 * - Gestion erreur 401 → redirection /login
 * - CSRF bootstrap au démarrage
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getCsrfToken(): string | null {
  const match = document.cookie.match(/csrf_token=([^;]+)/)
  return match ? match[1] : null
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean
}

/**
 * Appelle l'API Nova avec gestion centralisée.
 * - Ajoute toujours les cookies (credentials: include)
 * - Ajoute le header `X-CSRF-Token` pour les méthodes mutables (POST/PUT/PATCH/DELETE)
 * - Redirige vers `/login` en cas de 401 (sauf si `skipAuth=true`)
 * - Lève une erreur avec message explicite si la réponse n'est pas OK
 */
async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers || {}),
  }

  /* Ajouter le CSRF token sur les requêtes qui modifient les données */
  const method = (fetchOptions.method || 'GET').toUpperCase()
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      (headers as Record<string, string>)['X-CSRF-Token'] = csrfToken
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: 'include', /* Toujours envoyer les cookies */
  })

  /* Gestion 401 → redirection login */
  if (response.status === 401 && !skipAuth) {
    /* Éviter redirection si déjà sur une page publique */
    const isPublicPage = ['/login', '/register', '/login/', '/register/'].includes(window.location.pathname)
    if (!isPublicPage) {
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }

  /* Gestion 204 No Content */
  if (response.status === 204) {
    return {} as T
  }

  if (!response.ok) {
    if (response.status === 500) {
      throw new Error("Erreur interne du serveur (500). Veuillez contacter l'administrateur ou réessayer plus tard.")
    }
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData.error?.message || errorData.detail || `HTTP Error ${response.status}`
    throw new Error(errorMessage)
  }

  return response.json()
}

/* CSRF bootstrap : appelle le backend pour obtenir un csrf_token si absent */
/**
 * Initialise le cookie CSRF côté navigateur si absent.
 * À appeler avant une première requête mutante (ex. `login`).
 */
async function csrfBootstrap(): Promise<void> {
  const existingToken = getCsrfToken()
  if (!existingToken) {
    try {
      await fetch(`${API_BASE_URL}/auth/_csrf-bootstrap`, {
        method: 'GET',
        credentials: 'include',
      })
    } catch (error) {
      console.warn('CSRF bootstrap failed:', error)
    }
  }
}

export interface User {
  id: number | string
  email: string
  role: string
}

let userCache: User | null = null
let userCacheExpiry = 0
const CACHE_DURATION = 1000 * 60 * 5 // 5 minutes

/* Auth service */
/**
 * Service d'authentification Frontend.
 * Regroupe les appels `login`, `logout` et `checkAuth` en s'appuyant sur `apiFetch`.
 */
export const authService = {
  async login(email: string, password: string): Promise<User> {
    /* S'assurer que le CSRF token est présent avant login */
    await csrfBootstrap()
    const user = await apiFetch<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    })
    userCache = user
    userCacheExpiry = Date.now() + CACHE_DURATION
    return user
  },

  async register(email: string, password: string): Promise<User> {
    /* S'assurer que le CSRF token est présent avant register */
    await csrfBootstrap()
    const user = await apiFetch<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    })
    userCache = user
    userCacheExpiry = Date.now() + CACHE_DURATION
    return user
  },

  async logout(): Promise<void> {
    userCache = null
    userCacheExpiry = 0
    return apiFetch<void>('/auth/logout', {
      method: 'POST',
    })
  },

  async checkAuth(): Promise<User | null> {
    if (userCache && Date.now() < userCacheExpiry) {
      return userCache
    }

    try {
      /* Utilise /auth/me dédié pour vérifier l'authentification */
      const user = await apiFetch<User>('/auth/me', { skipAuth: true })
      userCache = user
      userCacheExpiry = Date.now() + CACHE_DURATION
      return user
    } catch {
      userCache = null
      userCacheExpiry = 0
      return null
    }
  },

  async getStats(): Promise<any> {
    return apiFetch<any>('/stats/dashboard')
  },

  async getAdminStats(): Promise<any> {
    return apiFetch<any>('/admin/stats/dashboard')
  },
  
  async markNotificationsAsRead(): Promise<void> {
    return apiFetch<void>('/stats/notifications/mark-as-read', {
      method: 'POST',
    })
  },
}

export { apiFetch, getCsrfToken, csrfBootstrap, API_BASE_URL }

/* Client.ts */