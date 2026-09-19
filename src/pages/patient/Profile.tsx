import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PatientPage from '../../components/PatientPage'
import PasswordInput from '../../components/PasswordInput'
import { getMe, getMyProfile, resetPassword, updateMyProfile } from '../../api/client'
import type { Patient, User } from '../../api/types'
import { useAuth } from '../../context/AuthContext'
import {
  BLOOD_GROUPS,
  MARITAL_STATUSES,
  calcAge,
  formatAge,
  formatDob,
  genderLabel,
} from '../../utils/patientForm'

type ProfileForm = {
  first_name: string
  last_name: string
  dob: string
  gender: '' | 'male' | 'female' | 'other'
  phone: string
  blood_group: string
  marital_status: string
  address_street: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  symptoms: string
  taking_medications: '' | 'yes' | 'no'
  current_medications: string
  emergency_contact_first_name: string
  emergency_contact_last_name: string
  emergency_contact_relationship: string
  emergency_contact_phone: string
}

function patientToForm(p: Patient): ProfileForm {
  const parts = p.name.split(' ')
  const first = p.first_name ?? parts[0] ?? ''
  const last = p.last_name ?? parts.slice(1).join(' ') ?? ''
  return {
    first_name: first,
    last_name: last,
    dob: p.dob ? p.dob.split('T')[0] : '',
    gender: (p.gender as ProfileForm['gender']) || '',
    phone: p.phone || '',
    blood_group: p.blood_group || '',
    marital_status: p.marital_status || '',
    address_street: p.address_street || '',
    address_line2: p.address_line2 || '',
    city: p.city || '',
    state: p.state || '',
    postal_code: p.postal_code || '',
    symptoms: p.symptoms || '',
    taking_medications: p.taking_medications === true ? 'yes' : p.taking_medications === false ? 'no' : '',
    current_medications: p.current_medications || '',
    emergency_contact_first_name: p.emergency_contact_first_name || '',
    emergency_contact_last_name: p.emergency_contact_last_name || '',
    emergency_contact_relationship: p.emergency_contact_relationship || '',
    emergency_contact_phone: p.emergency_contact_phone || '',
  }
}

export default function PatientProfile() {
  const { user, updateUser } = useAuth()
  const [searchParams] = useSearchParams()
  const isWelcome = searchParams.get('welcome') === '1'
  const [editing, setEditing] = useState(isWelcome)
  const [form, setForm] = useState<ProfileForm | null>(null)
  const [meta, setMeta] = useState<{ patient_code: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [pwdForm, setPwdForm] = useState({ current_password: '', password: '' })
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdMessage, setPwdMessage] = useState('')
  const [pwdError, setPwdError] = useState('')

  const hasPassword = Boolean(user?.has_password)

  useEffect(() => {
    Promise.all([getMyProfile(), getMe()])
      .then(([profileRes, meRes]) => {
        setForm(patientToForm(profileRes.data))
        setMeta({
          patient_code: profileRes.data.patient_code,
          email: profileRes.data.email || meRes.data.email || user?.email || '',
        })
        updateUser(meRes.data)
      })
      .catch(() => setError('Could not load profile'))
      .finally(() => setLoading(false))
  }, [user?.email])

  const update = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
    setError('')
    setMessage('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const { data } = await updateMyProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        dob: form.dob,
        gender: form.gender,
        phone: form.phone.replace(/\D/g, '').slice(-10),
        address_street: form.address_street.trim() || null,
        address_line2: form.address_line2.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        postal_code: form.postal_code.trim() || null,
        blood_group: form.blood_group || null,
        marital_status: form.marital_status || null,
        symptoms: form.symptoms.trim() || null,
        taking_medications: form.taking_medications === 'yes' ? true : form.taking_medications === 'no' ? false : null,
        current_medications: form.current_medications.trim() || null,
        emergency_contact_first_name: form.emergency_contact_first_name.trim() || null,
        emergency_contact_last_name: form.emergency_contact_last_name.trim() || null,
        emergency_contact_relationship: form.emergency_contact_relationship.trim() || null,
        emergency_contact_phone: form.emergency_contact_phone.replace(/\D/g, '').slice(-10) || null,
      })
      updateUser(data as User)
      setForm(patientToForm(data.patient!))
      setEditing(false)
      setMessage('Profile updated successfully')
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
      const firstFieldError = res?.errors ? Object.values(res.errors)[0]?.[0] : null
      setError(firstFieldError || res?.message || 'Failed to save profile')
    }
    setSaving(false)
  }

  const handleCancel = () => {
    if (user?.patient) setForm(patientToForm(user.patient))
    setEditing(false)
    setError('')
  }

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwdForm.password.length < 8) {
      setPwdError('Password must be at least 8 characters')
      return
    }
    if (hasPassword && !pwdForm.current_password) {
      setPwdError('Current password is required')
      return
    }
    setPwdSaving(true)
    setPwdError('')
    setPwdMessage('')
    try {
      const { data } = await resetPassword(
        pwdForm.password,
        hasPassword ? pwdForm.current_password : undefined
      )
      updateUser(data.user)
      setPwdForm({ current_password: '', password: '' })
      setPwdMessage(hasPassword ? 'Password updated successfully' : 'Password set successfully — you can now sign in with mobile/email and password')
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
      const firstFieldError = res?.errors ? Object.values(res.errors)[0]?.[0] : null
      setPwdError(firstFieldError || res?.message || 'Failed to update password')
    }
    setPwdSaving(false)
  }

  if (loading || !form || !meta) {
    return (
      <PatientPage kicker="Account" title="My profile" subtitle="Loading your details…">
        <div className="ph-page-panel">
          <p className="ph-home-empty" style={{ margin: 0 }}>Loading profile…</p>
        </div>
      </PatientPage>
    )
  }

  const age = calcAge(form.dob)
  const fullName = `${form.first_name} ${form.last_name}`.trim()
  const initials = fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <PatientPage
      kicker="Account"
      title="My profile"
      subtitle="Manage your personal and health information."
      actions={
        !editing ? (
          <button type="button" className="ph-btn ph-btn-primary" onClick={() => setEditing(true)}>
            Edit profile
          </button>
        ) : (
          <>
            <button type="button" className="ph-btn ph-btn-outline" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" form="profile-form" className="ph-btn ph-btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </>
        )
      }
    >
      {isWelcome && (
        <div className="ph-alert ph-alert-success">
          Welcome! Your registration is complete. Review your details below and update anything if needed.
        </div>
      )}
      {message && <div className="ph-alert ph-alert-success">{message}</div>}
      {error && <div className="ph-alert ph-alert-error">{error}</div>}

      <div className="ph-profile-hero ph-page-panel">
        <div className="ph-profile-hero-avatar">{initials}</div>
        <div className="ph-profile-hero-info">
          <h2>{fullName || 'Patient'}</h2>
          <span className="ph-profile-id">{meta.patient_code}</span>
          <p className="ph-muted">{meta.email}</p>
          {age && <p className="ph-muted">Age: {formatAge(age)}</p>}
        </div>
      </div>

      <form id="profile-form" onSubmit={handleSave} className="ph-profile-sections">
        <section className="ph-page-panel ph-profile-section">
          <div className="ph-page-panel-head">
            <h3>Personal information</h3>
          </div>
          {!editing ? (
            <dl className="ph-dl">
              <div><dt>First Name</dt><dd>{form.first_name || '—'}</dd></div>
              <div><dt>Last Name</dt><dd>{form.last_name || '—'}</dd></div>
              <div><dt>Date of Birth</dt><dd>{formatDob(form.dob)}</dd></div>
              <div><dt>Sex</dt><dd>{genderLabel(form.gender)}</dd></div>
              <div><dt>Mobile</dt><dd>{form.phone || '—'}</dd></div>
              <div><dt>Email</dt><dd>{meta.email}</dd></div>
              <div><dt>Blood Group</dt><dd>{form.blood_group || '—'}</dd></div>
              <div><dt>Marital Status</dt><dd>{MARITAL_STATUSES.find((s) => s.value === form.marital_status)?.label || '—'}</dd></div>
            </dl>
          ) : (
            <div className="ph-form-grid">
              <div className="ph-form-group"><label className="ph-label-form">First Name</label><input className="ph-input" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} required /></div>
              <div className="ph-form-group"><label className="ph-label-form">Last Name</label><input className="ph-input" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} required /></div>
              <div className="ph-form-group"><label className="ph-label-form">Date of Birth</label><input className="ph-input" type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)} max={new Date().toISOString().split('T')[0]} required />{age && <span className="ph-hint">Age: {formatAge(age)}</span>}</div>
              <div className="ph-form-group"><label className="ph-label-form">Sex</label><select className="ph-input" value={form.gender} onChange={(e) => update('gender', e.target.value)} required><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
              <div className="ph-form-group"><label className="ph-label-form">Mobile</label><input className="ph-input" value={form.phone} onChange={(e) => update('phone', e.target.value)} required /></div>
              <div className="ph-form-group"><label className="ph-label-form">Email</label><input className="ph-input" value={meta.email} disabled /><span className="ph-hint">Email cannot be changed here</span></div>
              <div className="ph-form-group"><label className="ph-label-form">Blood Group</label><select className="ph-input" value={form.blood_group} onChange={(e) => update('blood_group', e.target.value)}><option value="">Select</option>{BLOOD_GROUPS.filter((g) => g !== 'unknown').map((g) => <option key={g} value={g}>{g}</option>)}</select></div>
              <div className="ph-form-group"><label className="ph-label-form">Marital Status</label><select className="ph-input" value={form.marital_status} onChange={(e) => update('marital_status', e.target.value)}><option value="">Select</option>{MARITAL_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
            </div>
          )}
        </section>

        <section className="ph-page-panel ph-profile-section">
          <div className="ph-page-panel-head">
            <h3>Address</h3>
          </div>
          {!editing ? (
            <dl className="ph-dl">
              <div><dt>Street</dt><dd>{form.address_street || '—'}</dd></div>
              <div><dt>Line 2</dt><dd>{form.address_line2 || '—'}</dd></div>
              <div><dt>City</dt><dd>{form.city || '—'}</dd></div>
              <div><dt>State</dt><dd>{form.state || '—'}</dd></div>
              <div><dt>Postal Code</dt><dd>{form.postal_code || '—'}</dd></div>
            </dl>
          ) : (
            <div className="ph-form-grid">
              <div className="ph-form-group ph-full"><label className="ph-label-form">Street Address</label><input className="ph-input" value={form.address_street} onChange={(e) => update('address_street', e.target.value)} /></div>
              <div className="ph-form-group ph-full"><label className="ph-label-form">Street Address Line 2</label><input className="ph-input" value={form.address_line2} onChange={(e) => update('address_line2', e.target.value)} /></div>
              <div className="ph-form-group"><label className="ph-label-form">City</label><input className="ph-input" value={form.city} onChange={(e) => update('city', e.target.value)} /></div>
              <div className="ph-form-group"><label className="ph-label-form">State / Province</label><input className="ph-input" value={form.state} onChange={(e) => update('state', e.target.value)} /></div>
              <div className="ph-form-group"><label className="ph-label-form">Postal / Zip Code</label><input className="ph-input" value={form.postal_code} onChange={(e) => update('postal_code', e.target.value)} /></div>
            </div>
          )}
        </section>

        <section className="ph-page-panel ph-profile-section">
          <div className="ph-page-panel-head">
            <h3>Medical information</h3>
          </div>
          {!editing ? (
            <dl className="ph-dl">
              <div className="ph-full"><dt>Current Symptoms</dt><dd>{form.symptoms || 'None reported'}</dd></div>
              <div><dt>Taking Medications</dt><dd>{form.taking_medications === 'yes' ? 'Yes' : form.taking_medications === 'no' ? 'No' : '—'}</dd></div>
              <div className="ph-full"><dt>Medications List</dt><dd>{form.current_medications || 'None reported'}</dd></div>
            </dl>
          ) : (
            <div className="ph-form-grid">
              <div className="ph-form-group ph-full"><label className="ph-label-form">Current Symptoms</label><textarea className="ph-input ph-textarea" value={form.symptoms} onChange={(e) => update('symptoms', e.target.value)} rows={3} /></div>
              <div className="ph-form-group ph-full">
                <label className="ph-label-form">Taking medications currently?</label>
                <div className="ph-radios">
                  <label className="ph-radio"><input type="radio" name="taking_medications" value="yes" checked={form.taking_medications === 'yes'} onChange={(e) => update('taking_medications', e.target.value)} /> Yes</label>
                  <label className="ph-radio"><input type="radio" name="taking_medications" value="no" checked={form.taking_medications === 'no'} onChange={(e) => update('taking_medications', e.target.value)} /> No</label>
                </div>
              </div>
              {form.taking_medications === 'yes' && (
                <div className="ph-form-group ph-full"><label className="ph-label-form">Medications List</label><textarea className="ph-input ph-textarea" value={form.current_medications} onChange={(e) => update('current_medications', e.target.value)} rows={3} /></div>
              )}
            </div>
          )}
        </section>

        <section className="ph-page-panel ph-profile-section">
          <div className="ph-page-panel-head">
            <h3>Emergency contact</h3>
          </div>
          {!editing ? (
            <dl className="ph-dl">
              <div><dt>First Name</dt><dd>{form.emergency_contact_first_name || '—'}</dd></div>
              <div><dt>Last Name</dt><dd>{form.emergency_contact_last_name || '—'}</dd></div>
              <div><dt>Relationship</dt><dd>{form.emergency_contact_relationship || '—'}</dd></div>
              <div><dt>Contact Number</dt><dd>{form.emergency_contact_phone || '—'}</dd></div>
            </dl>
          ) : (
            <div className="ph-form-grid">
              <div className="ph-form-group"><label className="ph-label-form">First Name</label><input className="ph-input" value={form.emergency_contact_first_name} onChange={(e) => update('emergency_contact_first_name', e.target.value)} /></div>
              <div className="ph-form-group"><label className="ph-label-form">Last Name</label><input className="ph-input" value={form.emergency_contact_last_name} onChange={(e) => update('emergency_contact_last_name', e.target.value)} /></div>
              <div className="ph-form-group"><label className="ph-label-form">Relationship</label><input className="ph-input" value={form.emergency_contact_relationship} onChange={(e) => update('emergency_contact_relationship', e.target.value)} /></div>
              <div className="ph-form-group"><label className="ph-label-form">Contact Number</label><input className="ph-input" value={form.emergency_contact_phone} onChange={(e) => update('emergency_contact_phone', e.target.value)} /></div>
            </div>
          )}
        </section>
      </form>

      <section className="ph-page-panel ph-profile-section" style={{ marginTop: '0.15rem' }}>
        <div className="ph-page-panel-head">
          <h3>{hasPassword ? 'Change password' : 'Set password'}</h3>
        </div>
        <p className="ph-muted" style={{ marginBottom: '1rem' }}>
          {hasPassword
            ? 'Update your login password. Use mobile or email with this password on the Sign in page.'
            : 'You registered without a password. Set one here to sign in with mobile/email and password (OTP is optional).'}
        </p>
        {pwdMessage && <div className="ph-alert ph-alert-success">{pwdMessage}</div>}
        {pwdError && <div className="ph-alert ph-alert-error">{pwdError}</div>}
        <form onSubmit={handlePasswordSave} className="ph-form-grid">
          {hasPassword && (
            <div className="ph-form-group ph-full">
              <label className="ph-label-form">Current Password</label>
              <PasswordInput
                value={pwdForm.current_password}
                onChange={(e) => {
                  setPwdForm((p) => ({ ...p, current_password: e.target.value }))
                  setPwdError('')
                  setPwdMessage('')
                }}
                autoComplete="current-password"
                required
              />
            </div>
          )}
          <div className="ph-form-group ph-full">
            <label className="ph-label-form">New Password</label>
            <PasswordInput
              value={pwdForm.password}
              onChange={(e) => {
                setPwdForm((p) => ({ ...p, password: e.target.value }))
                setPwdError('')
                setPwdMessage('')
              }}
              minLength={8}
              autoComplete="new-password"
              required
              placeholder="At least 8 characters"
            />
          </div>
          <div className="ph-form-group ph-full">
            <button type="submit" className="ph-btn ph-btn-primary" disabled={pwdSaving}>
              {pwdSaving ? 'Saving...' : hasPassword ? 'Update Password' : 'Set Password'}
            </button>
          </div>
        </form>
      </section>
    </PatientPage>
  )
}
