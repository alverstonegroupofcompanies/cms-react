import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import PatientMonthCalendar from '../../components/PatientMonthCalendar'
import { doctorNav } from '../../config/navigation'

export default function DoctorCalendar() {
  const navigate = useNavigate()

  return (
    <Layout
      title="Calendar"
      subtitle="Pick a day to open that day’s patient board"
      nav={doctorNav}
    >
      <PatientMonthCalendar
        onSelectDay={(date) => {
          navigate(`/doctor/dashboard?date=${date}`)
        }}
      />
    </Layout>
  )
}
