import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Pin,
  Settings, 
  Box,
  LogOut 
} from 'lucide-react'

interface NavItem {
  label: string
  path: string
  icon: typeof LayoutDashboard
}

const mainNavItems: NavItem[] = [
  { label: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Mes suivis', path: '/watches', icon: Pin },
  { label: 'Paramètres', path: '/settings', icon: Settings },
]

const supportNavItems: NavItem[] = [
  { label: 'Aide', path: '/help', icon: Box },
]

interface SidebarProps {
  onLogout: () => void
}

export default function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-border h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-2">
          <img 
            src="/Logo_Nova.png" 
            alt="Nova Logo" 
            className="h-10 w-auto"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        {/* Section GENERAL */}
        <div className="mb-6">
          <h3 className="px-2 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Général
          </h3>
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-text hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Section SUPPORT */}
        <div>
          <h3 className="px-2 mb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Support
          </h3>
          <ul className="space-y-1">
            {supportNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-text hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              </li>
            ))}
            {/* Logout button */}
            <li>
              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold text-text hover:bg-gray-100 transition-colors w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                Déconnexion
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  )
}

/* Sidebar.tsx */