import { Link } from 'react-router-dom'
import PatientSiteLayout from '../../components/PatientSiteLayout'
import PatientEnquiryForm from '../../components/PatientEnquiryForm'
import { useAuth } from '../../context/AuthContext'
import { usePageTitle } from '../../hooks/usePageTitle'
import { CLINIC } from '../../config/clinic'
import { IconCalendar, IconQueue, IconFlask, IconPill, IconStethoscope, IconUsers, IconShield } from '../../components/Icons'

const SERVICE_DEFS = [
  {
    title: 'Book an Appointment',
    text: 'Choose your doctor, department, and preferred time slot.',
    signedInTo: '/patient/book',
    guestTo: '/patient/login?next=%2Fpatient%2Fbook',
    icon: IconCalendar,
    tone: 'navy',
  },
  {
    title: 'Live Queue Status',
    text: 'See real-time wait times before you arrive.',
    signedInTo: '/patient/dashboard',
    guestTo: '/patient/login?next=%2Fpatient%2Fdashboard',
    icon: IconQueue,
    tone: 'green',
  },
  {
    title: 'Lab Reports',
    text: 'View and download results as soon as they\'re ready.',
    signedInTo: '/patient/lab-reports',
    guestTo: '/patient/login?next=%2Fpatient%2Flab-reports',
    icon: IconFlask,
    tone: 'mist',
  },
  {
    title: 'Consultation History',
    text: 'Access past visit notes and prescriptions anytime.',
    signedInTo: '/patient/prescriptions',
    guestTo: '/patient/login?next=%2Fpatient%2Fprescriptions',
    icon: IconPill,
    tone: 'leaf',
  },
] as const

const DEPARTMENTS = [
  {
    title: 'Pediatrics',
    text: 'Gentle care for infants, children, and teens — growth checks, illness, and immunisations.',
    icon: IconUsers,
    tone: 'navy',
  },
  {
    title: 'Dermatology',
    text: 'Skin, hair, and nail consultations for rashes, allergies, and chronic conditions.',
    icon: IconShield,
    tone: 'green',
  },
  {
    title: 'General Medicine',
    text: 'Everyday health concerns, fever, diabetes follow-up, and adult outpatient care.',
    icon: IconStethoscope,
    tone: 'mist',
  },
  {
    title: 'Lab Tests',
    text: 'On-campus diagnostics and home sample collection when you need results fast.',
    icon: IconFlask,
    tone: 'leaf',
  },
] as const

export default function PatientLanding() {
  usePageTitle('Patient Care', 'Patient')
  const { user } = useAuth()
  const signedIn = user?.role === 'patient'
  const bookVisitTo = signedIn ? '/patient/book' : '/patient/login?next=%2Fpatient%2Fbook'

  return (
    <PatientSiteLayout>
      <section
        className="ps-hero"
        data-reveal="hero"
        style={{ backgroundImage: "url('/images/patient-site-banner.jpg')" }}
      >
        <div className="ps-hero-orb" aria-hidden />
        <div className="ps-hero-scan" aria-hidden />
        <div className="ps-hero-inner">
          <p className="ps-kicker ps-hero-line" style={{ ['--d' as string]: '0ms' }}>Your care, your account</p>
          <h1 className="ps-hero-line" style={{ ['--d' as string]: '100ms' }}>
            Everything about your care,<br />in one place.
          </h1>
          <p className="ps-hero-lead ps-hero-line" style={{ ['--d' as string]: '200ms' }}>
            Book appointments, track your queue in real time, and view lab reports and consultation
            history — securely, anytime, from your Alverstone Medcity account.
          </p>
          <div className="ps-hero-actions ps-hero-line" style={{ ['--d' as string]: '300ms' }}>
            {signedIn ? (
              <>
                <Link to="/patient/dashboard" className="ps-btn ps-btn-lg">Go to overview</Link>
                <Link to="/patient/book" className="ps-btn-ghost">Book a visit</Link>
              </>
            ) : (
              <Link to="/patient/register?next=%2Fpatient%2Fbook" className="ps-btn ps-btn-lg">
                Register now
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="ps-section ps-services-section">
        <div className="ps-section-head" data-reveal>
          <p className="ps-kicker ps-kicker-dark">Patient tools</p>
          <h2>Your care, in one place</h2>
          <p>Manage your entire care journey without picking up the phone.</p>
        </div>
        <div className="ps-service-grid">
          {SERVICE_DEFS.map((s, i) => {
            const Icon = s.icon
            return (
              <Link
                key={s.title}
                to={signedIn ? s.signedInTo : s.guestTo}
                className={`ps-service-card ps-service-card--${s.tone}`}
                data-reveal
                style={{ ['--d' as string]: `${i * 90}ms` }}
              >
                <div className="ps-service-card-top">
                  <span className="ps-service-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ps-service-icon" aria-hidden>
                    <Icon size={26} />
                  </span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <span className="ps-service-cta">
                  Get started
                  <span aria-hidden>→</span>
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="ps-split">
        <div
          className="ps-split-media"
          data-reveal="left"
          style={{ backgroundImage: "url('/images/patient-about.jpg')" }}
          role="img"
          aria-label="Clinic interior"
        >
          <span className="ps-split-media-badge">Alverstone campus</span>
        </div>
        <div className="ps-split-copy" data-reveal="right" style={{ ['--d' as string]: '120ms' }}>
          <p className="ps-kicker ps-kicker-dark">About us</p>
          <h2>Care with clarity in Kollam</h2>
          <p>{CLINIC.aboutShort}</p>
          <ul className="ps-checklist">
            <li>
              <span className="ps-check-icon" aria-hidden>
                <IconStethoscope size={20} />
              </span>
              <div className="ps-check-copy">
                <strong>Multi-specialty</strong>
                <span>Outpatient care across key departments</span>
              </div>
            </li>
            <li>
              <span className="ps-check-icon" aria-hidden>
                <IconFlask size={20} />
              </span>
              <div className="ps-check-copy">
                <strong>One campus</strong>
                <span>Pharmacy &amp; diagnostics under one roof</span>
              </div>
            </li>
            <li>
              <span className="ps-check-icon" aria-hidden>
                <IconCalendar size={20} />
              </span>
              <div className="ps-check-copy">
                <strong>Digital access</strong>
                <span>Appointments and reports online</span>
              </div>
            </li>
          </ul>
          <Link to="/patient/about" className="ps-btn-outline">
            Learn more about us
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <section className="ps-section ps-departments-section" id="departments">
        <div className="ps-departments-pattern" aria-hidden />
        <div className="ps-section-head" data-reveal>
          <p className="ps-kicker ps-kicker-dark">Departments</p>
          <h2>Care across our specialties</h2>
          <p>Outpatient clinics and diagnostics available on campus — book the team that fits your need.</p>
        </div>
        <div className="ps-dept-grid">
          {DEPARTMENTS.map((d, i) => {
            const Icon = d.icon
            return (
              <article
                key={d.title}
                className={`ps-dept-card ps-dept-card--${d.tone}`}
                data-reveal
                style={{ ['--d' as string]: `${i * 90}ms` }}
              >
                <span className="ps-dept-icon" aria-hidden>
                  <Icon size={24} />
                </span>
                <h3>{d.title}</h3>
                <p>{d.text}</p>
                <Link to={bookVisitTo} className="ps-dept-cta">
                  Book a visit
                  <span aria-hidden>→</span>
                </Link>
              </article>
            )
          })}
        </div>
      </section>

      <section className="ps-enquiry-section" id="contact">
        <div className="ps-enquiry-inner">
          <div className="ps-enquiry-intro" data-reveal="left">
            <p className="ps-kicker ps-kicker-dark">Contact</p>
            <h2>We&apos;re here to help</h2>
            <p>
              Visit us, call reception, or send an enquiry for a call back —
              appointments, lab tests at home, pharmacy, or a general question.
            </p>
            <dl className="ps-enquiry-quick">
              <div>
                <dt>Address</dt>
                <dd>{CLINIC.address}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd><a href={`tel:${CLINIC.phone.replace(/\s/g, '')}`}>{CLINIC.phone}</a></dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd><a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a></dd>
              </div>
            </dl>
            <h3 className="ps-hours-title">Hours</h3>
            <ul className="ps-hours">
              {CLINIC.hours.map((h) => (
                <li key={h.day}>
                  <span>{h.day}</span>
                  <strong>{h.time}</strong>
                </li>
              ))}
            </ul>
            {!signedIn && (
              <p className="ps-contact-note">
                Already registered? <Link to="/patient/login">Sign in to your portal</Link> for bookings and reports.
              </p>
            )}
          </div>
          <div className="ps-contact-form-card" data-reveal="right" style={{ ['--d' as string]: '140ms' }}>
            <PatientEnquiryForm
              title="Enquiry & call back"
              lead="Choose a purpose — appointments, lab at home, pharmacy, or a general question."
              submitLabel="Submit enquiry"
              compact
            />
          </div>
        </div>
      </section>
    </PatientSiteLayout>
  )
}
