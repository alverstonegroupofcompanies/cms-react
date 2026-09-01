import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendOtp, verifyOtp } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import AuthLayout from '../../components/AuthLayout'

export default function PatientLogin() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [devOtp, setDevOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await sendOtp(phone)
      if (data.dev_otp) setDevOtp(data.dev_otp)
      setStep('otp')
    } catch {
      setError('Failed to send OTP')
    }
    setLoading(false)
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await verifyOtp(phone, code, name || undefined)
      setAuth(data.token, data.user)
      navigate('/patient/dashboard')
    } catch {
      setError('Invalid OTP')
    }
    setLoading(false)
  }

  return (
    <AuthLayout title="Patient Login" subtitle="Login with your mobile number via OTP" variant="patient">
      {error && <div className="alert alert-error">{error}</div>}
      {step === 'phone' ? (
        <form onSubmit={handleSendOtp}>
          <div className="form-group">
            <label>Mobile Number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          {devOtp && <div className="alert alert-info">Dev OTP: <strong>{devOtp}</strong></div>}
          <div className="form-group">
            <label>Your Name (first time)</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label>OTP Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" maxLength={6} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
          <button type="button" className="btn btn-link" onClick={() => setStep('phone')}>Change number</button>
        </form>
      )}
    </AuthLayout>
  )
}
