import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import PatientMonthCalendar from '../../components/PatientMonthCalendar'
import { receptionistNav } from '../../config/navigation'

export default function ReceptionistCalendar() {
  const navigate = useNavigate()

  return (
    <Layout
      title="Patient calendar"
      subtitle="Month view — tap a day to open that day’s appointments"
      nav={receptionistNav}
    >
      <PatientMonthCalendar
        showDoctorFilter
        onSelectDay={(date, doctorId) => {
          const q = new URLSearchParams({ date })
          if (doctorId) q.set('doctor_id', String(doctorId))
          navigate(`/receptionist/appointments?${q.toString()}`)
        }}
      />
    </Layout>
  )
}
