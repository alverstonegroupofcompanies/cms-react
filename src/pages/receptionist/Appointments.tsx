import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { checkInAppointment, getAppointments } from '../../api/client'
import { receptionistNav } from '../../config/navigation'
import type { Appointment } from '../../api/types'

export default function ReceptionistAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [message, setMessage] = useState('')

  const load = () => {
    getAppointments({ date }).then(({ data }) => setAppointments(data.data || data))
  }

  useEffect(() => { load() }, [date])

  const handleCheckIn = async (id: number) => {
    const { data } = await checkInAppointment(id)
    setMessage(`Checked in! Token: ${data.queue_token.display_code}`)
    load()
  }

  return (
    <Layout title="Today's Appointments" subtitle="Check-in scheduled patients" nav={receptionistNav}>
      {message && <div className="alert alert-success">{message}</div>}
      <div className="card">
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Time</th><th>Patient</th><th>Doctor</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td><strong>{a.slot_time?.slice(0, 5)}</strong></td>
                  <td>{a.patient?.name} ({a.patient?.patient_code})</td>
                  <td>{a.doctor?.name}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  <td>
                    {a.status === 'booked' && (
                      <button type="button" className="btn btn-sm btn-primary" onClick={() => handleCheckIn(a.id)}>Check In</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
