import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePageTitle, portalLabel } from '../hooks/usePageTitle'
import { iconMap, IconLogout } from './Icons'
import BrandLogo from './BrandLogo'
import type { NavItem } from '../config/navigation'

interface LayoutProps {
  title: string
  subtitle?: string
  /** Hide the main page h1/subtitle (when the page has its own hero). */
  hidePageHeader?: boolean
  nav: NavItem[]
  children: React.ReactNode
}

const CLINIC_ROLES = new Set(['receptionist', 'doctor', 'pharmacy', 'lab'])

export default function Layout({ title, subtitle, hidePageHeader = false, nav, children }: LayoutProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  usePageTitle(title, portalLabel(user?.role))

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'
  const roleText = portalLabel(user?.role)
  const name = user?.name?.trim() ?? ''
  const nameKey = name.toLowerCase()
  const roleKey = roleText.toLowerCase()
  // Avoid "Receptionist" + "Reception" style duplication in the sidebar.
  const showRoleBadge =
    Boolean(roleText) &&
    !nameKey.includes(roleKey) &&
    !roleKey.includes(nameKey) &&
    nameKey !== (user?.role ?? '').toLowerCase()

  const isClinic = CLINIC_ROLES.has(user?.role ?? '')
  const logoHeight = isClinic ? 52 : 36
  const deskLabel =
    user?.role === 'receptionist'
      ? 'Front desk'
      : user?.role === 'doctor'
        ? 'Consults'
        : user?.role === 'pharmacy'
          ? 'Dispensing'
          : user?.role === 'lab'
            ? 'Diagnostics'
            : user?.role === 'admin'
              ? 'Operations'
              : null

  return (
    <div className={`layout page-fade${isClinic ? ' layout--clinic' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <BrandLogo
            to="/"
            height={logoHeight}
            variant={isClinic ? 'full' : 'compact'}
            onDark
            className="sidebar-brand-logo"
            caption={isClinic ? 'Clinic operations' : undefined}
          />
        </div>
        <div className="sidebar-user">
          <div className="avatar">{initials}</div>
          <div className="sidebar-user-copy">
            <p className="sidebar-user-name">{user?.name || roleText}</p>
            {deskLabel && <p className="sidebar-user-desk">{deskLabel}</p>}
            {!deskLabel && showRoleBadge && <span className="role-badge">{roleText}</span>}
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
            <span>Log out</span>
          </button>
        </div>
      </aside>
      <main className="main">
        {!hidePageHeader && (
          <header className="page-header">
            <div>
              <h1>{title}</h1>
              {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
          </header>
        )}
        <div className="page-content reveal">{children}</div>
      </main>
    </div>
  )
}
