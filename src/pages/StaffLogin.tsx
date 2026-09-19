import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { staffLogin } from '../api/client'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'
import PasswordInput from '../components/PasswordInput'

type StaffRole = 'admin' | 'doctor' | 'receptionist' | 'pharmacy' | 'lab'

interface Props {
  role: StaffRole
  redirect: string
  title: string
}

const SECTION: Record<StaffRole, string> = {
  doctor: 'Doctor',
  admin: 'Admin',
  receptionist: 'Reception',
  pharmacy: 'Pharmacy',
  lab: 'Lab',
}

const SUBTITLE: Record<StaffRole, string> = {
  doctor: 'Enter your clinic credentials to open the doctor workspace.',
  admin: 'Enter your admin credentials to manage clinic operations.',
  receptionist: 'Enter your credentials to open the reception desk.',
  pharmacy: 'Enter your credentials to open the pharmacy workspace.',
  lab: 'Enter your credentials to open the lab workspace.',
}

const DEMO_EMAIL: Record<StaffRole, string> = {
  doctor: 'doctor@clinic.com',
  admin: 'admin@clinic.com',
  receptionist: 'reception@clinic.com',
  pharmacy: 'pharmacy@clinic.com',
  lab: 'lab@clinic.com',
}

export default function StaffLogin({ role, redirect, title }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await staffLogin(email, password)
      if (data.user.role !== role) {
        setError(`This login is for ${role} staff only.`)
        setLoading(false)
        return
      }
      setAuth(data.token, data.user)
      navigate(redirect)
    } catch {
      setError('Invalid credentials')
    }
    setLoading(false)
  }

  return (
    <AuthLayout
      title={title}
      subtitle={SUBTITLE[role]}
      variant="staff"
      section={SECTION[role]}
      role={role}
    >
      {error && <div className="alert alert-error">{error}</div>}
      <form className="hop-auth-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={DEMO_EMAIL[role]}
            required
            autoComplete="username"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <PasswordInput
            inputClassName=""
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn btn-primary btn-block hop-auth-submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="demo-creds hop-auth-demo">
        Demo: {DEMO_EMAIL[role]} / password
      </p>
    </AuthLayout>
  )
}
