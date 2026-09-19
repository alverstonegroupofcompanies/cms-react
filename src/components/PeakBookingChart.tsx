import { useEffect, useMemo, useState } from 'react'
import { getDoctors, getPeakBookingHours } from '../api/client'
import type { Doctor, PeakBookingHoursResponse } from '../api/types'

type RangeKey = 'today' | '7d' | '30d' | '90d' | 'month' | 'all'

const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: 'month', label: 'This month' },
  { key: '90d', label: '90 days' },
  { key: 'all', label: 'All time' },
]

const CHART_MAX_PX = 140
const LIVE_POLL_MS = 15_000

function hourLabel(hour: number) {
  if (hour === 0) return '12am'
  if (hour === 12) return '12pm'
  if (hour < 12) return `${hour}am`
  return `${hour - 12}pm`
}

function formatDay(iso: string | null | undefined) {
  if (!iso) return ''
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatUpdatedAt(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

type Props = {
  /** Bump from parent (e.g. board poll) to refresh without waiting for the live timer. */
  refreshKey?: number | string
}

export default function PeakBookingChart({ refreshKey = 0 }: Props) {
  const [range, setRange] = useState<RangeKey>('today')
  const [doctorId, setDoctorId] = useState('')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [data, setData] = useState<PeakBookingHoursResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    getDoctors()
      .then(({ data: list }) => setDoctors(Array.isArray(list) ? list : []))
      .catch(() => setDoctors([]))
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), LIVE_POLL_MS)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false
    const silent = Boolean(data)
    if (!silent) setLoading(true)
    setError('')
    const params: { range: RangeKey; doctor_id?: number } = { range }
    if (doctorId) params.doctor_id = Number(doctorId)
    getPeakBookingHours(params)
      .then(({ data: res }) => {
        if (!cancelled) setData(res)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load peak hours')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // refreshKey + tick keep the chart live as bookings/queue change
  }, [range, doctorId, refreshKey, tick])

  const max = useMemo(
    () => Math.max(1, ...(data?.hours.map((h) => h.count) || [1])),
    [data]
  )

  const topHours = useMemo(() => {
    if (!data) return []
    return [...data.hours]
      .filter((h) => h.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
  }, [data])

  const periodText = data
    ? data.from && data.to
      ? `${data.range_label} · ${formatDay(data.from)}${data.from !== data.to ? ` – ${formatDay(data.to)}` : ''}`
      : data.to
        ? `${data.range_label} · through ${formatDay(data.to)}`
        : data.range_label
    : RANGES.find((r) => r.key === range)?.label

  return (
    <section className="pbh" aria-label="Peak booking hours overall">
      <div className="pbh-head">
        <div className="pbh-head-text">
          <h3 className="pbh-title">Peak booking hours</h3>
          <p className="pbh-sub">
            Live from booked slots + walk-in queue — updates as data changes
            {data ? ` · ${data.total_appointments} patients` : ''}
          </p>
          {periodText && <p className="pbh-period">{periodText}</p>}
          {data?.updated_at && (
            <p className="pbh-period">Updated {formatUpdatedAt(data.updated_at)}</p>
          )}
        </div>
      </div>

      <div className="pbh-filters">
        <div className="pbh-ranges" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              className={`pbh-range${range === r.key ? ' pbh-range-on' : ''}`}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
        <label className="pbh-doctor">
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
      </div>

      {topHours.length > 0 && (
        <div className="pbh-top" aria-label="Top busy hours">
          {topHours.map((h, i) => (
            <span key={h.hour} className={`pbh-chip${i === 0 ? ' pbh-chip-1' : ''}`}>
              <b>#{i + 1}</b> {hourLabel(h.hour)} · {h.count}
            </span>
          ))}
        </div>
      )}

      {error && <p className="pbh-error">{error}</p>}
      {loading && !data && <p className="pbh-loading">Loading chart…</p>}

      {data && data.total_appointments === 0 && (
        <p className="pbh-empty">No bookings in this period yet.</p>
      )}

      {data && data.total_appointments > 0 && (
        <div className="pbh-chart" role="img" aria-label="Bar chart of appointments by hour">
          {data.hours.map((h) => {
            const barH = h.count > 0 ? Math.max(10, Math.round((h.count / max) * CHART_MAX_PX)) : 0
            const isPeak = data.peak_hour === h.hour && h.count > 0
            const isBusy = h.count > 0 && h.count >= max * 0.6
            return (
              <div
                key={h.hour}
                className={`pbh-col${isPeak ? ' pbh-col-peak' : ''}${isBusy && !isPeak ? ' pbh-col-busy' : ''}`}
              >
                <span className="pbh-count">{h.count > 0 ? h.count : '\u00a0'}</span>
                <div className="pbh-bar-track">
                  <div
                    className="pbh-bar"
                    style={{ height: `${barH}px` }}
                    title={`${hourLabel(h.hour)} — ${h.count} patients`}
                  />
                </div>
                <span className="pbh-label">{hourLabel(h.hour)}</span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
