import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { cancelAppointment, getAppointments, getLabOrders } from '../api/client'
import type { Appointment, LabOrder } from '../api/types'
import DoctorAvatar from './DoctorAvatar'
import RescheduleModal, { type RescheduleTarget } from './RescheduleModal'
import { displayDoctorName } from '../utils/doctorName'
import { getDoctorPhotoUrl } from '../utils/doctorPhoto'

type Tab = 'upcoming' | 'past'

type VisitItem = {
  id: string
  kind: 'appointment' | 'lab'
  date: string
  slotTime: string
  slotTimeRaw?: string
  endTime: string
  service: string
  doctorName: string
  doctorId?: number
  doctorPhotoUrl?: string
  status: string
  statusLabel: string
  accent: 'clinical' | 'purple' | 'cyan' | 'teal'
  appointmentId?: number
  cancellable?: boolean
}

const STATUS_LABELS: Record<string, string> = {
  booked: 'Scheduled',
  checked_in: 'In queue',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'Missed',
  missed: 'Missed',
  ordered: 'Planned',
  pending: 'Planned',
  in_progress: 'In Progress',
  in_consultation: 'With doctor',
  waiting: 'In queue',
}

function parseList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: T[] }).data)) {
    return (data as { data: T[] }).data
  }
  return []
}

function formatVisitDateParts(dateStr: string): { day: string; month: string; year: string; full: string } {
  const iso = dateStr.slice(0, 10)
  const d = new Date(`${iso}T12:00:00`)
  return {
    day: d.toLocaleDateString('en-IN', { day: 'numeric' }),
    month: d.toLocaleDateString('en-IN', { month: 'short' }),
    year: d.toLocaleDateString('en-IN', { year: 'numeric' }),
    full: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
  }
}

function formatTimeRange(start: string, durationMinutes = 30): { start: string; end: string } {
  const [h, m] = start.split(':').map(Number)
  const startDate = new Date(2000, 0, 1, h, m)
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000)
  const fmt = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
  return { start: fmt(startDate), end: fmt(endDate) }
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

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return dateStr.slice(0, 10) === today
}

function appointmentToVisit(a: Appointment, _index: number): VisitItem {
  const date = a.appointment_date.split('T')[0]
  const slot = a.slot_time?.slice(0, 5) || '09:00'
  const range = formatTimeRange(slot, 30)
  const accent = 'clinical' as const
  const missed = isMissedAppointment(a)
  return {
    id: `appt-${a.id}`,
    kind: 'appointment',
    date,
    slotTime: range.start,
    slotTimeRaw: a.slot_time,
    endTime: range.end,
    service: a.doctor?.specialization ? `${a.doctor.specialization} consultation` : 'General consultation',
    doctorName: a.doctor?.name || 'Doctor',
    doctorId: a.doctor_id,
    doctorPhotoUrl: getDoctorPhotoUrl(a.doctor_id, a.doctor?.name),
    status: missed ? 'missed' : a.status,
    statusLabel: missed
      ? 'Missed'
      : a.status === 'checked_in'
        ? (a.queue_token?.status === 'in_consultation' ? 'With doctor' : 'In queue')
        : a.status === 'cancelled'
          ? 'Cancelled by clinic'
          : isToday(date) && a.status === 'booked' && a.queue_token
            ? 'In queue'
            : isToday(date) && a.status === 'booked'
              ? 'Today'
              : (STATUS_LABELS[a.status] || a.status),
    accent,
    appointmentId: a.id,
    cancellable: a.status === 'booked' || a.status === 'no_show',
  }
}

function labOrderToVisit(o: LabOrder, _index: number): VisitItem {
  const tests = o.items?.map((i) => i.lab_test?.name).filter(Boolean).join(', ') || 'Lab tests'
  const accent = 'clinical' as const
  const date = new Date().toISOString().split('T')[0]
  return {
    id: `lab-${o.id}`,
    kind: 'lab',
    date,
    slotTime: '—',
    endTime: '',
    service: tests,
    doctorName: o.doctor?.name || 'Doctor',
    doctorId: o.doctor_id,
    doctorPhotoUrl: getDoctorPhotoUrl(o.doctor_id, o.doctor?.name),
    status: o.status,
    statusLabel: STATUS_LABELS[o.status] || 'Planned',
    accent,
  }
}

function sortVisits(items: VisitItem[], direction: 'asc' | 'desc'): VisitItem[] {
  return [...items].sort((a, b) => {
    const cmp = `${a.date}${a.slotTime}`.localeCompare(`${b.date}${b.slotTime}`)
    return direction === 'asc' ? cmp : -cmp
  })
}

interface Props {
  patientId?: number
  compact?: boolean
  showViewAll?: boolean
  premium?: boolean
  variant?: 'default' | 'timeline'
}

export default function VisitsSection({
  patientId,
  compact = false,
  showViewAll = false,
  premium = false,
  variant = 'default',
}: Props) {
  const [tab, setTab] = useState<Tab>('upcoming')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [labOrders, setLabOrders] = useState<LabOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [rescheduleTarget, setRescheduleTarget] = useState<RescheduleTarget | null>(null)

  const load = () => {
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
    load()
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    const timer = window.setInterval(load, 15000)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.clearInterval(timer)
    }
  }, [patientId])

  const upcomingVisits = useMemo(() => {
    const appts = appointments
      .filter((a) => isMissedAppointment(a) || isUpcomingAppointment(a))
      .map(appointmentToVisit)
    const labs = labOrders
      .filter((o) => !['completed', 'cancelled'].includes(o.status))
      .map(labOrderToVisit)
    return sortVisits([...appts, ...labs], 'asc')
  }, [appointments, labOrders])

  const pastVisits = useMemo(() => {
    const appts = appointments
      .filter((a) => !isMissedAppointment(a) && !isUpcomingAppointment(a))
      .map(appointmentToVisit)
    const labs = labOrders
      .filter((o) => ['completed', 'cancelled'].includes(o.status))
      .map(labOrderToVisit)
    return sortVisits([...appts, ...labs], 'desc')
  }, [appointments, labOrders])

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'upcoming', label: 'Upcoming visits', count: upcomingVisits.length },
    { key: 'past', label: 'Past visits', count: pastVisits.length },
  ]

  const activeList = tab === 'upcoming' ? upcomingVisits : pastVisits

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel this appointment?')) return
    await cancelAppointment(id)
    load()
  }

  const openReschedule = (visit: VisitItem) => {
    if (!visit.appointmentId || !visit.doctorId || !visit.slotTimeRaw) return
    setRescheduleTarget({
      appointmentId: visit.appointmentId,
      doctorId: visit.doctorId,
      doctorName: visit.doctorName,
      appointmentDate: visit.date,
      slotTime: visit.slotTimeRaw,
    })
  }

  if (!patientId) return null

  if (variant === 'timeline') {
    const timelineItems = upcomingVisits.slice(0, 5)
    return (
      <>
        <div className="ph-timeline">
          {loading ? (
            <div className="ph-timeline-loading">
              {[1, 2, 3].map((i) => (
                <div key={i} className="ph-timeline-skeleton" />
              ))}
            </div>
          ) : timelineItems.length === 0 ? (
            <div className="ph-timeline-empty">
              <p>No upcoming activity</p>
              <Link to="/patient/book" className="ph-btn ph-btn-primary ph-btn-sm">
                Book a visit
              </Link>
            </div>
          ) : (
            timelineItems.map((visit, idx) => (
              <article key={visit.id} className="ph-timeline-item">
                <div className="ph-timeline-rail">
                  <span className={`ph-timeline-dot ph-timeline-dot-${visit.accent}`} />
                  {idx < timelineItems.length - 1 && <span className="ph-timeline-line" />}
                </div>
                <div className="ph-timeline-card">
                  <div className="ph-timeline-card-head">
                    <time className="ph-timeline-date">{formatVisitDateParts(visit.date).full}</time>
                    {visit.slotTime !== '—' && (
                      <span className="ph-timeline-time">{visit.slotTime} – {visit.endTime}</span>
                    )}
                  </div>
                  <p className="ph-timeline-service">{visit.service}</p>
                  <div className="ph-timeline-doctor-row">
                    <DoctorAvatar
                      doctorId={visit.doctorId}
                      name={visit.doctorName}
                      photoUrl={visit.doctorPhotoUrl}
                      className="ph-timeline-doctor-photo"
                    />
                    <p className="ph-timeline-doctor">{displayDoctorName(visit.doctorName)}</p>
                  </div>
                  <div className="ph-timeline-foot">
                    <span className={`ph-badge ph-badge-${visit.status}`}>{visit.statusLabel}</span>
                    {visit.cancellable && visit.appointmentId && (
                      <>
                        <button
                          type="button"
                          className="ph-timeline-reschedule"
                          onClick={() => openReschedule(visit)}
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          className="ph-timeline-cancel"
                          onClick={() => handleCancel(visit.appointmentId!)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
        <RescheduleModal
          target={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onSuccess={load}
        />
      </>
    )
  }

  const rootClass = [
    'visits-section',
    compact && 'visits-section-compact',
    premium && 'visits-section-premium',
  ].filter(Boolean).join(' ')

  return (
    <div className={rootClass}>
      <div className={`visits-tabs ${premium ? 'visits-tabs-premium' : ''}`}>
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`visits-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span className="visits-tab-label">{t.label}</span>
            <span className="visits-tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="visits-list">
        {loading ? (
          <div className="visits-loading">
            {[1, 2, 3].map((i) => (
              <div key={i} className="visit-skeleton" />
            ))}
          </div>
        ) : activeList.length === 0 ? (
          <div className="visits-empty-state">
            <p className="visits-empty-title">
              {tab === 'upcoming' ? 'No upcoming visits' : 'No past visits yet'}
            </p>
            <p className="visits-empty-sub">
              {tab === 'upcoming'
                ? 'Book a consultation to see your scheduled visits here.'
                : 'Completed and past appointments will appear here.'}
            </p>
            {tab === 'upcoming' && (
              <Link to="/patient/book" className="ph-btn ph-btn-primary ph-btn-sm">
                Book an appointment
              </Link>
            )}
          </div>
        ) : (
          activeList.map((visit) => {
            const dateParts = formatVisitDateParts(visit.date)
            return (
              <article
                key={visit.id}
                className={`visit-card visit-card-${visit.accent} ${premium ? 'visit-card-premium' : ''}`}
              >
                <div className="visit-card-date-block">
                  <span className="visit-card-date-day">{dateParts.day}</span>
                  <span className="visit-card-date-month">{dateParts.month}</span>
                  <span className="visit-card-date-year">{dateParts.year}</span>
                </div>

                <div className="visit-card-main">
                  <div className="visit-card-top">
                    <span className={`visit-type-badge visit-type-${visit.kind}`}>
                      {visit.kind === 'lab' ? 'Lab' : 'Consultation'}
                    </span>
                    {visit.slotTime !== '—' && (
                      <span className="visit-card-time">{visit.slotTime} – {visit.endTime}</span>
                    )}
                  </div>
                  <p className="visit-card-service">{visit.service}</p>
                  <div className="visit-card-doctor-row">
                    <DoctorAvatar
                      doctorId={visit.doctorId}
                      name={visit.doctorName}
                      photoUrl={visit.doctorPhotoUrl}
                      className="visit-doctor-photo"
                    />
                    <span className="visit-card-doctor-name">{displayDoctorName(visit.doctorName)}</span>
                  </div>
                </div>

                <div className="visit-card-actions">
                  <span className={`visit-status-pill visit-status-${visit.status}`}>{visit.statusLabel}</span>
                  {visit.cancellable && (
                    <>
                      <button
                        type="button"
                        className="visit-reschedule-btn"
                        onClick={() => openReschedule(visit)}
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        className="visit-cancel-btn"
                        onClick={() => handleCancel(visit.appointmentId!)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </article>
            )
          })
        )}
      </div>

      {showViewAll && (
        <div className="visits-footer">
          <Link to="/patient/appointments" className="btn btn-link">View all appointments →</Link>
        </div>
      )}

      <RescheduleModal
        target={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onSuccess={load}
      />
    </div>
  )
}
