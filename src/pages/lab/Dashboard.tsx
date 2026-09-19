import { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/Layout'
import LabBillPrint from '../../components/LabBillPrint'
import { formatInr } from '../../components/VisitBillPreview'
import {
  getLabOrder,
  getLabOrders,
  getVisitBills,
  markVisitBillLabDone,
  saveLabOrderResults,
  updateVisitBillLabItems,
  uploadLabReport,
} from '../../api/client'
import { labNav } from '../../config/navigation'
import type { LabOrder, VisitBill, VisitBillItem } from '../../api/types'
import { displayDoctorName } from '../../utils/doctorName'
import { emptyResultsForCode, labResultFieldsForCode } from '../../utils/labResultFields'

type Filter = 'pending' | 'done' | 'all'
type PrintMode = 'invoice' | 'report'

function ageFromDob(dob?: string | null) {
  if (!dob) return null
  const d = new Date(dob.includes('T') ? dob : dob + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1
  return age
}

function labBillStatusLabel(status?: string | null) {
  if (status === 'done') return 'Completed'
  if (status === 'pending') return 'Pending'
  return status || '—'
}

function labBillStatusBadgeClass(status?: string | null) {
  if (status === 'done') return 'badge badge-completed'
  if (status === 'pending') return 'badge badge-pending'
  return 'badge'
}

function labOrderStatusLabel(status?: string | null) {
  if (status === 'completed') return 'Completed'
  if (status === 'cancelled' || status === 'canceled') return 'Canceled'
  if (status === 'in_progress') return 'In progress'
  if (status === 'ordered') return 'Pending'
  return status || '—'
}

function labOrderStatusBadgeClass(status?: string | null) {
  if (status === 'completed') return 'badge badge-completed'
  if (status === 'cancelled' || status === 'canceled') return 'badge badge-cancelled'
  if (status === 'in_progress') return 'badge badge-in_consultation'
  if (status === 'ordered') return 'badge badge-pending'
  return 'badge'
}

function labItemTestStatus(item: VisitBillItem, included: boolean) {
  if (!included || item.status === 'skipped') {
    return { label: 'Canceled', className: 'badge badge-cancelled' }
  }
  if (item.status === 'done') {
    return { label: 'Completed', className: 'badge badge-completed' }
  }
  return { label: 'Pending', className: 'badge badge-pending' }
}

function labItemPaidStatus(item: VisitBillItem, included: boolean) {
  if (!included || item.status === 'skipped') {
    return { label: 'Not paid', className: 'badge badge-cancelled' }
  }
  if (item.purchased || item.status === 'done') {
    return { label: 'Paid', className: 'staff-doctor-today-badge is-on', style: { position: 'static' as const } }
  }
  return { label: 'Not paid', className: 'badge badge-pending' }
}

export default function LabDashboard() {
  const [filter, setFilter] = useState<Filter>('pending')
  const [bills, setBills] = useState<VisitBill[]>([])
  const [selected, setSelected] = useState<VisitBill | null>(null)
  const [orders, setOrders] = useState<LabOrder[]>([])
  const [included, setIncluded] = useState<Record<number, boolean>>({})
  const [resultsByItem, setResultsByItem] = useState<Record<number, Record<string, string>>>({})
  const [printMode, setPrintMode] = useState<PrintMode>('invoice')
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = async (f: Filter = filter) => {
    const params =
      f === 'all' ? {} : f === 'done' ? { lab_status: 'done' } : { lab_status: 'pending' }
    const { data: billData } = await getVisitBills(params)
    const all = Array.isArray(billData) ? billData : []
    setBills(
      f === 'all'
        ? all.filter((b) => b.lab_status !== 'none')
        : all.filter((b) => b.lab_status === f)
    )
  }

  useEffect(() => {
    load(filter).catch(() => setError('Could not load lab bills'))
  }, [filter])

  const openBill = async (bill: VisitBill) => {
    setError('')
    setMessage('')
    setShowPreview(false)
    setSelected(bill)
    const labItems = (bill.items || []).filter((i) => i.section === 'lab')
    const inc: Record<number, boolean> = {}
    labItems.forEach((i) => {
      inc[i.id] = i.included !== false
    })
    setIncluded(inc)

    const orderIds = [...new Set(labItems.map((i) => i.lab_order_id).filter(Boolean) as number[])]
    const loaded: LabOrder[] = []
    for (const id of orderIds) {
      try {
        const { data } = await getLabOrder(id)
        loaded.push(data)
      } catch {
        /* skip */
      }
    }
    // Fallback: fetch pending orders for patient if none linked
    if (!loaded.length && bill.patient_id) {
      try {
        const { data } = await getLabOrders({ patient_id: bill.patient_id })
        const list: LabOrder[] = data?.data || data || []
        loaded.push(...list.filter((o) => o.worksheet_id === bill.worksheet_id || !bill.worksheet_id))
      } catch {
        /* skip */
      }
    }
    setOrders(loaded)

    const results: Record<number, Record<string, string>> = {}
    loaded.forEach((order) => {
      order.items?.forEach((item) => {
        const code = item.lab_test?.code
        results[item.id] = {
          ...emptyResultsForCode(code),
          ...(item.results || {}),
        }
      })
    })
    setResultsByItem(results)
  }

  const labBillItems = useMemo(
    () => (selected?.items || []).filter((i) => i.section === 'lab'),
    [selected]
  )

  const labTotal = useMemo(
    () =>
      labBillItems
        .filter((i) => included[i.id] !== false)
        .reduce((s, i) => s + (Number(i.unit_price) || 0) * (Number(i.qty) || 1), 0),
    [labBillItems, included]
  )

  const printLines = useMemo(() => {
    return labBillItems.map((i) => {
      const orderItem = orders
        .flatMap((o) => o.items || [])
        .find((oi) => oi.id === i.lab_order_item_id || oi.lab_test?.name === i.name)
      const code = orderItem?.lab_test?.code || (i.detail || undefined)
      return {
        id: i.id,
        name: i.name,
        code,
        detail: i.detail || undefined,
        qty: Number(i.qty) || 1,
        unitPrice: Number(i.unit_price) || 0,
        amount: included[i.id] === false ? 0 : (Number(i.qty) || 1) * (Number(i.unit_price) || 0),
        included: included[i.id] !== false,
        results: orderItem ? resultsByItem[orderItem.id] : undefined,
      }
    })
  }, [labBillItems, included, orders, resultsByItem])

  const canEdit = selected?.lab_status === 'pending'

  const persistLabEdits = async () => {
    if (!selected) return null
    const { data: bill } = await updateVisitBillLabItems(
      selected.id,
      labBillItems.map((i) => ({ id: i.id, included: included[i.id] !== false }))
    )
    for (const order of orders) {
      const payload = (order.items || []).map((item) => ({
        id: item.id,
        results: resultsByItem[item.id] || {},
      }))
      if (payload.length) {
        await saveLabOrderResults(order.id, payload)
      }
    }
    return bill as VisitBill
  }

  const saveLabEdits = async () => {
    if (!selected) return
    setSaving(true)
    setError('')
    try {
      const bill = await persistLabEdits()
      if (bill) {
        setMessage('Lab bill & results saved')
        await load(filter)
        await openBill(bill)
      }
    } catch {
      setError('Could not save lab changes')
    }
    setSaving(false)
  }

  const completeLab = async () => {
    if (!selected) return
    const code = selected.bill_code
    setSaving(true)
    setError('')
    try {
      const bill = await persistLabEdits()
      if (!bill) return
      await markVisitBillLabDone(bill.id)
      setMessage(`Lab completed · ${code}`)
      setSelected(null)
      setOrders([])
      await load(filter)
    } catch {
      setError('Could not mark lab done')
    }
    setSaving(false)
  }

  const uploadForOrder = async (orderId: number, file: File) => {
    const fd = new FormData()
    fd.append('report', file)
    fd.append('result_summary', 'Report uploaded')
    await uploadLabReport(orderId, fd)
  }

  const handlePrint = (mode: PrintMode) => {
    setPrintMode(mode)
    setTimeout(() => window.print(), 50)
  }

  const patient = selected?.patient
  const doctor = selected?.doctor
  const age = ageFromDob(patient?.dob)

  return (
    <Layout
      title="Lab"
      subtitle="Lab tests only · enter blood results · print lab bill / report"
      nav={labNav}
    >
      <div className="lab-screen no-print">
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {selected ? (
          <div className="card">
            <div className="card-header">
              <h3>
                {selected.bill_code} · {patient?.name || 'Patient'}
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowPreview((v) => !v)}>
                  {showPreview ? 'Hide bill preview' : 'Bill preview'}
                </button>
                <button type="button" className="btn btn-sm btn-primary" onClick={() => handlePrint('invoice')}>
                  Print bill
                </button>
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => handlePrint('report')}>
                  Print report
                </button>
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setSelected(null)}>
                  Back
                </button>
              </div>
            </div>

            <div className="lab-context-grid">
              <section className="lab-context-card">
                <h4>Patient (read-only)</h4>
                <p><strong>{patient?.name || '—'}</strong></p>
                <p className="muted">{patient?.patient_code || '—'}</p>
                <p className="muted">
                  {[patient?.gender, age != null ? `${age} yrs` : null, patient?.dob ? `DOB ${String(patient.dob).slice(0, 10)}` : null]
                    .filter(Boolean)
                    .join(' · ') || 'Demographics —'}
                </p>
                <p className="muted">Blood group: {patient?.blood_group || '—'}</p>
                <p className="muted">Phone: {patient?.phone || '—'}</p>
              </section>
              <section className="lab-context-card">
                <h4>Doctor (read-only)</h4>
                <p><strong>{doctor?.name ? displayDoctorName(doctor.name) : '—'}</strong></p>
                <p className="muted">{doctor?.specialization || '—'}</p>
                <p className="muted">
                  {selected.worksheet?.worksheet_code || '—'}
                  {selected.queue_token?.display_code ? ` · Token ${selected.queue_token.display_code}` : ''}
                </p>
                <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  Lab status:
                  <span className={labBillStatusBadgeClass(selected.lab_status)}>
                    {labBillStatusLabel(selected.lab_status)}
                  </span>
                </p>
              </section>
            </div>

            <h4 style={{ margin: '1rem 0 0.5rem' }}>Lab tests {canEdit ? '(editable)' : ''}</h4>
            <div className="ws-bill-table-wrap">
              <table className="ws-bill-table pharm-edit-table">
                <thead>
                  <tr>
                    <th>Do</th>
                    <th>Test</th>
                    <th>Code</th>
                    <th className="num">Rate</th>
                    <th className="num">Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {labBillItems.map((i: VisitBillItem) => {
                    const orderItem = orders
                      .flatMap((o) => o.items || [])
                      .find((oi) => oi.id === i.lab_order_item_id)
                    const code = orderItem?.lab_test?.code || i.detail || '—'
                    const on = included[i.id] !== false
                    const testStatus = labItemTestStatus(i, on)
                    const paidStatus = labItemPaidStatus(i, on)
                    return (
                      <tr key={i.id} className={!on ? 'is-pending' : undefined}>
                        <td>
                          <input
                            type="checkbox"
                            checked={on}
                            disabled={!canEdit || saving}
                            onChange={(e) => setIncluded((prev) => ({ ...prev, [i.id]: e.target.checked }))}
                          />
                        </td>
                        <td><strong>{i.name}</strong></td>
                        <td>{code}</td>
                        <td className="num">{formatInr(Number(i.unit_price) || 0)}</td>
                        <td className="num">{formatInr(on ? (Number(i.unit_price) || 0) * (Number(i.qty) || 1) : 0)}</td>
                        <td>
                          <span className={testStatus.className}>{testStatus.label}</span>
                        </td>
                        <td>
                          <span className={paidStatus.className} style={paidStatus.style}>
                            {paidStatus.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="muted">Lab subtotal (selected): <strong>{formatInr(labTotal)}</strong></p>

            <h4 style={{ margin: '1.25rem 0 0.5rem' }}>Result entry (blood / panels)</h4>
            {orders.length === 0 ? (
              <p className="muted">No linked lab orders for result entry.</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="lab-result-order">
                  <div className="lab-result-order-head">
                    <strong>Order #{order.id}</strong>
                    <span className={labOrderStatusBadgeClass(order.status)}>
                      {labOrderStatusLabel(order.status)}
                    </span>
                    {canEdit && (
                      <label className="lab-upload-inline">
                        Upload report file
                        <input
                          type="file"
                          accept=".pdf,.jpg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            uploadForOrder(order.id, file)
                              .then(() => setMessage(`Report uploaded for order #${order.id}`))
                              .catch(() => setError('Upload failed'))
                          }}
                        />
                      </label>
                    )}
                  </div>
                  {(order.items || []).map((item) => {
                    const fields = labResultFieldsForCode(item.lab_test?.code)
                    const vals = resultsByItem[item.id] || emptyResultsForCode(item.lab_test?.code)
                    return (
                      <div key={item.id} className="lab-result-block">
                        <h5>
                          {item.lab_test?.name}
                          {item.lab_test?.code ? ` · ${item.lab_test.code}` : ''}
                        </h5>
                        <div className="lab-result-fields">
                          {fields.map((f) => (
                            <label key={f.key} className="lab-result-field">
                              <span>
                                {f.label}
                                {f.unit ? ` (${f.unit})` : ''}
                              </span>
                              <input
                                value={vals[f.key] || ''}
                                disabled={!canEdit || saving}
                                placeholder={f.placeholder}
                                onChange={(e) =>
                                  setResultsByItem((prev) => ({
                                    ...prev,
                                    [item.id]: { ...vals, [f.key]: e.target.value },
                                  }))
                                }
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}

            {showPreview && (
              <div className="lab-bill-preview-card">
                <h4>Lab bill preview</h4>
                <LabBillPrint bill={selected} lines={printLines} mode="invoice" />
              </div>
            )}

            {canEdit ? (
              <div className="ws-bill-actions" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" disabled={saving} onClick={saveLabEdits}>
                  {saving ? 'Saving…' : 'Save tests & results'}
                </button>
                <button type="button" className="btn btn-primary" disabled={saving} onClick={completeLab}>
                  Mark lab done
                </button>
              </div>
            ) : (
              <p className="muted" style={{ marginTop: '1rem' }}>
                This lab bill is completed — view / print only.
              </p>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="pbh-ranges" role="group" style={{ marginBottom: '1rem' }}>
              {([
                ['pending', 'Pending'],
                ['done', 'Done'],
                ['all', 'All lab bills'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`pbh-range${filter === key ? ' pbh-range-on' : ''}`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            {bills.length === 0 ? (
              <p className="empty-state">No lab bills in this filter.</p>
            ) : (
              <div className="staff-doctor-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                {bills.map((b) => {
                  const labItems = (b.items || []).filter((i) => i.section === 'lab')
                  const activeItems = labItems.filter((i) => i.included !== false && i.status !== 'skipped')
                  const canceledCount = labItems.length - activeItems.length
                  const allPaid =
                    activeItems.length > 0 &&
                    activeItems.every((i) => i.purchased || i.status === 'done')
                  const isCompleted = b.lab_status === 'done'
                  return (
                  <article key={b.id} className="staff-doctor-card is-clickable" onClick={() => openBill(b)}>
                    <div className="staff-doctor-card-body" style={{ paddingTop: '1rem' }}>
                      <h4 className="staff-doctor-card-name">{b.patient?.name || 'Patient'}</h4>
                      <p className="staff-doctor-card-spec">{b.bill_code}</p>
                      <p className="staff-doctor-card-meta">
                        Doctor: {b.doctor?.name ? displayDoctorName(b.doctor.name) : '—'}
                      </p>
                      <p className="staff-doctor-card-meta">
                        {labItems.map((i) => i.name).join(', ') || 'Lab tests'}
                      </p>
                      <p className="staff-doctor-card-meta" style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span>Lab {formatInr(b.lab_subtotal)}</span>
                        <span className={labBillStatusBadgeClass(b.lab_status)}>
                          {labBillStatusLabel(b.lab_status)}
                        </span>
                        {activeItems.length > 0 && (
                          allPaid || isCompleted ? (
                            <span className="staff-doctor-today-badge is-on" style={{ position: 'static' }}>
                              Paid
                            </span>
                          ) : (
                            <span className="badge badge-pending">Not paid</span>
                          )
                        )}
                        {canceledCount > 0 && (
                          <span className="badge badge-cancelled">
                            {canceledCount === labItems.length
                              ? 'Canceled'
                              : `${canceledCount} canceled`}
                          </span>
                        )}
                      </p>
                      <div className="staff-doctor-card-actions">
                        <button type="button" className="btn btn-sm btn-primary">Open lab bill</button>
                      </div>
                    </div>
                  </article>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {selected && (
        <div className="lab-print-only">
          <LabBillPrint bill={selected} lines={printLines} mode={printMode} />
        </div>
      )}
    </Layout>
  )
}
