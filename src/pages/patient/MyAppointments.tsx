import PatientPage from '../../components/PatientPage'
import VisitsSection from '../../components/VisitsSection'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { IconCalendar } from '../../components/Icons'

export default function MyAppointments() {
  const { user } = useAuth()

  return (
    <PatientPage
      kicker="Schedule"
      title="My visits"
      subtitle="Upcoming and past clinic appointments in one place."
      actions={
        <Link to="/patient/book" className="ph-btn ph-btn-primary">
          <IconCalendar size={16} /> Book a visit
        </Link>
      }
    >
      <section className="ph-page-panel ph-card-flush">
        <div className="ph-page-panel-head" style={{ margin: '0 1.15rem', paddingTop: '1.1rem' }}>
          <h3>Appointments</h3>
        </div>
        <VisitsSection patientId={user?.patient?.id} premium showViewAll={false} />
      </section>
    </PatientPage>
  )
}
