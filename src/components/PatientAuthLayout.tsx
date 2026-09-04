import { Link } from 'react-router-dom'

interface Props {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function PatientAuthLayout({ title, subtitle, children, footer }: Props) {
  return (
    <div className="ph-auth">
      <div className="ph-auth-bg" aria-hidden />

      <div className="ph-auth-shell">
        <aside className="ph-auth-aside">
          <Link to="/" className="ph-logo ph-logo-light">
            <span className="ph-logo-mark" aria-hidden>+</span>
            <span className="ph-logo-text">Alverstone Medcity</span>
          </Link>
          <p className="ph-auth-aside-kicker">Patient portal</p>
          <h2 className="ph-auth-aside-title">Clinic care,<br />managed online.</h2>
          <p className="ph-auth-aside-text">
            Access appointments, medical records, and lab reports through your secure patient account.
          </p>
          <ul className="ph-auth-features">
            <li>Book and manage clinic visits</li>
            <li>View appointment history</li>
            <li>Access lab reports securely</li>
          </ul>
        </aside>

        <main className="ph-auth-main">
          <div className="ph-auth-card">
            <h1 className="ph-auth-title">{title}</h1>
            {subtitle && <p className="ph-auth-sub">{subtitle}</p>}
            {children}
            {footer}
            <Link to="/" className="ph-auth-back">← Clinic home</Link>
          </div>
        </main>
      </div>
    </div>
  )
}
