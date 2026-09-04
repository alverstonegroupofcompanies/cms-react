import { Link, useNavigate } from 'react-router-dom'
import { devLogin } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { iconMap } from '../components/Icons'

const DEV_REDIRECTS = {
  patient: '/patient/dashboard',
  receptionist: '/receptionist/dashboard',
  doctor: '/doctor/dashboard',
  admin: '/admin/dashboard',
} as const

const portals = [
  { to: '/patient/register', className: 'patient', icon: 'calendar' as const, title: 'Patient Register', desc: 'Create your medical profile' },
  { to: '/patient/login', className: 'patient', icon: 'calendar' as const, title: 'Patient Login', desc: 'Book appointments and view reports' },
  { to: '/receptionist/login', className: 'receptionist', icon: 'users' as const, title: 'Receptionist', desc: 'Register patients, manage queue' },
  { to: '/doctor/login', className: 'doctor', icon: 'stethoscope' as const, title: 'Doctor Panel', desc: 'View schedule, call next patient' },
  { to: '/admin/login', className: 'admin', icon: 'shield' as const, title: 'Admin Panel', desc: 'Manage doctors, staff, dashboard' },
]

export default function Home() {
  const { setAuth } = useAuth()
  const navigate = useNavigate()
  const showDevBypass = import.meta.env.DEV

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
    <div className="home-page">
      <div className="home-visual">
        <div className="home-visual-overlay" />
        <div className="home-visual-content">
          <div className="home-logo">Alverstone<span> Medcity</span></div>
          <h1>Alverstone Medcity</h1>
          <p>Book appointments and manage your health — all in one place.</p>
        </div>
      </div>
      <div className="home-panel">
        <h2>Select your portal</h2>
        <div className="portal-grid">
          {portals.map((p) => {
            const Icon = iconMap[p.icon]
            return (
              <Link key={p.to} to={p.to} className={`portal-card ${p.className}`}>
                <div className="portal-card-icon"><Icon size={22} /></div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </Link>
            )
          })}
        </div>
        {showDevBypass && (
          <div className="dev-bypass">
            <p className="dev-bypass-label">Dev quick access — skip login</p>
            <div className="dev-bypass-buttons">
              {(['patient', 'receptionist', 'doctor', 'admin'] as const).map((role) => (
                <button key={role} type="button" className="btn-dev" onClick={() => handleDevLogin(role)}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
