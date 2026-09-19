import { useEffect, useMemo, useState } from 'react'
import { createDoctor, resetDoctorPassword, updateDoctor } from '../api/client'
import type { Doctor, DoctorAvailability } from '../api/types'
import DoctorAvatar from './DoctorAvatar'
import DoctorPhotoAdjuster, { DOCTOR_PHOTO_VIEW_SIZE } from './DoctorPhotoAdjuster'
import {
  DEFAULT_PHOTO_FRAME,
  exportFramedPhoto,
  type PhotoFrame,
} from '../utils/cropDoctorPhoto'

const DAY_OPTIONS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
]

type FormState = {
  name: string
  specialization: string
  email: string
  phone: string
  phone_secondary: string
  password: string
  start_time: string
  end_time: string
  slot_duration_minutes: number
  lunch_start: string
  lunch_end: string
  working_days: number[]
  must_reset_password: boolean
}

const emptyForm = (): FormState => ({
  name: '',
  specialization: '',
  email: '',
  phone: '',
  phone_secondary: '',
  password: '',
  start_time: '09:00',
  end_time: '17:00',
  slot_duration_minutes: 10,
  lunch_start: '13:00',
  lunch_end: '14:00',
  working_days: [1, 2, 3, 4, 5],
  must_reset_password: true,
})

function formFromDoctor(doctor: Doctor): FormState {
  const availability = doctor.availability || []
  const first = availability[0]
  return {
    name: doctor.name || '',
    specialization: doctor.specialization || '',
    email: doctor.email || '',
    phone: doctor.phone || '',
    phone_secondary: doctor.phone_secondary || '',
    password: '',
    start_time: first ? String(first.start_time).slice(0, 5) : '09:00',
    end_time: first ? String(first.end_time).slice(0, 5) : '17:00',
    slot_duration_minutes: first?.slot_duration_minutes || 10,
    lunch_start: doctor.lunch_start ? String(doctor.lunch_start).slice(0, 5) : '13:00',
    lunch_end: doctor.lunch_end ? String(doctor.lunch_end).slice(0, 5) : '14:00',
    working_days: availability.length
      ? [...new Set(availability.map((a) => a.day_of_week))].sort((a, b) => a - b)
      : [1, 2, 3, 4, 5],
    must_reset_password: true,
  }
}

function buildAvailability(form: FormState): DoctorAvailability[] {
  return form.working_days.map((day) => ({
    id: 0,
    day_of_week: day,
    start_time: form.start_time,
    end_time: form.end_time,
    slot_duration_minutes: form.slot_duration_minutes,
  }))
}

function toPayload(form: FormState, photo: File | null): FormData | Record<string, unknown> {
  const availability = buildAvailability(form).map(({ day_of_week, start_time, end_time, slot_duration_minutes }) => ({
    day_of_week,
    start_time,
    end_time,
    slot_duration_minutes,
  }))

  if (photo) {
    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('specialization', form.specialization)
    fd.append('email', form.email)
    fd.append('phone', form.phone)
    if (form.phone_secondary) fd.append('phone_secondary', form.phone_secondary)
    if (form.password) fd.append('password', form.password)
    fd.append('must_reset_password', form.must_reset_password ? '1' : '0')
    if (form.lunch_start) fd.append('lunch_start', form.lunch_start)
    if (form.lunch_end) fd.append('lunch_end', form.lunch_end)
    fd.append('availability', JSON.stringify(availability))
    fd.append('photo', photo)
    return fd
  }

  return {
    name: form.name,
    specialization: form.specialization,
    email: form.email,
    phone: form.phone,
    phone_secondary: form.phone_secondary || null,
    ...(form.password ? { password: form.password } : {}),
    must_reset_password: form.must_reset_password,
    lunch_start: form.lunch_start || null,
    lunch_end: form.lunch_end || null,
    availability,
  }
}

type Props = {
  doctor?: Doctor | null
  onDone: (message: string) => void
  onCancel: () => void
}

export default function DoctorManageForm({ doctor, onDone, onCancel }: Props) {
  const isEdit = Boolean(doctor)
  const [form, setForm] = useState<FormState>(() => (doctor ? formFromDoctor(doctor) : emptyForm()))
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFrame, setPhotoFrame] = useState<PhotoFrame>(DEFAULT_PHOTO_FRAME)
  const [resetPassword, setResetPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(doctor ? formFromDoctor(doctor) : emptyForm())
    setPhoto(null)
    setPhotoPreview(null)
    setPhotoFrame(DEFAULT_PHOTO_FRAME)
    setResetPassword('')
    setError('')
  }, [doctor])

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null)
      return
    }
    const url = URL.createObjectURL(photo)
    setPhotoPreview(url)
    setPhotoFrame(DEFAULT_PHOTO_FRAME)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  const previewSrc = useMemo(
    () => photoPreview || doctor?.photo_url || null,
    [photoPreview, doctor?.photo_url]
  )

  const clearNewPhoto = () => {
    setPhoto(null)
    setPhotoFrame(DEFAULT_PHOTO_FRAME)
  }

  const toggleDay = (day: number) => {
    setForm((prev) => ({
      ...prev,
      working_days: prev.working_days.includes(day)
        ? prev.working_days.filter((d) => d !== day)
        : [...prev.working_days, day].sort((a, b) => a - b),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.working_days.length) {
      setError('Select at least one working day.')
      return
    }
    if (!isEdit && !form.password) {
      setError('Password is required for the doctor login.')
      return
    }

    setSaving(true)
    try {
      let uploadPhoto = photo
      if (photo && photoPreview) {
        uploadPhoto = await exportFramedPhoto(
          photoPreview,
          photoFrame,
          DOCTOR_PHOTO_VIEW_SIZE,
          512,
          photo.name || 'doctor-photo.jpg'
        )
      }
      const payload = toPayload(form, uploadPhoto)
      if (isEdit && doctor) {
        await updateDoctor(doctor.id, payload)
        onDone(`Updated ${form.name}`)
      } else {
        await createDoctor(payload)
        onDone(`Created doctor login for ${form.email}`)
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
          ?.response?.data
      const firstError = msg?.errors ? Object.values(msg.errors).flat()[0] : null
      setError(firstError || msg?.message || 'Could not save doctor.')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async () => {
    if (!doctor || resetPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await resetDoctorPassword(doctor.id, resetPassword, true)
      setResetPassword('')
      onDone(`Password reset for ${doctor.email}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Could not reset password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="doctor-manage-form">
      <div className="doctor-manage-head">
        {photo && photoPreview ? (
          <DoctorPhotoAdjuster src={photoPreview} frame={photoFrame} onChange={setPhotoFrame} />
        ) : (
          <div className="doctor-photo-preview-block">
            <div className="doctor-photo-ring" aria-hidden={!previewSrc}>
              <DoctorAvatar
                doctorId={doctor?.id}
                name={form.name || 'Doctor'}
                photoUrl={previewSrc}
                className="doctor-manage-avatar"
              />
            </div>
            <span className="doctor-photo-preview-tag is-muted">Current photo</span>
          </div>
        )}
        <div>
          <h3 style={{ margin: 0 }}>{isEdit ? 'Edit doctor profile' : 'Create doctor user'}</h3>
          <p className="muted" style={{ margin: '0.25rem 0 0' }}>
            Login ID is the email. Staff can set or reset the password.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="doctor-photo-upload">
        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
          <label htmlFor="doctor-photo-input">Profile photo</label>
          <input
            id="doctor-photo-input"
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />
          <p className="muted" style={{ margin: '0.35rem 0 0', fontSize: '0.82rem' }}>
            {photo
              ? 'Frame is saved when you click Save profile.'
              : 'Choose a photo, then drag and zoom to frame the face.'}
          </p>
        </div>
        {photo && (
          <button type="button" className="btn btn-sm btn-secondary" onClick={clearNewPhoto}>
            Clear new photo
          </button>
        )}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Profile name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Specialization</label>
          <input
            value={form.specialization}
            onChange={(e) => setForm({ ...form, specialization: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>User ID (email)</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        {!isEdit && (
          <div className="form-group">
            <label>Password</label>
            <input
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8}
              required
              autoComplete="new-password"
            />
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Phone number</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Second number</label>
          <input
            value={form.phone_secondary}
            onChange={(e) => setForm({ ...form, phone_secondary: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Preferred working days</label>
        <div className="day-chip-row">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              className={`day-chip ${form.working_days.includes(d.value) ? 'active' : ''}`}
              onClick={() => toggleDay(d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Start time</label>
          <input
            type="time"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>End time</label>
          <input
            type="time"
            value={form.end_time}
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Slot (min)</label>
          <input
            type="number"
            min={5}
            max={60}
            value={form.slot_duration_minutes}
            onChange={(e) => setForm({ ...form, slot_duration_minutes: Number(e.target.value) || 10 })}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Lunch start</label>
          <input
            type="time"
            value={form.lunch_start}
            onChange={(e) => setForm({ ...form, lunch_start: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Lunch end</label>
          <input
            type="time"
            value={form.lunch_end}
            onChange={(e) => setForm({ ...form, lunch_end: e.target.value })}
          />
        </div>
      </div>

      {!isEdit && (
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.must_reset_password}
            onChange={(e) => setForm({ ...form, must_reset_password: e.target.checked })}
          />
          Require password change on first login
        </label>
      )}

      {isEdit && doctor && (
        <div className="doctor-reset-box">
          <h4 style={{ margin: '0 0 0.5rem' }}>Reset password</h4>
          <div className="form-row" style={{ alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>New password</label>
              <input
                type="text"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                minLength={8}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={saving}
              onClick={handleResetPassword}
              style={{ marginBottom: '1.1rem' }}
            >
              Reset password
            </button>
          </div>
        </div>
      )}

      <div className="doctor-manage-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save profile' : 'Create doctor'}
        </button>
      </div>
    </form>
  )
}
