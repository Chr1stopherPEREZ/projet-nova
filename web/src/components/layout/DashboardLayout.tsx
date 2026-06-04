import { ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Topbar } from './Topbar'
import { authService } from '../../api/client'

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: ReactNode /* Pour compatibilité pages hors périmètre */
  topbarAction?: ReactNode
}

export default function DashboardLayout({ children, title, topbarAction }: DashboardLayoutProps) {
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
    <div className="grid lg:grid-cols-[240px_1fr] h-screen font-sans text-ink bg-bg antialiased overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main area */}
      <div className="flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar */}
        <Topbar 
          title={title || "Nova"} 
          action={topbarAction} 
        />

        {/* Content - C'est ici que ça scrolle */}
        <main className="flex-1 overflow-y-auto p-7">
          {children}
        </main>
      </div>
    </div>
  )
}

/* DashboardLayout.tsx */