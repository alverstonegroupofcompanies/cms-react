import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { iconMap, IconLogout } from './Icons'
import type { NavItem } from '../config/navigation'

interface LayoutProps {
  title: string
  subtitle?: string
  nav: NavItem[]
  children: React.ReactNode
}

export default function Layout({ title, subtitle, nav, children }: LayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">Alverstone<span> Medcity</span></div>
        </div>
        <div className="sidebar-user">
          <div className="avatar">{initials}</div>
          <div>
            <p className="sidebar-user-name">{user?.name}</p>
            <span className="role-badge">{user?.role}</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {nav.map((item) => {
            const Icon = iconMap[item.icon]
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-link logout-btn">
            <IconLogout size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="main">
        <header className="page-header">
          <div>
            <h1>{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  )
}
