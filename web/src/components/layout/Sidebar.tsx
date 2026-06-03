import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Pin,
  Settings, 
  Box,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import { authService } from '../../api/client'

interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
}

interface SidebarProps {
  onLogout: () => void
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ onLogout, isOpen, onClose }: SidebarProps) {
  const [user, setUser] = useState<{ role: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      /* Tenter de récupérer l'utilisateur immédiatement s'il est déjà en cache
      checkAuth() est maintenant asynchrone mais rapide si en cache */
      try {
        const u = await authService.checkAuth()
        setUser(u)
      } catch (error) {
        console.error('Sidebar: failed to fetch user', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  /* Pour éviter le saut visuel, on n'affiche le skeleton QUE si on n'a vraiment pas d'utilisateur
  et que le chargement est en cours. Si l'appel est instantané (cache), loading passera
  très vite à false ou user sera déjà là. */
  if (loading && !user) {
    return (
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-background-sidebar border-r border-border-default transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col`}>
        <div className="px-6 py-6 animate-pulse">
          <div className="h-10 w-32 bg-border-default rounded-md"></div>
        </div>
        <div className="flex-1 px-4 space-y-4 pt-4">
          <div className="h-4 w-20 bg-background-app rounded"></div>
          <div className="h-10 w-full bg-background-app rounded-lg"></div>
          <div className="h-10 w-full bg-background-app rounded-lg"></div>
          <div className="h-10 w-full bg-background-app rounded-lg"></div>
        </div>
      </aside>
    )
  }

  const isAdmin = user?.role === 'ADMIN'

  /* Menu Utilisateur */
  const userMainNavItems: NavItem[] = [
    { label: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Mes suivis', path: '/watches', icon: Pin },
    // { label: 'Notifications', path: '/notifications', icon: Bell }, /* STUB */
    { label: 'Paramètres', path: '/settings', icon: Settings },
  ]

  /* Menu Admin */
  const adminMainNavItems: NavItem[] = [
    { label: 'Tableau de bord', path: '/admin/dashboard', icon: LayoutDashboard },
    // { label: 'Tous les suivis', path: '/admin/watches', icon: Pin }, /* STUB */
    // { label: 'Tester un profil', path: '/admin/test-profile', icon: Search }, /* STUB */
    // { label: 'Profils de site', path: '/admin/site-profiles', icon: Globe }, /* PARTIAL - Masqué pour V1/Rattrapage */
    { label: 'Paramètres', path: '/settings', icon: Settings },
  ]

  const mainNavItems = isAdmin ? adminMainNavItems : userMainNavItems

  const supportNavItems: NavItem[] = [
    { label: 'Aide', path: '/help', icon: Box },
  ]

  /* Ajouter "Confidentialité" pour les users */
  if (!isAdmin) {
    supportNavItems.push({ label: 'Confidentialité', path: '/privacy', icon: ShieldCheck })
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-auth-bg/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-background-sidebar border-r border-border-default h-screen flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
      <div className="px-6 py-10">
        <div className="flex items-center justify-center lg:justify-start">
          <img 
            src="/Logo_Nova_V2.png" 
            alt="Nova Logo" 
            className="h-14 w-auto object-contain"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto">
        {/* Section GENERAL */}
        <div className="mb-8">
          <h3 className="px-3 mb-3 text-xs font-bold text-text-muted uppercase tracking-widest">
            Général
          </h3>
          <ul className="space-y-1.5">
            {mainNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 shadow-sm'
                        : 'text-text-secondary hover:bg-background-app hover:text-text-primary'
                    }`
                  }
                >
                  <item.icon className={`h-5 w-5 transition-colors`} />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Section SUPPORT */}
        <div>
          <h3 className="px-3 mb-3 text-xs font-bold text-text-muted uppercase tracking-widest">
            Support
          </h3>
          <ul className="space-y-1.5">
            {supportNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 shadow-sm'
                        : 'text-text-secondary hover:bg-background-app hover:text-text-primary'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              </li>
            ))}
            {/* Logout button */}
            <li className="pt-4 mt-4 border-t border-border-default">
              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger-text hover:bg-danger-bg transition-all duration-200 w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                Déconnexion
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  </>
  )
}

/* Sidebar.tsx */