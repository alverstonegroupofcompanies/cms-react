import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { registerPatient, sendOtp } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { usePageTitle } from '../../hooks/usePageTitle'
import PasswordInput from '../../components/PasswordInput'
import BrandLogo from '../../components/BrandLogo'
import { BLOOD_GROUPS } from '../../utils/patientForm'

type FormFields = {
  first_name: string
  last_name: string
  phone: string
  email: string
  password: string
  password_confirmation: string
  gender: string
  dob: string
  address: string
  blood_group: string
  emergency_contact: string
}

type FieldKey = keyof FormFields | 'photo' | 'code'
type FieldErrors = Partial<Record<FieldKey, string>>

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const DRAFT_KEY = 'alverstone_patient_register_draft'

/** Survives React remounts (auth refresh / HMR) within the same tab session. */
let photoDraft: File | null = null

type DraftPayload = {
  form: FormFields
  step: 'form' | 'otp'
  code: string
  mailSent: boolean
  error?: string
}

function emptyForm(): FormFields {
  return {
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
  }
}

function readDraft(): DraftPayload | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as DraftPayload
  } catch {
    return null
  }
}

function writeDraft(draft: DraftPayload) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    /* ignore quota */
  }
}

function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY)
  photoDraft = null
}

function maskEmail(email: string) {
  const [user, domain] = email.split('@')
  if (!user || !domain) return email
  const visible = user.slice(0, Math.min(2, user.length))
  return `${visible}${'•'.repeat(Math.max(user.length - 2, 2))}@${domain}`
}

function todayIso() {
  return new Date().toISOString().split('T')[0]
}

/** Latest allowed DOB = yesterday (matches backend `before:today`). */
function maxDobIso() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function digitsPhone(phone: string) {
  return phone.replace(/\D/g, '').slice(-10)
}

function validateField(field: FieldKey, form: FormFields, photo: File | null): string {
  switch (field) {
    case 'first_name':
      if (!form.first_name.trim()) return 'First name is required'
      return ''
    case 'phone': {
      const phone = digitsPhone(form.phone)
      if (!phone) return 'Mobile number is required'
      if (!/^\d{10}$/.test(phone)) return 'Enter a valid 10-digit mobile number'
      return ''
    }
    case 'email':
      if (!form.email.trim()) return ''
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Enter a valid email address'
      return ''
    case 'password':
      if (!form.password) return 'Password is required'
      if (form.password.length < 8) return 'Password must be at least 8 characters'
      return ''
    case 'password_confirmation':
      if (!form.password_confirmation) return 'Confirm your password'
      if (form.password_confirmation !== form.password) return 'Passwords do not match'
      return ''
    case 'dob':
      if (!form.dob) return ''
      if (form.dob >= todayIso()) return 'Date of birth must be before today'
      return ''
    case 'photo':
      if (!photo) return ''
      if (!photo.type.startsWith('image/')) return 'Photo must be an image file'
      if (photo.size > MAX_PHOTO_BYTES) return 'Photo must be 5MB or smaller'
      return ''
    case 'code':
      return ''
    default:
      return ''
  }
}

function validateRegistrationForm(form: FormFields, photo: File | null): FieldErrors {
  const keys: FieldKey[] = [
    'first_name',
    'phone',
    'email',
    'password',
    'password_confirmation',
    'dob',
    'photo',
  ]
  const next: FieldErrors = {}
  for (const key of keys) {
    const msg = validateField(key, form, photo)
    if (msg) next[key] = msg
  }
  return next
}

function mapServerFieldErrors(errors?: Record<string, string[]>): FieldErrors {
  if (!errors) return {}
  const mapped: FieldErrors = {}
  for (const [key, messages] of Object.entries(errors)) {
    const msg = messages?.[0]
    if (!msg) continue
    if (key in mapped || ['first_name', 'last_name', 'phone', 'email', 'password', 'password_confirmation', 'gender', 'dob', 'address', 'blood_group', 'emergency_contact', 'photo', 'code'].includes(key)) {
      mapped[key as FieldKey] = msg
    }
  }
  return mapped
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="ph-field-error" role="alert">{message}</p>
}

export default function PatientRegister() {
  const initialDraft = useMemo(() => readDraft(), [])
  const [form, setForm] = useState<FormFields>(() => initialDraft?.form ?? emptyForm())
  const [photo, setPhoto] = useState<File | null>(() => photoDraft)
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({})
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [code, setCode] = useState(() => initialDraft?.code ?? '')
  const [devOtp, setDevOtp] = useState('')
  const [mailSent, setMailSent] = useState(() => initialDraft?.mailSent ?? true)
  const [step, setStep] = useState<'form' | 'otp'>(() => initialDraft?.step ?? 'form')
  const [error, setError] = useState(() => initialDraft?.error ?? '')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const submittingRef = useRef(false)
  const { setAuth } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const nextAfterRegister =
    searchParams.get('next')?.startsWith('/patient')
      ? searchParams.get('next')!
      : '/patient/dashboard'
  usePageTitle(step === 'otp' ? 'Verify email' : 'Patient registration', 'Patient')

  const maxDob = useMemo(() => maxDobIso(), [])

  useEffect(() => {
    writeDraft({ form, step, code, mailSent, error: step === 'form' ? error : undefined })
  }, [form, step, code, mailSent, error])

  useEffect(() => {
    photoDraft = photo
  }, [photo])

  const setFieldError = (field: FieldKey, message: string) => {
    setFieldErrors((prev) => {
      if (!message) {
        if (!prev[field]) return prev
        const next = { ...prev }
        delete next[field]
        return next
      }
      return { ...prev, [field]: message }
    })
  }

  const update = (field: keyof FormFields, value: string) => {
    const nextForm = { ...form, [field]: value }
    setForm(nextForm)
    setError('')
    setTouched((t) => ({ ...t, [field]: true }))
    setFieldError(field, validateField(field, nextForm, photo))
    if (field === 'password' || field === 'password_confirmation') {
      setFieldError('password_confirmation', validateField('password_confirmation', nextForm, photo))
    }
  }

  const markTouched = (field: FieldKey) => {
    setTouched((t) => ({ ...t, [field]: true }))
    setFieldError(field, validateField(field, form, photo))
  }

  const handlePhotoChange = (file: File | null) => {
    photoDraft = file
    setPhoto(file)
    setTouched((t) => ({ ...t, photo: true }))
    setError('')
    setFieldError('photo', validateField('photo', form, file))
  }

  const applyOtpResponse = (data: { mail_sent?: boolean; dev_otp?: string | null; message?: string }) => {
    setMailSent(data.mail_sent !== false)
    setDevOtp(data.dev_otp || '')
    if (data.dev_otp) {
      setInfo(`Dev mode: use code ${data.dev_otp}`)
    } else if (data.mail_sent === false) {
      setInfo(data.message || 'Code generated. If email did not arrive, check with support.')
    } else {
      setInfo('')
    }
  }

  const sendVerificationCode = async () => {
    const { data } = await sendOtp(form.email.trim().toLowerCase(), 'register')
    applyOtpResponse(data)
  }

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submittingRef.current) return

    const errors = validateRegistrationForm(form, photo)
    setFieldErrors(errors)
    setTouched({
      first_name: true,
      phone: true,
      email: true,
      password: true,
      password_confirmation: true,
      dob: true,
      photo: true,
    })

    if (Object.keys(errors).length > 0) {
      setError('Please fix the highlighted fields before continuing.')
      return
    }

    if (form.email.trim()) {
      submittingRef.current = true
      setLoading(true)
      setError('')
      try {
        await sendVerificationCode()
        setCode('')
        setStep('otp')
      } catch (err: unknown) {
        const res = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
        const mapped = mapServerFieldErrors(res?.errors)
        if (Object.keys(mapped).length) setFieldErrors((prev) => ({ ...prev, ...mapped }))
        const firstFieldError = res?.errors ? Object.values(res.errors)[0]?.[0] : null
        setError(firstFieldError || res?.message || 'Failed to send verification email')
      }
      setLoading(false)
      submittingRef.current = false
    } else {
      await submitRegistration()
    }
  }

  const submitRegistration = async (otpCode?: string) => {
    if (submittingRef.current) return

    const errors = validateRegistrationForm(form, photo)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setTouched((t) => ({
        ...t,
        first_name: true,
        phone: true,
        email: true,
        password: true,
        password_confirmation: true,
        dob: true,
        photo: true,
      }))
      setStep('form')
      setError('Please fix the highlighted fields before continuing.')
      return
    }

    submittingRef.current = true
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('first_name', form.first_name.trim())
      if (form.last_name.trim()) fd.append('last_name', form.last_name.trim())
      fd.append('phone', digitsPhone(form.phone))
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
      clearDraft()
      setAuth(data.token, data.user)
      navigate(nextAfterRegister, { replace: true })
      return
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
      const mapped = mapServerFieldErrors(res?.errors)
      const firstFieldError = res?.errors ? Object.values(res.errors)[0]?.[0] : null
      const message = firstFieldError || res?.message || 'Registration failed'

      if (Object.keys(mapped).length > 0 && !mapped.code) {
        setFieldErrors((prev) => ({ ...prev, ...mapped }))
        setStep('form')
        setError(message)
      } else {
        setError(message)
      }
    }
    setLoading(false)
    submittingRef.current = false
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Enter the 6-digit code from your email')
      return
    }
    await submitRegistration(code)
  }

  const handleResend = async () => {
    setResending(true)
    setError('')
    setInfo('')
    try {
      await sendVerificationCode()
      if (!devOtp) setInfo('A new code has been sent to your email.')
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string } } })?.response?.data
      setError(res?.message || 'Could not resend the code. Try again.')
    }
    setResending(false)
  }

  const backToRegistration = () => {
    setStep('form')
    setInfo('')
  }

  const show = (field: FieldKey) => (touched[field] ? fieldErrors[field] : undefined)
  const invalidClass = (field: FieldKey) => (show(field) ? ' ph-input-invalid' : '')

  return (
    <div className="ph-auth ph-auth-register">
      <div className="ph-auth-bg" aria-hidden />

      <div className="ph-register-wrap">
        <header className="ph-register-head">
          <BrandLogo brand="clinic" to="/patient" height={40} className="ph-register-logo" />
          <p className="ph-register-head-sub">
            Already registered? <Link to="/patient/login">Sign in</Link>
          </p>
        </header>

        <div className={`ph-register-card${step === 'otp' ? ' ph-register-card-verify' : ''}`}>
          {step === 'form' ? (
            <>
              <h1 className="ph-auth-title">Register as a patient</h1>
              <p className="ph-auth-sub">Create your clinic account. First name, mobile, and password are required.</p>
              {error && <div className="ph-alert ph-alert-error">{error}</div>}

              <form onSubmit={handleContinue} className="ph-auth-form" noValidate>
                <div className="ph-form-grid">
                  <div className="ph-form-group">
                    <label className="ph-label-form" htmlFor="reg-first-name">First Name *</label>
                    <input
                      id="reg-first-name"
                      className={`ph-input${invalidClass('first_name')}`}
                      value={form.first_name}
                      onChange={(e) => update('first_name', e.target.value)}
                      onBlur={() => markTouched('first_name')}
                      autoComplete="given-name"
                      required
                    />
                    <FieldError message={show('first_name')} />
                  </div>
                  <div className="ph-form-group">
                    <label className="ph-label-form" htmlFor="reg-last-name">Last Name</label>
                    <input
                      id="reg-last-name"
                      className="ph-input"
                      value={form.last_name}
                      onChange={(e) => update('last_name', e.target.value)}
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="ph-form-group">
                  <label className="ph-label-form" htmlFor="reg-phone">Mobile Number *</label>
                  <input
                    id="reg-phone"
                    className={`ph-input${invalidClass('phone')}`}
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    onBlur={() => markTouched('phone')}
                    placeholder="9876543210"
                    inputMode="numeric"
                    autoComplete="tel"
                    required
                  />
                  <FieldError message={show('phone')} />
                </div>

                <div className="ph-form-group">
                  <label className="ph-label-form" htmlFor="reg-email">Email</label>
                  <input
                    id="reg-email"
                    className={`ph-input${invalidClass('email')}`}
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    onBlur={() => markTouched('email')}
                    placeholder="you@email.com"
                    autoComplete="email"
                  />
                  <FieldError message={show('email')} />
                </div>

                <div className="ph-form-grid">
                  <div className="ph-form-group">
                    <label className="ph-label-form">Password *</label>
                    <PasswordInput
                      className={invalidClass('password').trim()}
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      onBlur={() => markTouched('password')}
                      minLength={8}
                      required
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                    />
                    <FieldError message={show('password')} />
                  </div>
                  <div className="ph-form-group">
                    <label className="ph-label-form">Confirm Password *</label>
                    <PasswordInput
                      className={invalidClass('password_confirmation').trim()}
                      value={form.password_confirmation}
                      onChange={(e) => update('password_confirmation', e.target.value)}
                      onBlur={() => markTouched('password_confirmation')}
                      minLength={8}
                      required
                      autoComplete="new-password"
                    />
                    <FieldError message={show('password_confirmation')} />
                  </div>
                </div>

                <div className="ph-form-grid">
                  <div className="ph-form-group">
                    <label className="ph-label-form" htmlFor="reg-gender">Gender</label>
                    <select
                      id="reg-gender"
                      className="ph-input"
                      value={form.gender}
                      onChange={(e) => update('gender', e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="ph-form-group">
                    <label className="ph-label-form" htmlFor="reg-dob">Date of Birth</label>
                    <input
                      id="reg-dob"
                      className={`ph-input${invalidClass('dob')}`}
                      type="date"
                      value={form.dob}
                      max={maxDob}
                      onChange={(e) => update('dob', e.target.value)}
                      onBlur={() => markTouched('dob')}
                    />
                    <FieldError message={show('dob')} />
                  </div>
                </div>

                <div className="ph-form-group">
                  <label className="ph-label-form" htmlFor="reg-address">Address</label>
                  <input
                    id="reg-address"
                    className="ph-input"
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                  />
                </div>

                <div className="ph-form-grid">
                  <div className="ph-form-group">
                    <label className="ph-label-form" htmlFor="reg-blood">Blood Group</label>
                    <select
                      id="reg-blood"
                      className="ph-input"
                      value={form.blood_group}
                      onChange={(e) => update('blood_group', e.target.value)}
                    >
                      <option value="">Select</option>
                      {BLOOD_GROUPS.filter((g) => g !== 'unknown').map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="ph-form-group">
                    <label className="ph-label-form" htmlFor="reg-emergency">Emergency Contact</label>
                    <input
                      id="reg-emergency"
                      className="ph-input"
                      value={form.emergency_contact}
                      onChange={(e) => update('emergency_contact', e.target.value)}
                      placeholder="Name & phone"
                    />
                  </div>
                </div>

                <div className="ph-form-group">
                  <label className="ph-label-form" htmlFor="reg-photo">Photo</label>
                  <input
                    id="reg-photo"
                    className={`ph-input ph-file${invalidClass('photo')}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
                  />
                  <p className="ph-verify-hint" style={{ marginTop: '0.35rem' }}>
                    Optional · max 5MB
                    {photo
                      ? ` · selected: ${photo.name}`
                      : step === 'form' && initialDraft?.step === 'otp'
                        ? ' · please re-select photo if needed'
                        : ''}
                  </p>
                  <FieldError message={show('photo')} />
                </div>

                <button type="submit" className="ph-btn ph-btn-primary ph-btn-block" disabled={loading}>
                  {loading ? 'Please wait...' : form.email.trim() ? 'Continue — Verify Email' : 'Register'}
                </button>
              </form>
            </>
          ) : (
            <div className="ph-verify">
              <button type="button" className="ph-linkbtn ph-verify-back" onClick={backToRegistration}>
                ← Back to registration
              </button>
              <div className="ph-verify-icon" aria-hidden>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <h1 className="ph-auth-title">Verify your email</h1>
              <p className="ph-auth-sub ph-verify-copy">
                {mailSent
                  ? 'We sent a 6-digit verification code to'
                  : 'Enter the 6-digit verification code for'}
              </p>
              <p className="ph-verify-email">{maskEmail(form.email.trim().toLowerCase())}</p>
              <p className="ph-verify-hint">
                {mailSent
                  ? 'Enter the code below to finish creating your account.'
                  : 'Email delivery was skipped or failed in this environment — use the code shown below.'}
              </p>

              {error && <div className="ph-alert ph-alert-error">{error}</div>}
              {info && <div className="ph-alert ph-alert-success">{info}</div>}
              {devOtp && (
                <div className="ph-alert ph-alert-success" role="status">
                  Your code: <strong style={{ letterSpacing: '0.2em' }}>{devOtp}</strong>
                </div>
              )}

              <form onSubmit={handleOtpSubmit} className="ph-auth-form ph-verify-form">
                <div className="ph-form-group">
                  <label className="ph-label-form" htmlFor="verify-code">Verification code</label>
                  <input
                    id="verify-code"
                    className="ph-input ph-otp-input"
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
                <button type="submit" className="ph-btn ph-btn-primary ph-btn-block" disabled={loading || code.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify email'}
                </button>
              </form>

              <div className="ph-verify-actions">
                <button type="button" className="ph-linkbtn" onClick={handleResend} disabled={resending}>
                  {resending ? 'Sending…' : 'Resend code'}
                </button>
                <button type="button" className="ph-linkbtn" onClick={backToRegistration}>
                  Edit details / photo
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="ph-register-foot">
          <Link to="/patient">← Patient home</Link>
        </p>
      </div>
    </div>
  )
}
