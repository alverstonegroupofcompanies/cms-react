import { Link } from 'react-router-dom'
import { IconShield } from './Icons'

interface Props {
  title: string
  subtitle?: string
  children: React.ReactNode
  variant?: 'patient' | 'staff'
}

export default function AuthLayout({ title, subtitle, children, variant = 'staff' }: Props) {
  return (
    <div className="auth-split">
      <div className="auth-split-visual">
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <div className="auth-logo">Clinic<span>CMS</span></div>
          <h1>Clinic Management System</h1>
          <p>Book appointments, join live queue, manage your clinic — all in one place.</p>
        </div>
      </div>
      <div className="auth-split-form">
        <div className="auth-form-wrap">
          {variant === 'staff' && (
            <div className="auth-shield">
              <IconShield size={32} />
            </div>
          )}
          {variant === 'patient' && (
            <div className="auth-phone-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </div>
          )}
          <h2>{title}</h2>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
          <Link to="/" className="back-link">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
