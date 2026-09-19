import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { patientLogin, resetPasswordWithOtp, sendOtp, verifyOtp } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import BrandLogo from '../../components/BrandLogo'
import PasswordInput from '../../components/PasswordInput'
import { usePageTitle } from '../../hooks/usePageTitle'

const REMEMBER_KEY = 'alverstone_patient_login'

function maskEmail(email: string) {
  const [user, domain] = email.split('@')
  if (!user || !domain) return email
  const visible = user.slice(0, Math.min(2, user.length))
  return `${visible}${'•'.repeat(Math.max(user.length - 2, 2))}@${domain}`
}

type Mode = 'password' | 'otp' | 'forgot'
type ForgotStep = 'email' | 'code' | 'password'

const FEATURES = [
  {
    title: 'Book and manage visits',
    text: 'Choose a department and doctor, reserve a convenient slot, and reschedule or cancel when plans change — without calling the front desk.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </svg>
    ),
  },
  {
    title: 'See your visit history',
    text: 'Look back at past appointments, prescriptions, and notes from your care team so you always know what was discussed and what comes next.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M9 13h6M9 17h4" />
      </svg>
    ),
  },
  {
    title: 'Access lab results',
    text: 'When your tests are ready, open clear reports online and share them with your doctor — no extra trip to collect paper copies.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 3h6M10 3v5.5L5.5 18a2.5 2.5 0 0 0 2.2 3.5h8.6a2.5 2.5 0 0 0 2.2-3.5L14 8.5V3" />
        <path d="M8.5 14h7" />
      </svg>
    ),
  },
] as const

export default function PatientLogin() {
  usePageTitle('Patient sign in', 'Patient')

  const [mode, setMode] = useState<Mode>('password')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email')
  const [forgotStep, setForgotStep] = useState<ForgotStep>('email')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const nextParam = searchParams.get('next')
  const stateFrom =
    typeof location.state === 'object' &&
    location.state &&
    'from' in location.state &&
    typeof (location.state as { from?: unknown }).from === 'string'
      ? (location.state as { from: string }).from
      : null
  const redirectTo =
    nextParam && nextParam.startsWith('/patient')
      ? nextParam
      : stateFrom && stateFrom.startsWith('/patient')
        ? stateFrom
        : '/patient/dashboard'

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY)
      if (saved) {
        setLogin(saved)
        setRemember(true)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const afterLogin = (token: string, user: import('../../api/types').User, mustReset?: boolean) => {
    try {
      if (remember && login.trim()) {
        localStorage.setItem(REMEMBER_KEY, login.trim())
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }
    } catch {
      /* ignore */
    }
    setAuth(token, user)
    if (mustReset || user.must_reset_password) {
      navigate('/patient/reset-password')
    } else {
      navigate(redirectTo)
    }
  }

  const applyOtpResponse = (data: { mail_sent?: boolean; dev_otp?: string | null; message?: string }) => {
    setDevOtp(data.dev_otp || '')
    if (data.dev_otp) {
      setInfo(`Dev mode: use code ${data.dev_otp}`)
    } else if (data.mail_sent === false) {
      setInfo(data.message || 'Code generated.')
    } else {
      setInfo('')
    }
  }

  const startForgot = () => {
    setMode('forgot')
    setForgotStep('email')
    setError('')
    setInfo('')
    setCode('')
    setDevOtp('')
    setNewPassword('')
    setConfirmPassword('')
    if (login.includes('@')) setEmail(login.trim().toLowerCase())
  }

  const backToPassword = () => {
    setMode('password')
    setForgotStep('email')
    setError('')
    setInfo('')
    setCode('')
    setDevOtp('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await patientLogin(login.trim(), password)
      afterLogin(data.token, data.user, data.must_reset_password)
    } catch {
      setError('Invalid email/mobile or password. Please try again.')
    }
    setLoading(false)
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')
    try {
      const { data } = await sendOtp(email.trim().toLowerCase(), 'login')
      applyOtpResponse(data)
      setCode('')
      setOtpStep('code')
    } catch (err: unknown) {
      const res = (err as { response?: { status?: number; data?: { message?: string } } })?.response
      if (res?.status === 404) {
        setError(res.data?.message || 'No account found. Please register first.')
      } else {
        setError(res?.data?.message || 'Failed to send verification code')
      }
    }
    setLoading(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Enter the 6-digit code from your email')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await verifyOtp(email.trim().toLowerCase(), code)
      afterLogin(data.token, data.user)
    } catch (err: unknown) {
      const res = (err as { response?: { status?: number; data?: { message?: string } } })?.response
      if (res?.status === 404) {
        setError('No patient account found for this email. Register first, or use mobile + password.')
      } else if (res?.status === 422) {
        setError(res.data?.message || 'Invalid or expired code')
      } else {
        setError('Could not verify code. Try again.')
      }
    }
    setLoading(false)
  }

  const handleResend = async (purpose: 'login' | 'reset_password' = 'login') => {
    setLoading(true)
    setError('')
    setInfo('')
    try {
      const { data } = await sendOtp(email.trim().toLowerCase(), purpose)
      applyOtpResponse(data)
      if (!data.dev_otp) setInfo('A new code has been sent to your email.')
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string } } })?.response?.data
      setError(res?.message || 'Could not resend the code. Try again.')
    }
    setLoading(false)
  }

  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')
    try {
      const { data } = await sendOtp(email.trim().toLowerCase(), 'reset_password')
      applyOtpResponse(data)
      setCode('')
      setForgotStep('code')
    } catch (err: unknown) {
      const res = (err as { response?: { status?: number; data?: { message?: string } } })?.response
      setError(res?.data?.message || 'Failed to send reset code')
    }
    setLoading(false)
  }

  const handleForgotVerifyCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Enter the 6-digit code from your email')
      return
    }
    setError('')
    setInfo('')
    setForgotStep('password')
  }

  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data } = await resetPasswordWithOtp(
        email.trim().toLowerCase(),
        code,
        newPassword,
        confirmPassword
      )
      setInfo('Password updated. Signing you in…')
      afterLogin(data.token, data.user, false)
    } catch (err: unknown) {
      const res = (err as { response?: { status?: number; data?: { message?: string } } })?.response
      if (res?.status === 422) {
        setError(res.data?.message || 'Invalid or expired code. Request a new one.')
        setForgotStep('code')
      } else {
        setError(res?.data?.message || 'Could not reset password. Try again.')
      }
    }
    setLoading(false)
  }

  const cardTitle =
    mode === 'forgot'
      ? 'Reset password'
      : mode === 'otp'
        ? 'Sign in with email code'
        : 'Sign in to your portal'

  const cardSub =
    mode === 'forgot'
      ? 'We will verify your email, then you can choose a new password.'
      : mode === 'otp'
        ? 'We email a one-time code — useful if you prefer not to type a password.'
        : 'Use the email or mobile number linked to your patient account.'

  return (
    <div className="pp-portal pp-portal-auth page-fade">
      <div className="pp-bg" aria-hidden>
        <div className="pp-bg-leaf pp-bg-leaf-a" />
        <div className="pp-bg-leaf pp-bg-leaf-b" />
        <div className="pp-bg-leaf pp-bg-leaf-c" />
      </div>

      <section className="pp-hero pp-hero-auth">
        <div className="pp-hero-copy">
          <BrandLogo brand="clinic" to="/patient" height={40} className="pp-auth-brand" />
          <h1 className="pp-headline">Your care, ready when you are</h1>
          <p className="pp-lead">
            Book visits, review history, and open lab results in one calm place —
            securely, whenever you need them.
          </p>

          <ul className="pp-features">
            {FEATURES.map((f) => (
              <li key={f.title} className="pp-feature">
                <span className="pp-feature-mark" aria-hidden>
                  {f.icon}
                </span>
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link to="/patient" className="pp-auth-back">
            ← Back to clinic site
          </Link>
        </div>

        <div className="pp-hero-form-wrap" id="sign-in">
          {redirectTo !== '/patient/dashboard' && (
            <div className="pp-auth-notice" role="status">
              Sign in to continue to{' '}
              <strong>{redirectTo.replace('/patient/', '').replace(/-/g, ' ')}</strong>.
            </div>
          )}

          <div className="pp-card">
            <h2 className="pp-card-title">{cardTitle}</h2>
            <p className="pp-card-sub">{cardSub}</p>

            {mode !== 'forgot' && (
              <div className="pp-tabs" role="tablist" aria-label="Sign-in method">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'password'}
                  className={mode === 'password' ? 'active' : ''}
                  onClick={() => {
                    setMode('password')
                    setError('')
                    setInfo('')
                  }}
                >
                  Password
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'otp'}
                  className={mode === 'otp' ? 'active' : ''}
                  onClick={() => {
                    setMode('otp')
                    setOtpStep('email')
                    setError('')
                    setInfo('')
                  }}
                >
                  Email code
                </button>
              </div>
            )}

            {error && (
              <div className="pp-alert pp-alert-error" role="alert">
                {error}
              </div>
            )}
            {info && (
              <div className="pp-alert pp-alert-success" role="status">
                {info}
              </div>
            )}

            {mode === 'password' ? (
              <form onSubmit={handlePasswordLogin} className="pp-form">
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-login">
                    Email or mobile
                  </label>
                  <input
                    id="pp-login"
                    className="pp-input"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="you@email.com or 9876543210"
                    required
                    autoComplete="username"
                  />
                </div>
                <div className="pp-field">
                  <div className="pp-label-row">
                    <label className="pp-label" htmlFor="pp-password">
                      Password
                    </label>
                    <button type="button" className="pp-linkbtn" onClick={startForgot}>
                      Forgot password?
                    </button>
                  </div>
                  <PasswordInput
                    id="pp-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    inputClassName="pp-input"
                  />
                </div>
                <div className="pp-row">
                  <label className="pp-check">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    Remember me
                  </label>
                </div>
                <button type="submit" className="pp-btn" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            ) : mode === 'forgot' && forgotStep === 'email' ? (
              <form onSubmit={handleForgotSendOtp} className="pp-form">
                <p className="pp-verify-copy">
                  Enter the email linked to your patient account. We will send a 6-digit code.
                </p>
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-reset-email">
                    Email
                  </label>
                  <input
                    id="pp-reset-email"
                    className="pp-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                <button type="submit" className="pp-btn" disabled={loading}>
                  {loading ? 'Sending…' : 'Send reset code'}
                </button>
                <div className="pp-verify-actions">
                  <button type="button" className="pp-linkbtn" onClick={backToPassword}>
                    Back to sign in
                  </button>
                </div>
              </form>
            ) : mode === 'forgot' && forgotStep === 'code' ? (
              <div>
                <p className="pp-verify-copy">We sent a 6-digit reset code to</p>
                <p className="pp-verify-email">{maskEmail(email.trim().toLowerCase())}</p>
                {devOtp && (
                  <div className="pp-alert pp-alert-success" role="status">
                    Your code: <strong style={{ letterSpacing: '0.2em' }}>{devOtp}</strong>
                  </div>
                )}
                <form onSubmit={handleForgotVerifyCode} className="pp-form">
                  <div className="pp-field">
                    <label className="pp-label" htmlFor="pp-reset-otp">
                      Verification code
                    </label>
                    <input
                      id="pp-reset-otp"
                      className="pp-input pp-otp-input"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                        setError('')
                      }}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="••••••"
                      required
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="pp-btn" disabled={loading || code.length !== 6}>
                    Continue
                  </button>
                </form>
                <div className="pp-verify-actions">
                  <button
                    type="button"
                    className="pp-linkbtn"
                    onClick={() => handleResend('reset_password')}
                    disabled={loading}
                  >
                    Resend code
                  </button>
                  <button
                    type="button"
                    className="pp-linkbtn"
                    onClick={() => {
                      setForgotStep('email')
                      setCode('')
                      setDevOtp('')
                      setError('')
                      setInfo('')
                    }}
                  >
                    Use a different email
                  </button>
                  <button type="button" className="pp-linkbtn" onClick={backToPassword}>
                    Back to sign in
                  </button>
                </div>
              </div>
            ) : mode === 'forgot' && forgotStep === 'password' ? (
              <form onSubmit={handleForgotReset} className="pp-form">
                <p className="pp-verify-copy">
                  Code verified for <strong>{maskEmail(email.trim().toLowerCase())}</strong>. Set
                  your new password.
                </p>
                <div className="pp-field">
                  <label className="pp-label">New password</label>
                  <PasswordInput
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    autoFocus
                    inputClassName="pp-input"
                  />
                </div>
                <div className="pp-field">
                  <label className="pp-label">Confirm password</label>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    inputClassName="pp-input"
                  />
                </div>
                <button type="submit" className="pp-btn" disabled={loading}>
                  {loading ? 'Saving…' : 'Save password & sign in'}
                </button>
                <div className="pp-verify-actions">
                  <button
                    type="button"
                    className="pp-linkbtn"
                    onClick={() => {
                      setForgotStep('code')
                      setError('')
                    }}
                  >
                    Back to code
                  </button>
                  <button type="button" className="pp-linkbtn" onClick={backToPassword}>
                    Back to sign in
                  </button>
                </div>
              </form>
            ) : otpStep === 'email' ? (
              <form onSubmit={handleSendOtp} className="pp-form">
                <div className="pp-field">
                  <label className="pp-label" htmlFor="pp-otp-email">
                    Email
                  </label>
                  <input
                    id="pp-otp-email"
                    className="pp-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <button type="submit" className="pp-btn" disabled={loading}>
                  {loading ? 'Sending…' : 'Send verification code'}
                </button>
              </form>
            ) : (
              <div>
                <p className="pp-verify-copy">We sent a 6-digit code to</p>
                <p className="pp-verify-email">{maskEmail(email.trim().toLowerCase())}</p>
                {devOtp && (
                  <div className="pp-alert pp-alert-success" role="status">
                    Your code: <strong style={{ letterSpacing: '0.2em' }}>{devOtp}</strong>
                  </div>
                )}
                <form onSubmit={handleVerifyOtp} className="pp-form">
                  <div className="pp-field">
                    <label className="pp-label" htmlFor="pp-login-otp">
                      Verification code
                    </label>
                    <input
                      id="pp-login-otp"
                      className="pp-input pp-otp-input"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                        setError('')
                      }}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="••••••"
                      required
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="pp-btn" disabled={loading || code.length !== 6}>
                    {loading ? 'Verifying…' : 'Verify & sign in'}
                  </button>
                </form>
                <div className="pp-verify-actions">
                  <button
                    type="button"
                    className="pp-linkbtn"
                    onClick={() => handleResend('login')}
                    disabled={loading}
                  >
                    Resend code
                  </button>
                  <button
                    type="button"
                    className="pp-linkbtn"
                    onClick={() => {
                      setOtpStep('email')
                      setCode('')
                      setDevOtp('')
                      setError('')
                      setInfo('')
                    }}
                  >
                    Use a different email
                  </button>
                </div>
              </div>
            )}

            {mode !== 'forgot' && (
              <p className="pp-card-foot">
                New here? <Link to="/patient/register">Create a patient account</Link>
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
