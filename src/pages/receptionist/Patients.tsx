import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  createPatient,
  deletePatient,
  getClinics,
  getDepartments,
  getDoctors,
  issuePatientLogin,
  joinQueue,
  searchPatients,
  updatePatient,
} from '../../api/client'
import { receptionistNav } from '../../config/navigation'
import { BLOOD_GROUPS } from '../../utils/patientForm'
import {
  afterSelectValue,
  focusField,
  focusNextOnEnter,
  selectEnterNav,
} from '../../utils/formNav'
import { filterDoctorsAvailableOnDate } from '../../utils/doctorAvailability'
import VisitSourceBadge from '../../components/VisitSourceBadge'
import type { Clinic, Department, Doctor, Patient } from '../../api/types'

const emptyForm = {
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  gender: '',
  dob: '',
  address: '',
  blood_group: '',
  emergency_contact: '',
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || '?'
}

function formatSlot(time?: string | null) {
  if (!time) return ''
  const [h, m] = time.slice(0, 5).split(':').map(Number)
  if (Number.isNaN(h)) return time.slice(0, 5)
  const ampm = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
}

type SortKey = 'patient_code' | 'name' | 'phone' | 'email' | 'appointment'
type SortDir = 'asc' | 'desc'

function nextSortDir(currentKey: SortKey | null, currentDir: SortDir | null, key: SortKey): {
  key: SortKey | null
  dir: SortDir | null
} {
  if (currentKey !== key || currentDir === null) return { key, dir: 'asc' }
  if (currentDir === 'asc') return { key, dir: 'desc' }
  return { key: null, dir: null }
}

function appointmentSortValue(p: Patient): string {
  const visit = p.upcoming_appointment || p.last_appointment
  if (!visit) return ''
  return `${visit.appointment_date} ${String(visit.slot_time || '').slice(0, 5)}`
}

function comparePatients(a: Patient, b: Patient, key: SortKey, dir: SortDir): number {
  const mul = dir === 'asc' ? 1 : -1
  let av = ''
  let bv = ''
  switch (key) {
    case 'patient_code':
      av = a.patient_code || ''
      bv = b.patient_code || ''
      break
    case 'name':
      av = a.name || ''
      bv = b.name || ''
      break
    case 'phone':
      av = a.phone || ''
      bv = b.phone || ''
      break
    case 'email':
      av = a.email || ''
      bv = b.email || ''
      break
    case 'appointment':
      av = appointmentSortValue(a)
      bv = appointmentSortValue(b)
      break
  }
  // Empty values sink to the end in both directions
  if (!av && bv) return 1
  if (av && !bv) return -1
  if (!av && !bv) return 0
  return av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' }) * mul
}

function SortableTh({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string
  column: SortKey
  sortKey: SortKey | null
  sortDir: SortDir | null
  onSort: (key: SortKey) => void
}) {
  const active = sortKey === column && sortDir
  const ariaSort = !active ? 'none' : sortDir === 'asc' ? 'ascending' : 'descending'
  return (
    <th aria-sort={ariaSort} className="th-sortable">
      <button
        type="button"
        className={`th-sort${active ? ` is-${sortDir}` : ''}`}
        onClick={() => onSort(column)}
        title={
          !active
            ? `Sort by ${label} ascending`
            : sortDir === 'asc'
              ? `Sort by ${label} descending`
              : `Clear ${label} sort`
        }
      >
        <span className="th-sort-label">{label}</span>
        <span className="th-sort-arrows" aria-hidden>
          <span className={`th-sort-up${active && sortDir === 'asc' ? ' on' : ''}`} />
          <span className={`th-sort-down${active && sortDir === 'desc' ? ' on' : ''}`} />
        </span>
      </button>
    </th>
  )
}

function patientToForm(patient: Patient) {
  return {
    first_name: patient.first_name || patient.name.split(/\s+/)[0] || '',
    last_name: patient.last_name || patient.name.split(/\s+/).slice(1).join(' ') || '',
    phone: patient.phone || '',
    email: patient.email || '',
    gender: patient.gender || '',
    dob: patient.dob ? String(patient.dob).slice(0, 10) : '',
    address: patient.address || '',
    blood_group: patient.blood_group || '',
    emergency_contact: patient.emergency_contact || '',
  }
}

function PatientAvatar({ patient, size = 40 }: { patient: Patient; size?: number }) {
  if (patient.photo_url) {
    return (
      <img
        src={patient.photo_url}
        alt=""
        className="rp-avatar-img"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span className="rp-avatar-fallback" style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials(patient.name)}
    </span>
  )
}

function buildPatientFormData(form: typeof emptyForm, photo: File | null) {
  const fd = new FormData()
  fd.append('first_name', form.first_name.trim())
  if (form.last_name.trim()) fd.append('last_name', form.last_name.trim())
  fd.append('phone', form.phone.replace(/\D/g, '').slice(-10))
  if (form.email.trim()) fd.append('email', form.email.trim().toLowerCase())
  if (form.gender) fd.append('gender', form.gender)
  if (form.dob) fd.append('dob', form.dob)
  if (form.address.trim()) fd.append('address', form.address.trim())
  if (form.blood_group) fd.append('blood_group', form.blood_group)
  if (form.emergency_contact.trim()) fd.append('emergency_contact', form.emergency_contact.trim())
  if (photo) fd.append('photo', photo)
  return fd
}

export default function ReceptionistPatients() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Patient[]>([])
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir | null>(null)
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [queueDoctors, setQueueDoctors] = useState<Doctor[]>([])
  const [registerDepartmentId, setRegisterDepartmentId] = useState('')
  const [registerDoctorId, setRegisterDoctorId] = useState('')
  const [queueDoctorId, setQueueDoctorId] = useState('')
  const [showForm, setShowForm] = useState(searchParams.get('register') === '1')
  const [selected, setSelected] = useState<Patient | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState(emptyForm)
  const [editPhoto, setEditPhoto] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [credentials, setCredentials] = useState<{ login: string; temp: string } | null>(null)
  const [quickName, setQuickName] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const deptRef = useRef<HTMLSelectElement>(null)
  const doctorRef = useRef<HTMLSelectElement>(null)
  const submitRef = useRef<HTMLButtonElement>(null)
  const openDoctorWhenReady = useRef(false)

  const loadPatients = async (q = '') => {
    setError('')
    const { data } = await searchPatients(q)
    setResults(data)
    if (q && !data.length) setError('No patients found')
  }

  useEffect(() => {
    getClinics().then(({ data }) => {
      const first = data[0] ?? null
      setClinic(first)
      if (first) {
        getDepartments(first.id).then(({ data: depts }) => setDepartments(depts))
      }
    })
    getDoctors().then(({ data }) => {
      setQueueDoctors(data)
      if (data[0]) setQueueDoctorId(String(data[0].id))
    })
    loadPatients()
  }, [])

  useEffect(() => {
    if (searchParams.get('register') === '1') {
      setShowForm(true)
      window.setTimeout(() => nameRef.current?.focus(), 80)
    }
  }, [searchParams])

  useEffect(() => {
    setRegisterDoctorId('')
    if (clinic && registerDepartmentId) {
      getDoctors({
        clinic_id: clinic.id,
        department_id: Number(registerDepartmentId),
      }).then(({ data }) => {
        setDoctors(data)
        const availableToday = filterDoctorsAvailableOnDate(data)
        if (openDoctorWhenReady.current) {
          openDoctorWhenReady.current = false
          if (availableToday.length > 0) {
            window.requestAnimationFrame(() => focusField(doctorRef.current))
          }
        }
      })
    } else {
      setDoctors([])
    }
  }, [clinic, registerDepartmentId])

  const walkInDoctors = useMemo(() => filterDoctorsAvailableOnDate(doctors), [doctors])
  const queueDoctorsToday = useMemo(
    () => filterDoctorsAvailableOnDate(queueDoctors),
    [queueDoctors]
  )
  const noWalkInDoctorsToday =
    Boolean(registerDepartmentId) && doctors.length > 0 && walkInDoctors.length === 0
  const noDoctorsInDepartment = Boolean(registerDepartmentId) && doctors.length === 0

  useEffect(() => {
    if (
      queueDoctorId &&
      queueDoctorsToday.length > 0 &&
      !queueDoctorsToday.some((d) => String(d.id) === queueDoctorId)
    ) {
      setQueueDoctorId(String(queueDoctorsToday[0].id))
    } else if (!queueDoctorId && queueDoctorsToday[0]) {
      setQueueDoctorId(String(queueDoctorsToday[0].id))
    } else if (queueDoctorsToday.length === 0) {
      setQueueDoctorId('')
    }
  }, [queueDoctorsToday, queueDoctorId])

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    await loadPatients(search.trim())
  }

  const cycleSort = (key: SortKey) => {
    const next = nextSortDir(sortKey, sortDir, key)
    setSortKey(next.key)
    setSortDir(next.dir)
  }

  const sortedResults = useMemo(() => {
    if (!sortKey || !sortDir) return results
    return [...results].sort((a, b) => comparePatients(a, b, sortKey, sortDir))
  }, [results, sortKey, sortDir])

  const openDetails = (patient: Patient) => {
    setSelected(patient)
    setEditing(false)
    setEditForm(patientToForm(patient))
    setEditPhoto(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    const name = quickName.trim()
    const email = form.email.trim().toLowerCase()
    const phone = form.phone.replace(/\D/g, '').slice(-10)

    if (!name) {
      setError('Enter patient name')
      nameRef.current?.focus()
      return
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address')
      emailRef.current?.focus()
      return
    }
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number')
      phoneRef.current?.focus()
      return
    }
    if (!registerDepartmentId) {
      setError('Select a department for this walk-in')
      deptRef.current?.focus()
      return
    }
    if (!registerDoctorId) {
      setError(
        noWalkInDoctorsToday
          ? 'Not available today — no doctors in this department work today'
          : 'Select a doctor — patient will join that doctor’s queue'
      )
      doctorRef.current?.focus()
      return
    }
    if (!walkInDoctors.some((d) => String(d.id) === registerDoctorId)) {
      setError('Not available today — choose a doctor who works today')
      doctorRef.current?.focus()
      return
    }

    const parts = name.split(/\s+/).filter(Boolean)
    const first_name = parts[0] || name
    const last_name = parts.slice(1).join(' ') || undefined

    setSaving(true)
    try {
      const { data } = await createPatient({
        first_name,
        last_name,
        phone,
        email,
      })
      const { data: queue } = await joinQueue(data.id, Number(registerDoctorId))
      const token =
        queue.queue_token?.display_code ||
        queue.display_code ||
        'issued'
      const doctorName =
        walkInDoctors.find((d) => String(d.id) === registerDoctorId)?.name || 'doctor'

      setResults((prev) => [data, ...prev.filter((p) => p.id !== data.id)])
      openDetails(data)
      const success = `Walk-in ${data.patient_code} → ${doctorName} · Token ${token}`
      setMessage(success)
      setShowForm(false)
      setQuickName('')
      setForm(emptyForm)
      setRegisterDepartmentId('')
      setRegisterDoctorId('')
      setSearchParams({})
      window.setTimeout(() => {
        navigate('/receptionist/dashboard', { state: { flash: success } })
      }, 900)
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
      const first = res?.errors ? Object.values(res.errors)[0]?.[0] : null
      setError(first || res?.message || 'Registration failed. Phone or email may already exist.')
    }
    setSaving(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setError('')
    setMessage('')
    setSaving(true)
    try {
      const { data } = await updatePatient(selected.id, buildPatientFormData(editForm, editPhoto))
      setResults((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)))
      setSelected(data)
      setEditing(false)
      setEditPhoto(null)
      setMessage(`Updated ${data.patient_code}`)
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data
      const first = res?.errors ? Object.values(res.errors)[0]?.[0] : null
      setError(first || res?.message || 'Update failed')
    }
    setSaving(false)
  }

  const handleDelete = async (patient: Patient) => {
    const label = `${patient.name} (${patient.patient_code})`
    if (!window.confirm(`Delete patient ${label}?\n\nThis removes them from staff lists, cancels upcoming appointments, and disables their login.`)) {
      return
    }
    setError('')
    setMessage('')
    setDeleting(true)
    try {
      await deletePatient(patient.id)
      setResults((prev) => prev.filter((p) => p.id !== patient.id))
      if (selected?.id === patient.id) {
        setSelected(null)
        setEditing(false)
      }
      setMessage(`Deleted ${label}`)
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string } } })?.response?.data
      setError(res?.message || 'Delete failed')
    }
    setDeleting(false)
  }

  const handleIssueLogin = async (patientId: number) => {
    try {
      const { data } = await issuePatientLogin(patientId)
      setCredentials({ login: data.login_email, temp: data.temp_password })
      setMessage('Login credentials created — patient must reset password on first login')
      setResults((prev) => prev.map((p) => (p.id === patientId ? { ...p, user_id: data.patient?.user_id || 1 } : p)))
      setSelected((prev) => (prev?.id === patientId ? { ...prev, user_id: data.patient?.user_id || 1 } : prev))
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string } } })?.response?.data
      setError(res?.message || 'Could not issue login')
    }
  }

  const handleWalkInQueue = async (patientId: number) => {
    if (!queueDoctorId) {
      setError(
        queueDoctorsToday.length === 0
          ? 'Not available today — no doctors are scheduled to work today'
          : 'Select a doctor for queue'
      )
      return
    }
    try {
      const { data } = await joinQueue(patientId, Number(queueDoctorId))
      setMessage(`Added to queue: Token ${data.queue_token.display_code}`)
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string } } })?.response?.data
      setError(res?.message || 'Could not add to queue')
    }
  }

  return (
    <Layout
      title={showForm ? 'Walk-in register' : 'Patient Management'}
      subtitle={showForm ? 'Quick walk-in — name, email, mobile, doctor' : 'Search, view, edit, or delete patients'}
      nav={receptionistNav}
    >
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {credentials && (
        <div className="alert alert-info">
          Give patient these credentials: Login <strong>{credentials.login}</strong> / Temp password <strong>{credentials.temp}</strong>
        </div>
      )}

      <div className="card rp-card">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email or patient ID"
          />
          <button type="submit" className="btn btn-primary">Search</button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const next = !showForm
              setShowForm(next)
              if (next) setSearchParams({ register: '1' })
              else setSearchParams({})
            }}
          >
            {showForm ? 'Hide register' : '+ Walk-in Register'}
          </button>
          <Link to="/receptionist/book" className="btn btn-secondary">Book appointment</Link>
        </form>

        {showForm && (
          <form onSubmit={handleCreate} className="patient-register-form walkin-quick-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <p className="muted" style={{ marginTop: 0 }}>
              Name, email, mobile — then department &amp; doctor. Patient joins that doctor’s queue only.
            </p>
            <div className="walkin-quick-grid">
              <label className="form-group">
                Name
                <input
                  ref={nameRef}
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="Full name *"
                  autoComplete="name"
                  required
                  onKeyDown={(e) => focusNextOnEnter(e, emailRef.current)}
                />
              </label>
              <label className="form-group">
                Email
                <input
                  ref={emailRef}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@gmail.com *"
                  autoComplete="email"
                  required
                  onKeyDown={(e) => focusNextOnEnter(e, phoneRef.current)}
                />
              </label>
              <label className="form-group">
                Mobile number
                <input
                  ref={phoneRef}
                  inputMode="numeric"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="10-digit mobile *"
                  autoComplete="tel"
                  required
                  onKeyDown={(e) => focusNextOnEnter(e, deptRef.current)}
                />
              </label>
              <label className="form-group">
                Department
                <select
                  ref={deptRef}
                  value={registerDepartmentId}
                  onChange={(e) => {
                    const value = e.target.value
                    setRegisterDepartmentId(value)
                    if (value) openDoctorWhenReady.current = true
                  }}
                  onKeyDown={(e) =>
                    selectEnterNav(e, doctorRef.current, () => submitRef.current?.click())
                  }
                  required
                >
                  <option value="">Select department *</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </label>
              <label className="form-group">
                Doctor
                <select
                  ref={doctorRef}
                  value={walkInDoctors.some((d) => String(d.id) === registerDoctorId) ? registerDoctorId : ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setRegisterDoctorId(value)
                    afterSelectValue(value, submitRef.current)
                  }}
                  onKeyDown={(e) =>
                    selectEnterNav(e, submitRef.current, () => submitRef.current?.click())
                  }
                  required
                  disabled={!registerDepartmentId || walkInDoctors.length === 0}
                >
                  <option value="">
                    {!registerDepartmentId
                      ? 'Choose department first'
                      : noDoctorsInDepartment
                        ? 'No doctors in this department'
                        : noWalkInDoctorsToday
                          ? 'Not available today'
                          : 'Select doctor *'}
                  </option>
                  {walkInDoctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialization}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {noWalkInDoctorsToday && (
              <div className="alert alert-error" role="alert">
                Not available today — no doctors in this department are scheduled to work today.
              </div>
            )}
            {registerDoctorId && walkInDoctors.some((d) => String(d.id) === registerDoctorId) && (
              <p className="muted walkin-doctor-hint">
                Queue for{' '}
                <strong>{walkInDoctors.find((d) => String(d.id) === registerDoctorId)?.name}</strong>
                ’s queue only.
              </p>
            )}
            <button
              ref={submitRef}
              type="submit"
              className="btn btn-primary"
              disabled={saving || noWalkInDoctorsToday || noDoctorsInDepartment}
            >
              {saving ? 'Saving…' : 'Register & issue token'}
            </button>
          </form>
        )}

        <div className="table-wrap rp-table-wrap">
          <table className="table rp-table">
            <thead>
              <tr>
                <SortableTh label="Patient ID" column="patient_code" sortKey={sortKey} sortDir={sortDir} onSort={cycleSort} />
                <SortableTh label="Patient" column="name" sortKey={sortKey} sortDir={sortDir} onSort={cycleSort} />
                <SortableTh label="Phone" column="phone" sortKey={sortKey} sortDir={sortDir} onSort={cycleSort} />
                <SortableTh label="Email" column="email" sortKey={sortKey} sortDir={sortDir} onSort={cycleSort} />
                <SortableTh label="Appointment" column="appointment" sortKey={sortKey} sortDir={sortDir} onSort={cycleSort} />
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="rp-empty">No patients to show — search or register a walk-in.</td>
                </tr>
              ) : (
                sortedResults.map((p) => {
                  const visit = p.upcoming_appointment || p.last_appointment
                  const isUpcoming = Boolean(p.upcoming_appointment)

                  return (
                    <tr key={p.id}>
                      <td>
                        <span className="rp-code">{p.patient_code}</span>
                      </td>
                      <td>
                        <div className="rp-patient-cell">
                          <PatientAvatar patient={p} />
                          <div className="rdm-name-row">
                            <span className="rp-name">{p.name}</span>
                            {p.registration_source === 'walk_in' ? (
                              <VisitSourceBadge source="walk_in" />
                            ) : p.upcoming_appointment ? (
                              <VisitSourceBadge source="booked" />
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td>{p.phone || '—'}</td>
                      <td className="rp-email">{p.email || '—'}</td>
                      <td>
                        {visit ? (
                          <div className={`rp-visit ${isUpcoming ? 'rp-visit-upcoming' : 'rp-visit-last'}`}>
                            <span className="rp-visit-label">{isUpcoming ? 'Upcoming' : 'Last'}</span>
                            <span className="rp-visit-main">
                              {visit.appointment_date} · {formatSlot(visit.slot_time) || '—'}
                            </span>
                            {visit.doctor?.name && (
                              <span className="rp-visit-doc">{visit.doctor.name}</span>
                            )}
                          </div>
                        ) : (
                          <span className="rp-visit-none">No bookings</span>
                        )}
                      </td>
                      <td className="rp-actions-cell">
                        <div className="rdm-actions">
                          <button type="button" className="btn btn-sm btn-primary" onClick={() => openDetails(p)}>
                            View
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              openDetails(p)
                              setEditing(true)
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            disabled={deleting}
                            onClick={() => handleDelete(p)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="rp-drawer-backdrop" onClick={() => { setSelected(null); setEditing(false) }} role="presentation">
          <aside className="rp-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Patient details">
            <div className="rp-drawer-head">
              <div className="rp-drawer-identity">
                <PatientAvatar patient={selected} size={64} />
                <div>
                  <div className="rdm-name-row">
                    <h2>{selected.name}</h2>
                    {selected.registration_source === 'walk_in' ? (
                      <VisitSourceBadge source="walk_in" />
                    ) : selected.upcoming_appointment ? (
                      <VisitSourceBadge source="booked" />
                    ) : null}
                  </div>
                  <p>{selected.patient_code}</p>
                </div>
              </div>
              <button type="button" className="rp-drawer-close" onClick={() => { setSelected(null); setEditing(false) }} aria-label="Close">
                ×
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleUpdate} className="patient-register-form" style={{ padding: 0 }}>
                <div className="form-row">
                  <input placeholder="First Name *" value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} required />
                  <input placeholder="Last Name" value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} />
                </div>
                <div className="form-row">
                  <input placeholder="Mobile *" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} required />
                  <input type="email" placeholder="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
                <div className="form-row">
                  <input type="date" value={editForm.dob} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} />
                  <select value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
                    <option value="">Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-row">
                  <input placeholder="Address" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                  <select value={editForm.blood_group} onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value })}>
                    <option value="">Blood group</option>
                    {BLOOD_GROUPS.filter((g) => g !== 'unknown').map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <input placeholder="Emergency contact" value={editForm.emergency_contact} onChange={(e) => setEditForm({ ...editForm, emergency_contact: e.target.value })} />
                  <input type="file" accept="image/*" onChange={(e) => setEditPhoto(e.target.files?.[0] || null)} />
                </div>
                <div className="rp-drawer-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving…' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing(false)
                      setEditForm(patientToForm(selected))
                      setEditPhoto(null)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <dl className="rp-detail-grid">
                  <div><dt>Patient ID</dt><dd>{selected.patient_code}</dd></div>
                  <div><dt>Phone</dt><dd>{selected.phone || '—'}</dd></div>
                  <div><dt>Email</dt><dd>{selected.email || '—'}</dd></div>
                  <div><dt>Gender</dt><dd>{selected.gender || '—'}</dd></div>
                  <div><dt>Date of birth</dt><dd>{selected.dob ? String(selected.dob).slice(0, 10) : '—'}</dd></div>
                  <div><dt>Blood group</dt><dd>{selected.blood_group || '—'}</dd></div>
                  <div className="rp-detail-wide">
                    <dt>Upcoming appointment</dt>
                    <dd>
                      {selected.upcoming_appointment
                        ? `${selected.upcoming_appointment.appointment_date} ${formatSlot(selected.upcoming_appointment.slot_time)}${selected.upcoming_appointment.doctor?.name ? ` · ${selected.upcoming_appointment.doctor.name}` : ''}`
                        : 'None'}
                    </dd>
                  </div>
                  <div className="rp-detail-wide">
                    <dt>Last booking</dt>
                    <dd>
                      {selected.last_appointment
                        ? `${selected.last_appointment.appointment_date} ${formatSlot(selected.last_appointment.slot_time)}${selected.last_appointment.doctor?.name ? ` · ${selected.last_appointment.doctor.name}` : ''}`
                        : 'None'}
                    </dd>
                  </div>
                  <div className="rp-detail-wide"><dt>Address</dt><dd>{selected.address || '—'}</dd></div>
                  <div className="rp-detail-wide"><dt>Emergency contact</dt><dd>{selected.emergency_contact || '—'}</dd></div>
                </dl>

                <div className="rp-drawer-actions">
                  <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>
                    Edit patient
                  </button>
                  <Link to={`/receptionist/book?patient_id=${selected.id}`} className="btn btn-secondary">
                    Book appointment
                  </Link>
                  {!selected.user_id && (
                    <button type="button" className="btn btn-secondary" onClick={() => handleIssueLogin(selected.id)}>
                      Issue login
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={deleting}
                    onClick={() => handleDelete(selected)}
                  >
                    {deleting ? 'Deleting…' : 'Delete patient'}
                  </button>
                  <div className="rp-queue-row">
                    <select
                      value={queueDoctorId}
                      onChange={(e) => setQueueDoctorId(e.target.value)}
                      aria-label="Doctor for queue"
                      disabled={queueDoctorsToday.length === 0}
                    >
                      <option value="">
                        {queueDoctorsToday.length === 0
                          ? 'Not available today'
                          : 'Doctor for queue'}
                      </option>
                      {queueDoctorsToday.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={queueDoctorsToday.length === 0}
                      onClick={() => handleWalkInQueue(selected.id)}
                    >
                      Add to queue
                    </button>
                  </div>
                  {queueDoctorsToday.length === 0 && (
                    <p className="muted" style={{ marginTop: '0.5rem' }}>
                      Not available today — no doctors are scheduled to work today.
                    </p>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </Layout>
  )
}
