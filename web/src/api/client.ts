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
      ;(headers as Record<string, string>)['X-CSRF-Token'] = csrfToken
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: 'include', // Toujours envoyer les cookies
  })

  /* Gestion 401 → redirection login */
  if (response.status === 401 && !skipAuth) {
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  /* Gestion 204 No Content */
  if (response.status === 204) {
    return {} as T
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `HTTP Error ${response.status}`)
  }

  return response.json()
}

/* CSRF bootstrap : appelle le backend pour obtenir un csrf_token si absent */
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

/* Auth service */
export const authService = {
  async login(email: string, password: string) {
    /* S'assurer que le CSRF token est présent avant login */
    await csrfBootstrap()
    return apiFetch<{ id: number; email: string; role: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    })
  },

  async logout() {
    return apiFetch<void>('/auth/logout', {
      method: 'POST',
    })
  },

  async checkAuth(): Promise<boolean> {
    try {
      /* Utilise /auth/me dédié pour vérifier l'authentification */
      await apiFetch<{ id: number; email: string; role: string }>('/auth/me', { skipAuth: true })
      return true
    } catch {
      return false
    }
  },
}

export { apiFetch, getCsrfToken, csrfBootstrap, API_BASE_URL }

/* Client.ts */