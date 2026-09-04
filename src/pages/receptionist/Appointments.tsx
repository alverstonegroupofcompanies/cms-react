import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import {
  checkInAppointment,
  cancelAppointment,
  getAppointments,
  getDaySchedule,
  getDoctors,
} from '../../api/client'
import { receptionistNav } from '../../config/navigation'
import type { Appointment, DayScheduleSlot, Doctor } from '../../api/types'

export default function ReceptionistAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [schedule, setSchedule] = useState<DayScheduleSlot[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadList = () => {
    setLoading(true)
    getAppointments({ date, ...(doctorId ? { doctor_id: Number(doctorId) } : {}) })
      .then(({ data }) => setAppointments(data.data || data))
      .catch(() => setError('Could not load appointments'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    getDoctors().then(({ data }) => setDoctors(data))
  }, [])

  useEffect(() => {
    setError('')
    loadList()
  }, [date, doctorId])

  useEffect(() => {
    if (!doctorId || !date) {
      setSchedule([])
      return
    }
    getDaySchedule(Number(doctorId), date)
      .then(({ data }) => setSchedule(data.slots || []))
      .catch(() => setSchedule([]))
  }, [doctorId, date])

  const handleCheckIn = async (id: number) => {
    try {
      const { data } = await checkInAppointment(id)
      setMessage(`Checked in! Token: ${data.queue_token.display_code}`)
      loadList()
      if (doctorId) {
        const { data: board } = await getDaySchedule(Number(doctorId), date)
        setSchedule(board.slots || [])
      }
    } catch {
      setError('Check-in failed')
    }
  }

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel this appointment?')) return
    try {
      await cancelAppointment(id)
      setMessage('Appointment cancelled')
      loadList()
      if (doctorId) {
        const { data: board } = await getDaySchedule(Number(doctorId), date)
        setSchedule(board.slots || [])
      }
    } catch {
      setError('Cancel failed')
    }
  }

  const reservedCount = schedule.filter((s) => s.status === 'booked').length
  const freeCount = schedule.filter((s) => s.status === 'available').length

  return (
    <Layout title="Appointments" subtitle="Reserved slots, patient details, and check-in" nav={receptionistNav}>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="form-row" style={{ alignItems: 'flex-end' }}>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Doctor</label>
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
              <option value="">All doctors (list view)</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
              ))}
            </select>
          </div>
          <Link to="/receptionist/book" className="btn btn-primary" style={{ marginBottom: '1.1rem' }}>
            + Book for patient
          </Link>
        </div>
        {doctorId && (
          <p className="muted">
            Day board: <strong>{reservedCount}</strong> reserved · <strong>{freeCount}</strong> available
          </p>
        )}
      </div>

      {doctorId && schedule.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 className="section-title" style={{ marginTop: 0 }}>Slot board</h3>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Patient</th>
                  <th>ID</th>
                  <th>Phone</th>
                  <th>Appt status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((s) => (
                  <tr key={s.slot_time}>
                    <td><strong>{s.time}</strong></td>
                    <td><span className={`badge badge-${s.status}`}>{s.status}</span></td>
                    <td>{s.patient?.name || '—'}</td>
                    <td>{s.patient?.patient_code || '—'}</td>
                    <td>{s.patient?.phone || '—'}</td>
                    <td>{s.appointment_status || '—'}</td>
                    <td className="table-actions">
                      {s.appointment_id && s.appointment_status === 'booked' && (
                        <>
                          <button type="button" className="btn btn-sm btn-primary" onClick={() => handleCheckIn(s.appointment_id!)}>
                            Check In
                          </button>
                          <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleCancel(s.appointment_id!)}>
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="section-title" style={{ marginTop: 0 }}>
          {doctorId ? 'Appointments for selected doctor' : 'All appointments for date'}
        </h3>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : appointments.length === 0 ? (
          <p className="muted">No appointments for this filter.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Phone</th>
                  <th>Doctor</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td><strong>{a.slot_time?.slice(0, 5)}</strong></td>
                    <td>
                      {a.patient?.name}
                      <div className="muted">{a.patient?.patient_code}</div>
                    </td>
                    <td>{a.patient?.phone || '—'}</td>
                    <td>{a.doctor?.name}</td>
                    <td>{a.type || 'scheduled'}</td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                    <td className="table-actions">
                      {a.status === 'booked' && (
                        <>
                          <button type="button" className="btn btn-sm btn-primary" onClick={() => handleCheckIn(a.id)}>
                            Check In
                          </button>
                          <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleCancel(a.id)}>
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
