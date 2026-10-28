import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PatientLayout from '../../components/PatientLayout'
import DoctorAvatar from '../../components/DoctorAvatar'
import RescheduleModal, { type RescheduleTarget } from '../../components/RescheduleModal'
import VisitsSection from '../../components/VisitsSection'
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconFlask,
  IconHeart,
  IconPhone,
  IconPill,
  IconQueue,
  IconStethoscope,
} from '../../components/Icons'
import { useAuth } from '../../context/AuthContext'
import {
  cancelAppointment,
  getAppointments,
  getLabOrders,
  getMyActiveQueue,
  getPrescriptions,
} from '../../api/client'
import { CLINIC } from '../../config/clinic'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { Appointment, LabOrder, Prescription } from '../../api/types'
import { formatAppointmentDate, toDateOnlyString } from '../../utils/dateUtils'

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
    doctor?: { id: number; name: string; specialization?: string; photo_url?: string | null }
    appointment?: { id: number; slot_time?: string; appointment_date?: string } | null
  }
}

const QUICK_SPECIALTIES = [
  { label: 'General Medicine', dept: 'General & Internal Medicine' },
  { label: 'Cardiology', dept: 'Cardiology & Heart Care' },
  { label: 'Pediatrics', dept: 'Pediatrics & Child Wellness' },
  { label: 'Geriatrics', dept: 'Geriatrics & Elder Care' },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function todayFormatted() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function parseList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: T[] }).data)) {
    return (data as { data: T[] }).data
  }
  return []
}

function appointmentStart(a: Appointment): Date {
  const date = toDateOnlyString(a.appointment_date)
  const raw = (a.slot_time || '00:00:00').slice(0, 8)
  const time = raw.length === 5 ? `${raw}:00` : raw
  return new Date(`${date}T${time}`)
}

function isTodayDate(dateStr: string): boolean {
  const today = new Date()
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return toDateOnlyString(dateStr) === todayIso
}

function isMissedAppointment(a: Appointment): boolean {
  if (a.status === 'cancelled' || a.status === 'completed') return false
  if (a.status === 'no_show') return true
  if (a.status === 'checked_in' && !isTodayDate(a.appointment_date) && appointmentStart(a).getTime() < Date.now()) {
    return true
  }
  if (a.status !== 'booked') return false
  return appointmentStart(a).getTime() < Date.now()
}

function isUpcomingAppointment(a: Appointment): boolean {
  if (['cancelled', 'completed', 'no_show'].includes(a.status)) return false
  if (isMissedAppointment(a)) return false
  return appointmentStart(a).getTime() >= Date.now() || (a.status === 'checked_in' && isTodayDate(a.appointment_date))
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
  if (isMissedAppointment(a) || a.status === 'cancelled' || a.status === 'completed') return false
  if (!isTodayDate(a.appointment_date)) return false
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
  usePageTitle('Care Overview', 'Patient')
  const name = user?.patient?.name || user?.name || 'Patient'
  const firstName = name.split(' ')[0]
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
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
    const onApptsChanged = () => loadAppointments()
    window.addEventListener('focus', onFocus)
    window.addEventListener('appointments:changed', onApptsChanged)
    const timer = window.setInterval(loadAppointments, 8000)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('appointments:changed', onApptsChanged)
      window.clearInterval(timer)
    }
  }, [patientId])

  const {
    upcoming,
    completed,
    readyLabsCount,
    pendingLabsCount,
    labHighlight,
    latestLab,
    nextAppt,
    missedAppt,
    lastVisit,
    activeRx,
  } = useMemo(() => {
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
    const sortedLabs = [...activeLabs].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0
      return tb - ta
    })
    const pendingLabOrder = [...pendingLabs].sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0
      return tb - ta
    })[0]

    const rxActive = prescriptions.filter((p) => !['cancelled', 'dispensed'].includes(p.status))

    return {
      upcoming: upcomingList.length,
      completed: completedList.length,
      readyLabsCount: ready,
      pendingLabsCount: pending,
      labHighlight: {
        count: pending > 0 ? pending : ready,
        label: pending > 0 ? 'pending results' : ready > 0 ? 'reports ready' : 'pending results',
      },
      latestLab: pendingLabOrder || sortedLabs[0] || null,
      nextAppt: next || null,
      missedAppt: missed || null,
      lastVisit: last || null,
      activeRx: rxActive.slice(0, 3),
    }
  }, [appointments, labOrders, prescriptions])

  const formatApptDate = (a: Appointment) => {
    return formatAppointmentDate(a.appointment_date)
  }

  const featured = missedAppt || nextAppt
  const isMissedFeature = Boolean(missedAppt) && !activeQueue
  const showQueueHero = Boolean(activeQueue) && !isMissedFeature
  const queueDoctor = activeQueue?.token?.doctor
  const queueStatusLabel =
    activeQueue?.status_label || (activeQueue?.status === 'in_consultation' ? 'With doctor' : 'In queue')
  const featuredStatusLabel = featured ? appointmentStatusLabel(featured) : 'Scheduled'
  const featuredIsQueued = featured ? (!isMissedFeature && isQueuedAppointment(featured)) || showQueueHero : showQueueHero
  const tokenCode =
    (showQueueHero && (activeQueue?.display_code || activeQueue?.token?.display_code)) ||
    (!isMissedFeature ? featured?.queue_token?.display_code : null) ||
    null

  const journeyStep = useMemo(() => {
    if (!featured && !showQueueHero) return 0
    if (activeQueue?.status === 'in_consultation' || featured?.queue_token?.status === 'in_consultation') {
      return 4
    }
    if (featuredIsQueued) return 3
    if (tokenCode) return 2
    return 1
  }, [featured, showQueueHero, activeQueue, featuredIsQueued, tokenCode])

  const openReschedule = (a: Appointment) => {
    setActionError('')
    setRescheduleTarget({
      appointmentId: a.id,
      doctorId: a.doctor_id,
      doctorName: a.doctor?.name || 'Doctor',
      doctorPhotoUrl: a.doctor?.photo_url,
      appointmentDate: a.appointment_date,
      slotTime: a.slot_time,
    })
  }

  const handleCancelFeatured = async () => {
    if (!featured || cancelling) return
    setCancelling(true)
    setActionError('')

    const targetDate = toDateOnlyString(featured.appointment_date)
    const targetIds = appointments
      .filter(
        (a) =>
          a.id === featured.id ||
          (isMissedAppointment(a) &&
            a.doctor_id === featured.doctor_id &&
            toDateOnlyString(a.appointment_date) === targetDate)
      )
      .map((a) => a.id)

    setAppointments((prev) =>
      prev.map((a) => (targetIds.includes(a.id) ? { ...a, status: 'cancelled' } : a))
    )

    try {
      await Promise.all(targetIds.map((id) => cancelAppointment(id)))
      window.dispatchEvent(new CustomEvent('appointments:changed'))
      loadAppointments()
    } catch {
      setActionError('Could not cancel appointment. Please try again.')
      loadAppointments()
    } finally {
      setCancelling(false)
    }
  }

  const visitDoctor = showQueueHero ? queueDoctor : featured?.doctor
  const visitTitle = showQueueHero
    ? activeQueue?.status === 'in_consultation'
      ? 'Doctor is ready for your consultation'
      : "You are checked into today's live queue"
    : featured
      ? formatApptDate(featured)
      : 'Ready when you need care'
  const visitMeta = showQueueHero
    ? activeQueue?.status === 'waiting' && activeQueue.position != null
      ? `Queue Position #${activeQueue.position}${
          activeQueue.estimated_wait_minutes != null
            ? ` · Est. wait ~${activeQueue.estimated_wait_minutes} mins`
            : ''
        }`
      : queueStatusLabel
    : featured
      ? `${formatSlotAmPm(featured.slot_time)} · 30 min specialist consultation`
      : 'Choose a department below or open the slot calendar to reserve your visit.'

  return (
    <PatientLayout>
      <div className="po-flow">
        {/* ==================================================================
            1. FLUID EDITORIAL HERO CANVAS (NO BOXES — SWEPT ORGANIC HEADER)
            ================================================================== */}
        <section
          className="po-flow-hero"
          data-reveal="hero"
          style={{ backgroundImage: "url('/images/patient-site-banner.jpg')" }}
        >
          <div className="po-flow-hero-veil" aria-hidden />

          <div className="po-flow-hero-inner">
            {/* Inline Patient Identity Strip (Borderless) */}
            <div className="po-flow-meta-bar po-hero-line" style={{ ['--d' as string]: '0ms' }}>
              <span className="po-flow-date">{todayFormatted()}</span>
              <span className="po-flow-dot" />
              <span className="po-flow-id">
                ID {patient?.patient_code || `PT-${String(patientId || 101).padStart(4, '0')}`}
              </span>
              {patient?.blood_group && (
                <>
                  <span className="po-flow-dot" />
                  <span className="po-flow-id">Blood Group {patient.blood_group}</span>
                </>
              )}
              <span className="po-flow-dot" />
              <Link to="/patient/profile" className="po-flow-profile-link">
                <span className="po-flow-avatar-mini">{initials}</span>
                <span>{name}</span>
                <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="po-flow-hero-main">
              <div className="po-flow-hero-copy">
                <h1 className="po-hero-line" style={{ ['--d' as string]: '70ms' }}>
                  {greeting()}, <em>{firstName}.</em>
                </h1>
                <p className="po-flow-lead po-hero-line" style={{ ['--d' as string]: '140ms' }}>
                  Your personal health stream at Alverstone Medcity — follow your live consultation
                  queue, review verified diagnostic results, and manage prescriptions in one calm,
                  open space.
                </p>

                <div className="po-flow-actions po-hero-line" style={{ ['--d' as string]: '200ms' }}>
                  <Link to="/patient/book" className="po-pill-primary">
                    <IconCalendar size={17} />
                    <span>Schedule a Consultation</span>
                  </Link>
                  <Link to="/patient/appointments" className="po-pill-ghost">
                    <IconQueue size={17} />
                    <span>Live Queue & Visits</span>
                  </Link>
                </div>
              </div>

              {/* Open Typographic Metric Stream (Zero Boxes — Pure Numbers & Hairlines) */}
              <div className="po-flow-metrics po-hero-line" style={{ ['--d' as string]: '240ms' }}>
                <Link to="/patient/appointments" className="po-flow-stat">
                  <span className="po-flow-stat-num">
                    {loading ? '—' : String(upcoming).padStart(2, '0')}
                  </span>
                  <span className="po-flow-stat-label">Upcoming Visits</span>
                  <small>{upcoming === 1 ? '1 active slot' : `${upcoming} scheduled`}</small>
                </Link>

                <Link to="/patient/appointments" className="po-flow-stat">
                  <span className="po-flow-stat-num">
                    {loading ? '—' : tokenCode ? tokenCode : featuredIsQueued ? 'LIVE' : '—'}
                  </span>
                  <span className="po-flow-stat-label">Queue Token</span>
                  <small>{featuredIsQueued ? queueStatusLabel : 'Standby'}</small>
                </Link>

                <Link to="/patient/lab-reports" className="po-flow-stat">
                  <span className="po-flow-stat-num">
                    {loading ? '—' : String(labHighlight.count).padStart(2, '0')}
                  </span>
                  <span className="po-flow-stat-label">Lab Reports</span>
                  <small>
                    {pendingLabsCount > 0
                      ? `${pendingLabsCount} processing`
                      : readyLabsCount > 0
                        ? `${readyLabsCount} verified`
                        : 'All clear'}
                  </small>
                </Link>

                <Link to="/patient/prescriptions" className="po-flow-stat">
                  <span className="po-flow-stat-num">
                    {loading ? '—' : String(prescriptions.length).padStart(2, '0')}
                  </span>
                  <span className="po-flow-stat-label">Prescriptions</span>
                  <small>{activeRx.length > 0 ? `${activeRx.length} active Rx` : `${completed} past visits`}</small>
                </Link>
              </div>
            </div>
          </div>

          {/* Organic Curved Wave Transition into Canvas */}
          <svg
            className="po-flow-wave"
            viewBox="0 0 1440 56"
            fill="none"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M0 56H1440V18C1240 52 980 58 720 38C460 18 200 2 0 28V56Z"
              fill="#faf6f2"
            />
          </svg>
        </section>

        <div className="po-flow-canvas">
          {actionError && (
            <div className="ph-alert ph-alert-error" style={{ marginBottom: '2rem' }}>
              {actionError}
            </div>
          )}

          {/* ==================================================================
              2. OPEN ACTIVE CONSULTATION STAGE (BORDERLESS EDITORIAL SPLIT)
              ================================================================== */}
          <section className="po-stage" data-reveal>
            <div className="po-stage-left">
              <div className="po-stage-kicker-row">
                <span className="po-stage-eyebrow">
                  {featured || showQueueHero ? 'Active Consultation Stage' : 'Next Consultation'}
                </span>
                {(featured || showQueueHero) && (
                  <span className={`po-stage-status ${isMissedFeature ? 'is-warn' : featuredIsQueued ? 'is-live' : ''}`}>
                    <IconCheck size={13} />
                    {isMissedFeature ? 'Missed Slot' : featuredIsQueued ? queueStatusLabel : featuredStatusLabel}
                  </span>
                )}
                {tokenCode && <span className="po-stage-token">Token {tokenCode}</span>}
              </div>

              <h2 className="po-stage-title">{visitTitle}</h2>
              <p className="po-stage-sub">
                <IconClock size={16} />
                <span>{visitMeta}</span>
              </p>

              {isMissedFeature && (
                <p className="po-stage-missed-note">
                  This scheduled time slot has passed. Please pick a new time slot or cancel the visit.
                </p>
              )}

              {/* Borderless Continuous Line Progress Track */}
              {(featured || showQueueHero) && !isMissedFeature && (
                <div className="po-line-progress" aria-label="Consultation progress">
                  <div className="po-line-track">
                    <div
                      className="po-line-fill"
                      style={{ width: `${Math.min(100, Math.max(15, ((journeyStep - 1) / 3) * 100))}%` }}
                    />
                  </div>
                  <div className="po-line-steps">
                    {[
                      { step: 1, label: 'Slot Booked' },
                      { step: 2, label: 'Token Issued' },
                      { step: 3, label: 'In Queue' },
                      { step: 4, label: 'With Doctor' },
                    ].map((s) => {
                      const isDone = journeyStep > s.step
                      const isCurrent = journeyStep === s.step
                      return (
                        <div
                          key={s.step}
                          className={`po-line-node ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}`}
                        >
                          <span className="po-line-dot">
                            {isDone ? <IconCheck size={11} /> : s.step}
                          </span>
                          <span className="po-line-label">{s.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quick Department Pills when no appointment */}
              {!featured && !showQueueHero && (
                <div className="po-stage-depts">
                  {QUICK_SPECIALTIES.map((s) => (
                    <Link
                      key={s.label}
                      to={`/patient/book?dept=${encodeURIComponent(s.dept)}`}
                      className="po-stage-dept-pill"
                    >
                      <IconStethoscope size={14} />
                      <span>{s.label}</span>
                      <span aria-hidden>→</span>
                    </Link>
                  ))}
                </div>
              )}

              <div className="po-stage-actions">
                {featured || showQueueHero ? (
                  <>
                    {!featuredIsQueued && featured && (
                      <button type="button" className="ps-btn" onClick={() => openReschedule(featured)}>
                        <IconCalendar size={15} /> Reschedule Slot
                      </button>
                    )}
                    {isMissedFeature ? (
                      <button
                        type="button"
                        className="ps-btn-outline"
                        onClick={handleCancelFeatured}
                        disabled={cancelling}
                      >
                        {cancelling ? 'Cancelling…' : 'Cancel Booking'}
                      </button>
                    ) : (
                      <Link to="/patient/appointments" className="po-link-arrow">
                        <span>Open full visit pass</span>
                        <span aria-hidden>→</span>
                      </Link>
                    )}
                  </>
                ) : (
                  <Link to="/patient/book" className="ps-btn">
                    <IconCalendar size={16} /> Book an Appointment
                  </Link>
                )}
              </div>
            </div>

            {/* Right: Sculpted Circular Doctor Lockup (No Box) */}
            <div className="po-stage-right">
              {featured || showQueueHero ? (
                <div className="po-doctor-halo">
                  <div className="po-doctor-halo-ring">
                    <DoctorAvatar
                      doctorId={visitDoctor?.id}
                      name={visitDoctor?.name}
                      photoUrl={visitDoctor?.photo_url}
                      className="po-doctor-halo-avatar"
                    />
                  </div>
                  <div className="po-doctor-halo-copy">
                    <span className="po-stage-eyebrow">Consulting Specialist</span>
                    <strong>{visitDoctor?.name || 'Assigned Physician'}</strong>
                    <em>{visitDoctor?.specialization || 'Multispecialty OPD'}</em>
                  </div>
                </div>
              ) : (
                <div className="po-doctor-halo">
                  <div className="po-doctor-halo-ring is-soft">
                    <IconStethoscope size={28} />
                  </div>
                  <div className="po-doctor-halo-copy">
                    <span className="po-stage-eyebrow"> Walk-In or Online</span>
                    <strong>8+ Clinical Specialties</strong>
                    <em>Same-day slots & live queue tracking</em>
                  </div>
                </div>
              )}
            </div>
          </section>

          <hr className="po-canvas-divider" />

          {/* ==================================================================
              3. FLOWING EDITORIAL CARE INDEX (REPLACES THE 4 SERVICE BOXES)
              ================================================================== */}
          <section className="po-index-section" data-reveal>
            <div className="po-index-intro">
              <span className="po-stage-eyebrow">Patient Care Pathways</span>
              <h2>Navigate your healthcare</h2>
            </div>

            <div className="po-index-rows">
              <Link to="/patient/book" className="po-index-row">
                <span className="po-index-num">01</span>
                <span className="po-index-icon">
                  <IconCalendar size={20} />
                </span>
                <div className="po-index-main">
                  <h3>Book a Consultation</h3>
                  <p>Choose a specialist, select your preferred time slot, and receive an instant queue token.</p>
                </div>
                <span className="po-index-meta">Instant Slot</span>
                <span className="po-index-arrow" aria-hidden>→</span>
              </Link>

              <Link to="/patient/appointments" className="po-index-row">
                <span className="po-index-num">02</span>
                <span className="po-index-icon">
                  <IconClock size={20} />
                </span>
                <div className="po-index-main">
                  <h3>My Visits & Live Queue</h3>
                  <p>Track real-time consultation room progress, reschedule upcoming visits, or review past logs.</p>
                </div>
                <span className="po-index-meta">{upcoming} Upcoming</span>
                <span className="po-index-arrow" aria-hidden>→</span>
              </Link>

              <Link to="/patient/lab-reports" className="po-index-row">
                <span className="po-index-num">03</span>
                <span className="po-index-icon">
                  <IconFlask size={20} />
                </span>
                <div className="po-index-main">
                  <h3>NABL Diagnostic Reports</h3>
                  <p>Access verified blood panels, pathology findings, and printable laboratory receipts online.</p>
                </div>
                <span className="po-index-meta">
                  {pendingLabsCount > 0 ? `${pendingLabsCount} Processing` : `${readyLabsCount} Verified`}
                </span>
                <span className="po-index-arrow" aria-hidden>→</span>
              </Link>

              <Link to="/patient/prescriptions" className="po-index-row">
                <span className="po-index-num">04</span>
                <span className="po-index-icon">
                  <IconPill size={20} />
                </span>
                <div className="po-index-main">
                  <h3>Digital Prescriptions & Pharmacy</h3>
                  <p>Review prescribed medicines, daily dosage schedules, and itemized clinical pharmacy bills.</p>
                </div>
                <span className="po-index-meta">{prescriptions.length} Records</span>
                <span className="po-index-arrow" aria-hidden>→</span>
              </Link>
            </div>
          </section>

          <hr className="po-canvas-divider" />

          {/* ==================================================================
              4. OPEN VERTICAL TIMELINE & BORDERLESS CLINICAL LEDGER
              ================================================================== */}
          <section className="po-open-split" data-reveal>
            {/* Left: Open Vertical Consultation Timeline (No Outer Box) */}
            <div className="po-open-timeline-col">
              <div className="po-open-col-head">
                <div>
                  <span className="po-stage-eyebrow">Chronological Care Log</span>
                  <h2>Visits & Consultation Timeline</h2>
                </div>
                <Link to="/patient/appointments" className="po-link-arrow">
                  <span>Full schedule</span>
                  <span aria-hidden>→</span>
                </Link>
              </div>

              <VisitsSection patientId={patientId} variant="timeline" />
            </div>

            {/* Right: Borderless Clinical Ledger (Diagnostics, Rx, Continuity) */}
            <aside className="po-open-ledger">
              {/* Diagnostics Stream */}
              <div className="po-ledger-group">
                <div className="po-ledger-head">
                  <span className="po-ledger-ico">
                    <IconFlask size={17} />
                  </span>
                  <div>
                    <span className="po-stage-eyebrow">Pathology & Lab</span>
                    <h3>Latest Diagnostic Status</h3>
                  </div>
                  <Link to="/patient/lab-reports" className="po-ledger-link">
                    Open →
                  </Link>
                </div>

                {latestLab ? (
                  <div className="po-ledger-body">
                    <div className="po-ledger-line">
                      <strong>Lab Order #{latestLab.id}</strong>
                      <span className={`po-ledger-status ${labOrderHasResults(latestLab) ? 'is-ready' : ''}`}>
                        {labOrderHasResults(latestLab) ? 'Verified Ready' : 'In Progress'}
                      </span>
                    </div>
                    <p className="po-ledger-sub">
                      Ordered {formatShortDate(latestLab.created_at)} ·{' '}
                      {(latestLab.items || []).length || 1} test panel
                      {(latestLab.items || []).length === 1 ? '' : 's'}
                    </p>
                    <div className="po-ledger-bar">
                      <span style={{ width: labOrderHasResults(latestLab) ? '100%' : '55%' }} />
                    </div>
                  </div>
                ) : (
                  <p className="po-ledger-sub">No pending diagnostic orders at this time.</p>
                )}
              </div>

              {/* Active Prescriptions Stream */}
              <div className="po-ledger-group">
                <div className="po-ledger-head">
                  <span className="po-ledger-ico">
                    <IconPill size={17} />
                  </span>
                  <div>
                    <span className="po-stage-eyebrow">Clinical Pharmacy</span>
                    <h3>Active Medications</h3>
                  </div>
                  <Link to="/patient/prescriptions" className="po-ledger-link">
                    All Rx →
                  </Link>
                </div>

                {activeRx.length === 0 ? (
                  <p className="po-ledger-sub">
                    Prescriptions issued during your consultations appear here automatically.
                  </p>
                ) : (
                  <ul className="po-ledger-list">
                    {activeRx.map((rx) => (
                      <li key={rx.id}>
                        <div>
                          <strong>Prescription #{rx.id}</strong>
                          <span>{rx.doctor?.name || 'Doctor'}</span>
                        </div>
                        <em>
                          {rx.items?.length || 0} med{(rx.items?.length || 0) === 1 ? '' : 's'}
                        </em>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Care Continuity & Medical Record Stream */}
              <div className="po-ledger-group">
                <div className="po-ledger-head">
                  <span className="po-ledger-ico">
                    <IconHeart size={17} />
                  </span>
                  <div>
                    <span className="po-stage-eyebrow">Continuity & File</span>
                    <h3>Patient Record & Follow-Up</h3>
                  </div>
                  <Link to="/patient/profile" className="po-ledger-link">
                    Edit →
                  </Link>
                </div>

                <div className="po-ledger-facts">
                  <div>
                    <span>Last Consultation</span>
                    <strong>
                      {lastVisit
                        ? `${formatShortDate(lastVisit.appointment_date)} · ${lastVisit.doctor?.name || 'Clinic'}`
                        : 'No completed visits yet'}
                    </strong>
                  </div>
                  <div>
                    <span>Current Medications</span>
                    <strong>{patient?.current_medications || 'None recorded'}</strong>
                  </div>
                  <div>
                    <span>Registered Phone</span>
                    <strong>{patient?.phone || '—'}</strong>
                  </div>
                </div>
              </div>

              {/* 24/7 Helpline Ribbon */}
              <div className="po-ledger-helpline">
                <div>
                  <span className="po-stage-eyebrow">24/7 Emergency Dispatch</span>
                  <strong>Need immediate assistance?</strong>
                </div>
                <a href={`tel:${CLINIC.phone.replace(/\s/g, '')}`} className="po-helpline-pill">
                  <IconPhone size={15} />
                  <span>{CLINIC.phone}</span>
                </a>
              </div>
            </aside>
          </section>
        </div>
      </div>

      <RescheduleModal
        target={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onSuccess={loadAppointments}
      />
    </PatientLayout>
  )
}
