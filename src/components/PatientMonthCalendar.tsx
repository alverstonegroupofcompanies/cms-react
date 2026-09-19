import { useEffect, useMemo, useState } from 'react'
import { getAppointmentCalendar, getDoctors } from '../api/client'
import type { AppointmentCalendarResponse, CalendarDaySummary, Doctor } from '../api/types'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const CATEGORIES = [
  { key: 'total', label: 'Total patients that day', color: '#1e3a5f' },
  { key: 'checked_in', label: 'Checked in / waiting', color: '#059669' },
  { key: 'completed', label: 'Completed visits', color: '#6d28d9' },
  { key: 'walk_in', label: 'Walk-ins', color: '#be185d' },
] as const

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function monthLabel(year: number, month: number) {
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })
}

function buildGrid(year: number, month: number) {
  const first = new Date(year, month - 1, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const prevMonthDays = new Date(year, month - 1, 0).getDate()
  const cells: { date: string; day: number; inMonth: boolean }[] = []

  for (let i = startPad - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    const y = month === 1 ? year - 1 : year
    const m = month === 1 ? 12 : month - 1
    cells.push({ date: `${y}-${pad(m)}-${pad(d)}`, day: d, inMonth: false })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: `${year}-${pad(month)}-${pad(d)}`, day: d, inMonth: true })
  }

  let next = 1
  while (cells.length % 7 !== 0) {
    const y = month === 12 ? year + 1 : year
    const m = month === 12 ? 1 : month + 1
    cells.push({ date: `${y}-${pad(m)}-${pad(next)}`, day: next, inMonth: false })
    next += 1
  }

  return cells
}

function barsForDay(summary?: CalendarDaySummary) {
  if (!summary || summary.total <= 0) return []
  const items: { key: string; label: string; color: string; strong?: boolean }[] = [
    { key: 'total', label: `${summary.total} Patients`, color: '#1e3a5f', strong: true },
  ]
  if (summary.checked_in > 0) {
    items.push({ key: 'checked_in', label: `${summary.checked_in} waiting`, color: '#059669' })
  }
  if (summary.walk_in > 0) {
    items.push({ key: 'walk_in', label: `${summary.walk_in} walk-in`, color: '#be185d' })
  }
  if (summary.completed > 0 && items.length < 3) {
    items.push({ key: 'completed', label: `${summary.completed} done`, color: '#6d28d9' })
  }
  return items.slice(0, 3)
}

type Props = {
  /** When true, show doctor filter (reception). Doctors are auto-scoped by API. */
  showDoctorFilter?: boolean
  onSelectDay?: (date: string, doctorId?: number) => void
}

export default function PatientMonthCalendar({ showDoctorFilter = false, onSelectDay }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [doctorId, setDoctorId] = useState('')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [data, setData] = useState<AppointmentCalendarResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!showDoctorFilter) return
    getDoctors().then(({ data: list }) => setDoctors(Array.isArray(list) ? list : []))
  }, [showDoctorFilter])

  useEffect(() => {
    setLoading(true)
    setError('')
    const params: { year: number; month: number; doctor_id?: number } = { year, month }
    if (doctorId) params.doctor_id = Number(doctorId)
    getAppointmentCalendar(params)
      .then(({ data: res }) => setData(res))
      .catch(() => setError('Could not load calendar'))
      .finally(() => setLoading(false))
  }, [year, month, doctorId])

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarDaySummary>()
    data?.days?.forEach((d) => map.set(d.date, d))
    return map
  }, [data])

  const cells = useMemo(() => buildGrid(year, month), [year, month])
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
  }

  return (
    <div className="pmc">
      <div className="pmc-toolbar">
        <div className="pmc-nav">
          <button type="button" className="pmc-nav-btn" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            ‹
          </button>
          <h2 className="pmc-month">{monthLabel(year, month)}</h2>
          <button type="button" className="pmc-nav-btn" onClick={() => shiftMonth(1)} aria-label="Next month">
            ›
          </button>
        </div>
        {showDoctorFilter && (
          <label className="pmc-filter">
            <span>Doctor</span>
            <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
              <option value="">All doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {error && <p className="pmc-error">{error}</p>}
      {loading && !data && <p className="pmc-loading">Loading calendar…</p>}

      <div className="pmc-grid-wrap">
        <div className="pmc-weekdays">
          {WEEKDAYS.map((d) => (
            <div key={d} className="pmc-weekday">
              {d}
            </div>
          ))}
        </div>
        <div className="pmc-grid">
          {cells.map((cell) => {
            const summary = byDate.get(cell.date)
            const bars = barsForDay(summary)
            const isToday = cell.date === todayStr
            return (
              <button
                key={cell.date}
                type="button"
                className={`pmc-cell${cell.inMonth ? '' : ' pmc-cell-muted'}${isToday ? ' pmc-cell-today' : ''}${summary?.total ? ' pmc-cell-has' : ''}`}
                onClick={() => {
                  if (!cell.inMonth) return
                  onSelectDay?.(cell.date, doctorId ? Number(doctorId) : undefined)
                }}
                disabled={!cell.inMonth}
              >
                <span className="pmc-daynum">{cell.day}</span>
                <div className="pmc-bars">
                  {bars.map((b) => (
                    <span
                      key={b.key}
                      className={`pmc-bar${b.strong ? ' pmc-bar-strong' : ''}`}
                      style={{ background: b.color }}
                      title={b.label}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="pmc-legend">
        <h3>Patient categories</h3>
        <ul>
          {CATEGORIES.map((c) => (
            <li key={c.key}>
              <span className="pmc-swatch" style={{ background: c.color }} />
              {c.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
