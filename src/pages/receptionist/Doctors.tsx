import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import { getDaySchedule, getDoctors } from '../../api/client'
import { receptionistNav } from '../../config/navigation'
import type { DayScheduleSlot, Doctor } from '../../api/types'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatWorkingDays(availability?: Doctor['availability']): string {
  if (!availability?.length) return 'No weekly schedule set'
  return [...new Set(availability.map((a) => a.day_of_week))]
    .sort((a, b) => a - b)
    .map((d) => DAY_NAMES[d])
    .join(', ')
}

function formatHours(availability?: Doctor['availability']): string {
  if (!availability?.length) return '—'
  const a = availability[0]
  return `${String(a.start_time).slice(0, 5)} – ${String(a.end_time).slice(0, 5)} (${a.slot_duration_minutes || 30} min)`
}

export default function ReceptionistDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [schedule, setSchedule] = useState<DayScheduleSlot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDoctors()
      .then(({ data }) => setDoctors(data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setSchedule([])
      return
    }
    getDaySchedule(selectedId, date)
      .then(({ data }) => setSchedule(data.slots || []))
      .catch(() => setSchedule([]))
  }, [selectedId, date])

  const selected = doctors.find((d) => d.id === selectedId)

  return (
    <Layout title="Doctors & availability" subtitle="View doctor schedules and reserved slots" nav={receptionistNav}>
      {loading ? (
        <div className="card"><p className="muted">Loading doctors…</p></div>
      ) : (
        <div className="staff-doctors-layout">
          <div className="card">
            <h3 className="section-title" style={{ marginTop: 0 }}>Doctor list</h3>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Dept</th>
                    <th>Working days</th>
                    <th>Hours</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((d) => (
                    <tr key={d.id} className={selectedId === d.id ? 'row-selected' : undefined}>
                      <td>
                        <strong>{d.name}</strong>
                        <div className="muted">{d.specialization}</div>
                      </td>
                      <td>{d.department?.name || '—'}</td>
                      <td>{formatWorkingDays(d.availability)}</td>
                      <td>{formatHours(d.availability)}</td>
                      <td>
                        <button
                          type="button"
                          className={`btn btn-sm ${selectedId === d.id ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setSelectedId(d.id)}
                        >
                          View day
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title" style={{ marginTop: 0 }}>
              {selected ? `${selected.name} — day schedule` : 'Select a doctor'}
            </h3>
            {selected && (
              <>
                <div className="form-row" style={{ alignItems: 'flex-end' }}>
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <Link
                    to={`/receptionist/book`}
                    className="btn btn-primary"
                    style={{ marginBottom: '1.1rem' }}
                  >
                    Book for patient
                  </Link>
                </div>
                <p className="muted">
                  Lunch: {selected.lunch_start?.slice(0, 5) || '—'}–{selected.lunch_end?.slice(0, 5) || '—'} · Fee ₹{selected.consultation_fee ?? '—'}
                </p>
                {schedule.length === 0 ? (
                  <p className="muted">No slots (doctor off / leave / no availability for this day).</p>
                ) : (
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Status</th>
                          <th>Patient</th>
                          <th>Phone</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.map((s) => (
                          <tr key={s.slot_time}>
                            <td><strong>{s.time}</strong></td>
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
                )}
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}
