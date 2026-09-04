import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  bookAppointment,
  getClinics,
  getDaySchedule,
  getDepartments,
  getDoctorAvailableDates,
  getDoctors,
  getPatient,
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

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatWorkingDays(availability?: Doctor['availability']): string {
  if (!availability?.length) return 'Not set'
  const days = [...new Set(availability.map((a) => a.day_of_week))].sort((a, b) => a - b)
  return days.map((d) => DAY_NAMES[d]).join(', ')
}

export default function ReceptionistBookAppointment() {
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
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [booking, setBooking] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getClinics().then(({ data }) => {
      const first = data[0] ?? null
      setClinic(first)
      if (first) getDepartments(first.id).then(({ data: depts }) => setDepartments(depts))
    })
  }, [])

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
      getDoctors({ clinic_id: clinic.id, department_id: Number(departmentId) }).then(({ data }) => setDoctors(data))
    } else {
      setDoctors([])
    }
  }, [clinic, departmentId])

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

  const handleSearchPatient = async () => {
    setError('')
    if (!patientQuery.trim()) {
      setError('Enter phone or patient ID to search')
      return
    }
    const { data } = await searchPatients(patientQuery.trim())
    setPatientResults(data)
    if (!data.length) setError('No patient found. Register walk-in first.')
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
      setMessage(
        token
          ? `Booked for ${selectedPatient.name}. Queue token: ${token}`
          : `Appointment booked for ${selectedPatient.name} on ${date} at ${selectedSlot.slice(0, 5)}`
      )
      setSelectedSlot('')
      const refreshed = await getDaySchedule(Number(doctorId), date)
      setSchedule(refreshed.data.slots || [])
    } catch {
      setError('Booking failed. Slot may already be taken.')
    } finally {
      setBooking(false)
    }
  }

  return (
    <Layout title="Book for patient" subtitle="Walk-in / staff appointment booking" nav={receptionistNav}>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 className="section-title" style={{ marginTop: 0 }}>1. Select patient</h3>
        {selectedPatient ? (
          <div className="staff-selected-patient">
            <div>
              <strong>{selectedPatient.name}</strong>
              <span className="muted"> · {selectedPatient.patient_code} · {selectedPatient.phone}</span>
            </div>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setSelectedPatient(null)}>Change</button>
          </div>
        ) : (
          <>
            <div className="search-bar">
              <input
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                placeholder="Phone or patient ID"
                onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
              />
              <button type="button" className="btn btn-primary" onClick={handleSearchPatient}>Search</button>
              <Link to="/receptionist/patients" className="btn btn-secondary">Register walk-in</Link>
            </div>
            {patientResults.length > 0 && (
              <div className="table-wrap" style={{ marginTop: '0.75rem' }}>
                <table className="table">
                  <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th></th></tr></thead>
                  <tbody>
                    {patientResults.map((p) => (
                      <tr key={p.id}>
                        <td>{p.patient_code}</td>
                        <td>{p.name}</td>
                        <td>{p.phone}</td>
                        <td>
                          <button type="button" className="btn btn-sm btn-primary" onClick={() => setSelectedPatient(p)}>
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
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 className="section-title" style={{ marginTop: 0 }}>2. Doctor & slot</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Department</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">Select department</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
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
            Fee ₹{selectedDoctor.consultation_fee ?? '—'} · Lunch {selectedDoctor.lunch_start?.slice(0, 5) || '—'}–{selectedDoctor.lunch_end?.slice(0, 5) || '—'}
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

        {date && schedule.length > 0 && (
          <details style={{ marginTop: '1rem' }}>
            <summary>Day board (reserved + free)</summary>
            <div className="table-wrap" style={{ marginTop: '0.5rem' }}>
              <table className="table">
                <thead>
                  <tr><th>Time</th><th>Status</th><th>Patient</th><th>Phone</th></tr>
                </thead>
                <tbody>
                  {schedule.map((s) => (
                    <tr key={s.slot_time} className={s.status === 'booked' ? 'row-booked' : undefined}>
                      <td>{s.time}</td>
                      <td><span className={`badge badge-${s.status}`}>{s.status}</span></td>
                      <td>
                        {s.patient
                          ? `${s.patient.name} (${s.patient.patient_code})`
                          : '—'}
                      </td>
                      <td>{s.patient?.phone || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
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
