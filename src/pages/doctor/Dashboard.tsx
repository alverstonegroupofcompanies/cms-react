import Layout from '../../components/Layout'
import ActionTile from '../../components/ActionTile'
import { doctorNav } from '../../config/navigation'

export default function DoctorDashboard() {
  return (
    <Layout title="Doctor Dashboard" subtitle="Today's schedule and patient queue" nav={doctorNav}>
      <div className="action-grid">
        <ActionTile to="/doctor/queue" icon="queue" title="Patient Queue" description="Call next patient, complete consultations" />
        <ActionTile to="/doctor/prescriptions" icon="pill" title="Write Prescription" description="Create prescriptions for patients" />
        <ActionTile to="/doctor/lab-orders" icon="flask" title="Lab Orders" description="Order lab tests for patients" />
      </div>
    </Layout>
  )
}
