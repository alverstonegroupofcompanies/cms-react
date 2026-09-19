import { Link } from 'react-router-dom'
import { usePageTitle } from '../hooks/usePageTitle'
import BrandLogo from './BrandLogo'
import {
  IconFlask,
  IconPill,
  IconShield,
  IconStethoscope,
  IconUsers,
} from './Icons'

type StaffRole = 'admin' | 'doctor' | 'receptionist' | 'pharmacy' | 'lab'

interface Props {
  title: string
  subtitle?: string
  children: React.ReactNode
  variant?: 'patient' | 'staff'
  /** Browser tab section label, e.g. Reception / Doctor / Admin */
  section?: string
  /** Staff role — drives left-panel copy & icon */
  role?: StaffRole
}

const ROLE_META: Record<
  StaffRole,
  { label: string; detail: string; line: string; icon: 'users' | 'stethoscope' | 'pill' | 'flask' | 'shield' }
> = {
  receptionist: {
    label: 'Reception',
    detail: 'Ground floor · front desk & scheduling',
    line: 'Sign in to manage arrivals, bookings, and the live day board.',
    icon: 'users',
  },
  doctor: {
    label: 'Doctor',
    detail: 'Level 2 · consults & patient charts',
    line: 'Sign in to open your queue, charts, and consultation workspace.',
    icon: 'stethoscope',
  },
  pharmacy: {
    label: 'Pharmacy',
    detail: 'Ground floor · dispensing & stock',
    line: 'Sign in to dispense medicines and keep stock in sync.',
    icon: 'pill',
  },
  lab: {
    label: 'Lab',
    detail: 'Level 1 · samples & results',
    line: 'Sign in to process samples and publish reports.',
    icon: 'flask',
  },
  admin: {
    label: 'Admin',
    detail: 'Operations · staff & clinic settings',
    line: 'Sign in to manage clinic configuration and staff access.',
    icon: 'shield',
  },
}

const icons = {
  users: IconUsers,
  stethoscope: IconStethoscope,
  pill: IconPill,
  flask: IconFlask,
  shield: IconShield,
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

export default function AuthLayout({
  title,
  subtitle,
  children,
  variant = 'staff',
  section = 'Staff',
  role,
}: Props) {
  usePageTitle(title, section)

  if (variant === 'staff') {
    const meta = role ? ROLE_META[role] : null
    const Icon = meta ? icons[meta.icon] : IconShield

    return (
      <div className="hop hop-auth page-fade">
        <aside className="hop-brand">
          <div className="hop-brand-top">
            <BrandLogo to="/" height={52} onDark className="hop-logo" caption="Clinic operations" />
          </div>

          <div className="hop-brand-mid">
            <ElevatorMark />
          </div>

          <div className="hop-brand-copy">
            {meta ? (
              <>
                <p className="hop-auth-role">{meta.label}</p>
                <h1>{meta.detail}</h1>
                <p>{meta.line}</p>
              </>
            ) : (
              <>
                <h1>
                  Every <em>desk, chart, and prescription</em> in the building — one door in.
                </h1>
                <p>— Front of house to the back lab bench</p>
              </>
            )}
          </div>
        </aside>

        <main className="hop-panel hop-auth-panel">
          <div className="hop-auth-card">
            <div className="hop-auth-card-top">
              <span className="hop-auth-card-ico" aria-hidden>
                <Icon size={22} />
              </span>
              <div>
                <h2>{title}</h2>
                {subtitle && <p className="hop-auth-sub">{subtitle}</p>}
              </div>
            </div>
            {children}
            <Link to="/" className="hop-auth-back">
              ← Back to staff home
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="auth-split page-fade">
      <div className="auth-split-visual">
        <div className="auth-visual-content reveal">
          <BrandLogo height={48} onDark />
          <h1>Secure staff access</h1>
          <p>Sign in to manage appointments, queue, and clinic operations.</p>
        </div>
      </div>
      <div className="auth-split-form">
        <div className="auth-form-wrap">
          <div className="auth-form-brand">
            <BrandLogo height={36} variant="compact" />
          </div>
          <div className="auth-phone-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 7l10 7 10-7" />
            </svg>
          </div>
          <h2>{title}</h2>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
          <Link to="/" className="back-link">
            ← Back to staff home
          </Link>
        </div>
      </div>
    </div>
  )
}
