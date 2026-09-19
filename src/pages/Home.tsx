import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { devLogin } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import BrandLogo from '../components/BrandLogo'
import { IconFlask, IconPill, IconStethoscope, IconUser, IconUsers } from '../components/Icons'

const DEV_REDIRECTS = {
  patient: '/patient/dashboard',
  receptionist: '/receptionist/dashboard',
  doctor: '/doctor/dashboard',
  pharmacy: '/pharmacy/dashboard',
  lab: '/lab/dashboard',
  admin: '/admin/dashboard',
} as const

const portals = [
  {
    to: '/receptionist/login',
    title: 'Reception',
    detail: 'Ground floor · front desk & scheduling',
    icon: 'users' as const,
    accent: false,
  },
  {
    to: '/doctor/login',
    title: 'Doctor',
    detail: 'Level 2 · consults & patient charts',
    icon: 'stethoscope' as const,
    accent: false,
  },
  {
    to: '/pharmacy/login',
    title: 'Pharmacy',
    detail: 'Ground floor · dispensing & stock',
    icon: 'pill' as const,
    accent: false,
  },
  {
    to: '/lab/login',
    title: 'Lab',
    detail: 'Level 1 · samples & results',
    icon: 'flask' as const,
    accent: false,
  },
  {
    to: '/patient',
    title: 'Patient portal',
    detail: 'View records, appointments & results',
    icon: 'user' as const,
    accent: true,
  },
]

const iconMap = {
  users: IconUsers,
  user: IconUser,
  stethoscope: IconStethoscope,
  pill: IconPill,
  flask: IconFlask,
}

function ElevatorMark() {
  return (
    <svg className="hop-elevator" viewBox="0 0 200 260" fill="none" aria-hidden>
      <circle cx="100" cy="28" r="18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M100 20v16M92 28h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M100 12v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="48" y="56" width="104" height="168" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M100 56v168" stroke="currentColor" strokeWidth="1.25" />
      <path d="M48 72h104M48 208h104" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      <circle cx="78" cy="132" r="11" stroke="currentColor" strokeWidth="1.25" />
      <path d="M67 158c0-8 5-14 11-14s11 6 11 14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="122" cy="132" r="11" stroke="currentColor" strokeWidth="1.25" />
      <path d="M111 158c0-8 5-14 11-14s11 6 11 14" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <rect x="58" y="228" width="84" height="8" rx="1" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  )
}

export default function Home() {
  const { setAuth } = useAuth()
  const navigate = useNavigate()
  const showDevBypass = import.meta.env.DEV
  const [devOpen, setDevOpen] = useState(false)
  usePageTitle('Staff Home')

  const handleDevLogin = async (role: keyof typeof DEV_REDIRECTS) => {
    try {
      const { data } = await devLogin(role)
      setAuth(data.token, data.user)
      navigate(DEV_REDIRECTS[role])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      alert(`Dev login failed: ${msg}\n\nStart backend:\ncd e:\\Technopark\\backend\nphp artisan serve`)
    }
  }

  return (
    <div className="hop page-fade">
      <aside className="hop-brand">
        <div className="hop-brand-top">
          <BrandLogo height={52} onDark className="hop-logo" caption="Clinic operations" />
        </div>

        <div className="hop-brand-mid">
          <ElevatorMark />
        </div>

        <div className="hop-brand-copy">
          <h1>
            Every <em>desk, chart, and prescription</em> in the building — one door in.
          </h1>
          <p>— Front of house to the back lab bench</p>
        </div>
      </aside>

      <main className="hop-panel">
        <header className="hop-panel-head">
          <h2>Where are you working from today?</h2>
          <p>Pick your department and we&apos;ll take you to the workspace built for it.</p>
        </header>

        <nav className="hop-list" aria-label="Staff portals">
          {portals.map((p) => {
            const Icon = iconMap[p.icon]
            return (
              <Link
                key={p.to}
                to={p.to}
                className={`hop-row${p.accent ? ' is-accent' : ''}`}
              >
                <span className="hop-row-ico" aria-hidden>
                  <Icon size={18} />
                </span>
                <span className="hop-row-copy">
                  <strong>{p.title}</strong>
                  <span>{p.detail}</span>
                </span>
                <span className="hop-row-cta" aria-label="Enter">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </span>
              </Link>
            )
          })}
        </nav>

        {showDevBypass && (
          <div className="hop-dev">
            <button type="button" className="hop-dev-toggle" onClick={() => setDevOpen((o) => !o)}>
              › Developer access
            </button>
            {devOpen && (
              <div className="hop-dev-buttons">
                {(['patient', 'receptionist', 'doctor', 'pharmacy', 'lab', 'admin'] as const).map((role) => (
                  <button key={role} type="button" className="hop-dev-btn" onClick={() => handleDevLogin(role)}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
