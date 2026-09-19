import { useCallback, useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import { formatInr } from '../../components/VisitBillPreview'
import { getPharmacySales } from '../../api/client'
import { pharmacyNav } from '../../config/navigation'
import type { PharmacySalesReport } from '../../api/types'

function todayIso() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function daysAgoIso(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatSaleDate(iso: string) {
  return new Date(iso.includes('T') ? iso : `${iso}T12:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    weekday: 'short',
  })
}

type Tab = 'by_date' | 'by_medicine'

export default function PharmacySales() {
  const [from, setFrom] = useState(() => daysAgoIso(29))
  const [to, setTo] = useState(() => todayIso())
  const [report, setReport] = useState<PharmacySalesReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('by_date')
  const [openDate, setOpenDate] = useState<string | null>(null)

  const load = useCallback(async (range = { from, to }) => {
    setLoading(true)
    setError('')
    try {
      const { data } = await getPharmacySales(range)
      setReport(data)
      setOpenDate(data.by_date?.[0]?.date ?? null)
    } catch {
      setError('Could not load pharmacy sales')
      setReport(null)
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    void load()
  }, [load])

  const applyPreset = (days: number) => {
    const nextTo = todayIso()
    const nextFrom = daysAgoIso(days)
    setFrom(nextFrom)
    setTo(nextTo)
  }

  const summary = report?.summary
  const empty = !loading && report && report.by_date.length === 0

  const medicineRows = useMemo(() => report?.by_medicine || [], [report])

  return (
    <Layout
      title="Sales record"
      subtitle="Medicines sold — quantity and amount by date"
      nav={pharmacyNav}
    >
      <div className="pharm-sales">
        {error && <div className="alert alert-error">{error}</div>}

        <section className="card pharm-sales-filters">
          <div className="pharm-sales-filter-row">
            <label>
              From
              <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label>
              To
              <input type="date" value={to} min={from} max={todayIso()} onChange={(e) => setTo(e.target.value)} />
            </label>
            <div className="pharm-sales-presets">
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => applyPreset(0)}>
                Today
              </button>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => applyPreset(6)}>
                7 days
              </button>
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => applyPreset(29)}>
                30 days
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                disabled={loading}
                onClick={() => void load({ from, to })}
              >
                {loading ? 'Loading…' : 'Apply'}
              </button>
            </div>
          </div>
        </section>

        {summary && (
          <div className="pharm-sales-stats">
            <div className="pharm-sales-stat">
              <em>Units sold</em>
              <strong>{summary.total_qty}</strong>
            </div>
            <div className="pharm-sales-stat">
              <em>Sale amount</em>
              <strong>{formatInr(summary.total_amount)}</strong>
            </div>
            <div className="pharm-sales-stat">
              <em>Bills</em>
              <strong>{summary.bills_count}</strong>
            </div>
            <div className="pharm-sales-stat">
              <em>Medicines</em>
              <strong>{summary.medicines_count}</strong>
            </div>
          </div>
        )}

        <div className="pharm-sales-tabs">
          <button
            type="button"
            className={`pharm-sales-tab${tab === 'by_date' ? ' is-on' : ''}`}
            onClick={() => setTab('by_date')}
          >
            By date
          </button>
          <button
            type="button"
            className={`pharm-sales-tab${tab === 'by_medicine' ? ' is-on' : ''}`}
            onClick={() => setTab('by_medicine')}
          >
            By medicine
          </button>
        </div>

        {loading && !report ? (
          <p className="muted">Loading sales…</p>
        ) : empty ? (
          <div className="card">
            <p className="ws-empty" style={{ margin: 0 }}>
              No medicines marked sold in this date range. Complete a pharmacy bill (mark purchased / pharmacy done) to
              record sales.
            </p>
          </div>
        ) : tab === 'by_date' ? (
          <div className="pharm-sales-days">
            {(report?.by_date || []).map((day) => {
              const open = openDate === day.date
              return (
                <section key={day.date} className={`card pharm-sales-day${open ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="pharm-sales-day-head"
                    onClick={() => setOpenDate(open ? null : day.date)}
                    aria-expanded={open}
                  >
                    <div>
                      <strong>{formatSaleDate(day.date)}</strong>
                      <span className="muted">
                        {day.medicines.length} medicine{day.medicines.length === 1 ? '' : 's'} · {day.bills_count} bill
                        {day.bills_count === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="pharm-sales-day-totals">
                      <span>{day.total_qty} units</span>
                      <strong>{formatInr(day.total_amount)}</strong>
                    </div>
                  </button>
                  {open && (
                    <div className="ws-bill-table-wrap">
                      <table className="ws-bill-table">
                        <thead>
                          <tr>
                            <th>Medicine</th>
                            <th className="num">Qty</th>
                            <th className="num">Bills</th>
                            <th className="num">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {day.medicines.map((m) => (
                            <tr key={`${day.date}-${m.name}`}>
                              <td>
                                <strong>{m.name}</strong>
                              </td>
                              <td className="num">{m.qty}</td>
                              <td className="num">{m.bills_count}</td>
                              <td className="num">{formatInr(m.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        ) : (
          <div className="card">
            <div className="ws-bill-table-wrap">
              <table className="ws-bill-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th className="num">Qty sold</th>
                    <th className="num">Days</th>
                    <th className="num">Bills</th>
                    <th className="num">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {medicineRows.map((m) => (
                    <tr key={m.name}>
                      <td>
                        <strong>{m.name}</strong>
                      </td>
                      <td className="num">{m.qty}</td>
                      <td className="num">{m.days_sold}</td>
                      <td className="num">{m.bills_count}</td>
                      <td className="num">{formatInr(m.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
