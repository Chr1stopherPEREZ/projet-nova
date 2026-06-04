import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  List,
  Users,
  Settings, 
  Shield,
  ChevronDown,
} from 'lucide-react'
import { authService } from '../../api/client'

interface SidebarProps {
  onLogout: () => void
  isOpen?: boolean
  onClose?: () => void
}

const NAV = {
  user: [
    { id: 'dashboard', label: 'Tableau de bord', path: '/dashboard', Icon: LayoutDashboard },
    { id: 'trackings', label: 'Mes suivis', path: '/watches', Icon: List, count: 5 },
  ],
  admin: [
    { id: 'admin', label: "Vue d'ensemble", path: '/admin/dashboard', Icon: LayoutDashboard },
    { id: 'users', label: 'Utilisateurs', path: '/admin/users', Icon: Users, count: 6 },
    { id: 'trackings', label: 'Tous les suivis', path: '/admin/watches', Icon: List, count: 12 },
  ],
};

export default function Sidebar({ onLogout, isOpen, onClose }: SidebarProps) {
  const [user, setUser] = useState<{ role: string; full_name?: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
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

  if (loading && !user) {
    return (
      <aside className="w-[240px] bg-surface border-r border-border h-screen flex flex-col shrink-0 animate-pulse">
        <div className="p-5 px-3">
          <div className="h-10 bg-muted rounded-md mb-4"></div>
          <div className="h-4 w-20 bg-muted rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-10 bg-muted rounded-md"></div>
            <div className="h-10 bg-muted rounded-md"></div>
          </div>
        </div>
      </aside>
    )
  }

  const isAdmin = user?.role === 'ADMIN'
  const items = isAdmin ? NAV.admin : NAV.user;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[240px] bg-surface border-r border-border h-screen flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 px-3 pt-5 pb-5 mb-3 border-b border-border mx-3">
          <div className="grid place-items-center w-7 h-7 rounded-md bg-ink text-white text-sm font-semibold shrink-0">N</div>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold leading-none text-ink">Nova</div>
            <div className="text-[11px] text-ink3 mt-0.5 truncate">{isAdmin ? 'Admin' : 'Surveillance produit'}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto">
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink3 px-2.5 pt-4 pb-1.5">
            {isAdmin ? 'Administration' : 'Espace de travail'}
          </div>
          <div className="space-y-px">
            {items.map(({ id, label, path, Icon, count }) => (
              <NavLink
                key={id}
                to={path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13.5px] font-medium transition-colors
                  ${isActive ? 'bg-muted text-ink' : 'text-ink2 hover:bg-muted hover:text-ink'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} strokeWidth={1.8} className={`shrink-0 ${isActive ? 'opacity-100' : 'opacity-90'}`} />
                    <span className="truncate">{label}</span>
                    {count != null && (
                      <span className={`ml-auto text-[11.5px] font-medium px-[7px] py-px rounded-[10px] border border-border transition-colors ${
                        isActive ? 'bg-white text-ink3' : 'bg-bg text-ink3'
                      }`}>
                        {count}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink3 px-2.5 pt-4 pb-1.5 mt-2">Compte</div>
          <div className="space-y-px">
            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13.5px] font-medium transition-colors
                ${isActive ? 'bg-muted text-ink' : 'text-ink2 hover:bg-muted hover:text-ink'}
              `}
            >
              <Settings size={16} strokeWidth={1.8} className="shrink-0 opacity-90" />
              <span>Paramètres</span>
            </NavLink>
            {!isAdmin && (
              <NavLink
                to="/security"
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13.5px] font-medium transition-colors
                  ${isActive ? 'bg-muted text-ink' : 'text-ink2 hover:bg-muted hover:text-ink'}
                `}
              >
                <Shield size={16} strokeWidth={1.8} className="shrink-0 opacity-90" />
                <span>Sécurité</span>
              </NavLink>
            )}
          </div>
        </nav>

        {/* User Footer */}
        <div className="mt-auto pt-2 p-2 border-t border-border mx-3 mb-3">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-muted transition-colors text-left"
          >
            <div className="grid place-items-center w-7 h-7 rounded-full bg-primary-soft text-primary text-[11.5px] font-semibold shrink-0">
              {(user?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium leading-tight text-ink truncate">
                {user?.full_name || user?.email?.split('@')[0]}
              </div>
              <div className="text-[11.5px] text-ink2 leading-tight truncate">{user?.email}</div>
            </div>
            <ChevronDown size={14} className="text-ink3" />
          </button>
        </div>
      </aside>
    </>
  )
}

/* Sidebar.tsx */