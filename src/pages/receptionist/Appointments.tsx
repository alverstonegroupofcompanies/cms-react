import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import RescheduleModal, { type RescheduleTarget } from '../../components/RescheduleModal'
import {
  cancelAppointment,
  checkInAppointment,
  checkOutAppointment,
  getAppointments,
  getDoctors,
} from '../../api/client'
import { receptionistNav } from '../../config/navigation'
import VisitSourceBadge from '../../components/VisitSourceBadge'
import type { Appointment, Doctor } from '../../api/types'

export default function ReceptionistAppointments() {
  const [searchParams] = useSearchParams()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorId, setDoctorId] = useState(searchParams.get('doctor_id') || '')
  const [date, setDate] = useState(searchParams.get('date') || '') // empty = all upcoming (ascending)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rescheduleTarget, setRescheduleTarget] = useState<RescheduleTarget | null>(null)

  useEffect(() => {
    const d = searchParams.get('date')
    const doc = searchParams.get('doctor_id')
    if (d) setDate(d)
    if (doc) setDoctorId(doc)
  }, [searchParams])

  const loadList = useCallback(() => {
    setLoading(true)
    setError('')
    const params: Record<string, string | number> = {}
    if (date) params.date = date
    if (doctorId) params.doctor_id = Number(doctorId)

    getAppointments(params)
      .then(({ data }) => {
        const rows = (data.data || data) as Appointment[]
        setAppointments(Array.isArray(rows) ? rows : [])
      })
      .catch(() => setError('Could not load appointments'))
      .finally(() => setLoading(false))
  }, [date, doctorId])

  useEffect(() => {
    getDoctors().then(({ data }) => setDoctors(data))
  }, [])

  useEffect(() => {
    loadList()
  }, [loadList])

  const handleCheckIn = async (id: number) => {
    try {
      const { data } = await checkInAppointment(id)
      setMessage(`Checked in · Token ${data.queue_token?.display_code || ''}`)
      loadList()
    } catch {
      setError('Check-in failed')
    }
  }

  const handleCheckout = async (id: number, name?: string) => {
    if (!window.confirm(`Check out ${name || 'this patient'}?`)) return
    try {
      await checkOutAppointment(id)
      setMessage(`Checked out · ${name || 'Patient'}`)
      loadList()
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string } } })?.response?.data
      setError(res?.message || 'Checkout failed')
    }
  }

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel / abort this appointment?')) return
    try {
      await cancelAppointment(id)
      setMessage('Appointment cancelled')
      loadList()
    } catch {
      setError('Cancel failed')
    }
  }

  const openReschedule = (a: Appointment) => {
    setRescheduleTarget({
      appointmentId: a.id,
      doctorId: a.doctor_id,
      doctorName: a.doctor?.name || 'Doctor',
      appointmentDate: String(a.appointment_date).slice(0, 10),
      slotTime: a.slot_time,
      patientName: a.patient?.name,
    })
  }

  const canManage = (status: string) => ['booked', 'no_show', 'checked_in'].includes(status)

  return (
    <Layout title="Appointments" subtitle="All upcoming bookings · filter by date if needed" nav={receptionistNav}>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="form-row" style={{ alignItems: 'flex-end' }}>
          <div className="form-group">
            <label>Date (optional)</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Filter by date"
            />
            <p className="muted" style={{ margin: '0.35rem 0 0', fontSize: '0.8rem' }}>
              Leave empty to show all upcoming (earliest first)
            </p>
          </div>
          <div className="form-group">
            <label>Doctor</label>
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
              <option value="">All doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
              ))}
            </select>
          </div>
          {date && (
            <button type="button" className="btn btn-secondary" style={{ marginBottom: '1.1rem' }} onClick={() => setDate('')}>
              Clear date
            </button>
          )}
          <Link to="/receptionist/book" className="btn btn-primary" style={{ marginBottom: '1.1rem' }}>
            + Book for patient
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title" style={{ marginTop: 0 }}>
          {date ? `Appointments on ${date}` : 'All upcoming appointments'}
          <span className="muted" style={{ fontWeight: 500, marginLeft: '0.5rem' }}>
            ({appointments.length})
          </span>
        </h3>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : appointments.length === 0 ? (
          <p className="muted">No appointments{date ? ' for this date' : ''}.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
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
                    <td>{String(a.appointment_date).slice(0, 10)}</td>
                    <td><strong>{a.slot_time?.slice(0, 5)}</strong></td>
                    <td>
                      {a.patient?.name}
                      <div className="muted">{a.patient?.patient_code}</div>
                    </td>
                    <td>{a.patient?.phone || '—'}</td>
                    <td>{a.doctor?.name}</td>
                    <td>
                      <VisitSourceBadge source={a.type === 'walk_in' ? 'walk_in' : 'booked'} />
                    </td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                    <td className="table-actions">
                      {a.status === 'booked' && (
                        <button type="button" className="btn btn-sm btn-primary" onClick={() => handleCheckIn(a.id)}>
                          Check in
                        </button>
                      )}
                      {a.status === 'checked_in' && a.queue_token?.status !== 'in_consultation' && (
                        <button type="button" className="btn btn-sm btn-success" onClick={() => handleCheckout(a.id, a.patient?.name)}>
                          Check out
                        </button>
                      )}
                      {a.status === 'checked_in' && a.queue_token?.status === 'in_consultation' && (
                        <span className="muted">With doctor</span>
                      )}
                      {canManage(a.status) && (
                        <>
                          <button type="button" className="btn btn-sm btn-secondary" onClick={() => openReschedule(a)}>
                            Reschedule
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

      <RescheduleModal
        target={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onSuccess={(result) => {
          setRescheduleTarget(null)
          setMessage(
            result
              ? `Rescheduled to ${result.date} at ${result.slot.slice(0, 5)} — visible on patient profile`
              : 'Appointment rescheduled — visible on patient profile'
          )
          loadList()
        }}
      />
    </Layout>
  )
}
