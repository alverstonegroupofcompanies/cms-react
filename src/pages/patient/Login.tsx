import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { patientLogin, sendOtp, verifyOtp } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import PatientAuthLayout from '../../components/PatientAuthLayout'

export default function PatientLogin() {
  const [mode, setMode] = useState<'password' | 'otp'>('password')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email')
  const [devOtp, setDevOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  const afterLogin = (token: string, user: import('../../api/types').User, mustReset?: boolean) => {
    setAuth(token, user)
    if (mustReset || user.must_reset_password) {
      navigate('/patient/reset-password')
    } else {
      navigate('/patient/dashboard')
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await patientLogin(login.trim(), password)
      afterLogin(data.token, data.user, data.must_reset_password)
    } catch {
      setError('Invalid mobile/email or password')
    }
    setLoading(false)
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await sendOtp(email.trim().toLowerCase())
      if (data.dev_otp) setDevOtp(data.dev_otp)
      setOtpStep('code')
    } catch {
      setError('Failed to send OTP')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await verifyOtp(email.trim().toLowerCase(), code)
      afterLogin(data.token, data.user)
    } catch (err: unknown) {
      const res = (err as { response?: { status?: number } })?.response
      setError(res?.status === 404 ? 'No account found. Please register first.' : 'Invalid OTP')
    }
    setLoading(false)
  }

  return (
    <PatientAuthLayout
      title="Patient sign in"
      subtitle="Access your clinic appointments and health records"
      footer={
        <p className="ph-auth-footer">
          New patient? <Link to="/patient/register">Register for an account</Link>
        </p>
      }
    >
      <div className="ph-tabs">
        <button type="button" className={mode === 'password' ? 'active' : ''} onClick={() => setMode('password')}>Password</button>
        <button type="button" className={mode === 'otp' ? 'active' : ''} onClick={() => setMode('otp')}>Email OTP</button>
      </div>
      {error && <div className="ph-alert ph-alert-error">{error}</div>}

      {mode === 'password' ? (
        <form onSubmit={handlePasswordLogin} className="ph-auth-form">
          <div className="ph-form-group">
            <label className="ph-label-form">Mobile or Email</label>
            <input className="ph-input" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="9876543210 or you@email.com" required />
          </div>
          <div className="ph-form-group">
            <label className="ph-label-form">Password</label>
            <input className="ph-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="ph-btn ph-btn-primary ph-btn-block" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
      ) : otpStep === 'email' ? (
        <form onSubmit={handleSendOtp} className="ph-auth-form">
          <div className="ph-form-group">
            <label className="ph-label-form">Email Address</label>
            <input className="ph-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="ph-btn ph-btn-primary ph-btn-block" disabled={loading}>Send OTP</button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="ph-auth-form">
          {devOtp && <div className="ph-alert ph-alert-info">Dev OTP: <strong>{devOtp}</strong></div>}
          <div className="ph-form-group">
            <label className="ph-label-form">OTP Code</label>
            <input className="ph-input" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} required />
          </div>
          <button type="submit" className="ph-btn ph-btn-primary ph-btn-block" disabled={loading}>Verify & Sign In</button>
        </form>
      )}
    </PatientAuthLayout>
  )
}
