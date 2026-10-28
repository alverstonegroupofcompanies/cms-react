import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { CLINIC } from '../config/clinic'
import { useAuth } from '../context/AuthContext'
import './aster-navbar.css'

interface SpecialtyItem {
  id: string
  name: string
  desc: string
  tag: string
  iconType: 'pediatrics' | 'medicine' | 'cardiology' | 'geriatrics' | 'pathology' | 'pharmacy'
}

const CLINIC_SPECIALTIES: SpecialtyItem[] = [
  { id: 'pediatrics', name: 'Pediatrics & Child Wellness', tag: 'Child Care', iconType: 'pediatrics', desc: 'Comprehensive neonatal, child growth & vaccination' },
  { id: 'general-medicine', name: 'General & Internal Medicine', tag: 'Primary Care', iconType: 'medicine', desc: 'Adult care, fevers, diabetes, hypertension' },
  { id: 'cardiology', name: 'Cardiology & Heart Care', tag: 'Heart Center', iconType: 'cardiology', desc: 'ECG, Echo screening & cardiac prevention' },
  { id: 'geriatrics', name: 'Geriatrics & Elder Care', tag: 'Senior Wellness', iconType: 'geriatrics', desc: 'Attentive, gentle chronic care for seniors' },
  { id: 'pathology', name: 'Pathology & Diagnostic Lab', tag: 'NABL Quality', iconType: 'pathology', desc: 'Automated blood diagnostics & digital reports' },
  { id: 'pharmacy', name: '24/7 Clinical Pharmacy', tag: 'In-House Rx', iconType: 'pharmacy', desc: 'Prescription dispensing & medication counseling' },
]

const CLINIC_DOCTORS = [
  {
    name: 'Dr. Sarah Sharma',
    spec: 'General Medicine',
    qualification: 'MD (Gen Med), DNB',
    experience: '14+ yrs exp',
    avail: 'Mon – Sat',
  },
  {
    name: 'Dr. Priya Sharma',
    spec: 'Cardiology & Heart Care',
    qualification: 'MD, DM (Cardiology)',
    experience: '11+ yrs exp',
    avail: 'Mon – Fri',
  },
  {
    name: 'Dr. Rajesh Menon',
    spec: 'Internal Medicine & Geriatrics',
    qualification: 'MD, Fellowship (Geriatric Med)',
    experience: '18+ yrs exp',
    avail: 'Mon – Sat',
  },
  {
    name: 'Dr. Arun Kumar',
    spec: 'Pediatrics & Neonatal Care',
    qualification: 'DCH, MD (Pediatrics)',
    experience: '9+ yrs exp',
    avail: 'Tue – Sun',
  },
]

function renderSpecialtyIcon(type: SpecialtyItem['iconType']) {
  switch (type) {
    case 'pediatrics':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      )
    case 'medicine':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
          <path d="M9 12.5v3a4.5 4.5 0 0 0 9 0v-1.5" />
          <circle cx="18" cy="14" r="2.5" />
        </svg>
      )
    case 'cardiology':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      )
    case 'geriatrics':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10" />
          <path d="M12 6v6l4 2" />
        </svg>
      )
    case 'pathology':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v7.31L4.36 19.46A2 2 0 0 0 6.09 22h11.82a2 2 0 0 0 1.73-2.54L14 9.31V2" />
          <line x1="8.5" y1="2" x2="15.5" y2="2" />
          <line x1="7" y1="16" x2="17" y2="16" />
        </svg>
      )
    case 'pharmacy':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
          <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
        </svg>
      )
  }
}

export default function AsterNavbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isPatient = user?.role === 'patient'

  // Dropdown & Modal states
  const [activeDropdown, setActiveDropdown] = useState<'doctors' | 'specialties' | 'profile' | 'hub' | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Modals
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? 'PT'

  // Close menus on page navigation
  useEffect(() => {
    setActiveDropdown(null)
    setMobileOpen(false)
    setSearchOpen(false)
    setHelpOpen(false)
  }, [location.pathname])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Smooth scroll to sections
  const handleScrollTo = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    setActiveDropdown(null)
    setMobileOpen(false)
    if (location.pathname === '/' || location.pathname === '/patient') {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    navigate({ pathname: '/', hash: id })
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }

  const handleLogout = async () => {
    setActiveDropdown(null)
    setMobileOpen(false)
    await logout()
    navigate('/')
  }

  // Filter search items
  const filteredSpecialties = CLINIC_SPECIALTIES.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredDoctors = CLINIC_DOCTORS.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.spec.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <header className="alv-header" ref={dropdownRef}>
      {/* ==================================================================
          TIER 1: ALVERSTONE CONCIERGE RIBBON (SLIM WARM ESPRESSO UTILITY BAR)
          ================================================================== */}
      <div className="alv-ribbon">
        <div className="alv-ribbon-inner">
          <div className="alv-ribbon-left">
            <a href={`tel:${CLINIC.phone.replace(/\s/g, '')}`} className="alv-emergency-pill">
              <span className="alv-live-dot" />
              <span className="alv-emergency-label">24/7 Emergency & Ambulance</span>
              <strong>{CLINIC.phone}</strong>
            </a>

            <span className="alv-ribbon-meta">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Chandanathope, Kollam
            </span>

            <span className="alv-ribbon-divider" />

            <span className="alv-ribbon-meta alv-ribbon-hours">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              OPD: Mon–Sat, 9:00 AM – 5:30 PM
            </span>
          </div>

          <div className="alv-ribbon-right">
            <button
              type="button"
              className="alv-ribbon-btn"
              onClick={() => setHelpOpen(true)}
              id="aster-nav-help-btn"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              24/7 Care Desk
            </button>

            <span className="alv-ribbon-divider" />

            <Link to="/dashboard" className="alv-ribbon-btn">
              Staff Portal
            </Link>

            <span className="alv-ribbon-divider" />

            {isPatient ? (
              <div className="alv-ribbon-auth">
                <span className="alv-ribbon-patient-tag">Patient Portal Active</span>
                <button
                  type="button"
                  className="alv-ribbon-signout"
                  onClick={handleLogout}
                  title="Sign out of your patient account"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="alv-ribbon-auth">
                <Link to="/patient/login" className="alv-ribbon-signin">
                  Patient Sign In
                </Link>
                <Link to="/patient/register" className="alv-ribbon-register">
                  New Patient
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================================
          TIER 2: ALVERSTONE BOUTIQUE MAIN BAR (FLOATING PILL TRACK + SCULPTED ACTIONS)
          ================================================================== */}
      <div className="alv-mainbar">
        <div className="alv-mainbar-inner">
          {/* Left Zone: Brand Identity */}
          <Link to="/" className="alv-brand" aria-label="Alverstone Medcity Home">
            <img
              src="/brand/alverstone-medcity-logo-white.png"
              alt="Alverstone Medcity - Compassion meets excellence"
              className="alv-brand-logo-img"
            />
          </Link>

          {/* Center Zone: Floating Pill Navigation Track */}
          <nav className="alv-pill-nav" aria-label="Clinic Navigation">
            {isPatient ? (
              /* ============================================================
                 SIGNED-IN PATIENT NAVIGATION (FLOATING CAPSULE LINKS)
                 ============================================================ */
              <div className="alv-pill-track">
                <NavLink
                  to="/patient/dashboard"
                  end
                  className={({ isActive }) => `alv-pill-link${isActive ? ' active' : ''}`}
                  id="aster-nav-overview"
                >
                  Overview
                </NavLink>

                <NavLink
                  to="/patient/book"
                  className={({ isActive }) => `alv-pill-link${isActive ? ' active' : ''}`}
                  id="aster-nav-book"
                >
                  Book Visit
                </NavLink>

                <NavLink
                  to="/patient/appointments"
                  className={({ isActive }) => `alv-pill-link${isActive ? ' active' : ''}`}
                  id="aster-nav-appointments"
                >
                  My Visits
                </NavLink>

                <NavLink
                  to="/patient/lab-reports"
                  className={({ isActive }) => `alv-pill-link${isActive ? ' active' : ''}`}
                  id="aster-nav-labs"
                >
                  Lab Reports
                </NavLink>

                <NavLink
                  to="/patient/prescriptions"
                  className={({ isActive }) => `alv-pill-link${isActive ? ' active' : ''}`}
                  id="aster-nav-prescriptions"
                >
                  Prescriptions
                </NavLink>

                {/* Our Doctors Dropdown */}
                <div
                  className={`alv-dropdown-wrap ${activeDropdown === 'doctors' ? 'open' : ''}`}
                  onMouseEnter={() => setActiveDropdown('doctors')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    className={`alv-pill-link alv-pill-trigger ${activeDropdown === 'doctors' ? 'is-open' : ''}`}
                    onClick={() => setActiveDropdown(activeDropdown === 'doctors' ? null : 'doctors')}
                    aria-expanded={activeDropdown === 'doctors'}
                    id="aster-nav-doctors-toggle"
                  >
                    <span>Doctors</span>
                    <svg className="alv-chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {activeDropdown === 'doctors' && (
                    <div className="alv-floating-menu alv-menu-doctors">
                      <div className="alv-menu-header">
                        <div>
                          <span className="alv-menu-kicker">Alverstone Medical Board</span>
                          <h4 className="alv-menu-heading">Consulting Specialists</h4>
                        </div>
                        <a href="/#doctors" onClick={(e) => handleScrollTo('doctors', e)} className="alv-menu-view-all">
                          Full Directory →
                        </a>
                      </div>

                      <div className="alv-doctors-grid">
                        {CLINIC_DOCTORS.map((doc) => (
                          <Link
                            key={doc.name}
                            to={`/patient/book?doctor=${encodeURIComponent(doc.name)}`}
                            className="alv-doc-item"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="alv-doc-monogram">
                              {doc.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="alv-doc-meta">
                              <h5>{doc.name}</h5>
                              <p>{doc.spec}</p>
                              <span>{doc.qualification} • {doc.experience}</span>
                            </div>
                            <span className="alv-doc-cta">Book →</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ============================================================
                 GUEST / PUBLIC VISITOR NAVIGATION (FLOATING CAPSULE LINKS)
                 ============================================================ */
              <div className="alv-pill-track">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) => `alv-pill-link${isActive ? ' active' : ''}`}
                  id="aster-nav-home"
                >
                  Home
                </NavLink>

                {/* Specialties Mega Dropdown */}
                <div
                  className={`alv-dropdown-wrap ${activeDropdown === 'specialties' ? 'open' : ''}`}
                  onMouseEnter={() => setActiveDropdown('specialties')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    className={`alv-pill-link alv-pill-trigger ${activeDropdown === 'specialties' ? 'is-open' : ''}`}
                    onClick={() => setActiveDropdown(activeDropdown === 'specialties' ? null : 'specialties')}
                    aria-expanded={activeDropdown === 'specialties'}
                    id="aster-nav-specialties-toggle"
                  >
                    <span>Specialties</span>
                    <svg className="alv-chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {activeDropdown === 'specialties' && (
                    <div className="alv-floating-menu alv-menu-mega">
                      <div className="alv-menu-header">
                        <div>
                          <span className="alv-menu-kicker">Centers of Excellence</span>
                          <h4 className="alv-menu-heading">Clinical Departments & Diagnostics</h4>
                        </div>
                        <a href="/#specialties" onClick={(e) => handleScrollTo('specialties', e)} className="alv-menu-view-all">
                          Explore All →
                        </a>
                      </div>

                      <div className="alv-spec-grid">
                        {CLINIC_SPECIALTIES.map((spec) => (
                          <Link
                            key={spec.id}
                            to={`/specialties/${spec.id}`}
                            className="alv-spec-card"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="alv-spec-icon-box">
                              {renderSpecialtyIcon(spec.iconType)}
                            </div>
                            <div className="alv-spec-body">
                              <div className="alv-spec-top">
                                <span className="alv-spec-title">{spec.name}</span>
                                <span className="alv-spec-badge">{spec.tag}</span>
                              </div>
                              <p className="alv-spec-desc">{spec.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Our Doctors Dropdown */}
                <div
                  className={`alv-dropdown-wrap ${activeDropdown === 'doctors' ? 'open' : ''}`}
                  onMouseEnter={() => setActiveDropdown('doctors')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    className={`alv-pill-link alv-pill-trigger ${activeDropdown === 'doctors' ? 'is-open' : ''}`}
                    onClick={() => setActiveDropdown(activeDropdown === 'doctors' ? null : 'doctors')}
                    aria-expanded={activeDropdown === 'doctors'}
                    id="aster-nav-doctors-toggle-guest"
                  >
                    <span>Our Doctors</span>
                    <svg className="alv-chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {activeDropdown === 'doctors' && (
                    <div className="alv-floating-menu alv-menu-doctors">
                      <div className="alv-menu-header">
                        <div>
                          <span className="alv-menu-kicker">Trusted Care Team</span>
                          <h4 className="alv-menu-heading">Meet Our Senior Physicians</h4>
                        </div>
                        <a href="/#doctors" onClick={(e) => handleScrollTo('doctors', e)} className="alv-menu-view-all">
                          View All Doctors →
                        </a>
                      </div>

                      <div className="alv-doctors-grid">
                        {CLINIC_DOCTORS.map((doc) => (
                          <Link
                            key={doc.name}
                            to={`/patient/book?doctor=${encodeURIComponent(doc.name)}`}
                            className="alv-doc-item"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="alv-doc-monogram">
                              {doc.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                            </div>
                            <div className="alv-doc-meta">
                              <h5>{doc.name}</h5>
                              <p>{doc.spec}</p>
                              <span>{doc.qualification} • {doc.experience}</span>
                            </div>
                            <span className="alv-doc-cta">Consult →</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <a
                  href="/#services"
                  className="alv-pill-link"
                  onClick={(e) => handleScrollTo('services', e)}
                  id="aster-nav-services"
                >
                  Patient Services
                </a>

                <NavLink
                  to="/about"
                  className={({ isActive }) => `alv-pill-link${isActive ? ' active' : ''}`}
                  id="aster-nav-about"
                >
                  About Us
                </NavLink>

                <a
                  href="/#contact"
                  className="alv-pill-link"
                  onClick={(e) => handleScrollTo('contact', e)}
                  id="aster-nav-contact"
                >
                  Contact
                </a>
              </div>
            )}
          </nav>

          {/* Right Zone: Search Pill, Digital Hub Popover & Sculpted Book CTA */}
          <div className="alv-actions">
            {/* Inline Search Pill */}
            <button
              type="button"
              className="alv-search-pill"
              onClick={() => setSearchOpen(true)}
              aria-label="Search doctors, departments, or lab tests"
              id="aster-nav-search-btn"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span className="alv-search-pill-text">Find doctor or service...</span>
            </button>

            {/* Patient Profile Chip (when signed in) OR Quick Care Hub */}
            {isPatient ? (
              <div className={`alv-dropdown-wrap ${activeDropdown === 'profile' ? 'open' : ''}`}>
                <button
                  type="button"
                  className="alv-profile-pill"
                  onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
                  aria-expanded={activeDropdown === 'profile'}
                  id="aster-nav-profile-toggle"
                >
                  <span className="alv-profile-avatar">{initials}</span>
                  <span className="alv-profile-name">{user?.name?.split(' ')[0]}</span>
                  <svg className="alv-chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {activeDropdown === 'profile' && (
                  <div className="alv-floating-menu alv-menu-profile">
                    <div className="alv-profile-card-head">
                      <div className="alv-profile-avatar-lg">{initials}</div>
                      <div>
                        <div className="alv-profile-fullname">{user?.name}</div>
                        <div className="alv-profile-sub">{user?.email || 'Verified Patient'}</div>
                      </div>
                    </div>

                    <div className="alv-profile-list">
                      <NavLink to="/patient/dashboard" className="alv-profile-item" onClick={() => setActiveDropdown(null)}>
                        <span>Patient Overview</span>
                        <span>→</span>
                      </NavLink>
                      <NavLink to="/patient/profile" className="alv-profile-item" onClick={() => setActiveDropdown(null)}>
                        <span>My Profile & Medical ID</span>
                        <span>→</span>
                      </NavLink>
                      <NavLink to="/patient/appointments" className="alv-profile-item" onClick={() => setActiveDropdown(null)}>
                        <span>Appointments & Queue</span>
                        <span>→</span>
                      </NavLink>
                      <NavLink to="/patient/lab-reports" className="alv-profile-item" onClick={() => setActiveDropdown(null)}>
                        <span>Diagnostic Lab Reports</span>
                        <span>→</span>
                      </NavLink>
                      <NavLink to="/patient/prescriptions" className="alv-profile-item" onClick={() => setActiveDropdown(null)}>
                        <span>Digital Prescriptions</span>
                        <span>→</span>
                      </NavLink>
                    </div>

                    <div className="alv-profile-foot">
                      <button type="button" className="alv-signout-btn" onClick={handleLogout}>
                        Sign Out of Portal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`alv-dropdown-wrap ${activeDropdown === 'hub' ? 'open' : ''}`}>
                <button
                  type="button"
                  className={`alv-hub-btn ${activeDropdown === 'hub' ? 'active' : ''}`}
                  onClick={() => setActiveDropdown(activeDropdown === 'hub' ? null : 'hub')}
                  aria-label="Digital Patient Hub"
                  title="Digital Patient Services"
                  id="aster-nav-launcher-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  <span>Portals</span>
                </button>

                {activeDropdown === 'hub' && (
                  <div className="alv-floating-menu alv-menu-hub">
                    <div className="alv-menu-header">
                      <div>
                        <span className="alv-menu-kicker">Online Care Access</span>
                        <h4 className="alv-menu-heading">Digital Patient Services</h4>
                      </div>
                    </div>

                    <div className="alv-hub-list">
                      <Link to="/patient/book" className="alv-hub-row" onClick={() => setActiveDropdown(null)}>
                        <div className="alv-hub-icon">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                        <div>
                          <strong>Instant Slot Booking</strong>
                          <span>Reserve consultation tokens online</span>
                        </div>
                      </Link>

                      <Link to="/patient/lab-reports" className="alv-hub-row" onClick={() => setActiveDropdown(null)}>
                        <div className="alv-hub-icon">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10 2v7.31L4.36 19.46A2 2 0 0 0 6.09 22h11.82a2 2 0 0 0 1.73-2.54L14 9.31V2" />
                            <line x1="8.5" y1="2" x2="15.5" y2="2" />
                          </svg>
                        </div>
                        <div>
                          <strong>Online Lab Reports</strong>
                          <span>Download verified NABL test results</span>
                        </div>
                      </Link>

                      <Link to="/patient/prescriptions" className="alv-hub-row" onClick={() => setActiveDropdown(null)}>
                        <div className="alv-hub-icon">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                          </svg>
                        </div>
                        <div>
                          <strong>E-Prescriptions & Refills</strong>
                          <span>View dosage schedules & pharmacy bills</span>
                        </div>
                      </Link>

                      <Link to="/dashboard" className="alv-hub-row" onClick={() => setActiveDropdown(null)}>
                        <div className="alv-hub-icon">
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                          </svg>
                        </div>
                        <div>
                          <strong>Clinical Staff Suite</strong>
                          <span>Doctor, Reception, Lab & Pharmacy login</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Primary Sculpted CTA Pill: Book Appointment */}
            <Link to="/patient/book" className="alv-book-cta" id="aster-nav-book-btn">
              <span>Book Appointment</span>
              <span className="alv-book-cta-arrow" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className="alv-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Navigation Menu"
              id="aster-mobile-toggle-btn"
            >
              <span className={`alv-hamburger ${mobileOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================
          MOBILE NAVIGATION DRAWER
          ================================================================== */}
      <div className={`alv-mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <div className="alv-mobile-drawer-header">
          <Link to="/" onClick={() => setMobileOpen(false)}>
            <img
              src="/brand/alverstone-medcity-logo-white.png"
              alt="Alverstone Medcity"
              style={{ height: '36px', width: 'auto', display: 'block', objectFit: 'contain' }}
            />
          </Link>
          <button
            type="button"
            className="alv-modal-close-btn"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="alv-mobile-links-list">
          {isPatient ? (
            <>
              <div className="alv-mobile-user-card">
                <div className="alv-profile-avatar">{initials}</div>
                <div>
                  <strong>{user?.name}</strong>
                  <div style={{ fontSize: '0.74rem', opacity: 0.8 }}>Patient Portal Account</div>
                </div>
              </div>
              <Link to="/patient/dashboard" className="alv-mobile-link" onClick={() => setMobileOpen(false)}>
                Patient Overview
              </Link>
              <Link to="/patient/book" className="alv-mobile-link alv-mobile-cta" onClick={() => setMobileOpen(false)}>
                Book A Visit
              </Link>
              <Link to="/patient/appointments" className="alv-mobile-link" onClick={() => setMobileOpen(false)}>
                My Visits & Queue
              </Link>
              <Link to="/patient/lab-reports" className="alv-mobile-link" onClick={() => setMobileOpen(false)}>
                Lab Reports
              </Link>
              <Link to="/patient/prescriptions" className="alv-mobile-link" onClick={() => setMobileOpen(false)}>
                Prescriptions
              </Link>
              <Link to="/patient/profile" className="alv-mobile-link" onClick={() => setMobileOpen(false)}>
                My Profile
              </Link>
            </>
          ) : (
            <>
              <Link to="/patient/book" className="alv-mobile-link alv-mobile-cta" onClick={() => setMobileOpen(false)}>
                Book An Appointment →
              </Link>
              <Link to="/" className="alv-mobile-link" onClick={() => setMobileOpen(false)}>
                Home
              </Link>
              <Link to="/patient/login" className="alv-mobile-link" onClick={() => setMobileOpen(false)}>
                Patient Sign In
              </Link>
              <Link to="/patient/register" className="alv-mobile-link" onClick={() => setMobileOpen(false)}>
                Register As New Patient
              </Link>
            </>
          )}

          <a href="/#specialties" className="alv-mobile-link" onClick={(e) => handleScrollTo('specialties', e)}>
            Specialties & Departments
          </a>
          <a href="/#doctors" className="alv-mobile-link" onClick={(e) => handleScrollTo('doctors', e)}>
            Our Doctors
          </a>
          <a href="/#services" className="alv-mobile-link" onClick={(e) => handleScrollTo('services', e)}>
            Patient Services
          </a>
          <Link to="/about" className="alv-mobile-link" onClick={() => setMobileOpen(false)}>
            About Alverstone
          </Link>
          <a href="/#contact" className="alv-mobile-link" onClick={(e) => handleScrollTo('contact', e)}>
            Contact & Location
          </a>

          <button
            type="button"
            className="alv-mobile-link"
            style={{ width: '100%', border: 'none', textAlign: 'left', cursor: 'pointer' }}
            onClick={() => {
              setMobileOpen(false)
              setSearchOpen(true)
            }}
          >
            Search Doctors & Specialties
          </button>

          {isPatient && (
            <button
              type="button"
              className="alv-mobile-link alv-mobile-logout"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================
          INTERACTIVE SEARCH MODAL OVERLAY
          ================================================================== */}
      {searchOpen && (
        <div className="alv-modal-backdrop" onClick={() => setSearchOpen(false)}>
          <div className="alv-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="alv-modal-header">
              <h3>Search Alverstone Medcity</h3>
              <button type="button" className="alv-modal-close-btn" onClick={() => setSearchOpen(false)}>
                ✕
              </button>
            </div>
            <div className="alv-modal-body">
              <div className="alv-search-input-wrap">
                <svg className="alv-search-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className="alv-search-input"
                  placeholder="Search doctors, specialties, diagnostics, or departments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="alv-search-results-list">
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7f5539', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                  SPECIALTIES ({filteredSpecialties.length})
                </div>
                {filteredSpecialties.map((s) => (
                  <Link
                    key={s.id}
                    to={`/specialties/${s.id}`}
                    className="alv-search-result-item"
                    onClick={() => setSearchOpen(false)}
                  >
                    <div>
                      <strong>{s.name}</strong>
                      <div style={{ fontSize: '0.76rem', color: '#6f5342' }}>{s.desc}</div>
                    </div>
                    <span style={{ color: '#7f5539', fontWeight: 700, fontSize: '0.82rem' }}>Explore →</span>
                  </Link>
                ))}

                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7f5539', letterSpacing: '0.05em', marginTop: '0.85rem', marginBottom: '0.35rem' }}>
                  DOCTORS ({filteredDoctors.length})
                </div>
                {filteredDoctors.map((d) => (
                  <Link
                    key={d.name}
                    to={`/patient/book?doctor=${encodeURIComponent(d.name)}`}
                    className="alv-search-result-item"
                    onClick={() => setSearchOpen(false)}
                  >
                    <div>
                      <strong>{d.name}</strong> — <span style={{ color: '#9c6644' }}>{d.spec}</span>
                      <div style={{ fontSize: '0.76rem', color: '#6f5342' }}>{d.qualification} • {d.experience}</div>
                    </div>
                    <span style={{ color: '#7f5539', fontWeight: 700, fontSize: '0.82rem' }}>Consult →</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================
          24/7 CARE DESK & EMERGENCY MODAL
          ================================================================== */}
      {helpOpen && (
        <div className="alv-modal-backdrop" onClick={() => setHelpOpen(false)}>
          <div className="alv-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="alv-modal-header">
              <h3>24/7 Care Desk & Emergency</h3>
              <button type="button" className="alv-modal-close-btn" onClick={() => setHelpOpen(false)}>
                ✕
              </button>
            </div>
            <div className="alv-modal-body">
              <div style={{ background: '#fdf7f3', border: '1px solid #e6ccb2', padding: '1.1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                <strong style={{ color: '#7f5539', display: 'block', marginBottom: '0.35rem' }}>
                  24-Hour Emergency Ambulance & Trauma Desk
                </strong>
                <a
                  href={`tel:${CLINIC.phone.replace(/\s/g, '')}`}
                  style={{ fontSize: '1.35rem', fontWeight: 800, color: '#9c6644', textDecoration: 'none' }}
                >
                  {CLINIC.phone}
                </a>
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.82rem', color: '#6f5342' }}>
                  Paramedics and emergency response on stand-by with rapid dispatch across Chandanathope, Kollam.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ background: '#fbf8f5', padding: '0.9rem', borderRadius: '10px', border: '1px solid #ede0d4' }}>
                  <div style={{ fontWeight: 700, color: '#382417', marginBottom: '0.2rem' }}>Appointment Desk</div>
                  <div style={{ fontSize: '0.85rem', color: '#7f5539', fontWeight: 600 }}>Open 24/7 online</div>
                  <Link to="/patient/book" onClick={() => setHelpOpen(false)} style={{ display: 'inline-block', marginTop: '0.45rem', fontSize: '0.8rem', color: '#9c6644', fontWeight: 700 }}>
                    Book Preferred Slot →
                  </Link>
                </div>

                <div style={{ background: '#fbf8f5', padding: '0.9rem', borderRadius: '10px', border: '1px solid #ede0d4' }}>
                  <div style={{ fontWeight: 700, color: '#382417', marginBottom: '0.2rem' }}>Email Helpdesk</div>
                  <a href={`mailto:${CLINIC.email}`} style={{ fontSize: '0.85rem', color: '#7f5539', textDecoration: 'none', fontWeight: 600 }}>
                    {CLINIC.email}
                  </a>
                  <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.78rem', color: '#6f5342' }}>Responses within 2 hours</p>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: '#ede0d4', borderRadius: '10px', border: '1px solid #ddb892' }}>
                <strong style={{ color: '#7f5539', fontSize: '0.88rem' }}>Campus Address:</strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: '#543825' }}>
                  {CLINIC.address}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
