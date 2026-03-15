import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/auth'
import {
  LayoutDashboard,
  UserPlus,
  Ticket,
  Monitor,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', requireManager: true },
  { to: '/onboard', icon: UserPlus, label: 'Onboard', requireManager: true },
  { to: '/tickets', icon: Ticket, label: 'Tickets', requireManager: false },
  { to: '/it', icon: Monitor, label: 'IT Ops', requireAdmin: true },
]

export function Layout() {
  const { user, isITAdmin, isManager, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const visibleItems = navItems.filter((item) => {
    if (item.requireAdmin && !isITAdmin) return false
    if (item.requireManager && !isManager) return false
    return true
  })

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-white border-r border-gray-200 transition-all',
          collapsed ? 'w-16' : 'w-56',
        )}
      >
        <div className={cn('flex items-center gap-2 px-4 h-14 border-b border-gray-200', collapsed && 'justify-center')}>
          <Monitor className="h-6 w-6 text-blue-600 shrink-0" />
          {!collapsed && <span className="font-semibold text-gray-900">IT Agent</span>}
        </div>

        <nav className="flex-1 py-2">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  collapsed && 'justify-center',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-10 border-t border-gray-200 text-gray-400 hover:text-gray-600"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-end gap-4 px-6 h-14 bg-white border-b border-gray-200">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
