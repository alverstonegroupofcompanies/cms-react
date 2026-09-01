import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import { cancelAppointment, getAppointments } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { patientNav } from '../../config/navigation'
import type { Appointment } from '../../api/types'

export default function MyAppointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const load = () => {
    if (user?.patient) {
      getAppointments({ patient_id: user.patient.id }).then(({ data }) => setAppointments(data.data || data))
    }
  }

  useEffect(() => { load() }, [user])

  const handleCancel = async (id: number) => {
    await cancelAppointment(id)
    load()
  }

  return (
    <Layout title="My Appointments" subtitle="Upcoming and past visits" nav={patientNav}>
      <div className="card">
        <div className="card-header"><h3>Appointment History</h3></div>
        {appointments.length === 0 ? (
          <p className="empty-state">No appointments yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Date</th><th>Time</th><th>Doctor</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.appointment_date}</td>
                    <td>{a.slot_time?.slice(0, 5)}</td>
                    <td>{a.doctor?.name}</td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                    <td>
                      {a.status === 'booked' && (
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => handleCancel(a.id)}>Cancel</button>
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
