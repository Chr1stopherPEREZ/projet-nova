import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Settings } from 'lucide-react'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { authService } from '../../api/client'

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

export default function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      navigate('/login')
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h1 className="text-2xl font-bold text-text">{title}</h1>
              )}
              {subtitle && (
                <p className="text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}

/* DashboardLayout.tsx */