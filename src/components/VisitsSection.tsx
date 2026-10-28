import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { cancelAppointment, getAppointments, getLabOrders } from '../api/client'
import type { Appointment, LabOrder } from '../api/types'
import DoctorAvatar from './DoctorAvatar'
import RescheduleModal, { type RescheduleTarget } from './RescheduleModal'
import { displayDoctorName } from '../utils/doctorName'
import { getDoctorPhotoUrl } from '../utils/doctorPhoto'
import {
  IconCalendar,
  IconClock,
  IconCheck,
  IconSearch,
  IconFlask,
  IconStethoscope,
  IconX,
  IconGrid,
  IconList,
  IconBuilding,
} from './Icons'
import { formatVisitDateParts, toDateOnlyString } from '../utils/dateUtils'

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
  doctorSpecialization?: string
  roomNumber?: string
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

function formatTimeRange(start: string, durationMinutes = 30): { start: string; end: string } {
  const [h, m] = start.split(':').map(Number)
  const startDate = new Date(2000, 0, 1, h, m)
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000)
  const fmt = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
  return { start: fmt(startDate), end: fmt(endDate) }
}

function appointmentStart(a: Appointment): Date {
  const date = toDateOnlyString(a.appointment_date)
  const raw = (a.slot_time || '00:00:00').slice(0, 8)
  const time = raw.length === 5 ? `${raw}:00` : raw
  return new Date(`${date}T${time}`)
}

function isToday(dateStr: string): boolean {
  const today = new Date()
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return toDateOnlyString(dateStr) === todayIso
}

function isMissedAppointment(a: Appointment): boolean {
  if (a.status === 'cancelled' || a.status === 'completed') return false
  if (a.status === 'no_show') return true
  if (a.status === 'checked_in' && !isToday(a.appointment_date) && appointmentStart(a).getTime() < Date.now()) {
    return true
  }
  if (a.status !== 'booked') return false
  return appointmentStart(a).getTime() < Date.now()
}

function isUpcomingAppointment(a: Appointment): boolean {
  if (['cancelled', 'completed', 'no_show'].includes(a.status)) return false
  if (isMissedAppointment(a)) return false
  return appointmentStart(a).getTime() >= Date.now() || (a.status === 'checked_in' && isToday(a.appointment_date))
}

function appointmentToVisit(a: Appointment, _index: number): VisitItem {
  const date = toDateOnlyString(a.appointment_date)
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
    service: a.doctor?.specialization ? `${a.doctor.specialization} Consultation` : 'General Clinical Consultation',
    doctorName: a.doctor?.name || 'Doctor',
    doctorSpecialization: a.doctor?.specialization || 'Clinical Specialist',
    roomNumber: a.doctor?.room_number ? `OPD Room ${a.doctor.room_number}` : 'Main Campus OPD',
    doctorId: a.doctor_id,
    doctorPhotoUrl: getDoctorPhotoUrl(a.doctor?.photo_url),
    status: a.status === 'cancelled' ? 'cancelled' : missed ? 'missed' : a.status,
    statusLabel:
      a.status === 'cancelled'
        ? 'Cancelled'
        : missed
          ? 'Missed'
          : a.status === 'checked_in'
            ? (a.queue_token?.status === 'in_consultation' ? 'With doctor' : 'In queue')
            : isToday(date) && a.status === 'booked' && a.queue_token
              ? 'In queue'
              : isToday(date) && a.status === 'booked'
                ? 'Today'
                : (STATUS_LABELS[a.status] || a.status),
    accent,
    appointmentId: a.id,
    cancellable: ['booked', 'no_show', 'checked_in'].includes(a.status),
  }
}

function labOrderToVisit(o: LabOrder, _index: number): VisitItem {
  const tests = o.items?.map((i) => i.lab_test?.name).filter(Boolean).join(', ') || 'Diagnostic Lab Profile'
  const accent = 'clinical' as const
  const date = new Date().toISOString().split('T')[0]
  return {
    id: `lab-${o.id}`,
    kind: 'lab',
    date,
    slotTime: '08:00',
    endTime: '18:00',
    service: tests,
    doctorName: o.doctor?.name || 'Clinical Pathology Lab',
    doctorSpecialization: 'Laboratory Diagnostics & Biochemistry',
    roomNumber: 'Diagnostic Wing • 1st Floor',
    doctorId: o.doctor_id,
    doctorPhotoUrl: getDoctorPhotoUrl(o.doctor?.photo_url),
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
  const [filterType, setFilterType] = useState<'all' | 'appointment' | 'lab'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')

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
    const onApptsChanged = () => load()
    window.addEventListener('focus', onFocus)
    window.addEventListener('appointments:changed', onApptsChanged)
    const timer = window.setInterval(load, 15000)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('appointments:changed', onApptsChanged)
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
    { key: 'past', label: 'Visit History', count: pastVisits.length },
  ]

  const activeList = tab === 'upcoming' ? upcomingVisits : pastVisits
  const nextVisit = upcomingVisits.length > 0 ? upcomingVisits[0] : null

  const filteredList = useMemo(() => {
    let list = activeList
    if (filterType !== 'all') {
      list = list.filter((v) => v.kind === filterType)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (v) =>
          v.doctorName.toLowerCase().includes(q) ||
          v.service.toLowerCase().includes(q) ||
          (v.doctorSpecialization && v.doctorSpecialization.toLowerCase().includes(q)) ||
          v.date.includes(q)
      )
    }
    return list
  }, [activeList, filterType, searchQuery])

  const handleCancel = async (id: number) => {
    const target = appointments.find((a) => a.id === id)
    const targetDate = target ? toDateOnlyString(target.appointment_date) : null
    const matchingIds = target
      ? appointments
          .filter(
            (a) =>
              a.id === id ||
              (a.doctor_id === target.doctor_id &&
                toDateOnlyString(a.appointment_date) === targetDate &&
                a.slot_time === target.slot_time &&
                !['completed', 'cancelled'].includes(a.status))
          )
          .map((a) => a.id)
      : [id]

    // Optimistically mark as cancelled so it is immediately removed from Overview/Upcoming and moved to History
    setAppointments((prev) =>
      prev.map((a) => (matchingIds.includes(a.id) ? { ...a, status: 'cancelled' } : a))
    )

    try {
      await Promise.all(matchingIds.map((apptId) => cancelAppointment(apptId)))
      window.dispatchEvent(new CustomEvent('appointments:changed'))
      load()
    } catch {
      load()
    }
  }

  const openReschedule = (visit: VisitItem) => {
    if (!visit.appointmentId || !visit.doctorId || !visit.slotTimeRaw) return
    setRescheduleTarget({
      appointmentId: visit.appointmentId,
      doctorId: visit.doctorId,
      doctorName: visit.doctorName,
      doctorPhotoUrl: visit.doctorPhotoUrl,
      appointmentDate: visit.date,
      slotTime: visit.slotTimeRaw,
    })
  }

  if (!patientId) return null

  if (variant === 'timeline') {
    const timelineSource = tab === 'upcoming' ? upcomingVisits : pastVisits
    const timelineFiltered =
      filterType === 'all' ? timelineSource : timelineSource.filter((v) => v.kind === filterType)
    const timelineItems = timelineFiltered.slice(0, 6)

    return (
      <>
        <div className="ph-tl-wrap">
          {/* Timeline Interactive Filter Header */}
          <div className="ph-tl-toolbar">
            <div className="ph-tl-tabs" role="tablist" aria-label="Timeline period">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'upcoming'}
                className={`ph-tl-tab ${tab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setTab('upcoming')}
              >
                <IconCalendar size={14} />
                <span>Upcoming</span>
                <em className="ph-tl-tab-count">{upcomingVisits.length}</em>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'past'}
                className={`ph-tl-tab ${tab === 'past' ? 'active' : ''}`}
                onClick={() => setTab('past')}
              >
                <IconClock size={14} />
                <span>History</span>
                <em className="ph-tl-tab-count">{pastVisits.length}</em>
              </button>
            </div>

            <div className="ph-tl-filters" role="group" aria-label="Filter by visit type">
              <button
                type="button"
                className={`ph-tl-filter-chip ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`ph-tl-filter-chip ${filterType === 'appointment' ? 'active' : ''}`}
                onClick={() => setFilterType('appointment')}
              >
                <IconStethoscope size={13} />
                <span>Consults</span>
              </button>
              <button
                type="button"
                className={`ph-tl-filter-chip ${filterType === 'lab' ? 'active' : ''}`}
                onClick={() => setFilterType('lab')}
              >
                <IconFlask size={13} />
                <span>Labs</span>
              </button>
            </div>
          </div>

          {/* Vertical Timeline Spine & Framed Cards */}
          <div className="ph-tl-list">
            {loading ? (
              <div className="ph-timeline-loading">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="ph-timeline-skeleton" />
                ))}
              </div>
            ) : timelineItems.length === 0 ? (
              <div className="ph-tl-empty-frame">
                <div className="ph-tl-empty-icon">
                  {tab === 'upcoming' ? <IconCalendar size={26} /> : <IconClock size={26} />}
                </div>
                <div className="ph-tl-empty-copy">
                  <h4>
                    {tab === 'upcoming'
                      ? 'No upcoming consultations or lab orders'
                      : 'No past consultation records in this view'}
                  </h4>
                  <p>
                    {tab === 'upcoming'
                      ? 'Schedule a visit with our specialists to track your appointment timeline and live queue here.'
                      : 'Completed clinic visits and diagnostic check-ups will be archived along this vertical timeline.'}
                  </p>
                </div>
                {tab === 'upcoming' && (
                  <Link to="/patient/book" className="ph-tl-empty-btn">
                    <IconCalendar size={15} />
                    <span>Schedule a Visit</span>
                  </Link>
                )}
              </div>
            ) : (
              timelineItems.map((visit, idx) => {
                const dateParts = formatVisitDateParts(visit.date)
                const isLast = idx === timelineItems.length - 1
                const isLive = ['checked_in', 'in_consultation', 'waiting'].includes(visit.status)

                return (
                  <article
                    key={visit.id}
                    className={`ph-tl-row ph-tl-row--${visit.status} ${isLive ? 'is-live' : ''}`}
                  >
                    {/* Left Date Stamp Badge */}
                    <div className="ph-tl-date-col">
                      <div className="ph-tl-date-stamp">
                        <span className="ph-tl-date-day">{dateParts.day}</span>
                        <span className="ph-tl-date-month">{dateParts.month}</span>
                        <span className="ph-tl-date-year">{dateParts.year}</span>
                      </div>
                    </div>

                    {/* Vertical Timeline Axis + Icon Node */}
                    <div className="ph-tl-axis" aria-hidden>
                      <div className={`ph-tl-node ph-tl-node--${visit.kind} ph-tl-node--${visit.status}`}>
                        {visit.status === 'completed' ? (
                          <IconCheck size={16} />
                        ) : visit.status === 'cancelled' ? (
                          <IconX size={15} />
                        ) : visit.kind === 'lab' ? (
                          <IconFlask size={16} />
                        ) : (
                          <IconStethoscope size={16} />
                        )}
                      </div>
                      {!isLast && <span className="ph-tl-spine" />}
                    </div>

                    {/* Framed Content Card */}
                    <div className="ph-tl-frame">
                      <div className="ph-tl-frame-top">
                        <div className="ph-tl-frame-badges">
                          <span className={`ph-tl-kind-pill is-${visit.kind}`}>
                            {visit.kind === 'lab' ? (
                              <>
                                <IconFlask size={12} />
                                <span>Diagnostic Lab</span>
                              </>
                            ) : (
                              <>
                                <IconStethoscope size={12} />
                                <span>Consultation</span>
                              </>
                            )}
                          </span>

                          {visit.slotTime !== '—' && (
                            <span className="ph-tl-meta-chip">
                              <IconClock size={12} />
                              <span>
                                {visit.slotTime} – {visit.endTime}
                              </span>
                            </span>
                          )}

                          {visit.roomNumber && (
                            <span className="ph-tl-meta-chip is-room">
                              <IconBuilding size={12} />
                              <span>{visit.roomNumber}</span>
                            </span>
                          )}
                        </div>

                        <span className={`ph-tl-status ph-badge-${visit.status}`}>
                          {isLive && <span className="ph-tl-status-dot" />}
                          <span>{visit.statusLabel}</span>
                        </span>
                      </div>

                      <div className="ph-tl-frame-body">
                        <div className="ph-tl-service-wrap">
                          <h4 className="ph-tl-service-title">{visit.service}</h4>
                          <p className="ph-tl-service-date">
                            <IconCalendar size={13} />
                            <span>{dateParts.full}</span>
                          </p>
                        </div>

                        <div className="ph-tl-doctor-box">
                          <DoctorAvatar
                            doctorId={visit.doctorId}
                            name={visit.doctorName}
                            photoUrl={visit.doctorPhotoUrl}
                            className="ph-tl-doctor-avatar"
                          />
                          <div className="ph-tl-doctor-copy">
                            <strong>{displayDoctorName(visit.doctorName)}</strong>
                            <span>{visit.doctorSpecialization || 'Clinical Specialist'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="ph-tl-frame-foot">
                        <div className="ph-tl-foot-left">
                          <span className="ph-tl-foot-id">
                            Ref #{visit.appointmentId || visit.id.replace(/\D/g, '') || '101'}
                          </span>
                        </div>

                        <div className="ph-tl-foot-actions">
                          {visit.cancellable && visit.appointmentId && tab === 'upcoming' ? (
                            <>
                              <button
                                type="button"
                                className="ph-tl-btn ph-tl-btn--reschedule"
                                onClick={() => openReschedule(visit)}
                              >
                                <IconCalendar size={13} />
                                <span>Reschedule</span>
                              </button>
                              <button
                                type="button"
                                className="ph-tl-btn ph-tl-btn--cancel"
                                onClick={() => handleCancel(visit.appointmentId!)}
                              >
                                <IconX size={13} />
                                <span>Cancel</span>
                              </button>
                            </>
                          ) : (
                            <Link to="/patient/appointments" className="ph-tl-btn ph-tl-btn--view">
                              <span>View Record</span>
                              <span aria-hidden>→</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </div>
        <RescheduleModal
          target={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onSuccess={load}
        />
      </>
    )
  }

  if (premium) {
    return (
      <div className="mv-section-wrap">
        {/* Metric Cards Overview */}
        <div className="mv-metrics-grid">
          <div className="mv-metric-card">
            <div className="mv-metric-icon mv-metric-icon--upcoming">
              <IconCalendar size={24} />
            </div>
            <div className="mv-metric-body">
              <div className="mv-metric-label">Upcoming Visits</div>
              <div className="mv-metric-value">{upcomingVisits.length} Active</div>
              <div className="mv-metric-tag">
                <span className="mv-metric-tag-dot" />
                <span>Confirmed appointments</span>
              </div>
            </div>
          </div>

          <div className="mv-metric-card">
            <div className="mv-metric-icon mv-metric-icon--next">
              <IconClock size={24} />
            </div>
            <div className="mv-metric-body">
              <div className="mv-metric-label">Next Scheduled Visit</div>
              <div className="mv-metric-value">
                {nextVisit
                  ? `${formatVisitDateParts(nextVisit.date).month} ${formatVisitDateParts(nextVisit.date).day}`
                  : 'None Scheduled'}
              </div>
              <div className="mv-metric-tag" style={{ color: nextVisit ? '#1d4ed8' : '#64748b' }}>
                {nextVisit ? `${nextVisit.slotTime} • ${displayDoctorName(nextVisit.doctorName)}` : 'Ready for your next checkup'}
              </div>
            </div>
          </div>

          <div className="mv-metric-card">
            <div className="mv-metric-icon mv-metric-icon--history">
              <IconCheck size={24} />
            </div>
            <div className="mv-metric-body">
              <div className="mv-metric-label">Completed Care History</div>
              <div className="mv-metric-value">{pastVisits.length} Records</div>
              <div className="mv-metric-tag" style={{ color: '#475569' }}>
                <span>Prescriptions & reports on file</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel with Toolbar & Cards */}
        <div className="mv-panel">
          <div className="mv-toolbar">
            <div className="mv-tabs" role="tablist">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  className={`mv-tab-btn ${tab === t.key ? 'active' : ''}`}
                  onClick={() => setTab(t.key)}
                >
                  <span>{t.label}</span>
                  <span className="mv-tab-count">{t.count}</span>
                </button>
              ))}
            </div>

            <div className="mv-filter-group">
              <div className="mv-type-filters">
                <button
                  type="button"
                  className={`mv-type-chip ${filterType === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterType('all')}
                >
                  All ({activeList.length})
                </button>
                <button
                  type="button"
                  className={`mv-type-chip ${filterType === 'appointment' ? 'active' : ''}`}
                  onClick={() => setFilterType('appointment')}
                >
                  Consultations ({activeList.filter((v) => v.kind === 'appointment').length})
                </button>
                <button
                  type="button"
                  className={`mv-type-chip ${filterType === 'lab' ? 'active' : ''}`}
                  onClick={() => setFilterType('lab')}
                >
                  Labs ({activeList.filter((v) => v.kind === 'lab').length})
                </button>
              </div>

              <div className="mv-search-box">
                <IconSearch size={16} className="mv-search-icon" />
                <input
                  type="text"
                  placeholder="Search doctor or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mv-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '0.65rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      padding: 0,
                    }}
                    aria-label="Clear search"
                  >
                    <IconX size={14} />
                  </button>
                )}
              </div>

              <div className="mv-view-switcher" role="group" aria-label="Layout view">
                <button
                  type="button"
                  className={`mv-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                  onClick={() => setViewMode('cards')}
                  title="Card Grid View"
                  aria-pressed={viewMode === 'cards'}
                >
                  <IconGrid size={15} />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  className={`mv-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                  aria-pressed={viewMode === 'list'}
                >
                  <IconList size={15} />
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cards List / Grid */}
          <div className={`mv-cards-list ${viewMode === 'cards' ? 'mv-cards-grid' : 'mv-cards-rows'}`}>
            {loading ? (
              <div className="mv-loading-list">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="mv-skeleton-card" />
                ))}
              </div>
            ) : filteredList.length === 0 ? (
              <div className="mv-empty-state">
                <div className="mv-empty-icon-wrap">
                  <IconStethoscope size={34} />
                </div>
                <h3 className="mv-empty-title">
                  {searchQuery
                    ? 'No matching appointments found'
                    : tab === 'upcoming'
                      ? 'No upcoming visits on your schedule'
                      : 'No past visit records found'}
                </h3>
                <p className="mv-empty-sub">
                  {searchQuery
                    ? `No visits matched "${searchQuery}". Try clearing your search query.`
                    : tab === 'upcoming'
                      ? 'Choose your specialist and book a preferred time slot in Chandanathope without waiting queues.'
                      : 'Completed consultations and verified laboratory diagnostics will be archived here for easy reference.'}
                </p>

                {tab === 'upcoming' && !searchQuery && (
                  <>
                    <div className="mv-empty-perks">
                      <span className="mv-perk-chip"><IconClock size={13} /> Zero Queue Delay</span>
                      <span className="mv-perk-chip"><IconStethoscope size={13} /> 8+ Specialties</span>
                      <span className="mv-perk-chip"><IconBuilding size={13} /> Chandanathope Campus</span>
                    </div>
                    <Link to="/patient/book" className="mv-btn-primary">
                      <IconCalendar size={18} />
                      <span>Book a Consultation Now</span>
                    </Link>
                  </>
                )}
              </div>
            ) : (
              filteredList.map((visit) => {
                const dateParts = formatVisitDateParts(visit.date)
                const isUpcomingTab = tab === 'upcoming'

                return (
                  <article
                    key={visit.id}
                    className={`mv-card mv-card--${visit.status} mv-card--${visit.kind}`}
                  >
                    {/* Card Header: Type Badge, Time Pill & Status */}
                    <div className="mv-card-header">
                      <div className="mv-card-header-left">
                        <span className={`mv-type-tag mv-type-tag--${visit.kind}`}>
                          {visit.kind === 'lab' ? (
                            <>
                              <IconFlask size={12} /> Diagnostic Lab
                            </>
                          ) : (
                            <>
                              <IconStethoscope size={12} /> Consultation
                            </>
                          )}
                        </span>

                        {visit.slotTime !== '—' && (
                          <span className="mv-time-pill">
                            <IconClock size={13} />
                            <span>{visit.slotTime} – {visit.endTime}</span>
                          </span>
                        )}
                      </div>

                      <span className={`mv-status-badge mv-status-badge--${visit.status}`}>
                        {['checked_in', 'in_consultation', 'booked', 'Today'].includes(visit.statusLabel) && (
                          <span className="mv-status-pulse-dot" />
                        )}
                        <span>{visit.statusLabel}</span>
                      </span>
                    </div>

                    {/* Card Hero: Date Ticket + Service Title */}
                    <div className="mv-card-body">
                      <div className="mv-date-ticket">
                        <span className="mv-date-month">{dateParts.month}</span>
                        <span className="mv-date-day">{dateParts.day}</span>
                        <span className="mv-date-year">{dateParts.year}</span>
                      </div>

                      <div className="mv-card-service-info">
                        <h4 className="mv-service-title">{visit.service}</h4>
                        <div className="mv-service-date-subtitle">
                          <IconCalendar size={13} />
                          <span>{dateParts.full} • {visit.slotTime !== '—' ? visit.slotTime : 'Scheduled'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Doctor / Specialist Cardlet */}
                    <div className="mv-doctor-cardlet">
                      <DoctorAvatar
                        doctorId={visit.doctorId}
                        name={visit.doctorName}
                        photoUrl={visit.doctorPhotoUrl}
                        className="mv-doctor-avatar"
                      />
                      <div className="mv-doctor-details">
                        <span className="mv-doctor-name">{displayDoctorName(visit.doctorName)}</span>
                        <span className="mv-doctor-spec">{visit.doctorSpecialization || 'Clinical Specialist'}</span>
                        {visit.roomNumber && (
                          <span className="mv-doctor-room">
                            <IconBuilding size={12} />
                            <span>{visit.roomNumber}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Footer: Action Buttons */}
                    <div className="mv-card-footer">
                      {visit.cancellable && isUpcomingTab ? (
                        <div className="mv-button-row">
                          <button
                            type="button"
                            className="mv-btn-reschedule"
                            onClick={() => openReschedule(visit)}
                            title="Reschedule to another slot"
                          >
                            <IconCalendar size={13} />
                            <span>Reschedule</span>
                          </button>
                          <button
                            type="button"
                            className="mv-btn-cancel"
                            onClick={() => handleCancel(visit.appointmentId!)}
                            title="Cancel appointment"
                          >
                            <IconX size={13} />
                            <span>Cancel</span>
                          </button>
                        </div>
                      ) : !isUpcomingTab && visit.kind === 'appointment' ? (
                        <Link to="/patient/book" className="mv-btn-reschedule mv-btn-full" title="Book a new follow-up">
                          <IconCalendar size={13} />
                          <span>Book Follow-up</span>
                        </Link>
                      ) : (
                        <div className="mv-card-campus-badge">
                          <IconBuilding size={12} />
                          <span>Alverstone Medcity Chandanathope</span>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </div>

        <RescheduleModal
          target={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onSuccess={load}
        />
      </div>
    )
  }

  const rootClass = [
    'visits-section',
    compact && 'visits-section-compact',
  ].filter(Boolean).join(' ')

  return (
    <div className={rootClass}>
      <div className="visits-tabs">
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
                className={`visit-card visit-card-${visit.accent}`}
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
