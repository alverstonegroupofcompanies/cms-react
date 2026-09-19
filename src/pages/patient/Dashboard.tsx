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
  IconPill,
  IconUser,
} from '../../components/Icons'
import { useAuth } from '../../context/AuthContext'
import {
  cancelAppointment,
  getAppointments,
  getLabOrders,
  getMyActiveQueue,
  getPrescriptions,
} from '../../api/client'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { Appointment, LabOrder, Prescription } from '../../api/types'

type ActiveQueue = {
  status: string
  status_label: string
  display_code: string
  position?: number | null
  estimated_wait_minutes?: number
  queue_length?: number
  joined_at?: string | null
  called_at?: string | null
  token?: {
    id: number
    display_code: string
    status: string
    doctor?: { id: number; name: string; specialization?: string }
    appointment?: { id: number; slot_time?: string; appointment_date?: string } | null
  }
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
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

function appointmentStatusLabel(a: Appointment) {
  if (a.status === 'checked_in') {
    return a.queue_token?.status === 'in_consultation' ? 'With doctor' : 'In queue'
  }
  if (a.status === 'booked' && a.queue_token && ['waiting', 'in_consultation'].includes(a.queue_token.status)) {
    return a.queue_token.status === 'in_consultation' ? 'With doctor' : 'In queue'
  }
  if (a.status === 'booked') return 'Scheduled'
  if (a.status === 'completed') return 'Completed'
  if (a.status === 'cancelled') return 'Cancelled'
  if (a.status === 'no_show') return 'Missed'
  return a.status.replace(/_/g, ' ')
}

function labOrderHasResults(o: LabOrder): boolean {
  if (o.report) return true
  if (o.status === 'completed') return true
  return (o.items || []).some((item) => {
    const results = item.results
    if (!results || typeof results !== 'object') return false
    return Object.values(results).some((v) => String(v ?? '').trim() !== '')
  })
}

function isQueuedAppointment(a: Appointment) {
  return (
    a.status === 'checked_in' ||
    Boolean(a.queue_token && ['waiting', 'in_consultation'].includes(a.queue_token.status))
  )
}

function formatSlotAmPm(slot?: string | null) {
  if (!slot) return '—'
  const [h, m] = slot.slice(0, 5).split(':').map(Number)
  if (Number.isNaN(h)) return slot.slice(0, 5)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = ((h + 11) % 12) + 1
  return `${hour}:${String(m || 0).padStart(2, '0')} ${ampm}`
}

function formatShortDate(iso?: string | null) {
  if (!iso) return '—'
  return new Date(String(iso).slice(0, 10) + 'T12:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

export default function PatientDashboard() {
  const { user } = useAuth()
  usePageTitle('Home', 'Patient')
  const name = user?.patient?.name || user?.name || 'Patient'
  const firstName = name.split(' ')[0]
  const patientId = user?.patient?.id
  const patient = user?.patient

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [labOrders, setLabOrders] = useState<LabOrder[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [activeQueue, setActiveQueue] = useState<ActiveQueue | null>(null)
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
      getPrescriptions({ patient_id: patientId }).catch(() => ({ data: [] })),
      getMyActiveQueue().catch(() => ({ data: { in_queue: false, queue: null } })),
    ])
      .then(([apptRes, labRes, rxRes, queueRes]) => {
        setAppointments(parseList<Appointment>(apptRes.data))
        setLabOrders(parseList<LabOrder>(labRes.data))
        setPrescriptions(parseList<Prescription>(rxRes.data))
        const q = (queueRes as { data?: { in_queue?: boolean; queue?: ActiveQueue | null } }).data
        setActiveQueue(q?.in_queue && q.queue ? q.queue : null)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!patientId) {
      setLoading(false)
      return
    }
    loadAppointments()
    const onFocus = () => loadAppointments()
    window.addEventListener('focus', onFocus)
    const timer = window.setInterval(loadAppointments, 8000)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.clearInterval(timer)
    }
  }, [patientId])

  const { upcoming, completed, labHighlight, pendingLab, nextAppt, missedAppt, lastVisit, activeRx } =
    useMemo(() => {
      const upcomingList = appointments.filter(isUpcomingAppointment)
      const missedList = appointments.filter(isMissedAppointment)
      const completedList = appointments.filter((a) => a.status === 'completed')
      const activeLabs = labOrders.filter((o) => o.status !== 'cancelled')
      const pendingLabs = activeLabs.filter((o) => !labOrderHasResults(o))
      const ready = activeLabs.filter((o) => labOrderHasResults(o)).length
      const pending = pendingLabs.length

      const queued = [...upcomingList]
        .filter(isQueuedAppointment)
        .sort((a, b) => appointmentStart(a).getTime() - appointmentStart(b).getTime())[0]
      const next =
        queued ||
        [...upcomingList].sort((a, b) => appointmentStart(a).getTime() - appointmentStart(b).getTime())[0]
      const missed = [...missedList].sort(
        (a, b) => appointmentStart(b).getTime() - appointmentStart(a).getTime()
      )[0]
      const last = [...completedList].sort(
        (a, b) => appointmentStart(b).getTime() - appointmentStart(a).getTime()
      )[0]
      const pendingLabOrder = [...pendingLabs].sort((a, b) => {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0
        return tb - ta
      })[0]

      const rxActive = prescriptions.filter((p) => !['cancelled', 'dispensed'].includes(p.status))

      return {
        upcoming: upcomingList.length,
        completed: completedList.length,
        labHighlight: {
          count: pending > 0 ? pending : ready,
          label: pending > 0 ? 'pending results' : ready > 0 ? 'reports ready' : 'pending results',
        },
        pendingLab: pendingLabOrder || null,
        nextAppt: next || null,
        missedAppt: missed || null,
        lastVisit: last || null,
        activeRx: rxActive.slice(0, 3),
      }
    }, [appointments, labOrders, prescriptions])

  const formatApptDate = (a: Appointment) => {
    const d = new Date(a.appointment_date.split('T')[0] + 'T00:00:00')
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const featured = missedAppt || nextAppt
  const isMissedFeature = Boolean(missedAppt) && !activeQueue
  const showQueueHero = Boolean(activeQueue) && !isMissedFeature
  const queueDoctor = activeQueue?.token?.doctor
  const queueStatusLabel =
    activeQueue?.status_label || (activeQueue?.status === 'in_consultation' ? 'With doctor' : 'In queue')
  const featuredStatusLabel = featured ? appointmentStatusLabel(featured) : 'Scheduled'
  const featuredIsQueued = featured ? isQueuedAppointment(featured) || showQueueHero : showQueueHero
  const tokenCode =
    (showQueueHero && (activeQueue?.display_code || activeQueue?.token?.display_code)) ||
    featured?.queue_token?.display_code ||
    null

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

  const visitDoctor = showQueueHero ? queueDoctor : featured?.doctor
  const visitTitle = showQueueHero
    ? activeQueue?.status === 'in_consultation'
      ? 'Please go in to see the doctor'
      : "You are in today's queue"
    : featured
      ? formatApptDate(featured)
      : 'Book your next clinic visit'
  const visitMeta = showQueueHero
    ? activeQueue?.status === 'waiting' && activeQueue.position != null
      ? `Position #${activeQueue.position}${
          activeQueue.estimated_wait_minutes != null
            ? ` · ~${activeQueue.estimated_wait_minutes} min wait`
            : ''
        }`
      : queueStatusLabel
    : featured
      ? `${formatSlotAmPm(featured.slot_time)} · 30 min consultation`
      : 'Choose department, doctor, and an available slot'

  return (
    <PatientLayout>
      <div className="po-page">
        <section
          className="po-hero"
          data-reveal="hero"
          style={{ backgroundImage: "url('/images/patient-site-banner.jpg')" }}
        >
          <div className="ps-hero-orb" aria-hidden />
          <div className="ps-hero-scan" aria-hidden />
          <div className="po-hero-inner">
            <p className="ps-kicker po-hero-line" style={{ ['--d' as string]: '0ms' }}>
              {greeting()} · Care overview
            </p>
            <h1 className="po-hero-line" style={{ ['--d' as string]: '80ms' }}>
              Welcome back, <span>{firstName}</span>
            </h1>
            <p className="po-hero-lead po-hero-line" style={{ ['--d' as string]: '160ms' }}>
              Book visits, follow your queue, and open labs or prescriptions — the same calm
              experience as the Alverstone Medcity website.
            </p>
            <div className="ps-hero-actions po-hero-line" style={{ ['--d' as string]: '240ms' }}>
              <Link to="/patient/book" className="ps-btn ps-btn-lg">
                <IconCalendar size={16} /> Book a visit
              </Link>
              <Link to="/patient/appointments" className="ps-btn-ghost">
                My visits
              </Link>
            </div>
          </div>
        </section>

        {actionError && (
          <div className="po-wrap">
            <div className="ph-alert ph-alert-error">{actionError}</div>
          </div>
        )}

        <section className="ps-section po-section">
          <div className="ps-section-head" data-reveal>
            <p className="ps-kicker ps-kicker-dark">Snapshot</p>
            <h2>Your care at a glance</h2>
            <p>Live counts from your account — visits and lab work in one place.</p>
          </div>
          <div className="po-stat-grid" data-reveal>
            <article className="po-stat-card po-stat-card--teal">
              <em>Upcoming</em>
              <strong>{loading ? '—' : upcoming}</strong>
              <span>{upcoming === 1 ? 'visit scheduled' : 'visits scheduled'}</span>
            </article>
            <article className="po-stat-card po-stat-card--navy">
              <em>Completed</em>
              <strong>{loading ? '—' : completed}</strong>
              <span>{completed === 1 ? 'past visit' : 'past visits'}</span>
            </article>
            <article className="po-stat-card po-stat-card--mist">
              <em>Laboratory</em>
              <strong>{loading ? '—' : labHighlight.count}</strong>
              <span>
                {labHighlight.label === 'reports ready'
                  ? (labHighlight.count === 1 ? 'result ready' : 'results ready')
                  : (labHighlight.count === 1 ? 'result pending' : 'results pending')}
              </span>
            </article>
          </div>
        </section>

        <section className="ps-section po-section po-visit-section">
          <div className="ps-section-head" data-reveal>
            <p className="ps-kicker ps-kicker-dark">Today&apos;s visit</p>
            <h2>{featured || showQueueHero ? 'Current appointment' : 'Plan your next visit'}</h2>
            <p>
              {featured || showQueueHero
                ? 'Status, token, and doctor details for your active booking.'
                : 'Choose a department and doctor when you are ready.'}
            </p>
          </div>

          <article
            className={`po-visit-card${isMissedFeature ? ' is-missed' : ''}${
              featuredIsQueued ? ' is-live' : ''
            }`}
            data-reveal
          >
            {featured || showQueueHero ? (
              <>
                <div className="po-visit-top">
                  <span className={`po-pill${isMissedFeature ? ' is-warn' : ''}`}>
                    <IconCheck size={14} />
                    {isMissedFeature
                      ? 'Missed'
                      : featuredIsQueued
                        ? queueStatusLabel
                        : featuredStatusLabel}
                  </span>
                  {tokenCode && (
                    <div className="po-token">
                      <em>Token</em>
                      <strong>{tokenCode}</strong>
                    </div>
                  )}
                </div>
                <div className="po-visit-body">
                  <div className="po-visit-copy">
                    <h3>{visitTitle}</h3>
                    <p>
                      <IconClock size={15} /> {visitMeta}
                    </p>
                    {isMissedFeature && (
                      <p className="po-visit-note">
                        This visit was missed. Please reschedule or cancel the booking.
                      </p>
                    )}
                  </div>
                  <div className="po-doctor">
                    <div className="po-doctor-avatar">{(visitDoctor?.name || 'D').charAt(0)}</div>
                    <div>
                      <strong>{visitDoctor?.name || 'Doctor'}</strong>
                      <span>{visitDoctor?.specialization || 'General consultation'}</span>
                    </div>
                  </div>
                </div>
                <div className="po-visit-actions">
                  {!featuredIsQueued && featured && (
                    <button type="button" className="ps-btn" onClick={() => openReschedule(featured)}>
                      Reschedule
                    </button>
                  )}
                  {isMissedFeature ? (
                    <button
                      type="button"
                      className="ps-btn-outline"
                      onClick={handleCancelFeatured}
                      disabled={cancelling}
                    >
                      {cancelling ? 'Cancelling…' : 'Cancel'}
                    </button>
                  ) : (
                    <Link to="/patient/appointments" className="ps-btn-outline">
                      View details <span aria-hidden>→</span>
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="po-visit-top">
                  <span className="po-pill">No visit yet</span>
                </div>
                <div className="po-visit-body">
                  <div className="po-visit-copy">
                    <h3>Schedule your next check-up</h3>
                    <p>Choose department, doctor, and an available slot online.</p>
                  </div>
                </div>
                <div className="po-visit-actions">
                  <Link to="/patient/book" className="ps-btn">
                    Book appointment
                  </Link>
                </div>
              </>
            )}
          </article>
        </section>

        <section className="ps-section po-section">
          <div className="ps-section-head" data-reveal>
            <p className="ps-kicker ps-kicker-dark">Patient tools</p>
            <h2>Continue your care</h2>
            <p>The same tools from the homepage — ready for your account.</p>
          </div>
          <div className="ps-service-grid po-tools-grid">
            <Link
              to="/patient/book"
              className="ps-service-card ps-service-card--navy"
              data-reveal
              style={{ ['--d' as string]: '0ms' }}
            >
              <div className="ps-service-card-top">
                <span className="ps-service-index">01</span>
                <span className="ps-service-icon" aria-hidden><IconCalendar size={26} /></span>
              </div>
              <h3>Book a visit</h3>
              <p>Pick department, doctor, and a convenient slot.</p>
              <span className="ps-service-cta">Open booking <span aria-hidden>→</span></span>
            </Link>
            <Link
              to="/patient/appointments"
              className="ps-service-card ps-service-card--green"
              data-reveal
              style={{ ['--d' as string]: '80ms' }}
            >
              <div className="ps-service-card-top">
                <span className="ps-service-index">02</span>
                <span className="ps-service-icon" aria-hidden><IconClock size={26} /></span>
              </div>
              <h3>My visits</h3>
              <p>Upcoming, queued, and past appointments.</p>
              <span className="ps-service-cta">View visits <span aria-hidden>→</span></span>
            </Link>
            <Link
              to="/patient/lab-reports"
              className="ps-service-card ps-service-card--mist"
              data-reveal
              style={{ ['--d' as string]: '160ms' }}
            >
              <div className="ps-service-card-top">
                <span className="ps-service-index">03</span>
                <span className="ps-service-icon" aria-hidden><IconFlask size={26} /></span>
              </div>
              <h3>Lab reports</h3>
              <p>Pending orders and completed results.</p>
              <span className="ps-service-cta">Open labs <span aria-hidden>→</span></span>
            </Link>
            <Link
              to="/patient/prescriptions"
              className="ps-service-card ps-service-card--leaf"
              data-reveal
              style={{ ['--d' as string]: '240ms' }}
            >
              <div className="ps-service-card-top">
                <span className="ps-service-index">04</span>
                <span className="ps-service-icon" aria-hidden><IconPill size={26} /></span>
              </div>
              <h3>Prescriptions</h3>
              <p>Medicines from your clinic visits.</p>
              <span className="ps-service-cta">View Rx <span aria-hidden>→</span></span>
            </Link>
          </div>
        </section>

        <section className="ps-section po-section po-bottom">
          <div className="po-bottom-grid">
            <div className="po-panel" data-reveal>
              <div className="po-panel-head">
                <div>
                  <p className="ps-kicker ps-kicker-dark">Schedule</p>
                  <h3>Appointments</h3>
                </div>
                <Link to="/patient/appointments" className="po-panel-link">
                  View all →
                </Link>
              </div>
              <VisitsSection patientId={patientId} variant="timeline" />
            </div>

            <aside className="po-side" data-reveal style={{ ['--d' as string]: '100ms' }}>
              <div className="po-panel po-side-card">
                <div className="po-side-row">
                  <span className="po-side-ico"><IconUser size={18} /></span>
                  <div>
                    <strong>Patient record</strong>
                    <em>Profile, allergies, insurance</em>
                  </div>
                </div>
                <dl className="po-facts">
                  <div>
                    <dt>Patient ID</dt>
                    <dd>{patient?.patient_code || '—'}</dd>
                  </div>
                  <div>
                    <dt>Blood group</dt>
                    <dd>{patient?.blood_group || '—'}</dd>
                  </div>
                </dl>
                <Link to="/patient/profile" className="po-panel-link">Update profile →</Link>
              </div>

              <div className="po-panel po-side-card">
                <div className="po-side-row">
                  <span className="po-side-ico is-lab"><IconFlask size={18} /></span>
                  <div>
                    <strong>Laboratory</strong>
                    <em>
                      {loading
                        ? 'Loading…'
                        : pendingLab
                          ? `${labHighlight.count} result${labHighlight.count === 1 ? '' : 's'} pending · ordered ${formatShortDate(pendingLab.created_at)}`
                          : labHighlight.count > 0 && labHighlight.label === 'reports ready'
                            ? `${labHighlight.count} report${labHighlight.count === 1 ? '' : 's'} ready`
                            : 'No pending lab work'}
                    </em>
                  </div>
                </div>
                <Link to="/patient/lab-reports" className="po-panel-link">Open lab reports →</Link>
              </div>

              <div className="po-panel po-side-card">
                <div className="po-side-row">
                  <span className="po-side-ico is-clock"><IconClock size={18} /></span>
                  <div>
                    <strong>Last visit</strong>
                    <em>
                      {lastVisit
                        ? `${formatShortDate(lastVisit.appointment_date)} · ${lastVisit.doctor?.name || 'Clinic visit'}`
                        : 'No completed visits yet'}
                    </em>
                  </div>
                </div>
              </div>

              <div className="po-panel po-side-card">
                <div className="po-panel-head po-panel-head-compact">
                  <div>
                    <p className="ps-kicker ps-kicker-dark">Medicines</p>
                    <h3>Prescriptions</h3>
                  </div>
                  <Link to="/patient/prescriptions" className="po-panel-link">View all →</Link>
                </div>
                {activeRx.length === 0 ? (
                  <p className="po-empty">Nothing active yet. Prescriptions from visits will show here.</p>
                ) : (
                  <ul className="po-rx-list">
                    {activeRx.map((rx) => (
                      <li key={rx.id}>
                        <div>
                          <strong>Rx #{rx.id}</strong>
                          <span>{rx.doctor?.name || 'Doctor'} · {rx.status}</span>
                        </div>
                        <em>{rx.items?.length || 0} medicine{(rx.items?.length || 0) === 1 ? '' : 's'}</em>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
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
