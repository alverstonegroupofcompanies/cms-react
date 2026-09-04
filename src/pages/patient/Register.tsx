import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerPatient, sendOtp } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { BLOOD_GROUPS } from '../../utils/patientForm'

export default function PatientRegister() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: '',
    gender: '',
    dob: '',
    address: '',
    blood_group: '',
    emergency_contact: '',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [devOtp, setDevOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuth()
  const navigate = useNavigate()

  const update = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }))
    setError('')
  }

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.first_name.trim()) {
      setError('First name is required')
      return
    }
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, '').slice(-10))) {
      setError('Valid 10-digit mobile number is required')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match')
      return
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Enter a valid email or leave blank')
      return
    }
    if (form.email) {
      setLoading(true)
      try {
        const { data } = await sendOtp(form.email.trim().toLowerCase())
        if (data.dev_otp) setDevOtp(data.dev_otp)
        setStep('otp')
      } catch {
        setError('Failed to send OTP to email')
      }
      setLoading(false)
    } else {
      await submitRegistration()
    }
  }

  const submitRegistration = async (otpCode?: string) => {
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('first_name', form.first_name.trim())
      if (form.last_name.trim()) fd.append('last_name', form.last_name.trim())
      fd.append('phone', form.phone.replace(/\D/g, '').slice(-10))
      if (form.email.trim()) fd.append('email', form.email.trim().toLowerCase())
      fd.append('password', form.password)
      fd.append('password_confirmation', form.password_confirmation)
      if (form.gender) fd.append('gender', form.gender)
      if (form.dob) fd.append('dob', form.dob)
      if (form.address.trim()) fd.append('address', form.address.trim())
      if (form.blood_group) fd.append('blood_group', form.blood_group)
      if (form.emergency_contact.trim()) fd.append('emergency_contact', form.emergency_contact.trim())
      if (otpCode) fd.append('code', otpCode)
      if (photo) fd.append('photo', photo)

      const { data } = await registerPatient(fd)
      setAuth(data.token, data.user)
      navigate('/patient/profile?welcome=1')
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
      const firstFieldError = res?.errors ? Object.values(res.errors)[0]?.[0] : null
      setError(firstFieldError || res?.message || 'Registration failed')
    }
    setLoading(false)
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Enter 6-digit OTP')
      return
    }
    await submitRegistration(code)
  }

  return (
    <div className="ph-auth ph-auth-register">
      <div className="ph-auth-bg" aria-hidden />

      <div className="ph-register-wrap">
        <header className="ph-register-head">
          <Link to="/" className="ph-logo">
            <span className="ph-logo-mark">+</span>
            <span className="ph-logo-text">
              <strong>Alverstone</strong>
              <span>Patient registration</span>
            </span>
          </Link>
          <p className="ph-register-head-sub">
            Already registered? <Link to="/patient/login">Sign in</Link>
          </p>
        </header>

        <div className="ph-register-card">
          <h1 className="ph-auth-title">Register as a patient</h1>
          <p className="ph-auth-sub">Create your clinic account. First name, mobile, and password are required.</p>
          {error && <div className="ph-alert ph-alert-error">{error}</div>}

          {step === 'form' ? (
            <form onSubmit={handleContinue} className="ph-auth-form">
              <div className="ph-form-grid">
                <div className="ph-form-group">
                  <label className="ph-label-form">First Name *</label>
                  <input className="ph-input" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} required />
                </div>
                <div className="ph-form-group">
                  <label className="ph-label-form">Last Name</label>
                  <input className="ph-input" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} />
                </div>
              </div>
              <div className="ph-form-group">
                <label className="ph-label-form">Mobile Number *</label>
                <input className="ph-input" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="9876543210" required />
              </div>
              <div className="ph-form-group">
                <label className="ph-label-form">Email</label>
                <input className="ph-input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="Optional — OTP sent if provided" />
              </div>
              <div className="ph-form-grid">
                <div className="ph-form-group">
                  <label className="ph-label-form">Password *</label>
                  <input
                    className="ph-input"
                    type="password"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    minLength={8}
                    required
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                  />
                </div>
                <div className="ph-form-group">
                  <label className="ph-label-form">Confirm Password *</label>
                  <input
                    className="ph-input"
                    type="password"
                    value={form.password_confirmation}
                    onChange={(e) => update('password_confirmation', e.target.value)}
                    minLength={8}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="ph-form-grid">
                <div className="ph-form-group">
                  <label className="ph-label-form">Gender</label>
                  <select className="ph-input" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="ph-form-group">
                  <label className="ph-label-form">Date of Birth</label>
                  <input className="ph-input" type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)} max={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="ph-form-group">
                <label className="ph-label-form">Address</label>
                <input className="ph-input" value={form.address} onChange={(e) => update('address', e.target.value)} />
              </div>
              <div className="ph-form-grid">
                <div className="ph-form-group">
                  <label className="ph-label-form">Blood Group</label>
                  <select className="ph-input" value={form.blood_group} onChange={(e) => update('blood_group', e.target.value)}>
                    <option value="">Select</option>
                    {BLOOD_GROUPS.filter((g) => g !== 'unknown').map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="ph-form-group">
                  <label className="ph-label-form">Emergency Contact</label>
                  <input className="ph-input" value={form.emergency_contact} onChange={(e) => update('emergency_contact', e.target.value)} placeholder="Name & phone" />
                </div>
              </div>
              <div className="ph-form-group">
                <label className="ph-label-form">Photo</label>
                <input className="ph-input ph-file" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
              </div>
              <button type="submit" className="ph-btn ph-btn-primary ph-btn-block" disabled={loading}>
                {loading ? 'Please wait...' : form.email ? 'Continue — Verify Email' : 'Register'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="ph-auth-form">
              <p className="ph-muted">OTP sent to <strong>{form.email}</strong></p>
              {devOtp && <div className="ph-alert ph-alert-info">Dev OTP: <strong>{devOtp}</strong></div>}
              <div className="ph-form-group">
                <label className="ph-label-form">Verification Code</label>
                <input className="ph-input" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} required />
              </div>
              <button type="submit" className="ph-btn ph-btn-primary ph-btn-block" disabled={loading}>
                {loading ? 'Registering...' : 'Verify & Register'}
              </button>
              <button type="button" className="ph-btn ph-btn-ghost ph-btn-block" onClick={() => setStep('form')}>Back</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
