import { useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import { CLINIC } from '../config/clinic'
import { useAuth } from '../context/AuthContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { iconMap } from './Icons'
import AsterNavbar from './AsterNavbar'

interface Props {
  children: React.ReactNode
  /** When true, content is a signed-in portal page (bottom nav + denser main). */
  portal?: boolean
}

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
  const { user } = useAuth()
  const location = useLocation()
  const isPatient = user?.role === 'patient'

  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace(/^#/, '')
    const scroll = () => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    const t = window.setTimeout(scroll, 80)
    return () => window.clearTimeout(t)
  }, [location.pathname, location.hash])

  return (
    <div className={`ps-site ph-app page-fade${portal ? ' is-portal' : ''}`}>
      <AsterNavbar />

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
        {/* Top Concierge & Emergency Contact Strip */}
        <div className="ps-footer-top-bar">
          <div className="ps-footer-top-inner">
            <div className="ps-footer-top-item">
              <span className="ps-footer-top-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <div>
                <span className="ps-footer-top-label">24/7 Emergency & Helpline</span>
                <a href={`tel:${CLINIC.phone.replace(/\s/g, '')}`} className="ps-footer-top-val">
                  {CLINIC.phone}
                </a>
              </div>
            </div>

            <div className="ps-footer-top-item">
              <span className="ps-footer-top-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <div>
                <span className="ps-footer-top-label">Patient Care Desk</span>
                <a href={`mailto:${CLINIC.email}`} className="ps-footer-top-val">
                  {CLINIC.email}
                </a>
              </div>
            </div>

            <div className="ps-footer-top-item">
              <span className="ps-footer-top-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <div>
                <span className="ps-footer-top-label">Hospital Campus</span>
                <span className="ps-footer-top-val">{CLINIC.address}</span>
              </div>
            </div>

            <Link
              to={isPatient ? '/patient/book' : loginHref('/patient/book')}
              className="ps-footer-top-cta"
            >
              <span>Book an Appointment</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Main 5-Column Balanced Directory */}
        <div className="ps-footer-inner">
          <div className="ps-footer-brand">
            <BrandLogo brand="clinic" to="/" height={46} onDark />
            <p className="ps-footer-brand-tagline">{CLINIC.tagline}</p>
            <p className="ps-footer-brand-note">
              Coordinated multispecialty consultations, NABL-grade diagnostics, and 24/7 clinical
              pharmacy services under one roof.
            </p>
            <div className="ps-footer-trust-row">
              <span>NABL Certified Lab</span>
              <span className="ps-footer-dot" />
              <span>24/7 Emergency</span>
              <span className="ps-footer-dot" />
              <span>Digital Health Records</span>
            </div>
          </div>

          <div className="ps-footer-cols">
            {/* Column 1: Specialties */}
            <div className="ps-footer-col">
              <h4>Clinical Specialties</h4>
              <nav className="ps-footer-links" aria-label="Clinical specialties">
                <Link to="/specialties/general-medicine">General & Internal Medicine</Link>
                <Link to="/specialties/cardiology">Cardiology & Heart Care</Link>
                <Link to="/specialties/pediatrics">Pediatrics & Child Wellness</Link>
                <Link to="/specialties/geriatrics">Geriatrics & Elder Care</Link>
                <Link to="/specialties/pathology">Pathology & Diagnostics</Link>
                <Link to="/specialties/pharmacy">24/7 Clinical Pharmacy</Link>
              </nav>
            </div>

            {/* Column 2: Patient Services */}
            <div className="ps-footer-col">
              <h4>Patient Services</h4>
              <nav className="ps-footer-links" aria-label="Patient services">
                <Link to={isPatient ? '/patient/book' : loginHref('/patient/book')}>Book a Consultation</Link>
                {isPatient ? (
                  <>
                    <Link to="/patient/dashboard">Patient Care Overview</Link>
                    <Link to="/patient/appointments">My Visits & Live Queue</Link>
                    <Link to="/patient/lab-reports">Diagnostic Lab Reports</Link>
                    <Link to="/patient/prescriptions">Digital Prescriptions</Link>
                  </>
                ) : (
                  <>
                    <Link to="/patient/login">Patient Portal Sign In</Link>
                    <Link to="/patient/register">New Patient Registration</Link>
                    <Link to={loginHref('/patient/lab-reports')}>Online Lab Reports</Link>
                    <Link to={loginHref('/patient/prescriptions')}>E-Prescriptions</Link>
                  </>
                )}
                <Link to="/dashboard">Staff & Doctor Portal</Link>
              </nav>
            </div>

            {/* Column 3: Hospital & Care Standards */}
            <div className="ps-footer-col">
              <h4>Hospital & Governance</h4>
              <nav className="ps-footer-links" aria-label="Hospital and governance">
                <Link to="/about">About Alverstone Medcity</Link>
                <Link to="/#doctors">Our Consulting Physicians</Link>
                <Link to="/#services"> Out-Patient Care Standards</Link>
                <Link to="/#contact">Campus Directions & Map</Link>
              </nav>
              <div className="ps-footer-standards">
                <span>Patient Privacy & Informed Consent</span>
                <small>Confidential records & transparent billing with zero hidden charges.</small>
              </div>
            </div>

            {/* Column 4: Visiting Hours (Clean Borderless Schedule) */}
            <div className="ps-footer-col">
              <h4>Visiting Hours</h4>
              <ul className="ps-footer-hours">
                <li>
                  <span>Outpatient (OPD)</span>
                  <strong>9:00 AM – 5:30 PM</strong>
                </li>
                {CLINIC.hours.map((h) => (
                  <li key={h.day}>
                    <span>{h.day}</span>
                    <strong>{h.time}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="ps-footer-bottom">
          <div className="ps-footer-bottom-inner">
            <p className="ps-footer-copy">
              © {new Date().getFullYear()} {CLINIC.name} Hospital & Research Center. All rights reserved.
            </p>
            <div className="ps-footer-legal-links">
              <Link to="/about">Privacy Policy</Link>
              <span>·</span>
              <Link to="/about">Patient Rights</Link>
              <span>·</span>
              <Link to="/#contact">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
