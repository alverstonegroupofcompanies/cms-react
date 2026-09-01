import Layout from '../../components/Layout'
import ActionTile from '../../components/ActionTile'
import { receptionistNav } from '../../config/navigation'

export default function ReceptionistDashboard() {
  return (
    <Layout title="Receptionist Dashboard" subtitle="Manage patients and clinic flow" nav={receptionistNav}>
      <div className="action-grid">
        <ActionTile to="/receptionist/patients" icon="users" title="Patient Management" description="Search, register new patients" />
        <ActionTile to="/receptionist/queue" icon="queue" title="Queue Board" description="Manage live queue, add walk-ins" />
        <ActionTile to="/receptionist/appointments" icon="calendar" title="Appointments" description="Check-in scheduled patients" />
        <ActionTile to="/receptionist/pharmacy" icon="pill" title="Pharmacy" description="Dispense prescriptions" />
      </div>
    </Layout>
  )
}
