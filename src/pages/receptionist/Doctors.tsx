import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../../components/Layout'
import DoctorManageForm from '../../components/DoctorManageForm'
import DoctorAvatar from '../../components/DoctorAvatar'
import VisitSourceBadge from '../../components/VisitSourceBadge'
import { getDaySchedule, getDoctors } from '../../api/client'
import { receptionistNav } from '../../config/navigation'
import { isDoctorAvailableOnDate } from '../../utils/doctorAvailability'
import type { DayScheduleSlot, Doctor } from '../../api/types'
import { IconPlus, IconSearch } from '../../components/Icons'

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0] // Mon → Sun display

function workingDaySet(availability?: Doctor['availability']): Set<number> {
  return new Set((availability || []).map((a) => a.day_of_week))
}

function formatHours(availability?: Doctor['availability']): string {
  if (!availability?.length) return '—'
  const a = availability[0]
  return `${String(a.start_time).slice(0, 5)} – ${String(a.end_time).slice(0, 5)}`
}

function slotMinutes(availability?: Doctor['availability']): string {
  if (!availability?.length) return '—'
  return `${availability[0].slot_duration_minutes || 30} min`
}

function isAvailableToday(availability?: Doctor['availability']): boolean {
  return isDoctorAvailableOnDate({ availability, status: 'active' })
}

function formatQueueStatus(status?: string | null): string {
  if (!status) return '—'
  if (status === 'in_consultation') return 'With doctor'
  if (status === 'waiting') return 'In queue'
  if (status === 'completed') return 'Completed'
  if (status === 'skipped') return 'Skipped'
  return status.replace(/_/g, ' ')
}

function slotRowKey(s: DayScheduleSlot, index: number): string {
  return `${s.slot_time}-${s.appointment_id ?? 'x'}-${s.token_id ?? 't'}-${index}`
}

function WeekStrip({ availability }: { availability?: Doctor['availability'] }) {
  const on = workingDaySet(availability)
  return (
    <div className="rdx-week" aria-label="Working days">
      {DAY_ORDER.map((dow, i) => (
        <span key={`${dow}-${i}`} className={`rdx-week-day${on.has(dow) ? ' is-on' : ''}`}>
          {DAY_LETTERS[dow]}
        </span>
      ))}
    </div>
  )
}

function DaySchedulePanel({
  doctor,
  date,
  onDateChange,
  schedule,
  onClose,
}: {
  doctor: Doctor
  date: string
  onDateChange: (value: string) => void
  schedule: DayScheduleSlot[]
  onClose: () => void
}) {
  return (
    <div className="rdx-day-panel">
      <div className="rdx-day-head">
        <div>
          <h4>Day schedule</h4>
          <p>
            Lunch: {doctor.lunch_start?.slice(0, 5) || '—'}–{doctor.lunch_end?.slice(0, 5) || '—'} · Fee ₹
            {doctor.consultation_fee ?? '—'}
            {doctor.phone_secondary ? ` · Alt ${doctor.phone_secondary}` : ''}
          </p>
        </div>
        <div className="rdx-day-tools">
          <label>
            <span>Date</span>
            <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
          </label>
          <Link to={`/receptionist/book?doctor_id=${doctor.id}`} className="rdx-btn rdx-btn-book">
            Book for patient
          </Link>
          <button type="button" className="rdx-btn rdx-btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {schedule.length === 0 ? (
        <p className="rdx-empty">No slots (doctor off / leave / no availability for this day).</p>
      ) : (
        <div className="table-wrap rdx-day-table-wrap">
          <table className="table doctor-day-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Slot</th>
                <th>Queue</th>
                <th>Token</th>
                <th>Patient</th>
                <th>Phone</th>
                <th>Entered</th>
                <th>Check in</th>
                <th>Check out</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((s, i) => {
                const hasVisit = Boolean(s.patient || s.appointment_id || s.token_id)
                return (
                  <tr key={slotRowKey(s, i)} className={hasVisit ? 'row-booked' : undefined}>
                    <td>
                      <strong>{s.time}</strong>
                    </td>
                    <td>{hasVisit ? <VisitSourceBadge source={s.source || s.appointment_type} /> : '—'}</td>
                    <td>
                      <span className={`badge badge-${s.status}`}>{s.status}</span>
                      {s.appointment_status ? (
                        <div className="muted" style={{ marginTop: 2 }}>
                          {s.appointment_status}
                        </div>
                      ) : null}
                    </td>
                    <td>{hasVisit ? formatQueueStatus(s.queue_status) : '—'}</td>
                    <td>{s.display_code || (s.token_number != null ? `#${s.token_number}` : '—')}</td>
                    <td>
                      {s.patient ? (
                        <>
                          <strong>{s.patient.name}</strong>
                          <div className="muted">{s.patient.patient_code}</div>
                          {s.patient.email ? <div className="muted">{s.patient.email}</div> : null}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{s.patient?.phone || '—'}</td>
                    <td>{s.entered_at || '—'}</td>
                    <td>{s.checked_in_at || '—'}</td>
                    <td>{s.checked_out_at || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

type StatusFilter = 'all' | 'available' | 'off'

export default function ReceptionistDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [schedule, setSchedule] = useState<DayScheduleSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editing, setEditing] = useState<Doctor | null>(null)
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const load = () =>
    getDoctors()
      .then(({ data }) => setDoctors(data))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setSchedule([])
      return
    }
    getDaySchedule(selectedId, date)
      .then(({ data }) => setSchedule(data.slots || []))
      .catch(() => setSchedule([]))
  }, [selectedId, date])

  const specialties = useMemo(() => {
    const set = new Set<string>()
    doctors.forEach((d) => {
      if (d.specialization?.trim()) set.add(d.specialization.trim())
    })
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [doctors])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return doctors.filter((d) => {
      const onToday = isAvailableToday(d.availability)
      if (statusFilter === 'available' && !onToday) return false
      if (statusFilter === 'off' && onToday) return false
      if (specialty && d.specialization !== specialty) return false
      if (!q) return true
      return (
        d.name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.phone.includes(q)
      )
    })
  }, [doctors, query, specialty, statusFilter])

  const available = filtered.filter((d) => isAvailableToday(d.availability))
  const offToday = filtered.filter((d) => !isAvailableToday(d.availability))
  const rosterCount = doctors.length
  const availableCount = doctors.filter((d) => isAvailableToday(d.availability)).length
  const offCount = rosterCount - availableCount

  const handleDone = (msg: string) => {
    setMessage(msg)
    setMode('list')
    setEditing(null)
    load()
  }

  const openEdit = (d: Doctor) => {
    setEditing(d)
    setMode('edit')
    setMessage('')
  }

  const toggleViewDay = (id: number) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  const renderRow = (d: Doctor) => {
    const onToday = isAvailableToday(d.availability)
    const expanded = selectedId === d.id

    return (
      <article key={d.id} className={`rdx-row${expanded ? ' is-open' : ''}${onToday ? '' : ' is-off'}`}>
        <div className="rdx-row-main">
          <DoctorAvatar
            doctorId={d.id}
            name={d.name}
            photoUrl={d.photo_url}
            className="rdx-avatar"
          />
          <div className="rdx-identity">
            <strong>{d.name}</strong>
            <span>{d.specialization || '—'}</span>
          </div>
          <div className="rdx-contact">
            <span>{d.email || '—'}</span>
            <span>
              {d.phone || '—'}
              {d.phone_secondary ? ` · ${d.phone_secondary}` : ''}
            </span>
          </div>
          <div className="rdx-schedule">
            <WeekStrip availability={d.availability} />
            <div className="rdx-hours">
              <span>{formatHours(d.availability)}</span>
              <em>{slotMinutes(d.availability)}</em>
            </div>
          </div>
          <div className={`rdx-status${onToday ? ' is-on' : ' is-off'}`}>
            <i aria-hidden />
            <span>{onToday ? 'Available today' : 'Off today'}</span>
          </div>
          <div className="rdx-actions">
            {onToday ? (
              <Link to={`/receptionist/book?doctor_id=${d.id}`} className="rdx-btn rdx-btn-book">
                Book
              </Link>
            ) : (
              <button type="button" className="rdx-btn rdx-btn-book" disabled>
                Book
              </button>
            )}
            <button
              type="button"
              className="rdx-btn rdx-btn-ghost"
              onClick={() => toggleViewDay(d.id)}
            >
              {expanded ? 'Close day' : 'View day'}
            </button>
            <button
              type="button"
              className="rdx-icon-btn"
              aria-label={`Edit ${d.name}`}
              onClick={() => openEdit(d)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
          </div>
        </div>
        {expanded && (
          <DaySchedulePanel
            doctor={d}
            date={date}
            onDateChange={setDate}
            schedule={schedule}
            onClose={() => setSelectedId(null)}
          />
        )}
      </article>
    )
  }

  return (
    <Layout
      title="Doctors & availability"
      subtitle="Find who's in today, check their hours, and book straight from here."
      hidePageHeader
      nav={receptionistNav}
    >
      <div className="rdx">
        {message && <div className="alert alert-success">{message}</div>}

        {mode !== 'list' ? (
          <div className="rdx-form-card">
            <DoctorManageForm
              doctor={mode === 'edit' ? editing : null}
              onDone={handleDone}
              onCancel={() => {
                setMode('list')
                setEditing(null)
              }}
            />
          </div>
        ) : (
          <>
            <header className="rdx-hero">
              <div>
                <h1>Doctors & availability</h1>
                <p>Find who&apos;s in today, check their hours, and book straight from here.</p>
                <div className="rdx-stats" aria-label="Roster summary">
                  <span>
                    Roster <b>{rosterCount}</b>
                  </span>
                  <span className="is-on">
                    Available now <b>{availableCount}</b>
                  </span>
                  <span className="is-off">
                    Off today <b>{offCount}</b>
                  </span>
                </div>
              </div>
            </header>

            <div className="rdx-toolbar">
              <label className="rdx-search">
                <IconSearch size={16} />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name or specialty"
                  aria-label="Search doctors"
                />
              </label>
              <select
                className="rdx-select"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                aria-label="Filter by specialty"
              >
                <option value="">All specialties</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <div className="rdx-tabs" role="tablist" aria-label="Availability">
                {(
                  [
                    ['all', 'All'],
                    ['available', 'Available'],
                    ['off', 'Off today'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={statusFilter === key}
                    className={`rdx-tab${statusFilter === key ? ' is-on' : ''}`}
                    onClick={() => setStatusFilter(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="rdx-btn rdx-btn-add"
                onClick={() => {
                  setEditing(null)
                  setMode('create')
                  setMessage('')
                }}
              >
                <IconPlus size={15} /> Add doctor
              </button>
            </div>

            {loading ? (
              <p className="rdx-empty">Loading doctors…</p>
            ) : filtered.length === 0 ? (
              <p className="rdx-empty">No doctors match your filters.</p>
            ) : (
              <div className="rdx-board">
                {(statusFilter === 'all' || statusFilter === 'available') && (
                  <section className="rdx-section">
                    <div className="rdx-section-head">
                      <h2>Available today</h2>
                      <span className="rdx-pill is-on">{available.length}</span>
                    </div>
                    {available.length === 0 ? (
                      <p className="rdx-empty">Nobody available today.</p>
                    ) : (
                      <div className="rdx-list">{available.map(renderRow)}</div>
                    )}
                  </section>
                )}

                {(statusFilter === 'all' || statusFilter === 'off') && (
                  <section className="rdx-section">
                    <div className="rdx-section-head">
                      <h2>Off today</h2>
                      <span className="rdx-pill is-off">{offToday.length}</span>
                    </div>
                    {offToday.length === 0 ? (
                      <p className="rdx-empty">Nobody is off today.</p>
                    ) : (
                      <div className="rdx-list">{offToday.map(renderRow)}</div>
                    )}
                  </section>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
