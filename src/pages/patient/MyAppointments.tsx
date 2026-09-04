import PatientPage from '../../components/PatientPage'
import VisitsSection from '../../components/VisitsSection'
import { useAuth } from '../../context/AuthContext'

export default function MyAppointments() {
  const { user } = useAuth()

  return (
    <PatientPage title="My appointments" subtitle="Upcoming and past clinic visits">
      <div className="ph-card ph-card-flush">
        <VisitsSection patientId={user?.patient?.id} premium showViewAll={false} />
      </div>
    </PatientPage>
  )
}
