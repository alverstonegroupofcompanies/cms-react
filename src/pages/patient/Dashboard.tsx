import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PatientLayout from '../../components/PatientLayout'
import RescheduleModal, { type RescheduleTarget } from '../../components/RescheduleModal'
import VisitsSection from '../../components/VisitsSection'
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconFlask,
  IconPhone,
  IconUser,
  IconUsers,
  IconX,
} from '../../components/Icons'
import { useAuth } from '../../context/AuthContext'
import { cancelAppointment, getAppointments, getLabOrders } from '../../api/client'
import type { Appointment, LabOrder } from '../../api/types'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function parseList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: T[] }).data)) {
    return (data as { data: T[] }).data
  }
  return []
}

function appointmentStart(a: Appointment): Date {
  const date = a.appointment_date.split('T')[0]
  const raw = (a.slot_time || '00:00:00').slice(0, 8)
  const time = raw.length === 5 ? `${raw}:00` : raw
  return new Date(`${date}T${time}`)
}

function isMissedAppointment(a: Appointment): boolean {
  if (a.status === 'no_show') return true
  if (a.status !== 'booked') return false
  return appointmentStart(a).getTime() < Date.now()
}

function isUpcomingAppointment(a: Appointment): boolean {
  if (['cancelled', 'completed', 'no_show'].includes(a.status)) return false
  if (a.status === 'booked' && appointmentStart(a).getTime() < Date.now()) return false
  return appointmentStart(a).getTime() >= Date.now() || a.status === 'checked_in'
}

function SunIcon() {
  return (
    <svg className="ph-sun" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" fill="#FBBF24" />
      <g stroke="#FBBF24" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="4.5" y1="4.5" x2="6.5" y2="6.5" />
        <line x1="17.5" y1="17.5" x2="19.5" y2="19.5" />
        <line x1="17.5" y1="6.5" x2="19.5" y2="4.5" />
        <line x1="4.5" y1="19.5" x2="6.5" y2="17.5" />
      </g>
    </svg>
  )
}

function DropIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.7c.4 0 7 7.2 7 11.3a7 7 0 1 1-14 0C5 9.9 11.6 2.7 12 2.7z" />
    </svg>
  )
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const name = user?.patient?.name || user?.name || 'Patient'
  const firstName = name.split(' ')[0]
  const patientId = user?.patient?.id
  const patient = user?.patient

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [labOrders, setLabOrders] = useState<LabOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [rescheduleTarget, setRescheduleTarget] = useState<RescheduleTarget | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [actionError, setActionError] = useState('')

  const loadAppointments = () => {
    if (!patientId) return
    setLoading(true)
    Promise.all([
      getAppointments({ patient_id: patientId }),
      getLabOrders({ patient_id: patientId }),
    ])
      .then(([apptRes, labRes]) => {
        setAppointments(parseList<Appointment>(apptRes.data))
        setLabOrders(parseList<LabOrder>(labRes.data))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!patientId) {
      setLoading(false)
      return
    }
    loadAppointments()
  }, [patientId])

  const { upcoming, completed, pendingLabs, nextAppt, missedAppt, lastVisit } = useMemo(() => {
    const upcomingList = appointments.filter(isUpcomingAppointment)
    const missedList = appointments.filter(isMissedAppointment)
    const completedList = appointments.filter((a) => a.status === 'completed')
    const next = [...upcomingList].sort((a, b) =>
      appointmentStart(a).getTime() - appointmentStart(b).getTime()
    )[0]
    const missed = [...missedList].sort((a, b) =>
      appointmentStart(b).getTime() - appointmentStart(a).getTime()
    )[0]
    const last = [...completedList].sort((a, b) =>
      appointmentStart(b).getTime() - appointmentStart(a).getTime()
    )[0]
    return {
      upcoming: upcomingList.length,
      completed: completedList.length,
      pendingLabs: labOrders.filter((o) => !['completed', 'cancelled'].includes(o.status)).length,
      nextAppt: next,
      missedAppt: missed,
      lastVisit: last,
    }
  }, [appointments, labOrders])

  const formatApptDate = (a: Appointment) => {
    const d = new Date(a.appointment_date.split('T')[0] + 'T00:00:00')
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const featured = missedAppt || nextAppt
  const isMissedFeature = Boolean(missedAppt)

  const openReschedule = (a: Appointment) => {
    setActionError('')
    setRescheduleTarget({
      appointmentId: a.id,
      doctorId: a.doctor_id,
      doctorName: a.doctor?.name || 'Doctor',
      appointmentDate: a.appointment_date,
      slotTime: a.slot_time,
    })
  }

  const handleCancelFeatured = async () => {
    if (!featured) return
    if (!window.confirm('Cancel this appointment?')) return
    setCancelling(true)
    setActionError('')
    try {
      await cancelAppointment(featured.id)
      loadAppointments()
    } catch {
      setActionError('Could not cancel appointment. Please try again.')
    }
    setCancelling(false)
  }

  return (
    <PatientLayout>
      <div className="ph-dash">
        <header className="ph-welcome">
          <div className="ph-welcome-copy">
            <p className="ph-welcome-tag">
              {greeting()} <SunIcon />
            </p>
            <h1 className="ph-welcome-title">{firstName}</h1>
            <p className="ph-welcome-sub">Patient dashboard — appointments, records, and lab reports.</p>
          </div>

          <div className="ph-quick-stats">
            <Link to="/patient/appointments" className="ph-qstat ph-qstat-green">
              <span className="ph-qstat-icon"><IconCalendar size={18} /></span>
              <span className="ph-qstat-text">
                <strong>{loading ? '—' : upcoming}</strong> Upcoming
              </span>
              <span className="ph-qstat-arrow">→</span>
            </Link>
            <Link to="/patient/appointments" className="ph-qstat ph-qstat-purple">
              <span className="ph-qstat-icon"><IconCheck size={18} /></span>
              <span className="ph-qstat-text">
                <strong>{loading ? '—' : completed}</strong> Completed
              </span>
              <span className="ph-qstat-arrow">→</span>
            </Link>
            <Link to="/patient/lab-reports" className="ph-qstat ph-qstat-orange">
              <span className="ph-qstat-icon"><IconFlask size={18} /></span>
              <span className="ph-qstat-text">
                <strong>{loading ? '—' : pendingLabs}</strong> Lab pending
              </span>
              <span className="ph-qstat-arrow">→</span>
            </Link>
          </div>
        </header>

        {actionError && <div className="ph-alert ph-alert-error">{actionError}</div>}

        <div className="ph-bento">
          <section className={`ph-feature-card${isMissedFeature ? ' is-missed' : ' is-next'}`}>
            <div className="ph-feature-body">
              {featured ? (
                <>
                  <div className="ph-feature-top">
                    <span className={`ph-alert-pill${isMissedFeature ? ' danger' : ' ok'}`}>
                      {isMissedFeature ? '⚠ Missed appointment' : '✓ Next appointment'}
                    </span>
                    <span className={`ph-badge ${isMissedFeature ? 'ph-badge-missed' : 'ph-badge-live'}`}>
                      {isMissedFeature ? 'Missed' : 'Scheduled'}
                    </span>
                  </div>
                  {isMissedFeature && (
                    <p className="ph-feature-missed-msg">
                      This visit was missed. Please reschedule a new slot or cancel the booking.
                    </p>
                  )}
                  <h2 className="ph-feature-date">
                    <IconCalendar size={22} /> {formatApptDate(featured)}
                  </h2>
                  <p className="ph-feature-time">
                    <IconClock size={16} /> {featured.slot_time?.slice(0, 5)} · 30 minute consultation
                  </p>
                  <div className="ph-feature-doctor">
                    <div className="ph-feature-doc-avatar">
                      {(featured.doctor?.name || 'D').charAt(0)}
                    </div>
                    <div>
                      <p className="ph-feature-doc-name">{featured.doctor?.name || 'Doctor'}</p>
                      <p className="ph-feature-doc-spec">
                        {featured.doctor?.specialization || 'General consultation'}
                      </p>
                    </div>
                  </div>
                  <div className="ph-feature-actions">
                    <button type="button" className="ph-btn ph-btn-primary" onClick={() => openReschedule(featured)}>
                      <IconCalendar size={16} /> Reschedule
                    </button>
                    {isMissedFeature ? (
                      <button
                        type="button"
                        className="ph-btn ph-btn-outline"
                        onClick={handleCancelFeatured}
                        disabled={cancelling}
                      >
                        <IconX size={16} /> {cancelling ? 'Cancelling…' : 'Cancel'}
                      </button>
                    ) : (
                      <Link to="/patient/appointments" className="ph-btn ph-btn-outline">
                        View details
                      </Link>
                    )}
                  </div>
                  {isMissedFeature && nextAppt && (
                    <p className="ph-feature-next-hint">
                      ℹ You also have an upcoming visit on {formatApptDate(nextAppt)} at{' '}
                      {nextAppt.slot_time?.slice(0, 5)}.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="ph-feature-top">
                    <span className="ph-alert-pill ok">Book a visit</span>
                  </div>
                  <h2 className="ph-feature-date">Schedule your next check-up</h2>
                  <p className="ph-feature-time">Choose department, doctor, and an available slot.</p>
                  <Link to="/patient/book" className="ph-btn ph-btn-primary ph-btn-lg">
                    <IconCalendar size={16} /> Book appointment
                  </Link>
                </>
              )}
            </div>
            <div className="ph-feature-art" aria-hidden>
              <div className="ph-feature-art-circle" />
              <div className="ph-feature-art-doc">+</div>
            </div>
          </section>

          <section className="ph-side-card ph-record-card">
            <div className="ph-side-card-head">
              <span className="ph-side-title"><IconCalendar size={16} /> Patient record</span>
              <Link to="/patient/profile" className="ph-side-link">View details →</Link>
            </div>
            <div className="ph-record-grid">
              <div className="ph-record-item">
                <span className="ph-record-ico"><IconUser size={14} /></span>
                <div>
                  <span className="ph-profile-key">Patient ID</span>
                  <span className="ph-profile-val">{patient?.patient_code || '—'}</span>
                </div>
              </div>
              <div className="ph-record-item">
                <span className="ph-record-ico blood"><DropIcon /></span>
                <div>
                  <span className="ph-profile-key">Blood group</span>
                  <span className="ph-profile-val ph-profile-highlight">{patient?.blood_group || '—'}</span>
                </div>
              </div>
              <div className="ph-record-item">
                <span className="ph-record-ico"><IconUsers size={14} /></span>
                <div>
                  <span className="ph-profile-key">Gender</span>
                  <span className="ph-profile-val">{patient?.gender || '—'}</span>
                </div>
              </div>
              <div className="ph-record-item">
                <span className="ph-record-ico"><IconPhone size={14} /></span>
                <div>
                  <span className="ph-profile-key">Phone</span>
                  <span className="ph-profile-val">{patient?.phone || user?.phone || '—'}</span>
                </div>
              </div>
            </div>
            <Link to="/patient/profile" className="ph-card-cta ph-card-cta-green">
              <IconUser size={16} /> Update profile →
            </Link>
          </section>

          <section className="ph-side-card ph-lab-card">
            <div className="ph-side-card-head">
              <span className="ph-side-title"><IconFlask size={16} /> Laboratory</span>
            </div>
            <p className="ph-lab-count">{loading ? '—' : pendingLabs}</p>
            <p className="ph-lab-sub">pending results</p>
            <div className="ph-lab-art" aria-hidden />
            <Link to="/patient/lab-reports" className="ph-card-cta ph-card-cta-blue">
              <IconFlask size={16} /> Open lab reports →
            </Link>
          </section>

          <section className="ph-side-card ph-last-card">
            <div className="ph-side-card-head">
              <span className="ph-side-title"><IconClock size={16} /> Last visit</span>
            </div>
            {lastVisit ? (
              <>
                <p className="ph-last-date">
                  {new Date(lastVisit.appointment_date.split('T')[0] + 'T00:00:00').toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <p className="ph-last-doc">{lastVisit.doctor?.name}</p>
                <span className="ph-badge ph-badge-done">Completed</span>
              </>
            ) : (
              <div className="ph-last-empty-wrap">
                <div className="ph-last-empty-art" aria-hidden>
                  <IconCheck size={28} />
                </div>
                <p className="ph-last-empty">No completed visits on record</p>
              </div>
            )}
          </section>
        </div>

        <section className="ph-activity">
          <div className="ph-activity-head">
            <div>
              <h2 className="ph-section-title">Appointments</h2>
              <p className="ph-section-sub">Upcoming and recent clinic visits</p>
            </div>
            <Link to="/patient/appointments" className="ph-link-arrow">View all →</Link>
          </div>
          <div className="ph-activity-body">
            <VisitsSection patientId={patientId} variant="timeline" />
          </div>
        </section>
      </div>

      <RescheduleModal
        target={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onSuccess={loadAppointments}
      />
    </PatientLayout>
  )
}
