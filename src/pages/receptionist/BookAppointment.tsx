import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  bookAppointment,
  createPatient,
  getClinics,
  getDaySchedule,
  getDepartments,
  getDoctorAvailableDates,
  getDoctors,
  getPatient,
  joinQueue,
  searchPatients,
} from '../../api/client'
import { receptionistNav } from '../../config/navigation'
import type {
  AvailableDate,
  Clinic,
  DayScheduleSlot,
  Department,
  Doctor,
  Patient,
} from '../../api/types'
import { filterPastSlotsForToday } from '../../utils/slotUtils'
import { filterDoctorsAvailableOnDate } from '../../utils/doctorAvailability'
import {
  afterSelectValue,
  focusField,
  focusNextOnEnter,
  openSelect,
  selectEnterNav,
} from '../../utils/formNav'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const GMAIL_RE = /^[^\s@]+@gmail\.com$/i

function formatWorkingDays(availability?: Doctor['availability']): string {
  if (!availability?.length) return 'Not set'
  const days = [...new Set(availability.map((a) => a.day_of_week))].sort((a, b) => a - b)
  return days.map((d) => DAY_NAMES[d]).join(', ')
}

function splitName(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  return {
    first_name: parts[0] || '',
    last_name: parts.slice(1).join(' ') || undefined,
  }
}

export default function ReceptionistBookAppointment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedPatientId = searchParams.get('patient_id')

  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([])
  const [schedule, setSchedule] = useState<DayScheduleSlot[]>([])
  const [departmentId, setDepartmentId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [patientQuery, setPatientQuery] = useState('')
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [searchingPatients, setSearchingPatients] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [booking, setBooking] = useState(false)
  const [quickSaving, setQuickSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [quickName, setQuickName] = useState('')
  const [quickEmail, setQuickEmail] = useState('')
  const [quickPhone, setQuickPhone] = useState('')

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const deptRef = useRef<HTMLSelectElement>(null)
  const doctorRef = useRef<HTMLSelectElement>(null)
  const quickSubmitRef = useRef<HTMLButtonElement>(null)
  const openDoctorWhenReady = useRef(false)
  const walkinMode = searchParams.get('walkin') === '1'

  useEffect(() => {
    getClinics().then(({ data }) => {
      const first = data[0] ?? null
      setClinic(first)
      if (first) getDepartments(first.id).then(({ data: depts }) => setDepartments(depts))
    })
  }, [])

  // Land on the name field when opening Book from Reception → Walk-in.
  useEffect(() => {
    if (!walkinMode) return
    const t = window.setTimeout(() => {
      nameRef.current?.focus()
      nameRef.current?.select()
      document.getElementById('walkin-quick')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => window.clearTimeout(t)
  }, [walkinMode])

  useEffect(() => {
    if (!preselectedPatientId) return
    getPatient(Number(preselectedPatientId))
      .then(({ data }) => setSelectedPatient(data))
      .catch(() => {
        /* ignore */
      })
  }, [preselectedPatientId])

  useEffect(() => {
    setDoctorId('')
    setDate('')
    setSelectedSlot('')
    setAvailableDates([])
    setSchedule([])
    if (clinic && departmentId) {
      getDoctors({ clinic_id: clinic.id, department_id: Number(departmentId) }).then(({ data }) => {
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
  }, [clinic, departmentId])

  const walkInDoctors = useMemo(() => filterDoctorsAvailableOnDate(doctors), [doctors])
  const noDoctorsAvailableToday =
    Boolean(departmentId) && doctors.length > 0 && walkInDoctors.length === 0
  const noDoctorsInDepartment = Boolean(departmentId) && doctors.length === 0

  useEffect(() => {
    setDate('')
    setSelectedSlot('')
    setAvailableDates([])
    setSchedule([])
    if (!doctorId) return
    getDoctorAvailableDates(Number(doctorId)).then(({ data }) => setAvailableDates(data.dates))
  }, [doctorId])

  useEffect(() => {
    setSelectedSlot('')
    if (!doctorId || !date) {
      setSchedule([])
      return
    }
    getDaySchedule(Number(doctorId), date).then(({ data }) => setSchedule(data.slots || []))
  }, [doctorId, date])

  const availableSlots = useMemo(() => {
    const free = schedule.filter((s) => s.status === 'available')
    return filterPastSlotsForToday(free, date)
  }, [schedule, date])

  const selectedDoctor = doctors.find((d) => String(d.id) === doctorId)

  // Live patient search while typing (debounced).
  useEffect(() => {
    if (selectedPatient) return

    const q = patientQuery.trim()
    if (q.length < 2) {
      setPatientResults([])
      setSearchingPatients(false)
      return
    }

    let cancelled = false
    setSearchingPatients(true)
    const timer = window.setTimeout(() => {
      searchPatients(q)
        .then(({ data }) => {
          if (cancelled) return
          setPatientResults(data)
          setSearchingPatients(false)
        })
        .catch(() => {
          if (cancelled) return
          setPatientResults([])
          setSearchingPatients(false)
        })
    }, 280)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [patientQuery, selectedPatient])

  const handleQuickWalkIn = async (doctorIdOverride?: string) => {
    setError('')
    setMessage('')

    const name = quickName.trim()
    const email = quickEmail.trim().toLowerCase()
    const phone = quickPhone.replace(/\D/g, '').slice(-10)
    const chosenDoctorId = doctorIdOverride || doctorId

    if (!name) {
      setError('Enter patient name')
      nameRef.current?.focus()
      return
    }
    if (!GMAIL_RE.test(email)) {
      setError('Enter a valid Gmail address (example@gmail.com)')
      emailRef.current?.focus()
      return
    }
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit contact number')
      phoneRef.current?.focus()
      return
    }
    if (!departmentId) {
      setError('Select a department')
      deptRef.current?.focus()
      return
    }
    if (!chosenDoctorId) {
      setError(
        noDoctorsAvailableToday
          ? 'Not available today — no doctors in this department work today'
          : 'Select a doctor — patient will join that doctor’s queue only'
      )
      doctorRef.current?.focus()
      return
    }
    if (!walkInDoctors.some((d) => String(d.id) === String(chosenDoctorId))) {
      setError('Not available today — choose a doctor who works today')
      doctorRef.current?.focus()
      return
    }

    if (doctorIdOverride && doctorIdOverride !== doctorId) {
      setDoctorId(doctorIdOverride)
    }

    setQuickSaving(true)
    try {
      const { first_name, last_name } = splitName(name)
      const { data: patient } = await createPatient({
        first_name,
        last_name,
        phone,
        email,
      })

      const { data: queue } = await joinQueue(patient.id, Number(chosenDoctorId))
      const token =
        queue.queue_token?.display_code ||
        queue.display_code ||
        queue.queue_token?.token_number ||
        'issued'

      const doctorName =
        doctors.find((d) => String(d.id) === chosenDoctorId)?.name || selectedDoctor?.name || 'doctor'
      const success = `Walk-in ready · ${patient.name} → ${doctorName} · Token ${token}`
      setMessage(success)
      setQuickName('')
      setQuickEmail('')
      setQuickPhone('')
      setSelectedPatient(patient)

      window.setTimeout(() => {
        navigate('/receptionist/dashboard', { state: { flash: success } })
      }, 900)
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
        ?.response?.data
      const firstError = res?.errors
        ? Object.values(res.errors).flat()[0]
        : null
      setError(firstError || res?.message || 'Quick register failed — phone or email may already exist')
    } finally {
      setQuickSaving(false)
    }
  }

  const handleBook = async () => {
    if (!selectedPatient || !clinic || !doctorId || !date || !selectedSlot) {
      setError('Select patient, doctor, date and slot')
      return
    }
    setBooking(true)
    setError('')
    setMessage('')
    try {
      const { data } = await bookAppointment({
        patient_id: selectedPatient.id,
        doctor_id: Number(doctorId),
        clinic_id: clinic.id,
        department_id: Number(departmentId),
        appointment_date: date,
        slot_time: selectedSlot,
        type: 'walk_in',
      })
      const token = data.queue_token?.display_code
      const success = token
        ? `Booked for ${selectedPatient.name}. Queue token: ${token}`
        : `Appointment booked for ${selectedPatient.name} on ${date} at ${selectedSlot.slice(0, 5)}`
      setMessage(success)
      setSelectedSlot('')
      window.setTimeout(() => {
        navigate('/receptionist/dashboard', { state: { flash: success } })
      }, 1200)
    } catch {
      setError('Booking failed. Slot may already be taken.')
    } finally {
      setBooking(false)
    }
  }

  return (
    <Layout title="Book for patient" subtitle="Quick walk-in or scheduled booking" nav={receptionistNav}>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div id="walkin-quick" className="card walkin-quick-card" style={{ marginBottom: '1rem' }}>
        <div className="walkin-quick-head">
          <div>
            <h3 className="section-title" style={{ marginTop: 0, marginBottom: 0 }}>
              Quick walk-in
            </h3>
            <p className="muted" style={{ margin: '0.25rem 0 0' }}>
              Name → email → phone → department → doctor. Press Enter to move next.
            </p>
          </div>
          <Link to="/receptionist/patients?register=1" className="btn btn-sm btn-secondary">
            Patients
          </Link>
        </div>

        <div className="walkin-quick-grid">
          <label className="form-group">
            Name
            <input
              ref={nameRef}
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              placeholder="Full name"
              autoComplete="name"
              autoFocus={walkinMode}
              onKeyDown={(e) => focusNextOnEnter(e, emailRef.current)}
            />
          </label>
          <label className="form-group">
            Gmail
            <input
              ref={emailRef}
              type="email"
              value={quickEmail}
              onChange={(e) => setQuickEmail(e.target.value)}
              placeholder="name@gmail.com"
              autoComplete="email"
              onKeyDown={(e) => focusNextOnEnter(e, phoneRef.current)}
            />
          </label>
          <label className="form-group">
            Contact number
            <input
              ref={phoneRef}
              inputMode="numeric"
              value={quickPhone}
              onChange={(e) => setQuickPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit mobile"
              autoComplete="tel"
              onKeyDown={(e) => focusNextOnEnter(e, deptRef.current)}
            />
          </label>
          <label className="form-group">
            Department
            <select
              ref={deptRef}
              value={departmentId}
              onChange={(e) => {
                const value = e.target.value
                setDepartmentId(value)
                if (value) openDoctorWhenReady.current = true
              }}
              onKeyDown={(e) =>
                selectEnterNav(e, doctorRef.current, () => void handleQuickWalkIn())
              }
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-group">
            Doctor
            <select
              ref={doctorRef}
              value={walkInDoctors.some((d) => String(d.id) === doctorId) ? doctorId : ''}
              onChange={(e) => {
                const value = e.target.value
                setDoctorId(value)
                afterSelectValue(value, quickSubmitRef.current)
              }}
              disabled={!departmentId || walkInDoctors.length === 0}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                e.preventDefault()
                e.stopPropagation()
                const value = e.currentTarget.value
                if (!value) {
                  openSelect(e.currentTarget)
                  return
                }
                void handleQuickWalkIn(value)
              }}
            >
              <option value="">
                {!departmentId
                  ? 'Choose department first'
                  : noDoctorsInDepartment
                    ? 'No doctors in this department'
                    : noDoctorsAvailableToday
                      ? 'Not available today'
                      : 'Select doctor'}
              </option>
              {walkInDoctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialization}
                </option>
              ))}
            </select>
          </label>
        </div>

        {noDoctorsAvailableToday && (
          <div className="alert alert-error" role="alert">
            Not available today — no doctors in this department are scheduled to work today.
          </div>
        )}

        {selectedDoctor && walkInDoctors.some((d) => String(d.id) === doctorId) && (
          <p className="muted walkin-doctor-hint">
            Queue for <strong>{selectedDoctor.name}</strong> only · {selectedDoctor.specialization}
            {selectedDoctor.consultation_fee != null ? ` · Fee ₹${selectedDoctor.consultation_fee}` : ''}
          </p>
        )}

        <button
          ref={quickSubmitRef}
          type="button"
          className="btn btn-primary"
          disabled={quickSaving || noDoctorsAvailableToday || noDoctorsInDepartment}
          onClick={() => void handleQuickWalkIn()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              void handleQuickWalkIn()
            }
          }}
        >
          {quickSaving ? 'Registering…' : 'Register & issue token'}
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 className="section-title" style={{ marginTop: 0 }}>Existing patient — book slot</h3>
        {selectedPatient ? (
          <div className="staff-selected-patient">
            <div>
              <strong>{selectedPatient.name}</strong>
              <span className="muted">
                {' '}
                · {selectedPatient.patient_code} · {selectedPatient.phone}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => {
                setSelectedPatient(null)
                setPatientQuery('')
                setPatientResults([])
              }}
            >
              Change
            </button>
          </div>
        ) : (
          <>
            <div className="search-bar">
              <input
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                placeholder="Type name, phone, or patient ID…"
                autoComplete="off"
                aria-label="Search patients"
              />
              {searchingPatients && <span className="muted" style={{ alignSelf: 'center' }}>Searching…</span>}
            </div>
            {patientQuery.trim().length >= 2 && !searchingPatients && patientResults.length === 0 && (
              <p className="muted" style={{ marginTop: '0.65rem' }}>
                No patient found — use Quick walk-in above.
              </p>
            )}
            {patientResults.length > 0 && (
              <div className="table-wrap" style={{ marginTop: '0.75rem' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientResults.map((p) => (
                      <tr key={p.id}>
                        <td>{p.patient_code}</td>
                        <td>{p.name}</td>
                        <td>{p.phone}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setSelectedPatient(p)
                              setPatientQuery('')
                              setPatientResults([])
                            }}
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        <div className="form-row" style={{ marginTop: '1rem' }}>
          <div className="form-group">
            <label>Department</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Doctor</label>
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} disabled={!departmentId}>
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialization} ({formatWorkingDays(d.availability)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedDoctor && (
          <p className="muted" style={{ marginBottom: '0.75rem' }}>
            Fee ₹{selectedDoctor.consultation_fee ?? '—'} · Lunch{' '}
            {selectedDoctor.lunch_start?.slice(0, 5) || '—'}–{selectedDoctor.lunch_end?.slice(0, 5) || '—'}
          </p>
        )}

        {availableDates.length > 0 && (
          <div className="form-group">
            <label>Date</label>
            <div className="staff-date-chips">
              {availableDates.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  className={`btn btn-sm ${date === d.date ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDate(d.date)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {date && (
          <div className="form-group">
            <label>Available slots</label>
            {availableSlots.length === 0 ? (
              <p className="muted">No open slots for this date.</p>
            ) : (
              <div className="staff-slot-grid">
                {availableSlots.map((s) => (
                  <button
                    key={s.slot_time}
                    type="button"
                    className={`btn btn-sm ${selectedSlot === s.slot_time ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedSlot(s.slot_time)}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
          disabled={!selectedPatient || !selectedSlot || booking}
          onClick={handleBook}
        >
          {booking ? 'Booking…' : 'Confirm booking'}
        </button>
      </div>
    </Layout>
  )
}
