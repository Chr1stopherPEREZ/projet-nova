import { ReactNode, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pin, Settings, Menu, X } from 'lucide-react'
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
  /* const [unreadCount, setUnreadCount] = useState(0) */
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = await authService.checkAuth()
        const isUserAdmin = user?.role === 'ADMIN'
        setIsAdmin(isUserAdmin)

        if (!isUserAdmin && user) {
          const stats = await authService.getStats()
          if (stats && stats.kpis) {
            /* setUnreadCount(stats.kpis.unread_notifications_count || 0) */
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats for notification badge:', error)
      }
    }

    fetchStats()
    
    /* Actualiser toute les 5 minutes */
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  /*
  const handleNotificationClick = async () => {
    try {
      setUnreadCount(0)
      await authService.markNotificationsAsRead()
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
    navigate('/notifications')
  }
  */

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
    <div className="flex h-screen bg-background-app overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="bg-background-card border-b border-border-default px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 text-text-secondary hover:bg-background-app rounded-md"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <div>
                {title && (
                  <h1 className="text-xl md:text-2xl font-bold text-text-primary truncate max-w-[150px] sm:max-w-none">{title}</h1>
                )}
                {subtitle && (
                  <p className="text-text-secondary mt-1 text-sm hidden sm:block">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {!isAdmin && (
                <>
                  <button 
                    onClick={() => navigate('/watches')}
                    title="Mes suivis"
                    className="p-2 text-text-secondary hover:text-primary-600 hover:bg-background-app rounded-full transition-all flex items-center gap-2"
                  >
                    <Pin className="h-5 w-5" />
                    <span className="hidden md:inline text-sm font-semibold">Mes suivis</span>
                  </button>
                  {/* Bouton Notifications masqué pour la V2 (Page en attente) */}
                  {/* 
                  <button 
                    onClick={handleNotificationClick}
                    title="Notifications"
                    className="p-2 text-text-secondary hover:text-primary-600 hover:bg-background-app rounded-full transition-all relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger-text border-2 border-background-card rounded-full"></span>
                    )}
                  </button>
                  */}
                </>
              )}
              <button 
                onClick={() => navigate('/settings')}
                className="p-2 text-text-secondary hover:text-primary-600 hover:bg-background-app rounded-full transition-all"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}

/* DashboardLayout.tsx */