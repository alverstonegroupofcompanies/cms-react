import { Link } from 'react-router-dom'
import PatientLayout from '../../components/PatientLayout'
import VisitsSection from '../../components/VisitsSection'
import { useAuth } from '../../context/AuthContext'
import { IconCalendar, IconPhone } from '../../components/Icons'
import { CLINIC } from '../../config/clinic'
import { usePageTitle } from '../../hooks/usePageTitle'
import './my-visits.css'

export default function MyAppointments() {
  usePageTitle('My Visits', 'Patient')
  const { user } = useAuth()

  return (
    <PatientLayout>
      <div className="mv-page-container">
        {/* Luxury Clinical Hero Banner */}
        <header className="mv-hero">
          <div className="mv-hero-content">
            <div className="mv-kicker">
              <span className="mv-kicker-dot" />
              <span>Care Schedule & Visits</span>
            </div>
            <h1 className="mv-title">
              My <span className="mv-title-accent">Visits & Care</span> Schedule
            </h1>
            <p className="mv-lead">
              Manage your confirmed doctor consultations, live queue check-ins, past health records, and diagnostic laboratory tests all in one place.
            </p>
          </div>

          <div className="mv-hero-actions">
            <Link to="/patient/book" className="mv-btn-primary">
              <IconCalendar size={18} />
              <span>Book an Appointment</span>
            </Link>
            <a
              href={`tel:${CLINIC.phone.replace(/\s/g, '')}`}
              className="mv-btn-emergency"
              title="Direct call to emergency & help desk"
            >
              <IconPhone size={16} />
              <span>24/7 Helpline</span>
            </a>
          </div>
        </header>

        {/* Visits & Appointments Component */}
        <VisitsSection patientId={user?.patient?.id} premium showViewAll={false} />
      </div>
    </PatientLayout>
  )
}
