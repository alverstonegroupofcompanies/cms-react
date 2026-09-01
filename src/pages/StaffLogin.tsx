import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { staffLogin } from '../api/client'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'

interface Props {
  role: 'admin' | 'doctor' | 'receptionist'
  redirect: string
  title: string
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
        setError(`This login is for ${role} only.`)
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
    <AuthLayout title={title} subtitle="Secure staff access" variant="staff">
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={`${role}@clinic.com`} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="demo-creds">Demo: {role}@clinic.com / password</p>
    </AuthLayout>
  )
}
