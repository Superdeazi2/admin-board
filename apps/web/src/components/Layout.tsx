import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, ClipboardList, LogOut, Menu, Users, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../auth'
import type { Permission } from '../api'
import { hasUiPermission } from '../permissions'

const nav: Array<{
  to: string
  label: string
  icon: typeof ClipboardList
  permission?: Permission
}> = [
  { to: '/tickets', label: 'Заявки', icon: ClipboardList },
  { to: '/analytics', label: 'Статистика', icon: BarChart3, permission: 'analytics.view' },
  { to: '/users', label: 'Команда', icon: Users, permission: 'users.view' },
]

const titles: Record<string, string> = {
  '/tickets': 'Заявки',
  '/analytics': 'Статистика',
  '/users': 'Команда',
}

export function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleNav = nav.filter(
    (item) => !item.permission || hasUiPermission(user, item.permission),
  )

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">AB</div>
          <div>
            <strong>Admin Board</strong>
            <span>Support workspace</span>
          </div>
          <button
            className="icon-button sidebar-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Закрыть меню"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="nav-list">
          {visibleNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="avatar">{user?.name?.slice(0, 2).toUpperCase()}</div>
          <div className="sidebar-user-copy">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
          <button className="icon-button" onClick={() => void logout()} aria-label="Выйти">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <button
          className="backdrop"
          aria-label="Закрыть меню"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMobileOpen(true)}
            aria-label="Открыть меню"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1>{titles[location.pathname] ?? 'Admin Board'}</h1>
            <p>
              {new Intl.DateTimeFormat('ru-RU', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              }).format(new Date())}
            </p>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
