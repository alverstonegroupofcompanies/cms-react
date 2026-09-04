import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { iconMap, IconLogout } from './Icons'
import type { NavItem } from '../config/navigation'

interface Props {
  children: React.ReactNode
}

const NAV: NavItem[] = [
  { to: '/patient/dashboard', label: 'Home', icon: 'dashboard' },
  { to: '/patient/book', label: 'Book', icon: 'calendar' },
  { to: '/patient/appointments', label: 'Visits', icon: 'calendar' },
  { to: '/patient/lab-reports', label: 'Labs', icon: 'flask' },
  { to: '/patient/profile', label: 'Profile', icon: 'users' },
]

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

export default function PatientLayout({ children }: Props) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <div className="ph-app">
      <div className="ph-bg" aria-hidden>
        <div className="ph-leaf ph-leaf-1" />
        <div className="ph-leaf ph-leaf-2" />
      </div>

      <header className="ph-header">
        <div className="ph-header-inner">
          <NavLink to="/patient/dashboard" className="ph-logo">
            <span className="ph-logo-mark" aria-hidden>+</span>
            <span className="ph-logo-text">
              <strong>Alverstone Clinic</strong>
              <span>Better Health. Brighter Tomorrow.</span>
            </span>
          </NavLink>

          <nav className={`ph-nav ${menuOpen ? 'open' : ''}`}>
            {NAV.map((item) => {
              const Icon = iconMap[item.icon]
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/patient/dashboard'}
                  className={({ isActive }) => `ph-nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="ph-header-right">
            <button type="button" className="ph-icon-btn" aria-label="Notifications" title="Notifications">
              <BellIcon />
              <span className="ph-notif-dot" />
            </button>
            <NavLink to="/patient/profile" className="ph-user-chip" title="My profile">
              <div className="ph-user-avatar">{initials}</div>
            </NavLink>
            <button type="button" className="ph-logout-btn" onClick={handleLogout} title="Sign out">
              <IconLogout size={18} />
            </button>
            <button
              type="button"
              className="ph-menu-toggle"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <main className="ph-main">{children}</main>

      <nav className="ph-bottom-nav" aria-label="Patient navigation">
        {NAV.map((item) => {
          const Icon = iconMap[item.icon]
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/patient/dashboard'}
              className={({ isActive }) => `ph-bottom-item${isActive ? ' active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
