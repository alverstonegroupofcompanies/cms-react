import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { createPatient, getDoctors, issuePatientLogin, joinQueue, searchPatients } from '../../api/client'
import { receptionistNav } from '../../config/navigation'
import { BLOOD_GROUPS } from '../../utils/patientForm'
import type { Doctor, Patient } from '../../api/types'

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

export default function ReceptionistPatients() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [queueDoctorId, setQueueDoctorId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<Patient | null>(null)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    gender: '',
    dob: '',
    address: '',
    blood_group: '',
    emergency_contact: '',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [credentials, setCredentials] = useState<{ login: string; temp: string } | null>(null)

  const loadPatients = async (q = '') => {
    setError('')
    const { data } = await searchPatients(q)
    setResults(data)
    if (q && !data.length) setError('No patients found')
  }

  useEffect(() => {
    getDoctors().then(({ data }) => {
      setDoctors(data)
      if (data[0]) setQueueDoctorId(String(data[0].id))
    })
    loadPatients()
  }, [])

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()
    await loadPatients(search.trim())
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const fd = new FormData()
      fd.append('first_name', form.first_name.trim())
      if (form.last_name.trim()) fd.append('last_name', form.last_name.trim())
      fd.append('phone', form.phone.replace(/\D/g, '').slice(-10))
      if (form.email.trim()) fd.append('email', form.email.trim())
      if (form.gender) fd.append('gender', form.gender)
      if (form.dob) fd.append('dob', form.dob)
      if (form.address.trim()) fd.append('address', form.address.trim())
      if (form.blood_group) fd.append('blood_group', form.blood_group)
      if (form.emergency_contact.trim()) fd.append('emergency_contact', form.emergency_contact.trim())
      if (photo) fd.append('photo', photo)

      const { data } = await createPatient(fd)
      setResults((prev) => [data, ...prev.filter((p) => p.id !== data.id)])
      setSelected(data)
      setMessage(`Walk-in registered: ${data.patient_code}`)
      setShowForm(false)
      setForm({ first_name: '', last_name: '', phone: '', email: '', gender: '', dob: '', address: '', blood_group: '', emergency_contact: '' })
      setPhoto(null)
    } catch {
      setError('Registration failed. Phone may already exist.')
    }
  }

  const handleIssueLogin = async (patientId: number) => {
    const { data } = await issuePatientLogin(patientId)
    setCredentials({ login: data.login_email, temp: data.temp_password })
    setMessage('Login credentials created — patient must reset password on first login')
    setResults((prev) => prev.map((p) => (p.id === patientId ? { ...p, user_id: 1 } : p)))
    setSelected((prev) => (prev?.id === patientId ? { ...prev, user_id: 1 } : prev))
  }

  const handleWalkInQueue = async (patientId: number) => {
    if (!queueDoctorId) {
      setError('Select a doctor for queue')
      return
    }
    try {
      const { data } = await joinQueue(patientId, Number(queueDoctorId))
      setMessage(`Added to queue: Token ${data.queue_token.display_code}`)
    } catch {
      setError('Could not add to queue')
    }
  }

  return (
    <Layout title="Patient Management" subtitle="Find patients — view details only when needed" nav={receptionistNav}>
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
          <button type="button" className="btn btn-secondary" onClick={() => setShowForm(!showForm)}>
            + Walk-in Register
          </button>
          <Link to="/receptionist/book" className="btn btn-secondary">Book appointment</Link>
        </form>

        {showForm && (
          <form onSubmit={handleCreate} className="patient-register-form">
            <div className="form-row">
              <input placeholder="First Name *" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
              <input placeholder="Last Name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              <input placeholder="Mobile *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div className="form-row">
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-row">
              <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <select value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })}>
                <option value="">Blood group</option>
                {BLOOD_GROUPS.filter((g) => g !== 'unknown').map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <input placeholder="Emergency contact" value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} />
            </div>
            <div className="form-row">
              <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
            </div>
            <button type="submit" className="btn btn-primary">Register Walk-in</button>
          </form>
        )}

        <div className="table-wrap rp-table-wrap">
          <table className="table rp-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Patient</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Appointment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="rp-empty">No patients to show — search or register a walk-in.</td>
                </tr>
              ) : (
                results.map((p) => {
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
                          <span className="rp-name">{p.name}</span>
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
                        <button type="button" className="btn btn-sm btn-primary" onClick={() => setSelected(p)}>
                          View details
                        </button>
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
        <div className="rp-drawer-backdrop" onClick={() => setSelected(null)} role="presentation">
          <aside className="rp-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Patient details">
            <div className="rp-drawer-head">
              <div className="rp-drawer-identity">
                <PatientAvatar patient={selected} size={64} />
                <div>
                  <h2>{selected.name}</h2>
                  <p>{selected.patient_code}</p>
                </div>
              </div>
              <button type="button" className="rp-drawer-close" onClick={() => setSelected(null)} aria-label="Close">
                ×
              </button>
            </div>

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
              <Link to={`/receptionist/book?patient_id=${selected.id}`} className="btn btn-primary">
                Book appointment
              </Link>
              {!selected.user_id && (
                <button type="button" className="btn btn-secondary" onClick={() => handleIssueLogin(selected.id)}>
                  Issue login
                </button>
              )}
              <div className="rp-queue-row">
                <select value={queueDoctorId} onChange={(e) => setQueueDoctorId(e.target.value)} aria-label="Doctor for queue">
                  <option value="">Doctor for queue</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
                  ))}
                </select>
                <button type="button" className="btn btn-secondary" onClick={() => handleWalkInQueue(selected.id)}>
                  Add to queue
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </Layout>
  )
}
