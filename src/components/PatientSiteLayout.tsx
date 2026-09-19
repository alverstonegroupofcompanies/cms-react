import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import { CLINIC } from '../config/clinic'
import { useAuth } from '../context/AuthContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { iconMap } from './Icons'

interface Props {
  children: React.ReactNode
  /** When true, content is a signed-in portal page (bottom nav + denser main). */
  portal?: boolean
}

const PUBLIC_NAV = [
  { to: '/patient', label: 'Home', end: true },
  { to: '/patient/about', label: 'About', end: false },
  { to: '/patient#contact', label: 'Contact', end: false },
] as const

const PORTAL_NAV = [
  { to: '/patient/dashboard', label: 'Overview', end: true, icon: 'dashboard' as const },
  { to: '/patient/book', label: 'Book', end: false, icon: 'calendar' as const },
  { to: '/patient/appointments', label: 'Visits', end: false, icon: 'calendar' as const },
  { to: '/patient/lab-reports', label: 'Labs', end: false, icon: 'flask' as const },
  { to: '/patient/prescriptions', label: 'Rx', end: false, icon: 'pill' as const },
  { to: '/patient/profile', label: 'Profile', end: false, icon: 'users' as const },
] as const

function loginHref(next?: string) {
  if (!next) return '/patient/login'
  return `/patient/login?next=${encodeURIComponent(next)}`
}

export default function PatientSiteLayout({ children, portal = false }: Props) {
  useScrollReveal()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isPatient = user?.role === 'patient'
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const navItems = isPatient
    ? [
        { to: '/patient', label: 'Home', end: true as const },
        ...PORTAL_NAV.map(({ to, label, end }) => ({ to, label, end })),
        { to: '/patient/about', label: 'About', end: false as const },
        { to: '/patient#contact', label: 'Contact', end: false as const },
      ]
    : [
        ...PUBLIC_NAV,
        { to: loginHref('/patient/book'), label: 'Book', end: false as const },
      ]

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? '?'

  useEffect(() => {
    setMenuOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace(/^#/, '')
    const scroll = () => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    const t = window.setTimeout(scroll, 80)
    return () => window.clearTimeout(t)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (!profileOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [profileOpen])

  const handleLogout = async () => {
    setProfileOpen(false)
    setMenuOpen(false)
    await logout()
    navigate('/patient')
  }

  return (
    <div className={`ps-site ph-app page-fade${portal ? ' is-portal' : ''}${isPatient ? ' is-signed-in' : ''}`}>
      <header className="ps-topbar ps-topbar-enter">
        <div className="ps-topbar-inner ps-topbar-centered">
          <nav
            className={`ps-nav ps-nav-left${menuOpen ? ' open' : ''}`}
            aria-label="Clinic site"
          >
            {navItems.map((item) => {
              const isContact = item.to.includes('#contact')
              const onContact =
                location.pathname === '/patient' && location.hash === '#contact'

              if (isContact) {
                return (
                  <Link
                    key={item.to}
                    to="/patient#contact"
                    className={`ps-nav-link${onContact ? ' active' : ''}`}
                    aria-current={onContact ? 'page' : undefined}
                    onClick={(e) => {
                      setMenuOpen(false)
                      if (location.pathname === '/patient') {
                        e.preventDefault()
                        if (location.hash !== '#contact') {
                          navigate({ pathname: '/patient', hash: 'contact' })
                        }
                        window.setTimeout(() => {
                          document.getElementById('contact')?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                          })
                        }, 50)
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                )
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={'end' in item ? item.end : false}
                  className={({ isActive }) => {
                    if (item.to === '/patient' && item.end && onContact) {
                      return 'ps-nav-link'
                    }
                    return `ps-nav-link${isActive ? ' active' : ''}`
                  }}
                  onClick={(e) => {
                    setMenuOpen(false)
                    // Leaving contact: clear hash so Contact is no longer active
                    if (item.to === '/patient' && item.end && location.hash === '#contact') {
                      e.preventDefault()
                      navigate('/patient', { replace: true })
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }}
                >
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <BrandLogo brand="clinic" to={isPatient ? '/patient/dashboard' : '/patient'} height={52} className="ps-logo" />

          <div className="ps-topbar-actions">
            {isPatient ? (
              <div className="ps-profile-wrap" ref={profileRef}>
                <button
                  type="button"
                  className="ps-profile-btn"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  onClick={() => setProfileOpen((o) => !o)}
                >
                  <span className="ps-profile-avatar">{initials}</span>
                  <span className="ps-profile-name">{user.name?.split(' ')[0]}</span>
                </button>
                {profileOpen && (
                  <div className="ps-profile-menu" role="menu">
                    <NavLink
                      to="/patient/dashboard"
                      role="menuitem"
                      className="ps-profile-menu-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      Overview
                    </NavLink>
                    <NavLink
                      to="/patient/profile"
                      role="menuitem"
                      className="ps-profile-menu-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      Profile
                    </NavLink>
                    <NavLink
                      to="/patient/book"
                      role="menuitem"
                      className="ps-profile-menu-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      Book a visit
                    </NavLink>
                    <NavLink
                      to="/patient/appointments"
                      role="menuitem"
                      className="ps-profile-menu-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      My visits
                    </NavLink>
                    <button
                      type="button"
                      role="menuitem"
                      className="ps-profile-menu-item ps-profile-menu-logout"
                      onClick={handleLogout}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/patient/register" className="ps-btn-text">
                  Register
                </Link>
                <Link
                  to={loginHref(location.pathname === '/patient' ? '/patient/dashboard' : undefined)}
                  className="ps-btn ps-btn-nav"
                >
                  Sign in
                </Link>
              </>
            )}
            <button
              type="button"
              className={`ps-menu-toggle${menuOpen ? ' open' : ''}`}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <main className={`ps-main${portal ? ' ps-main-portal' : ''}`}>{children}</main>

      {isPatient && (
        <nav className="ps-bottom-nav" aria-label="Patient portal">
          {PORTAL_NAV.map((item) => {
            const Icon = iconMap[item.icon]
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `ps-bottom-item${isActive ? ' active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      )}

      <footer className="ps-footer" data-reveal>
        <div className="ps-footer-bg" aria-hidden>
          <img src="/images/patient-footer-care.jpg" alt="" />
        </div>
        <div className="ps-footer-inner">
          <div className="ps-footer-brand">
            <BrandLogo brand="clinic" to="/patient" height={56} onDark />
            <p>{CLINIC.tagline}</p>
            <p className="ps-footer-brand-note">
              Patients, doctors, and reception — working together so every visit feels clear and personal.
            </p>
            <div className="ps-footer-contact-pills">
              <a href={`tel:${CLINIC.phone.replace(/\s/g, '')}`}>{CLINIC.phone}</a>
              <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a>
            </div>
          </div>

          <div className="ps-footer-cols">
            <div>
              <h4>Visiting hours</h4>
              <ul className="ps-footer-hours">
                {CLINIC.hours.map((h) => (
                  <li key={h.day}>
                    <span>{h.day}</span>
                    <strong>{h.time}</strong>
                  </li>
                ))}
              </ul>
              <p className="ps-footer-muted">{CLINIC.address}</p>
            </div>

            <div>
              <h4>Trusted doctors</h4>
              <p className="ps-footer-muted">{CLINIC.doctorsNote}</p>
              <Link to="/patient#contact">Meet our care team →</Link>
              <Link to={isPatient ? '/patient/book' : loginHref('/patient/book')}>Book a visit</Link>
              <Link to="/patient/about">About the clinic</Link>
            </div>

            <div>
              <h4>Policies we follow</h4>
              <ul className="ps-footer-policies">
                {CLINIC.policies.map((p) => (
                  <li key={p.title}>
                    <strong>{p.title}</strong>
                    <span>{p.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4>Quick links</h4>
              <Link to="/patient">Home</Link>
              <Link to="/patient/about">About us</Link>
              <Link to="/patient#contact">Contact</Link>
              {isPatient ? (
                <>
                  <Link to="/patient/dashboard">Patient overview</Link>
                  <Link to="/patient/lab-reports">Lab reports</Link>
                </>
              ) : (
                <>
                  <Link to="/patient/login">Patient sign in</Link>
                  <Link to="/patient/register">New patient</Link>
                </>
              )}
              <Link to="/">Staff home</Link>
            </div>
          </div>
        </div>
        <p className="ps-footer-copy">
          © {new Date().getFullYear()} {CLINIC.name}. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
