import { useEffect, useMemo, useState } from 'react'
import PatientPage from '../../components/PatientPage'
import { getLabOrders } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import type { LabOrder } from '../../api/types'
import { displayDoctorName } from '../../utils/doctorName'
import { labResultFieldsForCode } from '../../utils/labResultFields'

function parseOrders(data: unknown): LabOrder[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: LabOrder[] }).data)) {
    return (data as { data: LabOrder[] }).data
  }
  return []
}

function orderHasResults(o: LabOrder): boolean {
  if (o.report) return true
  if (o.status === 'completed') return true
  return (o.items || []).some((item) => {
    const results = item.results
    if (!results || typeof results !== 'object') return false
    return Object.values(results).some((v) => String(v ?? '').trim() !== '')
  })
}

function storageUrl(path: string) {
  const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/api\/?$/, '')
  return `${base}/storage/${path}`
}

function formatOrderDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

type ResultRow = {
  key: string
  label: string
  value: string
  unit?: string
}

function resultRowsForItem(item: NonNullable<LabOrder['items']>[number]): ResultRow[] {
  const results = item.results || {}
  const fields = labResultFieldsForCode(item.lab_test?.code)
  const byKey = new Map(fields.map((f) => [f.key, f]))
  const rows: ResultRow[] = []

  // Prefer known field order/labels first.
  for (const field of fields) {
    const raw = results[field.key]
    if (raw == null || String(raw).trim() === '') continue
    if (field.key === 'unit' || field.key === 'remarks') continue
    rows.push({
      key: field.key,
      label: field.label,
      value: String(raw).trim(),
      unit: field.unit || (results.unit ? String(results.unit) : undefined),
    })
  }

  // Any extra keys not in the schema.
  for (const [key, raw] of Object.entries(results)) {
    if (byKey.has(key) || key === 'unit' || key === 'remarks') continue
    if (raw == null || String(raw).trim() === '') continue
    rows.push({
      key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: String(raw).trim(),
      unit: results.unit ? String(results.unit) : undefined,
    })
  }

  const remarks = results.remarks
  if (remarks != null && String(remarks).trim() !== '') {
    rows.push({
      key: 'remarks',
      label: 'Remarks',
      value: String(remarks).trim(),
    })
  }

  return rows
}

function CompletedReportCard({ order }: { order: LabOrder }) {
  const items = order.items || []
  const testsWithRows = items
    .map((item) => ({ item, rows: resultRowsForItem(item) }))
    .filter((x) => x.rows.length > 0 || order.report)

  return (
    <article className="ph-lab-report is-ready">
      <header className="ph-lab-report-head">
        <div>
          <p className="ph-lab-report-kicker">Completed laboratory report</p>
          <h3 className="ph-lab-report-title">
            {items.map((i) => i.lab_test?.name).filter(Boolean).join(', ') || `Lab order #${order.id}`}
          </h3>
          <p className="ph-lab-report-meta">
            {[
              formatOrderDate(order.created_at),
              displayDoctorName(order.doctor?.name),
              order.queue_token?.display_code,
              order.worksheet?.worksheet_code,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <span className="ph-lab-report-status">Ready</span>
      </header>

      {testsWithRows.length === 0 && !order.report ? (
        <p className="ph-lab-report-empty">This order is marked complete. Detailed values will appear when entered by the lab.</p>
      ) : (
        <div className="ph-lab-report-body">
          {testsWithRows.map(({ item, rows }) => (
            <section key={item.id} className="ph-lab-report-test">
              <div className="ph-lab-report-test-head">
                <h4>{item.lab_test?.name || 'Investigation'}</h4>
                {item.lab_test?.code ? <span>{item.lab_test.code}</span> : null}
              </div>
              {rows.length > 0 ? (
                <div className="ph-lab-report-table-wrap">
                  <table className="ph-lab-report-table">
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Result</th>
                        <th>Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.key} className={row.key === 'remarks' ? 'is-remarks' : undefined}>
                          <td>{row.label}</td>
                          <td>
                            <strong>{row.value}</strong>
                          </td>
                          <td>{row.unit || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="ph-muted">No numeric results listed for this test.</p>
              )}
            </section>
          ))}
        </div>
      )}

      <footer className="ph-lab-report-foot">
        {order.report ? (
          <a
            href={storageUrl(order.report.file_path)}
            target="_blank"
            rel="noreferrer"
            className="ph-btn ph-btn-primary"
          >
            Open PDF report
          </a>
        ) : (
          <p className="ph-lab-report-note">Official values as recorded by the laboratory.</p>
        )}
        <button type="button" className="ph-btn ph-btn-outline" onClick={() => window.print()}>
          Print / save
        </button>
      </footer>
    </article>
  )
}

function PendingOrderCard({ order }: { order: LabOrder }) {
  return (
    <article className="ph-lab-report is-pending">
      <header className="ph-lab-report-head">
        <div>
          <p className="ph-lab-report-kicker">Awaiting laboratory</p>
          <h3 className="ph-lab-report-title">
            {(order.items || []).map((i) => i.lab_test?.name).filter(Boolean).join(', ') || `Lab order #${order.id}`}
          </h3>
          <p className="ph-lab-report-meta">
            {[formatOrderDate(order.created_at), displayDoctorName(order.doctor?.name)].filter(Boolean).join(' · ')}
          </p>
        </div>
        <span className="ph-lab-report-status is-wait">Pending</span>
      </header>
      <p className="ph-lab-report-empty">Your doctor ordered these tests. Results will show here when the lab completes them.</p>
    </article>
  )
}

export default function LabReports() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<LabOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    getLabOrders(user.patient?.id ? { patient_id: user.patient.id } : undefined)
      .then(({ data }) => setOrders(parseOrders(data)))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [user])

  const { ready, pending } = useMemo(() => {
    const active = orders.filter((o) => o.status !== 'cancelled')
    return {
      ready: active.filter(orderHasResults),
      pending: active.filter((o) => !orderHasResults(o)),
    }
  }, [orders])

  return (
    <PatientPage
      kicker="Laboratory"
      title="Lab reports"
      subtitle="Clear, readable results from your clinic visits."
    >
      {loading ? (
        <div className="ph-page-panel">
          <p className="ph-home-empty" style={{ margin: 0 }}>Loading reports…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="ph-empty">
          <p className="ph-empty-title">No lab orders yet</p>
          <p className="ph-empty-sub">Lab results will appear here once ordered by your doctor.</p>
        </div>
      ) : (
        <div className="ph-lab-reports">
          {ready.length > 0 && (
            <section className="ph-page-panel">
              <div className="ph-page-panel-head">
                <h2>Completed reports</h2>
                <span>{ready.length}</span>
              </div>
              <div className="ph-lab-report-list">
                {ready.map((o) => (
                  <CompletedReportCard key={o.id} order={o} />
                ))}
              </div>
            </section>
          )}

          {pending.length > 0 && (
            <section className="ph-page-panel">
              <div className="ph-page-panel-head">
                <h2>Pending</h2>
                <span>{pending.length}</span>
              </div>
              <div className="ph-lab-report-list">
                {pending.map((o) => (
                  <PendingOrderCard key={o.id} order={o} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PatientPage>
  )
}
