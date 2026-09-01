import Layout from '../../components/Layout'
import ActionTile from '../../components/ActionTile'
import { useAuth } from '../../context/AuthContext'
import { patientNav } from '../../config/navigation'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const name = user?.patient?.name || user?.name || 'Patient'

  return (
    <Layout title="Patient Dashboard" subtitle={`${greeting()}, ${name.split(' ')[0]}`} nav={patientNav}>
      <div className="welcome-banner">
        <h2>{greeting()}, {name}!</h2>
        {user?.patient && <p>Patient ID: <strong>{user.patient.patient_code}</strong></p>}
      </div>
      <p className="section-title">Quick Actions</p>
      <div className="action-grid">
        <ActionTile to="/patient/book" icon="calendar" title="Book Appointment" description="Schedule a time slot with a doctor" />
        <ActionTile to="/patient/queue" icon="queue" title="Join Queue" description="Get a token for today's walk-in visit" />
        <ActionTile to="/patient/appointments" icon="calendar" title="My Appointments" description="View upcoming and past visits" />
        <ActionTile to="/patient/lab-reports" icon="flask" title="Lab Reports" description="View your test results" />
      </div>
    </Layout>
  )
}
